# 🔍 Audit Performance Template Pearl

**Date** : 23 janvier 2025  
**Template** : Pearl  
**Objectif** : Identifier les problèmes de performance et proposer des solutions

---

## 📊 Constat

### Problèmes identifiés

#### 1. **Fichier content.json volumineux** ⚠️ CRITIQUE
- **Taille** : ~45 Mo (24 Mo réel après compression)
- **Lignes** : 416 158 lignes
- **Contenu** : Seulement 2 articles de blog + 4 projets work
- **Cause** : Contenu HTML complet stocké directement dans le JSON

#### 2. **Chargement côté client** ⚠️ CRITIQUE
- **Problème** : Tous les templates (dont Pearl) chargent **tout le contenu** via `fetch('/api/content')`
- **Impact** : 
  - Téléchargement de 45 Mo à chaque chargement de page
  - Temps de chargement initial très long
  - Consommation de bande passante excessive
  - Mauvaise expérience utilisateur

#### 3. **Pas de chargement partiel** ⚠️ MAJEUR
- **Problème** : Aucune API pour charger uniquement :
  - Les métadonnées d'une page
  - Un article spécifique
  - Une liste paginée d'articles
- **Impact** : Impossible d'optimiser le chargement

#### 4. **Cache désactivé** ⚠️ MAJEUR
- **Problème** : Cache Next.js désactivé pour fichiers > 2 MB
- **Impact** : Rechargement complet à chaque requête

#### 5. **Structure de données inefficace** ⚠️ MOYEN
- **Problème** : Tout le contenu HTML est stocké dans le JSON principal
- **Impact** : 
  - Fichier très lourd même avec peu de contenu
  - Parsing JSON lent
  - Mémoire utilisée excessive

---

## 🎯 Solutions proposées

### Solution 1 : API partielle (RECOMMANDÉ - Court terme) ⭐

**Objectif** : Créer des endpoints API qui retournent uniquement ce qui est nécessaire

#### Endpoints à créer :

1. **`/api/content/metadata`** - Métadonnées uniquement
   ```json
   {
     "metadata": {...},
     "nav": {...},
     "home": { "title": "...", "hero": {...} },
     "work": { "hero": {...}, "projects": [{ "title", "slug", "excerpt" }] },
     "blog": { "hero": {...}, "articles": [{ "title", "slug", "excerpt" }] }
   }
   ```

2. **`/api/content/page/[slug]`** - Page spécifique
   ```json
   {
     "page": { "title", "blocks", "hero", ... }
   }
   ```

3. **`/api/content/article/[slug]`** - Article spécifique
   ```json
   {
     "article": { "title", "content", "blocks", ... }
   }
   ```

4. **`/api/content/project/[slug]`** - Projet spécifique
   ```json
   {
     "project": { "title", "content", "blocks", ... }
   }
   ```

**Avantages** :
- ✅ Réduction drastique de la taille des réponses
- ✅ Chargement initial rapide (métadonnées seulement)
- ✅ Chargement à la demande du contenu complet
- ✅ Compatible avec l'existant

**Implémentation** : ~2-3 heures

---

### Solution 2 : Séparation contenu/métadonnées (RECOMMANDÉ - Moyen terme) ⭐⭐

**Objectif** : Séparer les métadonnées du contenu complet

#### Structure proposée :

```
data/
├── content.json (métadonnées uniquement, ~100 Ko)
├── articles/
│   ├── article-1.json
│   ├── article-2.json
│   └── ...
└── projects/
    ├── project-1.json
    ├── project-2.json
    └── ...
```

**Avantages** :
- ✅ Fichier principal léger
- ✅ Chargement rapide de la liste
- ✅ Contenu chargé uniquement quand nécessaire
- ✅ Meilleure scalabilité

**Implémentation** : ~1 jour

---

### Solution 3 : Server-Side Rendering (RECOMMANDÉ - Long terme) ⭐⭐⭐

**Objectif** : Utiliser le SSR de Next.js au lieu du chargement client

#### Changements :

1. **Passer de `'use client'` à Server Components**
2. **Utiliser `readContent()` côté serveur**
3. **Passer les données via props**

**Avantages** :
- ✅ Pas de chargement client
- ✅ SEO amélioré
- ✅ Performance optimale
- ✅ Cache Next.js fonctionnel

**Implémentation** : ~2-3 jours (refactoring des templates)

---

### Solution 4 : Base de données (OPTIONNEL - Long terme)

**Objectif** : Migrer vers une vraie base de données (SQLite, PostgreSQL, etc.)

**Avantages** :
- ✅ Requêtes optimisées
- ✅ Pagination native
- ✅ Indexation
- ✅ Scalabilité maximale

**Inconvénients** :
- ⚠️ Refactoring majeur
- ⚠️ Migration des données
- ⚠️ Complexité accrue

**Implémentation** : ~1 semaine

---

## 🚀 Plan d'action recommandé

### Phase 1 : Quick wins (Cette semaine)
1. ✅ Créer `/api/content/metadata` (métadonnées uniquement)
2. ✅ Modifier Pearl pour charger d'abord les métadonnées
3. ✅ Charger le contenu complet uniquement pour la page courante

**Gain estimé** : Réduction de 90% de la taille initiale

### Phase 2 : Optimisation (Semaine prochaine)
1. ✅ Créer les endpoints `/api/content/article/[slug]` et `/api/content/project/[slug]`
2. ✅ Modifier les pages individuelles pour utiliser ces endpoints
3. ✅ Ajouter un cache côté serveur pour les métadonnées

**Gain estimé** : Chargement initial < 100 Ko au lieu de 45 Mo

### Phase 3 : Refactoring (Mois prochain)
1. ✅ Séparer contenu/métadonnées dans la structure de fichiers
2. ✅ Migrer progressivement vers SSR pour les templates
3. ✅ Optimiser le cache Next.js

**Gain estimé** : Performance équivalente à un CMS professionnel

---

## 📈 Métriques cibles

### Actuel
- **Taille initiale** : 45 Mo
- **Temps de chargement** : 3-5 secondes (selon connexion)
- **Bande passante** : 45 Mo par visite

### Objectif Phase 1
- **Taille initiale** : < 100 Ko (métadonnées)
- **Temps de chargement** : < 500 ms
- **Bande passante** : < 100 Ko + contenu de la page courante

### Objectif Phase 2
- **Taille initiale** : < 50 Ko
- **Temps de chargement** : < 200 ms
- **Bande passante** : Optimisé par page

---

## ✅ Réponses aux questions

1. **Priorité** : ✅ **Frontend en premier** (CMS utilisé par le client)
2. **Compatibilité** : ✅ **Pearl uniquement** (template de référence, autres templates non concernés pour l'instant)
3. **Migration** : ✅ **Pearl uniquement** (case study pour décliner d'autres templates)
4. **Contenu** : ✅ **Illimité** (CMS doit supporter autant de contenu que nécessaire)

---

## 🎯 Plan d'action pour Pearl

### Phase 1 : API Métadonnées (Quick Win) ⭐

**Objectif** : Réduire drastiquement la taille du chargement initial

#### 1.1 Créer `/api/content/metadata` 
- Retourne uniquement les métadonnées nécessaires pour la navigation et les listes
- Exclut le contenu HTML complet des articles/projets
- Taille estimée : < 100 Ko au lieu de 45 Mo

#### 1.2 Créer `/api/content/article/[slug]`
- Retourne un article spécifique avec son contenu complet
- Utilisé uniquement pour les pages individuelles

#### 1.3 Créer `/api/content/project/[slug]`
- Retourne un projet spécifique avec son contenu complet
- Utilisé uniquement pour les pages individuelles

#### 1.4 Modifier `pearl-client.tsx`
- Charger d'abord les métadonnées (pour navigation + listes)
- Charger le contenu complet uniquement pour les pages individuelles
- Utiliser le cache navigateur pour les métadonnées

**Gain estimé** : Réduction de 99% de la taille initiale (< 100 Ko au lieu de 45 Mo)

---

### Phase 2 : Optimisation Admin (Moyen terme)

**Objectif** : Optimiser la sauvegarde côté admin

#### 2.1 Modifier `/api/admin/content` (PUT)
- Sauvegarder uniquement les modifications (diff)
- Ne pas recharger tout le contenu après sauvegarde

#### 2.2 Optimiser le système de preview
- Sauvegarder uniquement la page modifiée dans les previews
- Ne pas dupliquer tout le contenu

**Gain estimé** : Sauvegarde plus rapide, moins de fichiers volumineux

---

### Phase 3 : Structure de données optimisée (Long terme)

**Objectif** : Séparer métadonnées et contenu complet

#### 3.1 Structure proposée :
```
data/templates/pearl/
├── content.json (métadonnées uniquement, ~100 Ko)
├── articles/
│   ├── article-1.json
│   ├── article-2.json
│   └── ...
└── projects/
    ├── project-1.json
    ├── project-2.json
    └── ...
```

**Avantages** :
- Fichier principal toujours léger
- Scalabilité maximale
- Chargement à la demande optimal

**Implémentation** : Migration progressive avec compatibilité backward

---

## 🔧 Implémentation Phase 1 (Détails techniques)

### Structure de l'API Métadonnées

```typescript
// /api/content/metadata
{
  "metadata": {...},
  "nav": {...},
  "home": {
    "hero": {...},
    "blocks": [...] // Blocs uniquement (pas de contenu HTML lourd)
  },
  "work": {
    "hero": {...},
    "description": "...",
    "adminProjects": [
      {
        "id": "...",
        "title": "...",
        "slug": "...",
        "excerpt": "...", // Pas de content complet
        "category": "...",
        "image": "..."
      }
    ]
  },
  "blog": {
    "hero": {...},
    "description": "...",
    "articles": [
      {
        "id": "...",
        "title": "...",
        "slug": "...",
        "excerpt": "...", // Pas de content complet
        "publishedAt": "..."
      }
    ]
  },
  "studio": {...},
  "contact": {...}
}
```

### Modification de `pearl-client.tsx`

```typescript
// ✅ Phase 1 : Charger les métadonnées d'abord
const [metadata, setMetadata] = useState<any>(null);
const [fullContent, setFullContent] = useState<any>(null);

useEffect(() => {
  const loadMetadata = async () => {
    const response = await fetch('/api/content/metadata', {
      cache: 'force-cache', // Cache les métadonnées
      headers: { 'Cache-Control': 'public, max-age=3600' }
    });
    const data = await response.json();
    setMetadata(data);
  };
  
  loadMetadata();
}, []);

// ✅ Charger le contenu complet uniquement pour les pages individuelles
useEffect(() => {
  if (route === 'blog-slug' || route === 'work-slug') {
    const loadFullContent = async () => {
      const slug = pathname.split('/').pop();
      const endpoint = route === 'blog-slug' 
        ? `/api/content/article/${slug}`
        : `/api/content/project/${slug}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      setFullContent(data);
    };
    
    loadFullContent();
  }
}, [route, pathname]);
```

---

## 📊 Métriques cibles

### Actuel
- **Taille initiale** : 45 Mo
- **Temps de chargement** : 3-5 secondes
- **Bande passante** : 45 Mo par visite

### Phase 1 (Objectif)
- **Taille initiale** : < 100 Ko (métadonnées)
- **Temps de chargement** : < 500 ms
- **Bande passante** : < 100 Ko + contenu de la page courante uniquement

### Phase 2 (Objectif)
- **Taille initiale** : < 50 Ko
- **Temps de chargement** : < 200 ms
- **Bande passante** : Optimisé par page

---

## 🚀 Prochaines étapes

1. ✅ Valider ce plan
2. ⏳ Implémenter `/api/content/metadata`
3. ⏳ Implémenter `/api/content/article/[slug]` et `/api/content/project/[slug]`
4. ⏳ Modifier `pearl-client.tsx` pour utiliser les nouvelles APIs
5. ⏳ Tester les performances
6. ⏳ Documenter les changements

---

**Note** : Cette optimisation est spécifique à Pearl. Les autres templates continueront de fonctionner avec l'ancien système jusqu'à ce qu'ils soient migrés.

