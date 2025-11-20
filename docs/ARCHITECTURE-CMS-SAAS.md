# 🏗️ Architecture CMS SaaS - Plan d'Évolution

**Date** : 23 janvier 2025  
**Objectif** : Transformer le CMS en plateforme SaaS scalable et performante (type Wix/Squarespace)

---

## 🎯 Vision Produit

### Objectifs Business
- **CMS multi-tenant** : Chaque client a son propre site isolé
- **Système de templates/démos** : Templates de base par secteur (snakers, beauté, etc.) avec contenu de démo
- **Scalabilité** : Support de milliers de sites avec des milliers d'articles/projets chacun
- **Performance** : Temps de chargement < 1s même avec beaucoup de contenu
- **Fiabilité** : 99.9% uptime, backups automatiques
- **Sécurité** : Isolation complète des données par client

### Système de Templates/Démos
- **Templates de base** : Créés via Template Manager par catégorie (portfolio, agency, blog, ecommerce, etc.)
- **Contenu de démo** : Chaque template a son propre contenu de démo (`data/templates/{template}/content.json`)
- **Objectif** : Montrer aux clients comment leur site pourrait ressembler dans leur secteur
- **Exemple** : Template "snakers" avec contenu sneakers vs template "beauté" avec contenu beauté

### Contraintes Techniques
- **Performance frontend** : Critique (expérience utilisateur finale)
- **Performance backend** : Critique (admin + API)
- **Scalabilité** : Architecture horizontale possible
- **Coûts** : Optimiser les ressources serveur

---

## 📊 État Actuel vs Cible

### ❌ Problèmes Actuels

#### 1. Stockage JSON
- **Limitation** : Fichiers JSON de 45 Mo+ avec peu de contenu
- **Problème** : Ne scale pas au-delà de quelques centaines d'articles
- **Impact** : Parsing lent, mémoire excessive, pas de requêtes optimisées

#### 2. Pas de Multi-Tenancy
- **Limitation** : Un seul fichier `content.json` par template
- **Problème** : Impossible d'avoir plusieurs clients avec le même template
- **Impact** : Pas de SaaS multi-tenant possible

#### 3. Chargement Client Complet
- **Limitation** : Tout le contenu chargé à chaque visite
- **Problème** : 45 Mo téléchargés même pour voir une liste
- **Impact** : Temps de chargement très long, mauvaise UX

#### 4. Pas de Pagination
- **Limitation** : Tous les articles/projets chargés d'un coup
- **Problème** : Impossible de gérer des milliers d'items
- **Impact** : Performance dégradée avec beaucoup de contenu

#### 5. Pas de Cache Avancé
- **Limitation** : Cache Next.js désactivé pour fichiers > 2 MB
- **Problème** : Rechargement complet à chaque requête
- **Impact** : Latence élevée, coûts serveur importants

---

## ✅ Architecture Cible (SaaS)

### Phase 1 : Migration Base de Données (CRITIQUE)

#### Option A : SQLite (Recommandé pour MVP)
**Avantages** :
- ✅ Pas de serveur DB à gérer
- ✅ Migration facile depuis JSON
- ✅ Performances excellentes jusqu'à ~100K articles
- ✅ Backup simple (copie de fichier)
- ✅ Gratuit et open-source

**Inconvénients** :
- ⚠️ Limité en écritures concurrentes (mais OK pour CMS)
- ⚠️ Pas de scalabilité horizontale native

**Quand utiliser** : MVP, petits/moyens clients (< 10K articles)

#### Option B : PostgreSQL (Recommandé pour Production)
**Avantages** :
- ✅ Scalabilité horizontale (réplication)
- ✅ Requêtes complexes optimisées
- ✅ Support multi-tenant natif
- ✅ Indexation avancée
- ✅ Transactions ACID

**Inconvénients** :
- ⚠️ Nécessite un serveur DB
- ⚠️ Plus complexe à gérer

**Quand utiliser** : Production, gros clients (> 10K articles)

#### Option C : Hybride (Recommandé pour Évolution Progressive)
**Stratégie** :
1. **Phase 1** : SQLite pour MVP (migration rapide)
2. **Phase 2** : PostgreSQL pour nouveaux clients
3. **Phase 3** : Migration progressive SQLite → PostgreSQL

**Avantages** :
- ✅ Migration progressive sans casser l'existant
- ✅ Flexibilité selon la taille du client
- ✅ Coûts optimisés (SQLite pour petits clients)

---

### Phase 2 : Multi-Tenancy + Templates/Démos

#### Architecture Proposée

```
Templates (démos de base)
├── Template "pearl" (secteur: portfolio)
│   └── Contenu de démo (articles/projets exemple)
├── Template "snakers" (secteur: ecommerce)
│   └── Contenu de démo (produits sneakers)
└── Template "beauté" (secteur: beauté)
    └── Contenu de démo (produits beauté)

Sites (clients)
├── Site 1 (basé sur template "pearl")
│   ├── Articles (table articles WHERE site_id = 1)
│   ├── Projets (table projects WHERE site_id = 1)
│   ├── Pages (table pages WHERE site_id = 1)
│   └── Config (table site_config WHERE site_id = 1, template_key = 'pearl')
├── Site 2 (basé sur template "snakers")
│   └── ...
└── Site 3 (basé sur template "beauté")
    └── ...
```

#### Gestion des Templates/Démos

**Problème actuel** :
- Chaque template a son propre `content.json` volumineux (45 Mo pour Pearl)
- Contenu de démo stocké dans JSON (ne scale pas)
- Pas de séparation entre contenu de démo et contenu client

**Solution proposée** :
- **Templates** : Stockés en DB avec flag `is_demo = true`
- **Contenu de démo** : Généré à la volée ou pré-généré léger
- **Clients** : Héritent du template mais ont leur propre contenu isolé

#### Isolation des Données

**Option 1 : Multi-tenant avec site_id** (Recommandé)
```sql
-- Toutes les tables ont un site_id
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  slug TEXT NOT NULL,
  published_at TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

CREATE INDEX idx_articles_site_id ON articles(site_id);
CREATE INDEX idx_articles_slug ON articles(site_id, slug);
```

**Option 2 : Base de données par client** (Pour isolation maximale)
- Une DB par client
- Isolation totale
- Plus complexe à gérer

**Recommandation** : Option 1 (plus simple, suffisant pour la plupart des cas)

---

### Phase 3 : API Optimisée

#### Structure des Endpoints

```
GET  /api/v1/sites/:siteId/metadata          # Métadonnées (< 50 Ko)
GET  /api/v1/sites/:siteId/pages/:slug      # Page spécifique
GET  /api/v1/sites/:siteId/articles          # Liste articles (paginated)
GET  /api/v1/sites/:siteId/articles/:slug    # Article spécifique
GET  /api/v1/sites/:siteId/projects          # Liste projets (paginated)
GET  /api/v1/sites/:siteId/projects/:slug   # Projet spécifique
```

#### Pagination

```typescript
// GET /api/v1/sites/:siteId/articles?page=1&limit=20
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Cache Stratégique

```typescript
// Métadonnées : Cache 1h (rarement modifiées)
Cache-Control: public, max-age=3600

// Articles/Projets : Cache 5min (modifiés plus souvent)
Cache-Control: public, max-age=300

// Contenu spécifique : Cache 15min
Cache-Control: public, max-age=900
```

---

### Phase 4 : Performance Frontend

#### Chargement Optimisé

```typescript
// ✅ Phase 1 : Charger les métadonnées (< 50 Ko)
const metadata = await fetch('/api/v1/sites/pearl/metadata');

// ✅ Phase 2 : Charger la liste paginée (si nécessaire)
const articles = await fetch('/api/v1/sites/pearl/articles?page=1&limit=20');

// ✅ Phase 3 : Charger le contenu complet uniquement pour la page courante
if (route === 'blog-slug') {
  const article = await fetch(`/api/v1/sites/pearl/articles/${slug}`);
}
```

#### Server-Side Rendering (SSR)

```typescript
// Pages individuelles : SSR pour SEO
export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  return <ArticleContent article={article} />;
}

// Listes : SSG avec revalidation
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map(a => ({ slug: a.slug }));
}
```

---

## 🗄️ Schéma de Base de Données

### Tables Principales

```sql
-- Templates (démos de base)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- 'pearl', 'snakers', 'beauté', etc.
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'portfolio', 'ecommerce', 'beauté', etc.
  description TEXT,
  is_demo BOOLEAN DEFAULT true, -- Template de démo ou template client
  demo_content JSONB, -- Contenu de démo léger (métadonnées uniquement)
  styles JSONB, -- Styles par défaut du template
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sites (clients)
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  template_id UUID REFERENCES templates(id), -- Template de base utilisé
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft', -- draft, published
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Projets
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB, -- Blocs, hero, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Configuration du site
CREATE TABLE site_config (
  site_id UUID PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
  metadata JSONB, -- title, description, etc.
  nav JSONB,
  footer JSONB,
  palette JSONB,
  typography JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_articles_site_status ON articles(site_id, status);
CREATE INDEX idx_articles_site_published ON articles(site_id, published_at DESC);
CREATE INDEX idx_projects_site_status ON projects(site_id, status);
CREATE INDEX idx_projects_site_published ON projects(site_id, published_at DESC);
```

---

## 🚀 Plan de Migration

### Étape 1 : Préparation (Semaine 1)
1. ✅ Créer le schéma de base de données (incluant table `templates`)
2. ✅ Créer les types TypeScript correspondants
3. ✅ Créer les fonctions de migration JSON → DB
4. ✅ Migrer les templates existants (pearl, praxis, etc.) vers la table `templates`
5. ✅ Tester la migration sur Pearl

### Étape 2 : API Métadonnées (Semaine 2)
1. ✅ Créer `/api/v1/sites/:siteId/metadata`
2. ✅ Créer `/api/v1/sites/:siteId/articles` (paginated)
3. ✅ Créer `/api/v1/sites/:siteId/projects` (paginated)
4. ✅ Modifier `pearl-client.tsx` pour utiliser les nouvelles APIs

### Étape 3 : Migration Contenu (Semaine 3)
1. ✅ Script de migration JSON → SQLite
2. ✅ Migration des données Pearl
3. ✅ Tests de régression
4. ✅ Validation des performances

### Étape 4 : Admin Optimisé (Semaine 4)
1. ✅ Modifier l'admin pour utiliser la DB
2. ✅ Optimiser les sauvegardes (upsert au lieu de tout réécrire)
3. ✅ Système de preview optimisé

### Étape 5 : Production (Semaine 5)
1. ✅ Déploiement progressif
2. ✅ Monitoring des performances
3. ✅ Optimisations basées sur les métriques

---

## 📈 Métriques de Succès

### Performance
- **Temps de chargement initial** : < 500 ms (métadonnées)
- **Temps de chargement page** : < 1s (contenu complet)
- **Temps de réponse API** : < 200 ms (p95)
- **Throughput** : > 1000 req/s

### Scalabilité
- **Support** : > 10 000 articles par site
- **Sites simultanés** : > 100 sites actifs
- **Concurrent users** : > 1000 utilisateurs simultanés

### Fiabilité
- **Uptime** : > 99.9%
- **Backups** : Automatiques toutes les 6h
- **RTO** (Recovery Time Objective) : < 1h
- **RPO** (Recovery Point Objective) : < 6h

---

## 🔒 Sécurité Multi-Tenant

### Isolation des Données
- ✅ Toutes les requêtes filtrent par `site_id`
- ✅ Validation stricte des permissions
- ✅ Pas de fuite de données entre sites

### Authentification
- ✅ JWT avec `site_id` dans le payload
- ✅ Validation côté serveur à chaque requête
- ✅ Rate limiting par site

---

## 💰 Coûts Estimés

### SQLite (MVP)
- **Coût** : 0€ (fichier local)
- **Limite** : ~100K articles par site
- **Scalabilité** : Verticale uniquement

### PostgreSQL (Production)
- **Coût** : ~20-50€/mois (VPS ou managed DB)
- **Limite** : Illimitée (avec réplication)
- **Scalabilité** : Horizontale

### CDN (Optionnel)
- **Coût** : ~10-30€/mois (Cloudflare, Vercel)
- **Bénéfice** : Réduction latence de 50-80%

---

## 🎯 Recommandation Finale

### Pour Pearl (Template de Référence)

**Phase 1 (Immédiat)** :
1. ✅ Créer API métadonnées (sans DB pour l'instant)
2. ✅ Optimiser le chargement dans `pearl-client.tsx`
3. ✅ Pagination côté API même avec JSON

**Phase 2 (Court terme - 1 mois)** :
1. ✅ Migration vers SQLite
2. ✅ Multi-tenancy basique (site_id)
3. ✅ Admin optimisé

**Phase 3 (Moyen terme - 3 mois)** :
1. ✅ Migration vers PostgreSQL (si nécessaire)
2. ✅ CDN pour assets
3. ✅ Cache avancé (Redis)

**Phase 4 (Long terme - 6 mois)** :
1. ✅ Scalabilité horizontale
2. ✅ Monitoring avancé
3. ✅ Auto-scaling

---

## 🎨 Optimisation Système Templates/Démos

### Problème Actuel
- Chaque template a son propre `content.json` volumineux (45 Mo pour Pearl)
- Contenu de démo complet stocké dans JSON (articles/projets avec HTML complet)
- Pas de séparation entre contenu de démo et contenu client

### Solution Proposée

#### 1. Contenu de Démo Léger
```sql
-- Table templates avec contenu de démo optimisé
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,
  category TEXT,
  demo_content JSONB -- Métadonnées uniquement, pas de contenu HTML complet
);

-- Exemple de demo_content léger
{
  "articles": [
    { "title": "Article exemple", "excerpt": "...", "slug": "article-exemple" }
    // Pas de content HTML complet
  ],
  "projects": [
    { "title": "Projet exemple", "excerpt": "...", "slug": "projet-exemple" }
    // Pas de content HTML complet
  ]
}
```

#### 2. Génération de Contenu de Démo à la Volée
- **Option A** : Contenu de démo généré par l'IA à la première visite
- **Option B** : Contenu de démo pré-généré mais léger (métadonnées + quelques exemples)
- **Recommandation** : Option B (plus rapide, prévisible)

#### 3. Séparation Template/Client
```sql
-- Quand un client choisit un template
INSERT INTO sites (name, template_id) VALUES ('Mon Site', 'pearl-template-id');

-- Le client hérite de la structure mais pas du contenu
-- Le contenu de démo reste dans templates.demo_content
-- Le contenu client est dans articles/projects avec site_id
```

#### 4. API Optimisée pour Démos
```typescript
// GET /api/v1/templates/:templateKey/demo
// Retourne uniquement les métadonnées de démo (< 50 Ko)
{
  "template": { "key": "pearl", "category": "portfolio" },
  "demo": {
    "articles": [{ "title", "excerpt", "slug" }], // Pas de content
    "projects": [{ "title", "excerpt", "slug" }] // Pas de content
  }
}

// GET /api/v1/templates/:templateKey/demo/article/:slug
// Retourne le contenu complet d'un article de démo (si nécessaire)
```

---

## ❓ Questions à Valider

1. **Base de données** : SQLite pour MVP ou PostgreSQL directement ?
2. **Multi-tenancy** : Un site = un client ou plusieurs sites par client ?
3. **Templates/Démos** : 
   - Les démos doivent-elles être complètes (avec contenu HTML) ou juste des métadonnées ?
   - Génération de contenu de démo à la volée ou pré-généré ?
4. **Domaine** : Sous-domaines (client1.cms.com) ou domaines personnalisés ?
5. **Pricing** : Modèle freemium, abonnement, ou usage-based ?
6. **Limites** : Limites par plan (articles, stockage, bande passante) ?

---

**Prochaines étapes** : Valider cette architecture et commencer l'implémentation de la Phase 1.

