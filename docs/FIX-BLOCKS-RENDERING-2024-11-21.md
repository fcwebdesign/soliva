# Fix : Problème d'affichage des blocs customisés

**Date** : 21 novembre 2024  
**Agent** : @AGENT-ARCHITECTURE  
**Problème** : Les blocs customisés ne s'affichaient que sur showcase, pas sur studio ni test-page

---

## 🔍 Problème identifié

Les pages studio et test-page affichaient uniquement les titres mais aucun bloc de contenu, alors que les blocs étaient bien présents dans le JSON et que showcase fonctionnait correctement.

### Symptômes

- ✅ Showcase : blocs visibles
- ❌ Studio : page vide (seulement le titre)
- ❌ Test-page : page vide (seulement le titre)
- ✅ Admin : édition des blocs fonctionnelle

### Analyse

Deux problèmes distincts ont été identifiés :

#### 1. Mauvais imports du BlockRenderer

Il existait **deux versions** du `BlockRenderer` dans le projet :

- `@/components/BlockRenderer` - **Ancienne version** (simplifiée, bugs avec les blocs auto-déclarés)
- `@/blocks/BlockRenderer` - **Version correcte** (avec système de registre par template)

Plusieurs pages utilisaient encore l'ancien import :

```typescript
// ❌ Ancien (incorrect)
import BlockRenderer from "@/components/BlockRenderer";

// ✅ Nouveau (correct)
import BlockRenderer from "@/blocks/BlockRenderer";
```

**Pourquoi c'était un problème** : L'ancien BlockRenderer ne gérait pas correctement le système de registre par template, ce qui causait des problèmes avec les blocs auto-déclarés comme `image`, `contact`, `content`, etc.

#### 2. Condition de rendu trop stricte dans Pearl

Dans `pearl-client.tsx`, la condition pour afficher les blocs vérifiait que chaque bloc avait un `content` non vide :

```typescript
// ❌ Condition trop stricte
{Array.isArray(pageData?.blocks) && 
 pageData.blocks.length > 0 && 
 pageData.blocks.some((block: any) => block.content && block.content.trim() !== '') ? (
  <BlockRenderer blocks={pageData.blocks} content={fullContent || metadata} />
) : null}
```

**Pourquoi c'était un problème** : Les blocs comme `image` et `contact` ne stockent PAS leurs données dans une propriété `content` directe, mais dans `data` :

```json
{
  "id": "image-1763705064111",
  "type": "image",
  "data": {
    "image": {
      "src": "/uploads/1763705071367-c45d1097.webp",
      "alt": ""
    }
  }
}
```

La condition `block.content && block.content.trim() !== ''` était donc toujours `false` pour ces blocs, empêchant leur affichage.

---

## ✅ Solutions appliquées

### 1. Mise à jour des imports BlockRenderer

Fichiers modifiés pour utiliser le bon import :

```diff
- import BlockRenderer from "@/components/BlockRenderer";
+ import BlockRenderer from "@/blocks/BlockRenderer";
```

**Fichiers concernés** :
- ✅ `src/app/studio/studio-client.tsx`
- ✅ `src/app/[slug]/page.tsx`
- ✅ `src/app/[slug]/page-client.tsx`
- ✅ `src/app/home-client.tsx`
- ✅ `src/app/page.tsx`
- ✅ `src/app/work/[slug]/page.tsx`
- ✅ `src/app/blog/[slug]/page-client.tsx`

### 2. Simplification de la condition dans Pearl

**Fichier** : `src/templates/pearl/pearl-client.tsx`

```diff
- {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 && pageData.blocks.some((block: any) => block.content && block.content.trim() !== '') ? (
+ {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
    <BlockRenderer blocks={pageData.blocks} content={fullContent || metadata} />
  ) : !(pageData?.hero?.title || pageData?.title || pageData?.hero?.subtitle || pageData?.description) ? (
```

**Explication** : On vérifie simplement qu'il y a des blocs dans le tableau. Le BlockRenderer se charge ensuite de gérer chaque type de bloc individuellement.

### 3. Warning de dépréciation

Ajout d'un warning dans l'ancien BlockRenderer pour éviter que le problème se reproduise :

**Fichier** : `src/components/BlockRenderer.tsx`

```typescript
/**
 * ⚠️ DEPRECATED - NE PAS UTILISER CE FICHIER
 * 
 * Ce fichier est une ancienne version du BlockRenderer.
 * Utilisez plutôt : import BlockRenderer from '@/blocks/BlockRenderer'
 * 
 * Raison : Cette version ne gère pas correctement le système de registre
 * par template et peut causer des problèmes avec les blocs auto-déclarés.
 * 
 * Ce fichier sera supprimé dans une future version.
 */

// Log de warning en développement
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️ DEPRECATED: Vous utilisez @/components/BlockRenderer qui est déprécié.\n' +
    'Utilisez plutôt: import BlockRenderer from "@/blocks/BlockRenderer"'
  );
}
```

### 4. Ajout de logs de debug

Pour faciliter le débogage futur, ajout de logs détaillés dans le BlockRenderer :

```typescript
// Debug: afficher tous les blocs reçus
if (process.env.NODE_ENV !== 'production' && blocks.length > 0) {
  console.log('🎨 [BlockRenderer] Rendu de', blocks.length, 'blocs:', 
    blocks.map(b => ({ id: b.id, type: b.type }))
  );
}

// Debug pour TOUS les types de blocs en développement
if (process.env.NODE_ENV !== 'production') {
  console.log(`🎨 [BlockRenderer] Traitement bloc ${block.type}:`, { 
    block, 
    hasTemplateComponent: !!(registry[block.type] ?? defaultRegistry[block.type]),
    scalable: getAutoDeclaredBlock(block.type)
  });
}
```

---

## 🧪 Tests effectués

### Studio (`/studio`)

**Avant** :
- Titre "About us." visible
- Description visible
- ❌ Aucun bloc affiché

**Après** :
- ✅ Titre "About us." visible
- ✅ Description visible
- ✅ Image affichée (bloc `image`)
- ✅ Bloc contact affiché (bloc `contact`)

### Test Page (`/test-page`)

**Avant** :
- Titre "Test Page" visible
- Description visible
- ❌ Aucun bloc affiché

**Après** :
- ✅ Titre "Test Page" visible
- ✅ Description visible
- ✅ Image affichée (bloc `image`)
- ✅ Bloc content affiché (bloc `content`)

### Console logs

Les logs confirment le bon fonctionnement :

```
🎨 [BlockRenderer] Rendu de 2 blocs: [Object, Object]
🎨 [BlockRenderer] Traitement bloc image: {...}
✅ [BlockRenderer] Utilisation du bloc auto-déclaré pour image
🎨 [BlockRenderer] Traitement bloc contact: {...}
✅ [BlockRenderer] Utilisation du bloc auto-déclaré pour contact
```

---

## 📊 Validation

### Compilation

```bash
npm run build
```

**Résultat** : ✅ Build réussi sans erreur

### Pages testées

- ✅ `/studio` - Blocs affichés correctement
- ✅ `/test-page` - Blocs affichés correctement
- ✅ `/showcase` - Continue de fonctionner
- ✅ Toutes les autres pages - Pas de régression

---

## 🎯 Points clés à retenir

### Pour les développeurs

1. **Toujours utiliser** `import BlockRenderer from '@/blocks/BlockRenderer'`
2. **Ne jamais utiliser** `import BlockRenderer from '@/components/BlockRenderer'` (déprécié)
3. Les blocs auto-déclarés stockent leurs données dans `data`, pas forcément dans `content`
4. Tester les blocs sur plusieurs pages, pas seulement showcase

### Structure des blocs

Les blocs auto-déclarés peuvent avoir différentes structures :

```typescript
// Bloc avec content direct
{
  id: "content-123",
  type: "content",
  content: "<p>Texte</p>"
}

// Bloc avec data imbriquée
{
  id: "image-123",
  type: "image",
  data: {
    image: {
      src: "/path/to/image.jpg",
      alt: "Description"
    }
  }
}

// Bloc avec propriétés multiples
{
  id: "contact-123",
  type: "contact",
  data: {
    title: "Contactez-nous",
    ctaText: "Envoyer",
    ctaLink: "/contact",
    theme: "auto"
  }
}
```

Le BlockRenderer gère automatiquement toutes ces structures.

---

## 🔮 Actions futures

### Court terme

- [ ] Supprimer complètement `src/components/BlockRenderer.tsx` après avoir vérifié qu'il n'est plus utilisé nulle part
- [ ] Documenter le système de blocs auto-déclarés dans `docs/agents/AGENT-BLOCKS.md`

### Moyen terme

- [ ] Ajouter des tests automatisés pour détecter ce genre de problème
- [ ] Créer un linter rule pour interdire l'import de l'ancien BlockRenderer
- [ ] Standardiser la structure des données des blocs

---

## 📝 Références

- **Système de blocs** : `README-SCALABLE-BLOCKS.md`
- **Documentation agent** : `docs/agents/AGENT-BLOCKS.md`
- **Registry des blocs** : `src/blocks/auto-declared/registry.ts`
- **BlockRenderer principal** : `src/blocks/BlockRenderer.tsx`

---

**Statut** : ✅ Résolu et testé  
**Impact** : Correction critique pour l'affichage des blocs sur toutes les pages  
**Breaking changes** : Aucun (amélioration rétrocompatible)

