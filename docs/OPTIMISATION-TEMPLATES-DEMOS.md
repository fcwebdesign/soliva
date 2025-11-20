# 🎨 Optimisation Système Templates/Démos

**Date** : 23 janvier 2025  
**Objectif** : Optimiser le système de templates/démos pour qu'il soit performant et scalable

---

## 📊 Constat Actuel

### Système de Templates/Démos

**Fonctionnement** :
- Template Manager permet de créer de nouveaux templates par catégorie
- Chaque template a son propre contenu de démo dans `data/templates/{template}/content.json`
- Objectif : Montrer aux clients comment leur site pourrait ressembler dans leur secteur
- Exemple : Template "snakers" avec contenu sneakers vs template "beauté" avec contenu beauté

**Problèmes identifiés** :
1. **Fichiers volumineux** : Chaque template a son propre `content.json` (45 Mo pour Pearl)
2. **Contenu complet** : Articles/projets avec HTML complet stocké dans les démos
3. **Pas de séparation** : Contenu de démo mélangé avec contenu client potentiel
4. **Performance** : Chargement lent même pour les démos

---

## ✅ Solutions Proposées

### Solution 1 : Contenu de Démo Léger (RECOMMANDÉ)

**Principe** : Stocker uniquement les métadonnées dans les templates, pas le contenu HTML complet

#### Structure Optimisée

```typescript
// data/templates/{template}/demo.json (léger, < 10 Ko)
{
  "template": {
    "key": "pearl",
    "category": "portfolio",
    "name": "Pearl"
  },
  "demo": {
    "articles": [
      {
        "title": "Article exemple 1",
        "excerpt": "Court extrait de l'article...",
        "slug": "article-exemple-1",
        "category": "Design"
        // Pas de content HTML complet
      }
    ],
    "projects": [
      {
        "title": "Projet exemple 1",
        "excerpt": "Description courte...",
        "slug": "projet-exemple-1",
        "category": "Web Design"
        // Pas de content HTML complet
      }
    ],
    "pages": {
      "home": {
        "hero": { "title": "...", "subtitle": "..." },
        "blocks": [] // Structure uniquement, pas de contenu lourd
      }
    }
  }
}
```

**Avantages** :
- ✅ Fichiers légers (< 10 Ko au lieu de 45 Mo)
- ✅ Chargement rapide des démos
- ✅ Scalabilité : Peut avoir des centaines de templates sans problème

**Implémentation** :
- Créer un script de migration qui extrait uniquement les métadonnées
- Générer le contenu HTML complet à la volée si nécessaire (via IA)

---

### Solution 2 : Génération de Contenu à la Volée

**Principe** : Générer le contenu HTML complet uniquement quand nécessaire

#### Workflow

```typescript
// 1. Charger la démo (léger)
const demo = await fetch('/api/v1/templates/pearl/demo');
// Retourne : métadonnées uniquement (< 10 Ko)

// 2. Si l'utilisateur veut voir le contenu complet d'un article
const article = await fetch('/api/v1/templates/pearl/demo/article/article-exemple-1');
// Génère le contenu HTML à la volée (via IA ou template)
```

**Avantages** :
- ✅ Démos ultra-légères
- ✅ Contenu toujours à jour
- ✅ Personnalisable par secteur

**Inconvénients** :
- ⚠️ Latence à la première génération
- ⚠️ Nécessite un système de génération IA

---

### Solution 3 : Base de Données pour Templates

**Principe** : Stocker les templates en DB avec contenu optimisé

#### Schéma

```sql
-- Table templates
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  demo_metadata JSONB, -- Métadonnées de démo (< 10 Ko)
  demo_content_cache JSONB, -- Cache optionnel du contenu généré
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table template_demo_content (optionnel, pour cache)
CREATE TABLE template_demo_content (
  template_id UUID REFERENCES templates(id),
  content_type TEXT, -- 'article', 'project'
  slug TEXT,
  content TEXT, -- Contenu HTML complet (généré)
  generated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (template_id, content_type, slug)
);
```

**Avantages** :
- ✅ Scalabilité maximale
- ✅ Requêtes optimisées
- ✅ Cache possible

---

## 🚀 Plan d'Implémentation

### Phase 1 : Migration Contenu de Démo (Semaine 1)

1. **Créer script de migration**
   ```bash
   node scripts/migrate-template-demos.js
   ```
   - Lit tous les `data/templates/{template}/content.json`
   - Extrait uniquement les métadonnées
   - Crée `data/templates/{template}/demo.json` (léger)

2. **Modifier API `/api/content`**
   - Si template de démo : charger `demo.json` au lieu de `content.json`
   - Retourner uniquement les métadonnées

3. **Tester sur Pearl**
   - Vérifier que la démo charge rapidement
   - Vérifier que le contenu complet peut être généré si nécessaire

**Gain estimé** : Réduction de 99% de la taille des démos (< 10 Ko au lieu de 45 Mo)

---

### Phase 2 : Génération de Contenu (Semaine 2)

1. **Créer API de génération**
   ```
   POST /api/v1/templates/:templateKey/demo/generate-content
   Body: { type: 'article', slug: 'article-exemple-1' }
   ```
   - Génère le contenu HTML complet via IA
   - Cache le résultat

2. **Modifier les pages de démo**
   - Charger d'abord les métadonnées
   - Générer le contenu à la demande

---

### Phase 3 : Migration DB (Semaine 3)

1. **Migrer templates vers DB**
   - Créer table `templates`
   - Migrer les métadonnées de démo
   - Garder le système JSON comme fallback

2. **Optimiser les requêtes**
   - Index sur `category`, `key`
   - Cache des métadonnées fréquemment accédées

---

## 📊 Métriques Cibles

### Actuel
- **Taille démo Pearl** : 45 Mo
- **Temps de chargement** : 3-5 secondes
- **Nombre de templates** : ~15 templates

### Objectif Phase 1
- **Taille démo Pearl** : < 10 Ko
- **Temps de chargement** : < 200 ms
- **Nombre de templates** : Illimité (scalable)

### Objectif Phase 2
- **Taille démo Pearl** : < 5 Ko (métadonnées uniquement)
- **Temps de chargement** : < 100 ms
- **Génération contenu** : < 2s à la demande

---

## 🎯 Recommandation Finale

### Pour le MVP (Immédiat)

**Solution** : Contenu de démo léger (Solution 1)

1. ✅ Créer `demo.json` avec métadonnées uniquement
2. ✅ Modifier API pour charger `demo.json` au lieu de `content.json`
3. ✅ Générer le contenu HTML à la volée si nécessaire (via template ou IA simple)

**Avantages** :
- ✅ Implémentation rapide (1-2 jours)
- ✅ Gain immédiat de performance
- ✅ Compatible avec l'existant

### Pour la Production (Long terme)

**Solution** : Base de données + Génération à la volée (Solution 3)

1. ✅ Migrer templates vers DB
2. ✅ Système de génération IA pour le contenu de démo
3. ✅ Cache des contenus générés

---

## 🔧 Script de Migration

```javascript
// scripts/migrate-template-demos.js
const fs = require('fs');
const path = require('path');

function extractDemoMetadata(content) {
  return {
    template: {
      key: content._template,
      category: content.metadata?.category || 'portfolio'
    },
    demo: {
      articles: (content.blog?.articles || []).map(a => ({
        title: a.title,
        excerpt: a.excerpt || a.content?.substring(0, 200),
        slug: a.slug || a.id,
        category: a.category,
        publishedAt: a.publishedAt
        // Pas de content HTML complet
      })),
      projects: (content.work?.adminProjects || []).map(p => ({
        title: p.title,
        excerpt: p.excerpt || p.description?.substring(0, 200),
        slug: p.slug || p.id,
        category: p.category,
        image: p.image
        // Pas de content HTML complet
      })),
      pages: {
        home: {
          hero: content.home?.hero,
          blocks: [] // Structure uniquement
        }
      }
    }
  };
}

// Migrer tous les templates
const templatesDir = path.join(process.cwd(), 'data', 'templates');
const templates = fs.readdirSync(templatesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

templates.forEach(templateKey => {
  const contentPath = path.join(templatesDir, templateKey, 'content.json');
  if (fs.existsSync(contentPath)) {
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const demo = extractDemoMetadata(content);
    const demoPath = path.join(templatesDir, templateKey, 'demo.json');
    fs.writeFileSync(demoPath, JSON.stringify(demo, null, 2));
    console.log(`✅ ${templateKey}: ${(JSON.stringify(demo).length / 1024).toFixed(2)} Ko`);
  }
});
```

---

**Prochaines étapes** : Valider cette approche et commencer la migration des démos.

