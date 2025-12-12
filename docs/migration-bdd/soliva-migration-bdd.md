# Soliva CMS — Migration JSON → PostgreSQL (Performance & Scalabilité)

Ce document est une **spec Cursor-ready** : schéma BDD + Prisma, repository dual-read/write, APIs, pagination cursor, cache Next, script de migration, rollout, tests, pièges.

---

## 0) Principes non négociables (gains de perf réels)

1. **Ne jamais charger `blocks` en liste** (blog/work). En liste : `id, slug, title, excerpt, coverImage, dates, status`.
2. **Stopper tous les fallbacks "/api/content full dump"** : un seul point de décision (Repository).
3. **Pagination cursor** (pas OFFSET) dès V1.
4. **Migration progressive** : `dual_write` → `dual_read` → `db`.
5. **`blocks` en JSONB** en V1 (zéro refacto des 38 blocs). Normalisation V2 optionnelle.
6. **Blocs imbriqués** : JSONB gère parfaitement les structures récursives (two-columns, etc.). Validation Zod côté admin obligatoire.
7. **Extraction "liste"** : Ne JAMAIS scanner les `blocks` pour générer excerpt/cover en runtime. Colonnes dédiées uniquement.

---

## 1) Architecture cible (simple et robuste)

### 1.1 ContentRepository (unique point d’accès)

- `JsonStore` : lit/écrit tes fichiers `data/*.json` (actuel)
- `DbStore` : lit/écrit Postgres (nouveau)
- `ContentRepository` : gère le mode

Modes via env :

- `CONTENT_MODE=json`
- `CONTENT_MODE=dual_write`
- `CONTENT_MODE=dual_read`
- `CONTENT_MODE=db`

**Règle** : plus aucun composant / page / editor ne “fallback” directement vers `/api/content`. Tout passe par `ContentRepository`.

### 1.2 Multi-site / multi-template (recommandé)

Tu as `data/content.json` + `data/templates/*/content.json`.

En DB, le mapping propre c’est :

- `sites` (un site = un contenu + un template actif)
- un site peut correspondre à : `soliva`, `pearl-demo`, `starter-kit-demo`, etc.

Avantages :

- plusieurs démos propres
- switch template sans hacks fichiers
- contenus isolés

---

## 2) Schéma BDD recommandé (V1)

### 2.1 Entités

- `Site` : workspace / instance de contenu
- `Page` : home, studio, contact, etc. (slug stable)
- `Article` : blog
- `Project` : work
- `NavigationItem` : menu
- `Footer` : footer
- `Asset` : uploads
- `Revision` : preview + versions

### 2.2 Champs clés

- `blocks JSONB` pour pages/articles/projects
- `seo JSONB`
- `metadata JSONB` (globals)
- `status` (`draft` / `published` / `archived`)
- `publishedAt`
- `updatedAt` pour invalidation cache

### 2.3 Index indispensables

- Uniques : `(siteId, slug)` sur pages/articles/projects
- Listes : `(siteId, status, publishedAt desc, id desc)` sur articles/projects
- Projects : `(siteId, featured, publishedAt desc)`
- Revisions : `(siteId, entityType, entityId, createdAt desc)`

---

## 3) Prisma schema (copiable)

> `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ContentStatus {
  draft
  published
  archived
}

enum EntityType {
  page
  article
  project
  site
}

model Site {
  id           String   @id @default(cuid())
  key          String   @unique // ex: "soliva", "pearl", "starter-kit"
  name         String
  activeTheme  String?  // ex: template key
  metadata     Json     @default("{}") // global metadata (title, description, socials, etc.)
  typography   Json     @default("{}")
  spacing      Json     @default("{}")
  palettes     Json     @default("[]")
  transitions  Json     @default("{}")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  pages        Page[]
  articles     Article[]
  projects     Project[]
  navItems     NavigationItem[]
  footer       Footer?
  assets       Asset[]
  revisions    Revision[]
}

model Page {
  id          String        @id @default(cuid())
  siteId      String
  site        Site          @relation(fields: [siteId], references: [id], onDelete: Cascade)

  slug        String
  title       String?
  description String?
  hero        Json          @default("{}")
  blocks      Json          @default("[]")
  seo         Json          @default("{}")
  status      ContentStatus @default(draft)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([siteId, slug])
  @@index([siteId, status])
}

model Article {
  id          String        @id @default(cuid())
  siteId      String
  site        Site          @relation(fields: [siteId], references: [id], onDelete: Cascade)

  slug        String
  title       String
  excerpt     String?
  coverImage  String?
  content     String?       // optionnel si tu gardes tout via blocks
  blocks      Json          @default("[]")
  seo         Json          @default("{}")

  status      ContentStatus @default(draft)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@unique([siteId, slug])
  @@index([siteId, status, publishedAt(sort: Desc), id(sort: Desc)])
}

enum ProjectVisibility {
  public
  admin
}

model Project {
  id          String            @id @default(cuid())
  siteId      String
  site        Site              @relation(fields: [siteId], references: [id], onDelete: Cascade)

  slug        String
  title       String
  excerpt     String?
  description String?
  coverImage  String?
  category    String?
  featured    Boolean           @default(false)
  visibility  ProjectVisibility @default(public) // "public" | "admin" (remplace adminProjects)

  content     String?
  blocks      Json              @default("[]")
  seo         Json              @default("{}")

  status      ContentStatus     @default(draft)
  publishedAt DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@unique([siteId, slug])
  @@index([siteId, status, publishedAt(sort: Desc), id(sort: Desc)])
  @@index([siteId, featured, publishedAt(sort: Desc)])
  @@index([siteId, visibility, status, publishedAt(sort: Desc)]) // Pour filtrer public vs admin
}

model NavigationItem {
  id         String   @id @default(cuid())
  siteId     String
  site       Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  label      String
  url        String
  orderIndex Int
  isExternal Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([siteId, orderIndex])
}

model Footer {
  id        String   @id @default(cuid())
  siteId    String   @unique
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  content   String?
  socials   Json     @default("[]")
  columns   Json     @default("[]")
  updatedAt DateTime @updatedAt
}

model Asset {
  id        String   @id @default(cuid())
  siteId    String
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  url       String
  mimeType  String?
  size      Int?
  width     Int?
  height    Int?
  alt       String?
  meta      Json     @default("{}")

  createdAt DateTime @default(now())
  @@index([siteId, createdAt(sort: Desc)])
}

model Revision {
  id          String     @id @default(cuid())
  siteId      String
  site        Site       @relation(fields: [siteId], references: [id], onDelete: Cascade)

  entityType  EntityType
  entityId    String?    // id de Page/Article/Project/Site selon le type
  snapshot    Json       // snapshot complet (ou delta si tu veux plus tard)
  note        String?
  createdAt   DateTime   @default(now())

  @@index([siteId, entityType, entityId, createdAt(sort: Desc)])
}

model MigrationRun {
  id         String   @id @default(cuid())
  siteKey    String
  status     String   // "running" | "success" | "failed"
  startedAt  DateTime @default(now())
  finishedAt DateTime?
  error      String?  // Message d'erreur si failed
  records    Json?    // Stats: { pages: 10, articles: 5, projects: 8 }

  @@index([siteKey, startedAt(sort: Desc)])
}
```

---

## 4) Repository pattern (dual write/read)

### 4.1 Interface store (contrat)

> `src/content/store/types.ts`

```ts
export type SiteKey = string;

export type ContentMode = "json" | "dual_write" | "dual_read" | "db";

export type ListParams = {
  limit: number;
  cursor?: string | null;
  status?: "published" | "draft" | "archived";
};

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
};

export interface ContentStore {
  // Metadata light
  getMetadata(siteKey: SiteKey): Promise<any>;

  // Pages
  getPageBySlug(siteKey: SiteKey, slug: string): Promise<any | null>;
  upsertPage(siteKey: SiteKey, payload: any): Promise<any>;

  // Articles
  listArticles(siteKey: SiteKey, params: ListParams): Promise<PaginatedResult<any>>;
  getArticleBySlug(siteKey: SiteKey, slug: string): Promise<any | null>;
  upsertArticle(siteKey: SiteKey, payload: any): Promise<any>;

  // Projects
  listProjects(
    siteKey: SiteKey,
    params: ListParams & { featured?: boolean; visibility?: "public" | "admin" }
  ): Promise<PaginatedResult<any>>;
  getProjectBySlug(siteKey: SiteKey, slug: string): Promise<any | null>;
  upsertProject(siteKey: SiteKey, payload: any): Promise<any>;

  // Nav/Footer
  getNavigation(siteKey: SiteKey): Promise<any[]>;
  setNavigation(siteKey: SiteKey, items: any[]): Promise<void>;
  getFooter(siteKey: SiteKey): Promise<any | null>;
  setFooter(siteKey: SiteKey, payload: any): Promise<void>;
}
```

### 4.2 ContentRepository (seul endroit où fallback est autorisé)

> `src/content/repository.ts`

```ts
import type { ContentStore, ContentMode } from "./store/types";

export class ContentRepository implements ContentStore {
  constructor(
    private mode: ContentMode,
    private db: ContentStore,
    private json: ContentStore,
    private logger: {
      warn: (...a: any[]) => void;
      error: (...a: any[]) => void;
    }
  ) {}

  private async read<T>(fn: (s: ContentStore) => Promise<T>): Promise<T> {
    if (this.mode === "db") return fn(this.db);
    if (this.mode === "json") return fn(this.json);

    if (this.mode === "dual_read") {
      try {
        return await fn(this.db);
      } catch (e) {
        this.logger.warn("DB read failed, fallback JSON", e);
        return fn(this.json);
      }
    }

    // dual_write : lecture encore JSON (ou DB si tu préfères)
    return fn(this.json);
  }

  private async write<T>(fn: (s: ContentStore) => Promise<T>): Promise<T> {
    if (this.mode === "db") return fn(this.db);
    if (this.mode === "json") return fn(this.json);

    if (this.mode === "dual_write") {
      const dbRes = await fn(this.db);
      try {
        await fn(this.json);
      } catch (e) {
        this.logger.error("JSON write failed (db kept)", e);
      }
      return dbRes;
    }

    // dual_read : écriture DB
    return fn(this.db);
  }

  getMetadata(siteKey: string) {
    return this.read((s) => s.getMetadata(siteKey));
  }

  getPageBySlug(siteKey: string, slug: string) {
    return this.read((s) => s.getPageBySlug(siteKey, slug));
  }

  upsertPage(siteKey: string, payload: any) {
    return this.write((s) => s.upsertPage(siteKey, payload));
  }

  listArticles(siteKey: string, params: any) {
    return this.read((s) => s.listArticles(siteKey, params));
  }

  getArticleBySlug(siteKey: string, slug: string) {
    return this.read((s) => s.getArticleBySlug(siteKey, slug));
  }

  upsertArticle(siteKey: string, payload: any) {
    return this.write((s) => s.upsertArticle(siteKey, payload));
  }

  listProjects(siteKey: string, params: any) {
    return this.read((s) => s.listProjects(siteKey, params));
  }

  getProjectBySlug(siteKey: string, slug: string) {
    return this.read((s) => s.getProjectBySlug(siteKey, slug));
  }

  upsertProject(siteKey: string, payload: any) {
    return this.write((s) => s.upsertProject(siteKey, payload));
  }

  getNavigation(siteKey: string) {
    return this.read((s) => s.getNavigation(siteKey));
  }

  setNavigation(siteKey: string, items: any[]) {
    return this.write((s) => s.setNavigation(siteKey, items));
  }

  getFooter(siteKey: string) {
    return this.read((s) => s.getFooter(siteKey));
  }

  setFooter(siteKey: string, payload: any) {
    return this.write((s) => s.setFooter(siteKey, payload));
  }
}
```

---

## 5) Pagination cursor (stable, performante)

### 5.1 Pourquoi pas OFFSET
OFFSET devient lent et instable (insertions entre pages). Cursor = stable + performant.

### 5.2 Cursor conseillé
Tri principal :

- `publishedAt DESC`
- `id DESC` (tie-break)

Cursor = base64(JSON) contenant `{ publishedAt, id }`.

> `src/content/pagination.ts`

```ts
export type Cursor = { publishedAt: string; id: string };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

export function decodeCursor(raw?: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
```

### 5.3 Query Prisma (articles, version liste)

> `DbStore.listArticles()`

```ts
import { decodeCursor, encodeCursor } from "../pagination";

async listArticles(siteKey, { limit, cursor, status = "published" }) {
  const site = await this.getSiteByKey(siteKey);

  const decoded = decodeCursor(cursor);
  const where: any = { siteId: site.id, status };

  // Cursor filter : (publishedAt, id) < (cursorPublishedAt, cursorId)
  if (decoded) {
    where.OR = [
      { publishedAt: { lt: new Date(decoded.publishedAt) } },
      {
        publishedAt: new Date(decoded.publishedAt),
        id: { lt: decoded.id },
      },
    ];
  }

  const items = await this.prisma.article.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      // IMPORTANT : pas de blocks ici
    },
  });

  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;

  const nextCursor = hasMore
    ? encodeCursor({
        publishedAt: sliced[sliced.length - 1].publishedAt!.toISOString(),
        id: sliced[sliced.length - 1].id,
      })
    : null;

  return { items: sliced, nextCursor };
}
```

Même logique pour `Projects` (avec filtre `visibility` si besoin).

### 5.4 Filtrage Projects par visibility

```ts
async listProjects(siteKey, { limit, cursor, status = "published", visibility = "public" }) {
  const site = await this.getSiteByKey(siteKey);
  const decoded = decodeCursor(cursor);
  const where: any = { 
    siteId: site.id, 
    status,
    visibility // Filtre public vs admin
  };

  // Cursor filter identique aux articles
  if (decoded) {
    where.OR = [
      { publishedAt: { lt: new Date(decoded.publishedAt) } },
      {
        publishedAt: new Date(decoded.publishedAt),
        id: { lt: decoded.id },
      },
    ];
  }

  const items = await this.prisma.project.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      featured: true,
      visibility: true,
      publishedAt: true,
      updatedAt: true,
      // IMPORTANT : pas de blocks ici
    },
  });

  // ... même logique cursor que articles
}
```

**Règle** :
- **Public API** : `visibility="public" AND status="published"` uniquement
- **Admin API** : peut voir tout (`visibility` optionnel dans les params)

---

## 6) APIs (refactor propre)

### 6.1 Public

- `GET /api/content/metadata?site=soliva`
  - renvoie : `site metadata` + `nav` + `footer` + `counts`
- `GET /api/content/articles?site=soliva&limit=12&cursor=...`
- `GET /api/content/articles/[slug]?site=soliva`
- `GET /api/content/projects?site=soliva&limit=12&cursor=...&featured=true`
- `GET /api/content/projects/[slug]?site=soliva`
- `GET /api/content/pages/[slug]?site=soliva`

### 6.2 Admin

- CRUD pages/articles/projects (upsert + delete)
- `POST /api/admin/preview/create` (crée `Revision` snapshot)
- `GET /api/admin/revisions?entityType=...&entityId=...`

---

## 7) Cache Next.js (tags + invalidation)

### 7.1 Stratégie de tags

- Listes :
  - `articles:list:${siteKey}`
  - `projects:list:${siteKey}`
- Détails :
  - `article:${siteKey}:${slug}`
  - `project:${siteKey}:${slug}`
  - `page:${siteKey}:${slug}`
- Globals :
  - `site:${siteKey}:metadata`
  - `site:${siteKey}:nav`
  - `site:${siteKey}:footer`

### 7.2 Invalidation lors d’un write admin

Quand tu `upsertArticle` :

```ts
import { revalidateTag } from "next/cache";

revalidateTag(`articles:list:${siteKey}`);
revalidateTag(`article:${siteKey}:${payload.slug}`);
```

---

## 8) Phase 0 (immédiat) — Stopper les full dumps

Avant même la DB :

- supprimer tous les fallback `/api/content` dans :
  - templates `*-client.tsx`
  - editors admin
  - pages admin work/blog/template-manager
- remplacer par :
  - retry metadata
  - message d’erreur contrôlé
  - et surtout : **ne jamais “charger tout”**

Objectif : plus aucun path ne peut envoyer 5–40 Mo au client.

---

## 9) DbStore (implémentation minimale)

### 9.1 Résolution `siteKey` → `siteId`

Toujours résoudre une fois, puis utiliser `siteId` en DB.

Tu peux mettre un cache mémoire serveur (Map) pour ça.

### 9.2 Sélections strictes

- endpoints **liste** : `select` sans blocks
- endpoints **détail** : `select` avec blocks

---

## 10) Script de migration JSON → DB (idempotent)

### 10.1 Objectifs

- Importer :
  - `data/content.json` → site `soliva` (ou `main`)
  - `data/templates/*/content.json` → site `{templateKey}`
- `upsert` par `(siteId, slug)`
- `--dry-run` + logs
- **Transactions par site** (rollback automatique si erreur)
- **Tracking via `MigrationRun`** : audit complet de chaque migration

### 10.2 Gestion adminProjects → Project.visibility

**Migration** :
- Si `content.work.adminProjects` existe : importer dans `Project` avec `visibility="admin"`
- Si `content.work.projects` existe : importer dans `Project` avec `visibility="public"`
- Résultat : une seule table `Project`, plus de duplication

### 10.2 Script Node/TS (squelette)

> `scripts/migrate-json-to-db.ts`

```ts
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Options = { dryRun: boolean };

async function loadJson(p: string) {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

async function upsertSite(siteKey: string, name: string) {
  return prisma.site.upsert({
    where: { key: siteKey },
    create: { key: siteKey, name },
    update: { name },
  });
}

// Adapte ces extracteurs à TA shape exacte de content.json
function extractAll(content: any) {
  return {
    metadata: content.metadata ?? {},
    pages: content.pages?.pages ?? content.pages ?? [],
    articles: content.blog?.articles ?? [],
    projects: content.work?.projects ?? [],
    adminProjects: content.work?.adminProjects ?? [], // AdminProjects séparés
    nav: content.nav ?? content.navigation ?? [],
    footer: content.footer ?? null,
  };
}

async function migrateOneSite(siteKey: string, filePath: string, opts: Options) {
  const data = extractAll(await loadJson(filePath));
  const site = await upsertSite(siteKey, siteKey);

  if (opts.dryRun) {
    console.log(
      `[DRY] ${siteKey}: pages=${data.pages.length} articles=${data.articles.length} projects=${data.projects.length} adminProjects=${data.adminProjects?.length || 0}`
    );
    return;
  }

  // Créer un enregistrement MigrationRun
  const migrationRun = await prisma.migrationRun.create({
    data: {
      siteKey,
      status: "running",
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
    await tx.site.update({
      where: { id: site.id },
      data: { metadata: data.metadata },
    });

    for (const p of data.pages) {
      await tx.page.upsert({
        where: { siteId_slug: { siteId: site.id, slug: p.slug } },
        create: {
          siteId: site.id,
          slug: p.slug,
          title: p.title ?? null,
          description: p.description ?? null,
          hero: p.hero ?? {},
          blocks: p.blocks ?? [],
          seo: p.seo ?? {},
          status: p.status ?? "draft",
        },
        update: {
          title: p.title ?? null,
          description: p.description ?? null,
          hero: p.hero ?? {},
          blocks: p.blocks ?? [],
          seo: p.seo ?? {},
          status: p.status ?? "draft",
        },
      });
    }

    for (const a of data.articles) {
      await tx.article.upsert({
        where: { siteId_slug: { siteId: site.id, slug: a.slug } },
        create: {
          siteId: site.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt ?? null,
          coverImage: a.coverImage ?? null,
          blocks: a.blocks ?? [],
          seo: a.seo ?? {},
          status: a.status ?? "draft",
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        },
        update: {
          title: a.title,
          excerpt: a.excerpt ?? null,
          coverImage: a.coverImage ?? null,
          blocks: a.blocks ?? [],
          seo: a.seo ?? {},
          status: a.status ?? "draft",
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        },
      });
    }

    // Projets publics (content.work.projects)
    for (const p of data.projects || []) {
      await tx.project.upsert({
        where: { siteId_slug: { siteId: site.id, slug: p.slug } },
        create: {
          siteId: site.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? null,
          description: p.description ?? null,
          coverImage: p.coverImage ?? p.image ?? null,
          category: p.category ?? null,
          featured: !!p.featured,
          visibility: "public", // Projets publics
          blocks: p.blocks ?? [],
          seo: p.seo ?? {},
          status: p.status ?? "draft",
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
        update: {
          title: p.title,
          excerpt: p.excerpt ?? null,
          description: p.description ?? null,
          coverImage: p.coverImage ?? p.image ?? null,
          category: p.category ?? null,
          featured: !!p.featured,
          visibility: "public",
          blocks: p.blocks ?? [],
          seo: p.seo ?? {},
          status: p.status ?? "draft",
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
      });
    }

    // AdminProjects (content.work.adminProjects) → visibility="admin"
    for (const p of data.adminProjects || []) {
      await tx.project.upsert({
        where: { siteId_slug: { siteId: site.id, slug: p.slug || p.id } },
        create: {
          siteId: site.id,
          slug: p.slug || p.id,
          title: p.title,
          excerpt: p.excerpt ?? p.description?.substring(0, 200) ?? null,
          description: p.description ?? null,
          coverImage: p.image ?? p.coverImage ?? null,
          category: p.category ?? null,
          featured: !!p.featured,
          visibility: "admin", // AdminProjects → visibility="admin"
          blocks: p.blocks ?? [],
          seo: p.seo ?? {},
          status: p.status ?? "draft",
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
        update: {
          title: p.title,
          excerpt: p.excerpt ?? p.description?.substring(0, 200) ?? null,
          description: p.description ?? null,
          coverImage: p.image ?? p.coverImage ?? null,
          category: p.category ?? null,
          featured: !!p.featured,
          visibility: "admin",
          blocks: p.blocks ?? [],
          seo: p.seo ?? {},
          status: p.status ?? "draft",
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
      });
    }

    await tx.navigationItem.deleteMany({ where: { siteId: site.id } });
    await tx.navigationItem.createMany({
      data: (data.nav ?? []).map((n: any, i: number) => ({
        siteId: site.id,
        label: n.label,
        url: n.url,
        orderIndex: n.orderIndex ?? i,
        isExternal: !!n.isExternal,
      })),
    });

    if (data.footer) {
      await tx.footer.upsert({
        where: { siteId: site.id },
        create: {
          siteId: site.id,
          content: data.footer.content ?? null,
          socials: data.footer.socials ?? [],
          columns: data.footer.columns ?? [],
        },
        update: {
          content: data.footer.content ?? null,
          socials: data.footer.socials ?? [],
          columns: data.footer.columns ?? [],
        },
      });
    }
    });

    // Marquer la migration comme réussie
    await prisma.migrationRun.update({
      where: { id: migrationRun.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        records: {
          pages: data.pages.length,
          articles: data.articles.length,
          projects: (data.projects?.length || 0) + (data.adminProjects?.length || 0),
        },
      },
    });

    console.log(`[OK] migrated ${siteKey} from ${filePath}`);
  } catch (error) {
    // Marquer la migration comme échouée
    await prisma.migrationRun.update({
      where: { id: migrationRun.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error; // Re-throw pour arrêter le script
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const root = process.cwd();

  await migrateOneSite("soliva", path.join(root, "data/content.json"), { dryRun });

  const templatesDir = path.join(root, "data/templates");
  const entries = await fs.readdir(templatesDir).catch(() => []);
  for (const tpl of entries) {
    const p = path.join(templatesDir, tpl, "content.json");
    await migrateOneSite(tpl, p, { dryRun });
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
```

---

## 11) Dual-write (phase critique)

### 11.1 Où brancher

Tu as déjà `PUT /api/admin/content` etc.  
Tu modifies les handlers pour appeler :

- `repo.upsertArticle(...)`
- `repo.upsertProject(...)`
- etc.

En `dual_write` :

1) write DB  
2) write JSON (best effort)  
3) logs si JSON échoue

Résultat : DB devient fiable comme source de vérité, sans risque de perdre des writes.

---

## 12) Dual-read (prod sans downtime)

En `dual_read` :

- lecture DB
- fallback JSON si DB down / erreur

À activer après import + dual-write.

---

## 13) Débrancher définitivement `/api/content`

Deux options :

- **Option A (reco)** : supprimer l’endpoint public `/api/content` (full dump)
- **Option B** : le garder mais **admin-only** (protégé) pour debug/export

---

## 14) Preview / Versions (aligné avec ton système)

En DB :

- `Revision.snapshot` contient un snapshot complet :
  - d’une page / article / project / site

Workflow simple :

- `POST /api/admin/preview/create` :
  - prend `entityType + entityId`
  - lit en DB
  - crée une `Revision` snapshot
  - renvoie `previewId`

Public read :

- si `?preview=previewId`, charger snapshot au lieu des tables.

---

## 15) Checklists par phase (acceptance criteria)

### Phase 0 (immédiat)

- [ ] aucun import `/api/content` côté client
- [ ] aucun “fallback full dump”
- [ ] listes blog/work ne chargent jamais `blocks`

### Phase 1 (DB ready)

- [ ] migrations Prisma OK
- [ ] seed sites OK

### Phase 2 (import)

- [ ] `--dry-run` ok
- [ ] import idempotent (re-run sans doublons)
- [ ] `MigrationRun` tracking fonctionnel
- [ ] `adminProjects` migrés avec `visibility="admin"`
- [ ] `projects` migrés avec `visibility="public"`
- [ ] pages/articles/projects visibles via DB
- [ ] Rollback automatique si erreur (transaction par site)

### Phase 3 (dual_write)

- [ ] un save admin écrit DB + JSON
- [ ] logs si JSON fail
- [ ] `revalidateTag` déclenché

### Phase 4 (dual_read)

- [ ] public lit DB
- [ ] si DB indispo → fallback JSON (contrôlé)

### Phase 5 (db only)

- [ ] `CONTENT_MODE=db`
- [ ] endpoint full dump supprimé/protégé
- [ ] pagination cursor active partout
- [ ] Validation Zod des blocs imbriqués en place
- [ ] Assets : décision V1 (métadonnées) vs V2 (storage externe)

---

## 16) Pièges classiques (et comment les éviter)

1. **Listes qui select `blocks`** → interdit. Séparer `selectList` vs `selectFull`.
2. **Cursor avec `publishedAt null`** (draft) → public = `status=published` uniquement.
3. **Taille des blocks** : OK en détail, interdit en liste.
4. **Connexions DB en serverless** : pooler (Neon/Supabase), éviter instanciations multiples de Prisma.
5. **Concurrence admin** : prévoir `updatedAt` et éventuellement un `version` (optimistic lock) plus tard.
6. **Blocs imbriqués** : JSONB gère les structures récursives, mais **validation Zod obligatoire** côté admin avant write.
7. **adminProjects vs projects** : Utiliser `visibility` dans une seule table `Project`, pas de duplication.
8. **Assets** : V1 = métadonnées en DB, fichiers restent dans `public/uploads`. V2 = storage externe si besoin.

---

## 17) Assets : stratégie de migration

### 17.1 V1 (reco) : Migrer métadonnées, garder fichiers

**Principe** :
- Garder `public/uploads/**` (ou ton stockage actuel)
- Ajouter table `Asset` pour référencer : `url`, `alt`, `width/height`, `mime`, `size`, `meta`, `siteId`

**Migration** :
- Option A : **Ne rien faire** si les URLs sont stables et tu n'en as pas besoin en DB
- Option B : **Import "best effort"** : scanner le dossier `uploads` et créer des entrées `Asset`

**Avantage** : Évite de toucher au système d'upload pendant la migration de contenu.

### 17.2 V2 (optionnel) : Storage externe

Seulement quand tu veux :
- CDN + cache agressif
- Séparation front/infra
- Uploads multi-instances sans filesystem

Options : Supabase Storage / S3 / Cloudflare R2

---

## 18) Rollback : stratégie complète

### 18.1 Import initial (script JSON → DB)

**Pattern recommandé** : **Transaction par site + idempotence**

- `prisma.$transaction()` pour **un site complet**
- Si ça plante : **rollback automatique** pour ce site
- Peut relancer sans doublons car tout est en `upsert`

✅ **Résultat** : Pas de DB "à moitié" pour un site.

**Amélioration** : Table `MigrationRun` pour tracking :
- `id, startedAt, finishedAt, status, siteKey, error, records`
- Script écrit `status=running` puis `success/fail`
- Utile pour audit/debug

### 18.2 Dual-write (admin écrit DB + JSON)

**Le rollback ici = le JSON reste le plan B**

- En mode `dual_write`, la source reste "utilisable" des deux côtés
- Si DB foire après déploiement :
  1. Repasser `CONTENT_MODE=json`
  2. Continuer d'écrire JSON
  3. Corriger DB puis relancer un import (ou rattrapage)

**Important** :
- Ordre recommandé = **write DB puis write JSON best effort**
- DB est la future source de vérité
- Si JSON fail, logger fort mais continuer (DB est OK)

### 18.3 Dual-read (public lit DB, fallback JSON)

**Filet de sécurité prod**

- Si DB down ou query fail : repository fallback JSON automatique
- **Pas de downtime** côté user
- Monitoring : alerter si fallback activé trop souvent

---

## 19) Quick wins supplémentaires (si tu veux verrouiller la perf)

- Colonnes dédiées déjà présentes :
  - `excerpt`, `coverImage`, `category`, `featured`, `visibility`
- Ne jamais dériver ces infos en parcourant `blocks` à la volée côté API.
- V2 : ajouter un `SearchIndex` si tu veux full-text sérieux sans parser les blocks.

---

## 18) Recos finales (stack)

- **BDD** : PostgreSQL (prod)
- **ORM** : Prisma (vitesse + DX)
- **Hosting DB** :
  - Neon si Vercel + Postgres serverless simple
  - Supabase si tu veux auth/storage en bonus
  - Railway si tu veux “tout packagé”
