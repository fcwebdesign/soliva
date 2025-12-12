# 🚀 Prompt Professionnel - Migration Base de Données pour Performance & Scalabilité CMS

**Contexte** : CMS Next.js avec système de blocs modulaires, stockage JSON actuel  
**Problème** : Performance dégradée avec croissance du contenu (chargement lent, parsing JSON lourd)  
**Objectif** : Migration vers base de données pour résoudre définitivement les problèmes de performance et scalabilité

---

## 📊 Constat Actuel

### Architecture Actuelle
- **Framework** : Next.js 15.3.2 (App Router)
- **Stockage** : Fichiers JSON (`data/content.json` + templates)
- **Pas de base de données** : Tout le contenu est dans des fichiers JSON
- **Système de blocs** : 38 blocs auto-déclarés avec contenu HTML complet stocké dans JSON

### Problèmes Identifiés

#### 1. **Chargement Initial Excessif** ⚠️ CRITIQUE
- **Situation** : Certains templates chargent encore `/api/content` qui retourne TOUT le contenu
- **Taille** : Fichiers JSON pouvant atteindre plusieurs Mo (225K+ pour certains templates)
- **Impact** :
  - Temps de chargement initial : 3-5 secondes
  - Bande passante excessive : Téléchargement de tout le contenu même si non utilisé
  - Mauvaise expérience utilisateur : Attente avant affichage

#### 2. **Parsing JSON Lourd** ⚠️ CRITIQUE
- **Situation** : Parsing de fichiers JSON volumineux à chaque requête
- **Problème** : Même avec cache en mémoire, le parsing initial est lent
- **Impact** :
  - Latence serveur élevée
  - Consommation mémoire excessive
  - Timeout possible sur serveurs lents

#### 3. **Pas de Chargement Différé** ⚠️ MAJEUR
- **Situation** : Contenu complet chargé même pour les listes (blog, work)
- **Problème** : On charge tous les blocs HTML de tous les articles/projets pour afficher une liste
- **Impact** :
  - Données inutiles téléchargées
  - Ralentissement inutile

#### 4. **Croissance Non Scalable** ⚠️ MAJEUR
- **Situation** : Chaque nouveau projet/article avec blocs augmente la taille du JSON
- **Problème** : Pas de limite, le fichier grandit indéfiniment
- **Impact** :
  - Performance dégradée progressivement
  - Risque de crash sur fichiers très volumineux
  - Impossible de gérer des milliers d'articles/projets

### Optimisations Déjà en Place

✅ **API Métadonnées** : `/api/content/metadata` (< 100 Ko)  
✅ **APIs Spécifiques** : `/api/content/article/[slug]` et `/api/content/project/[slug]`  
✅ **Cache en mémoire** : Cache du contenu parsé côté serveur  
✅ **Lazy loading images** : Images chargées à la demande  
✅ **Code splitting** : Next.js App Router

### Problèmes Restants

❌ **Fallback vers `/api/content`** : Plusieurs endroits chargent encore l'API complète :
   - `src/templates/Starter-Kit/Starter-Kit-client.tsx` : Fallback si metadata échoue
   - `src/blocks/auto-declared/ProjectsBlock/editor.tsx` : Chargement pour l'éditeur
   - `src/app/admin/work/[id]/page.tsx` : Chargement pour admin projet
   - `src/app/admin/template-manager/page.tsx` : Gestion des templates
   
❌ **Chargement complet pour listes** : Les listes blog/work chargent parfois tout le contenu  
❌ **Pas de pagination** : Impossible de paginer les articles/projets  
❌ **Pas de cache côté client** : Rechargement à chaque navigation  
❌ **Structure JSON monolithique** : Tout dans un seul fichier  
❌ **Parsing répété** : Même avec cache, parsing initial lent sur fichiers volumineux

---

## 🎯 Objectifs

### Performance
- **Temps de chargement initial** : < 500 ms
- **Temps de chargement page individuelle** : < 1 s
- **Taille initiale** : < 200 Ko (métadonnées uniquement)

### Scalabilité
- **Support** : 1000+ articles, 500+ projets
- **Croissance** : Performance stable avec croissance du contenu
- **Mémoire** : < 100 Mo par requête

### Contraintes
- **Migration BDD** : Solution choisie pour résoudre définitivement les problèmes
- **Rétrocompatibilité** : Ne pas casser l'existant pendant la migration
- **Migration progressive** : Dual-write puis dual-read pour transition en douceur

---

## 💡 Solution Choisie : Migration vers Base de Données

**Décision** : Migration vers une base de données pour résoudre définitivement les problèmes de performance et scalabilité.

### Pourquoi une BDD résout tous les problèmes ?

#### ✅ Problème 1 : Chargement Initial Excessif → RÉSOLU
- **Avec BDD** : Requêtes SQL ciblées (SELECT uniquement ce dont on a besoin)
- **Résultat** : Chargement initial < 50 Ko (métadonnées uniquement)
- **Exemple** : `SELECT id, title, slug, excerpt FROM articles LIMIT 10` au lieu de charger tout

#### ✅ Problème 2 : Parsing JSON Lourd → RÉSOLU
- **Avec BDD** : Pas de parsing JSON, requêtes optimisées avec index
- **Résultat** : Latence < 50 ms même avec milliers d'articles
- **Avantage** : Index B-tree natifs pour recherches rapides

#### ✅ Problème 3 : Pas de Chargement Différé → RÉSOLU
- **Avec BDD** : Pagination native (`LIMIT/OFFSET` ou curseurs)
- **Résultat** : Chargement de 10-20 articles à la fois
- **Avantage** : Requêtes optimisées par la BDD

#### ✅ Problème 4 : Croissance Non Scalable → RÉSOLU
- **Avec BDD** : Support de millions d'articles sans dégradation
- **Résultat** : Performance stable quelle que soit la taille
- **Avantage** : Index, partitions, réplication possibles

### Architecture Proposée

#### Base de Données Recommandée
- **Option 1 : PostgreSQL** ⭐ RECOMMANDÉ
  - Robuste, performant, support JSON natif
  - Parfait pour CMS avec relations complexes
  - Support full-text search intégré

- **Option 2 : SQLite** (pour début)
  - Pas de serveur à gérer
  - Migration facile depuis JSON
  - Peut migrer vers PostgreSQL plus tard

#### Structure de Tables Proposée

```sql
-- Métadonnées globales
CREATE TABLE site_metadata (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pages principales (home, studio, contact, etc.)
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  hero JSONB,
  blocks JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Articles de blog
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  excerpt TEXT,
  content TEXT,
  blocks JSONB,
  seo JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at);

-- Projets
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  excerpt TEXT,
  content TEXT,
  blocks JSONB,
  category VARCHAR(255),
  image VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);

-- Navigation
CREATE TABLE navigation (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255),
  url VARCHAR(500),
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Footer
CREATE TABLE footer (
  id SERIAL PRIMARY KEY,
  content TEXT,
  socials JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Stratégie de Migration Progressive

#### Phase 1 : Dual-Write (Semaine 1-2)
- **Principe** : Écrire dans JSON ET BDD simultanément
- **Avantage** : Pas de risque, on peut revenir en arrière
- **Action** : Modifier `/api/admin/content` pour écrire dans les deux

#### Phase 2 : Dual-Read (Semaine 3-4)
- **Principe** : Lire depuis BDD, fallback JSON si erreur
- **Avantage** : Migration transparente, pas de downtime
- **Action** : Modifier toutes les APIs pour lire depuis BDD

#### Phase 3 : Migration des Données (Semaine 5)
- **Principe** : Script de migration pour transférer tout le JSON vers BDD
- **Avantage** : Données historiques préservées
- **Action** : Script Node.js pour parser JSON et insérer en BDD

#### Phase 4 : Dépréciation JSON (Semaine 6)
- **Principe** : Retirer complètement le système JSON
- **Avantage** : Code simplifié, maintenance réduite
- **Action** : Supprimer code JSON, garder uniquement BDD

### Avantages de la Migration BDD

✅ **Performance** : Requêtes optimisées, index natifs  
✅ **Scalabilité** : Support illimité d'articles/projets  
✅ **Pagination** : Native et performante  
✅ **Recherche** : Full-text search intégré  
✅ **Relations** : Gestion des relations entre entités  
✅ **Transactions** : Atomicité des opérations  
✅ **Backup** : Sauvegardes BDD standardisées  
✅ **Monitoring** : Outils de monitoring BDD disponibles

### Inconvénients à Gérer

⚠️ **Complexité** : Ajout d'une couche BDD  
⚠️ **Migration** : Temps de développement (2-3 semaines)  
⚠️ **Infrastructure** : Serveur BDD à gérer (ou service cloud)  
⚠️ **ORM** : Nécessite un ORM (Prisma, Drizzle, etc.)

### Stack Technique Proposée

- **ORM** : Prisma (recommandé) ou Drizzle
- **BDD** : PostgreSQL (production) ou SQLite (développement)
- **Migration** : Prisma Migrate ou scripts SQL
- **Hosting BDD** : 
  - Développement : SQLite (local)
  - Production : PostgreSQL (Supabase, Railway, Neon, etc.)

---

## 🔍 Questions Techniques

1. **Quel ORM choisir** : Prisma vs Drizzle vs TypeORM ? (Prisma recommandé pour Next.js)
2. **Quelle base de données** : PostgreSQL (production) vs SQLite (développement) ?
3. **Comment structurer le schéma** : Tables séparées vs JSONB pour blocs complexes ?
4. **Stratégie de migration** : Script de migration automatique ou manuel ?
5. **Gestion des blocs** : Stocker en JSONB ou tables séparées avec relations ?
6. **Cache** : Redis nécessaire ou cache Next.js suffisant ?
7. **Hosting BDD** : Supabase, Railway, Neon, ou self-hosted ?

---

## 📋 Livrables Attendus

1. **Schéma de base de données** : Structure complète avec relations
2. **Script de migration** : Migration automatique JSON → BDD
3. **ORM Setup** : Configuration Prisma/Drizzle avec types TypeScript
4. **APIs refactorisées** : Toutes les APIs utilisant la BDD
5. **Système dual-write/read** : Transition progressive sans downtime
6. **Documentation** : Guide de migration et nouvelles APIs
7. **Tests de performance** : Métriques avant/après (objectif : < 500ms)

---

## 🛠️ Informations Techniques

### Stack Actuelle
- Next.js 15.3.2 (App Router)
- React 18.2.0
- TypeScript 5.9.2
- Node.js runtime pour APIs

### Structure Actuelle
```
data/
├── content.json              # Contenu principal (26K actuellement)
└── templates/
    ├── Starter-Kit/content.json  # Template Starter-Kit (26K)
    ├── pearl/content.json        # Template Pearl (139K)
    └── soliva/content.json       # Template Soliva (225K)
```

### APIs Existantes
- `GET /api/content` : Contenu complet (lourd)
- `GET /api/content/metadata` : Métadonnées uniquement (< 100 Ko) ✅
- `GET /api/content/article/[slug]` : Article complet ✅
- `GET /api/content/project/[slug]` : Projet complet ✅

### Points d'Entrée à Optimiser
- `src/templates/pearl/pearl-client.tsx` : Fallback vers `/api/content`
- `src/templates/Starter-Kit/Starter-Kit-client.tsx` : Fallback vers `/api/content`
- `src/app/work/[slug]/page.tsx` : Chargement projet
- `src/app/blog/[slug]/page.tsx` : Chargement article

---

## 🎯 Critères de Succès

### Métriques Cibles
- **Temps de chargement initial** : < 500 ms (vs 3-5s actuellement)
- **Taille téléchargée initiale** : < 200 Ko (vs plusieurs Mo)
- **Temps de chargement page individuelle** : < 1s
- **Support contenu** : 1000+ articles sans dégradation

### Qualité
- ✅ Rétrocompatibilité : Ne pas casser l'existant
- ✅ Maintenabilité : Code propre et documenté
- ✅ Testabilité : Tests de performance inclus
- ✅ Évolutivité : Permettre migration future vers BDD

---

**Merci de fournir une analyse détaillée avec recommandations concrètes et plan d'implémentation par phases.**

