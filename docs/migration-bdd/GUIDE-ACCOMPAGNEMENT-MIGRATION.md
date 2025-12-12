# 🎯 Guide d'Accompagnement Migration BDD - Documentation Complète

**Objectif** : Documentation ultra-détaillée pour faciliter l'accompagnement étape par étape  
**Structure** : Chaque étape est autonome, avec vérifications et exemples concrets

---

## 📚 Structure de la Documentation

1. **ROADMAP-MIGRATION-BDD.md** : Vue d'ensemble et planning
2. **GUIDE-ACCOMPAGNEMENT-MIGRATION.md** (ce fichier) : Guide détaillé étape par étape
3. **soliva-migration-bdd.md** : Spec technique complète (référence)

---

## 🎯 Phase 0 : Nettoyer l'Existant (IMMÉDIAT)

**Objectif** : Supprimer tous les fallbacks vers `/api/content` (full dump)  
**Durée** : 1-2 jours  
**Résultat** : Performance améliorée immédiatement, sans toucher à la BDD

### Étape 0.1 : Identifier tous les fallbacks

**Commande à exécuter** :
```bash
cd /Users/florent/Desktop/Professionnel/AGENCE/website/soliva
grep -r "fetch.*['\"]/api/content['\"]" src/ --include="*.ts" --include="*.tsx"
```

**Fichiers à vérifier** (liste complète) :
- `src/templates/Starter-Kit/Starter-Kit-client.tsx`
- `src/templates/pearl/pearl-client.tsx`
- `src/blocks/auto-declared/ProjectsBlock/editor.tsx`
- `src/app/admin/work/[id]/page.tsx`
- `src/app/admin/template-manager/page.tsx`
- `src/app/admin/components/TemplateManager.tsx`
- `src/app/api/admin/templates/generate/route.ts`

**Vérification** :
- [ ] Liste des fichiers avec fallback `/api/content` obtenue
- [ ] Compris quels fichiers doivent être modifiés

### Étape 0.2 : Modifier les templates clients

#### Fichier 1 : `src/templates/Starter-Kit/Starter-Kit-client.tsx`

**Rechercher** (autour de la ligne 162) :
```ts
const fallbackResponse = await fetch('/api/content', { cache: 'no-store' });
```

**Remplacer par** :
```ts
// Fallback désactivé : utiliser uniquement /api/content/metadata
// Si metadata échoue, afficher une erreur contrôlée
console.error('❌ Impossible de charger les métadonnées');
// Optionnel : afficher un message à l'utilisateur
```

**Vérification** :
- [ ] Code modifié
- [ ] Plus de fallback vers `/api/content`
- [ ] Erreur gérée proprement

#### Fichier 2 : `src/templates/pearl/pearl-client.tsx`

**Même modification** que Starter-Kit (ligne ~161)

**Vérification** :
- [ ] Code modifié
- [ ] Plus de fallback vers `/api/content`

### Étape 0.3 : Modifier les éditeurs admin

#### Fichier 3 : `src/blocks/auto-declared/ProjectsBlock/editor.tsx`

**Rechercher** (autour de la ligne 99) :
```ts
const response = await fetch('/api/content', {
```

**Remplacer par** :
```ts
// Utiliser uniquement /api/content/metadata pour la liste
const response = await fetch('/api/content/metadata', {
```

**Vérification** :
- [ ] Code modifié
- [ ] Utilise `/api/content/metadata` au lieu de `/api/content`

#### Fichier 4 : `src/app/admin/work/[id]/page.tsx`

**Rechercher** (autour de la ligne 256) :
```ts
const contentResponse = await fetch('/api/content');
```

**Remplacer par** :
```ts
// Utiliser /api/content/metadata pour les métadonnées
// Pour le projet complet, utiliser /api/content/project/[slug]
const contentResponse = await fetch('/api/content/metadata');
```

**Vérification** :
- [ ] Code modifié
- [ ] Utilise les APIs optimisées

### Étape 0.4 : Tester les modifications

**Commandes** :
```bash
# Lancer le serveur de développement
npm run dev
```

**Tests à effectuer** :
1. **Page d'accueil** : Vérifier qu'elle se charge
2. **Page blog** : Vérifier que la liste s'affiche
3. **Page work** : Vérifier que les projets s'affichent
4. **Admin** : Vérifier que l'édition fonctionne
5. **Admin work/[id]** : Vérifier qu'un projet s'édite

**Vérification** :
- [ ] Toutes les pages se chargent
- [ ] Pas d'erreurs dans la console
- [ ] Performance améliorée (chargement plus rapide)

### Étape 0.5 : Vérifier la taille des réponses

**Ouvrir DevTools** (F12) → Network

**Vérifier** :
- Les requêtes vers `/api/content/metadata` font < 100 Ko
- Plus aucune requête vers `/api/content` (full dump)

**Vérification finale Phase 0** :
- [ ] Tous les fallbacks supprimés
- [ ] Site fonctionne normalement
- [ ] Performance améliorée
- [ ] Prêt pour Phase 1

---

## 🛠️ Phase 1 : Setup BDD + Prisma (Infrastructure)

**Objectif** : Installer PostgreSQL et Prisma, créer le schéma  
**Durée** : 2-3 jours  
**Résultat** : BDD prête, tables créées, Prisma fonctionnel

### Étape 1.1 : Choisir et installer PostgreSQL

#### Option A : Local (macOS avec Homebrew)

**Commandes** :
```bash
# Installer PostgreSQL
brew install postgresql@15

# Démarrer PostgreSQL
brew services start postgresql@15

# Vérifier que ça fonctionne
psql postgres -c "SELECT version();"
```

**Vérification** :
- [ ] PostgreSQL installé
- [ ] Service démarré
- [ ] Commande `psql` fonctionne

#### Option B : Cloud (Recommandé - Neon)

**Étapes** :
1. Aller sur https://neon.tech
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Copier la `DATABASE_URL` (format : `postgresql://user:password@host/dbname`)

**Vérification** :
- [ ] Compte Neon créé
- [ ] Projet créé
- [ ] `DATABASE_URL` copiée

### Étape 1.2 : Installer Prisma

**Commandes** :
```bash
cd /Users/florent/Desktop/Professionnel/AGENCE/website/soliva

# Installer Prisma (dev dependency)
npm install -D prisma

# Installer le client Prisma
npm install @prisma/client

# Initialiser Prisma
npx prisma init
```

**Résultat attendu** :
- Dossier `prisma/` créé
- Fichier `prisma/schema.prisma` créé
- Fichier `.env` créé (ou mis à jour)

**Vérification** :
- [ ] Prisma installé
- [ ] `prisma/schema.prisma` existe
- [ ] `.env` existe

### Étape 1.3 : Configurer le schéma Prisma

**Fichier à modifier** : `prisma/schema.prisma`

**Action** :
1. Ouvrir `docs/soliva-migration-bdd.md`
2. Aller à la section "3) Prisma schema (copiable)"
3. Copier TOUT le contenu du bloc de code Prisma
4. Coller dans `prisma/schema.prisma` (remplacer le contenu par défaut)

**Vérification** :
- [ ] Schéma copié dans `prisma/schema.prisma`
- [ ] Le fichier contient les modèles : Site, Page, Article, Project, etc.

### Étape 1.4 : Configurer DATABASE_URL

**Fichier à modifier** : `.env`

**Action** :
1. Ouvrir `.env`
2. Trouver la ligne `DATABASE_URL=`
3. Remplacer par :
   - **Local** : `DATABASE_URL="postgresql://florent@localhost:5432/soliva_cms"`
   - **Neon** : Coller l'URL fournie par Neon

**Vérification** :
- [ ] `DATABASE_URL` configurée dans `.env`
- [ ] URL correcte (testée si possible)

### Étape 1.5 : Créer la base de données (si local)

**Commandes** :
```bash
# Créer la base de données
createdb soliva_cms

# Vérifier qu'elle existe
psql -l | grep soliva_cms
```

**Vérification** :
- [ ] Base de données créée
- [ ] Visible dans la liste des bases

### Étape 1.6 : Générer le client Prisma et créer les tables

**Commandes** :
```bash
# Générer le client Prisma (à partir du schéma)
npx prisma generate

# Créer les tables dans la BDD
npx prisma db push
```

**Résultat attendu** :
- Client Prisma généré dans `node_modules/.prisma/client`
- Tables créées dans la BDD

**Vérification** :
- [ ] `npx prisma generate` exécuté sans erreur
- [ ] `npx prisma db push` exécuté sans erreur
- [ ] Message "Your database is now in sync with your schema"

### Étape 1.7 : Vérifier avec Prisma Studio

**Commande** :
```bash
npx prisma studio
```

**Action** :
1. Prisma Studio s'ouvre dans le navigateur (http://localhost:5555)
2. Vérifier que les tables sont là :
   - Site
   - Page
   - Article
   - Project
   - NavigationItem
   - Footer
   - Asset
   - Revision
   - MigrationRun

**Vérification** :
- [ ] Prisma Studio s'ouvre
- [ ] Toutes les tables sont visibles
- [ ] Tables sont vides (normal, pas encore de données)

### Étape 1.8 : Créer un site de test

**Créer un fichier** : `scripts/test-db.ts`

**Contenu** :
```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer un site de test
  const site = await prisma.site.create({
    data: {
      key: 'test',
      name: 'Site de Test',
      metadata: {},
      typography: {},
      spacing: {},
      palettes: [],
      transitions: {},
    },
  });

  console.log('✅ Site créé:', site);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Exécuter** :
```bash
npx tsx scripts/test-db.ts
```

**Vérifier dans Prisma Studio** :
- [ ] Le site "test" apparaît dans la table Site

**Nettoyer** (optionnel) :
```ts
// Supprimer le site de test
await prisma.site.delete({ where: { key: 'test' } });
```

**Vérification finale Phase 1** :
- [ ] PostgreSQL installé et fonctionnel
- [ ] Prisma installé
- [ ] Schéma configuré
- [ ] `DATABASE_URL` configurée
- [ ] Tables créées
- [ ] Prisma Studio fonctionne
- [ ] Test de création réussi
- [ ] Prêt pour Phase 2

---

## 📦 Phase 2 : Migration des Données (Import)

**Objectif** : Importer tout le contenu JSON dans la BDD  
**Durée** : 2-3 jours  
**Résultat** : Toutes les données dans la BDD, MigrationRun enregistré

### Étape 2.1 : Créer le script de migration

**Créer le dossier** :
```bash
mkdir -p scripts
```

**Créer le fichier** : `scripts/migrate-json-to-db.ts`

**Action** :
1. Ouvrir `docs/soliva-migration-bdd.md`
2. Aller à la section "10) Script de migration JSON → DB"
3. Copier le code complet (lignes ~604-793)
4. Coller dans `scripts/migrate-json-to-db.ts`

**Vérification** :
- [ ] Fichier `scripts/migrate-json-to-db.ts` créé
- [ ] Code copié depuis la doc

### Étape 2.2 : Adapter la fonction extractAll()

**Fichier à modifier** : `scripts/migrate-json-to-db.ts`

**Rechercher** la fonction `extractAll()` :
```ts
function extractAll(content: any) {
  return {
    metadata: content.metadata ?? {},
    pages: content.pages?.pages ?? content.pages ?? [],
    articles: content.blog?.articles ?? [],
    projects: content.work?.projects ?? [],
    adminProjects: content.work?.adminProjects ?? [],
    nav: content.nav ?? content.navigation ?? [],
    footer: content.footer ?? null,
  };
}
```

**Action** :
1. Ouvrir `data/content.json`
2. Vérifier la structure exacte
3. Adapter `extractAll()` si nécessaire

**Exemple de vérification** :
```bash
# Voir la structure de content.json
cat data/content.json | jq 'keys'
```

**Vérification** :
- [ ] Structure JSON comprise
- [ ] `extractAll()` adaptée si nécessaire

### Étape 2.3 : Installer tsx (pour exécuter TypeScript)

**Commande** :
```bash
npm install -D tsx
```

**Vérification** :
- [ ] `tsx` installé

### Étape 2.4 : Tester en dry-run

**Commande** :
```bash
npx tsx scripts/migrate-json-to-db.ts --dry-run
```

**Résultat attendu** :
```
[DRY] soliva: pages=X articles=Y projects=Z adminProjects=W
[DRY] Starter-Kit: pages=X articles=Y projects=Z adminProjects=W
...
```

**Vérification** :
- [ ] Dry-run exécuté sans erreur
- [ ] Les nombres affichés sont cohérents
- [ ] Pas d'erreurs de parsing

### Étape 2.5 : Migration réelle

**⚠️ IMPORTANT : Backup avant migration**

**Commande** :
```bash
# Backup du JSON
cp data/content.json data/backups/content-$(date +%Y%m%d-%H%M%S).json

# Backup des templates
mkdir -p data/backups/templates
cp -r data/templates/* data/backups/templates/ 2>/dev/null || true
```

**Vérification** :
- [ ] Backup créé
- [ ] Fichiers sauvegardés

**Migration** :
```bash
npx tsx scripts/migrate-json-to-db.ts
```

**Résultat attendu** :
```
[OK] migrated soliva from data/content.json
[OK] migrated Starter-Kit from data/templates/Starter-Kit/content.json
...
```

**Vérification** :
- [ ] Migration exécutée sans erreur
- [ ] Messages "[OK] migrated" pour chaque site

### Étape 2.6 : Vérifier dans Prisma Studio

**Commande** :
```bash
npx prisma studio
```

**Vérifications** :
1. **Table Site** :
   - [ ] Sites créés (soliva, Starter-Kit, pearl, etc.)
2. **Table Page** :
   - [ ] Pages importées (home, studio, contact, etc.)
3. **Table Article** :
   - [ ] Articles importés
4. **Table Project** :
   - [ ] Projects importés avec `visibility="public"`
   - [ ] AdminProjects importés avec `visibility="admin"`
5. **Table MigrationRun** :
   - [ ] Enregistrements avec `status="success"`

**Vérification** :
- [ ] Toutes les données sont là
- [ ] `visibility` correct pour les projects
- [ ] MigrationRun enregistré

### Étape 2.7 : Vérifier la cohérence

**Créer un script de vérification** : `scripts/verify-migration.ts`

**Contenu** :
```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sites = await prisma.site.findMany({
    include: {
      pages: true,
      articles: true,
      projects: true,
    },
  });

  for (const site of sites) {
    console.log(`\n📊 Site: ${site.key}`);
    console.log(`  Pages: ${site.pages.length}`);
    console.log(`  Articles: ${site.articles.length}`);
    console.log(`  Projects: ${site.projects.length}`);
    console.log(`    - Public: ${site.projects.filter(p => p.visibility === 'public').length}`);
    console.log(`    - Admin: ${site.projects.filter(p => p.visibility === 'admin').length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Exécuter** :
```bash
npx tsx scripts/verify-migration.ts
```

**Vérification** :
- [ ] Les nombres sont cohérents avec le JSON original
- [ ] Pas de données manquantes

**Vérification finale Phase 2** :
- [ ] Script de migration créé
- [ ] Dry-run fonctionne
- [ ] Backup créé
- [ ] Migration réelle exécutée
- [ ] Données visibles dans Prisma Studio
- [ ] Vérification de cohérence OK
- [ ] Prêt pour Phase 3

---

## ✍️ Phase 3 : Dual-write (Écriture double)

**Objectif** : Écrire dans BDD ET JSON simultanément  
**Durée** : 3-4 jours  
**Résultat** : Les modifications admin sont sauvegardées dans les deux systèmes

### Étape 3.1 : Créer la structure des stores

**Créer les dossiers** :
```bash
mkdir -p src/content/store
```

**Fichiers à créer** :
1. `src/content/store/types.ts` (interface)
2. `src/content/store/JsonStore.ts` (implémentation JSON)
3. `src/content/store/DbStore.ts` (implémentation BDD)

### Étape 3.2 : Créer l'interface ContentStore

**Fichier** : `src/content/store/types.ts`

**Contenu** (copier depuis `docs/soliva-migration-bdd.md` section 4.1) :
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

**Vérification** :
- [ ] Fichier créé
- [ ] Interface complète

### Étape 3.3 : Créer JsonStore (implémentation JSON)

**Fichier** : `src/content/store/JsonStore.ts`

**Action** :
1. Cette implémentation utilise le code existant (`readContent`, `writeContent`)
2. Adapter les fonctions existantes pour implémenter l'interface `ContentStore`

**Structure de base** :
```ts
import type { ContentStore, ListParams, PaginatedResult } from './types';
import { readContent } from '@/lib/content';
// ... autres imports

export class JsonStore implements ContentStore {
  async getMetadata(siteKey: string): Promise<any> {
    // Utiliser readContent() existant
    // Retourner uniquement les métadonnées
  }

  async getPageBySlug(siteKey: string, slug: string): Promise<any | null> {
    // Lire depuis JSON
  }

  async upsertPage(siteKey: string, payload: any): Promise<any> {
    // Utiliser writeContent() existant
  }

  // ... implémenter toutes les méthodes de l'interface
}
```

**Vérification** :
- [ ] JsonStore créé
- [ ] Toutes les méthodes implémentées (même si basiques)

### Étape 3.4 : Créer DbStore (implémentation BDD)

**Fichier** : `src/content/store/DbStore.ts`

**Action** :
1. Utiliser Prisma Client pour lire/écrire en BDD
2. Implémenter toutes les méthodes de l'interface

**Structure de base** :
```ts
import { PrismaClient } from '@prisma/client';
import type { ContentStore, ListParams, PaginatedResult } from './types';
import { decodeCursor, encodeCursor } from '@/content/pagination';

export class DbStore implements ContentStore {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async getSiteByKey(siteKey: string) {
    const site = await this.prisma.site.findUnique({
      where: { key: siteKey },
    });
    if (!site) throw new Error(`Site ${siteKey} not found`);
    return site;
  }

  async getMetadata(siteKey: string): Promise<any> {
    const site = await this.getSiteByKey(siteKey);
    // Retourner les métadonnées du site
  }

  // ... implémenter toutes les méthodes
}
```

**Vérification** :
- [ ] DbStore créé
- [ ] Prisma Client utilisé
- [ ] Méthodes implémentées (peut être basique au début)

### Étape 3.5 : Créer ContentRepository

**Fichier** : `src/content/repository.ts`

**Action** :
1. Copier le code depuis `docs/soliva-migration-bdd.md` section 4.2
2. Adapter si nécessaire

**Vérification** :
- [ ] ContentRepository créé
- [ ] Code copié depuis la doc

### Étape 3.6 : Créer le helper getContentRepository

**Fichier** : `src/content/repository.ts` (ajouter à la fin)

**Contenu** :
```ts
import { JsonStore } from './store/JsonStore';
import { DbStore } from './store/DbStore';
import { ContentRepository } from './repository';

let repositoryInstance: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (repositoryInstance) return repositoryInstance;

  const mode = (process.env.CONTENT_MODE || 'json') as ContentMode;
  const db = new DbStore();
  const json = new JsonStore();

  repositoryInstance = new ContentRepository(mode, db, json, {
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
  });

  return repositoryInstance;
}
```

**Vérification** :
- [ ] Helper créé
- [ ] Utilise `CONTENT_MODE` depuis `.env`

### Étape 3.7 : Configurer CONTENT_MODE

**Fichier** : `.env`

**Ajouter** :
```
CONTENT_MODE=dual_write
```

**Vérification** :
- [ ] `CONTENT_MODE=dual_write` dans `.env`

### Étape 3.8 : Modifier les APIs admin

**Fichier à modifier** : `src/app/api/admin/content/route.ts`

**Rechercher** la fonction qui écrit (PUT/POST)

**Remplacer** :
```ts
// Avant
await writeContentToFile(data);

// Après
import { getContentRepository } from '@/content/repository';
const repo = getContentRepository();
await repo.upsertArticle('soliva', data); // ou le bon siteKey
```

**Vérification** :
- [ ] APIs admin modifiées
- [ ] Utilisent `getContentRepository()`

### Étape 3.9 : Tester dual-write

**Actions** :
1. Lancer `npm run dev`
2. Aller dans l'admin
3. Modifier un article
4. Sauvegarder

**Vérifications** :
1. **Dans Prisma Studio** : L'article est modifié en BDD
2. **Dans `data/content.json`** : L'article est aussi modifié
3. **Dans les logs** : Pas d'erreur si JSON fail

**Vérification finale Phase 3** :
- [ ] JsonStore créé et fonctionnel
- [ ] DbStore créé et fonctionnel
- [ ] ContentRepository créé
- [ ] `CONTENT_MODE=dual_write` configuré
- [ ] APIs admin modifiées
- [ ] Test : modification → visible en BDD ET JSON
- [ ] Prêt pour Phase 4

---

## 📖 Phase 4 : Dual-read puis DB only

**Objectif** : Lire depuis BDD avec fallback JSON, puis supprimer JSON  
**Durée** : 3-4 jours  
**Résultat** : Site fonctionne uniquement avec BDD

### Étape 4.1 : Modifier les APIs publiques

**Fichiers à modifier** :
- `src/app/api/content/metadata/route.ts`
- `src/app/api/content/article/[slug]/route.ts`
- `src/app/api/content/project/[slug]/route.ts`

**Action** : Remplacer les appels directs par le repository

**Exemple** (`src/app/api/content/metadata/route.ts`) :
```ts
// Avant
const content = await loadTemplateContent();

// Après
import { getContentRepository } from '@/content/repository';
const repo = getContentRepository();
const metadata = await repo.getMetadata('soliva'); // ou détecter le siteKey
```

**Vérification** :
- [ ] APIs publiques modifiées
- [ ] Utilisent le repository

### Étape 4.2 : Activer dual-read

**Fichier** : `.env`

**Modifier** :
```
CONTENT_MODE=dual_read
```

**Tester** :
1. Lancer `npm run dev`
2. Vérifier que les pages se chargent
3. Vérifier que les données viennent de la BDD

**Vérification** :
- [ ] `CONTENT_MODE=dual_read` configuré
- [ ] Site fonctionne
- [ ] Données depuis BDD

### Étape 4.3 : Tester le fallback JSON

**Action** : Simuler une erreur BDD (temporairement)

**Vérification** :
- [ ] Si BDD down, fallback JSON fonctionne
- [ ] Pas de downtime

### Étape 4.4 : Passer en DB only

**Fichier** : `.env`

**Modifier** :
```
CONTENT_MODE=db
```

**Tester** :
1. Lancer `npm run dev`
2. Vérifier que tout fonctionne
3. Vérifier les performances

**Vérification finale Phase 4** :
- [ ] APIs publiques modifiées
- [ ] `CONTENT_MODE=dual_read` testé
- [ ] Fallback JSON fonctionne
- [ ] `CONTENT_MODE=db` activé
- [ ] Tout fonctionne sans JSON
- [ ] Performance améliorée
- [ ] Migration terminée ! 🎉

---

## ✅ Checklist Globale

### Phase 0
- [ ] Tous les fallbacks `/api/content` supprimés
- [ ] Site fonctionne normalement
- [ ] Performance améliorée

### Phase 1
- [ ] PostgreSQL installé
- [ ] Prisma installé et configuré
- [ ] Tables créées
- [ ] Prisma Studio fonctionne

### Phase 2
- [ ] Script de migration créé
- [ ] Données migrées
- [ ] Vérification OK

### Phase 3
- [ ] Stores créés
- [ ] Repository créé
- [ ] Dual-write fonctionnel

### Phase 4
- [ ] Dual-read fonctionnel
- [ ] DB only activé
- [ ] Migration terminée

---

## 🆘 Points de Blocage Courants

### Erreur Prisma "Can't reach database"
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier que PostgreSQL est démarré (si local)
- Vérifier la connexion réseau (si cloud)

### Erreur "Site not found"
- Vérifier que les sites sont créés en BDD
- Vérifier le `siteKey` utilisé

### Erreur de migration
- Vérifier la structure JSON
- Vérifier les logs dans `MigrationRun`
- Relancer en `--dry-run` pour voir l'erreur

---

## 📝 Notes pour l'Accompagnement

**Structure de cette doc** :
- Chaque étape est autonome
- Vérifications à chaque étape
- Commandes exactes à exécuter
- Points de blocage documentés

**Pour l'accompagnement** :
- Suivre étape par étape
- Vérifier chaque point avant de passer à la suite
- Ne pas hésiter à revenir en arrière si problème

**Cette doc sera mise à jour** au fur et à mesure de l'avancement.

