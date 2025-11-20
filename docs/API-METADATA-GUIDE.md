# 📚 Guide API Metadata - Bonnes Pratiques

**Date de création** : 23 janvier 2025  
**Dernière mise à jour** : 23 janvier 2025  
**Status** : ✅ Actif

---

## 🎯 Objectif

Ce guide documente l'API `/api/content/metadata` et les bonnes pratiques pour éviter les problèmes de propriétés manquantes lors de l'optimisation des performances.

---

## ⚠️ Problème rencontré

**Date** : 23 janvier 2025  
**Symptôme** : La configuration `columns` dans la page `/work` ne s'affichait pas correctement (toujours 3 colonnes au lieu de la valeur configurée dans l'admin).

**Cause** : L'API `/api/content/metadata` ne retournait pas la propriété `columns` de la section `work`, alors que le composant `WorkPearl` en avait besoin.

**Solution** : Ajout de `columns: content.work?.columns` dans l'API metadata.

---

## 📋 Propriétés incluses dans `/api/content/metadata`

### Structure générale

```typescript
{
  _template: string,
  _transitionConfig: TransitionConfig,
  metadata: {
    typography: {...},
    colorPalette: string,
    layout: 'standard' | 'compact' | 'wide',
    reveal: {...},
    // ... toutes les propriétés de metadata
  },
  nav: {...},
  footer: {...},
  home: {...},
  studio: {...},
  contact: {...},
  work: {...},  // ⚠️ Voir section détaillée ci-dessous
  blog: {...},  // ⚠️ Voir section détaillée ci-dessous
  pages: {...}
}
```

### Section `work` - Propriétés incluses

```typescript
work: {
  hero: {...},                    // ✅ Hero de la page work
  description: string,            // ✅ Description de la page
  filters: Array,                 // ✅ Filtres de catégories
  columns: number,                // ✅ Nombre de colonnes (2, 3, ou 4)
  adminProjects: [{                // ✅ Projets avec métadonnées uniquement
    id, title, slug, excerpt,
    category, image, status,
    publishedAt, client, year, featured
    // ❌ PAS de content HTML complet
  }],
  projects: [{                    // ✅ Projets publics avec métadonnées
    title, slug, description (excerpt),
    category, image, alt
    // ❌ PAS de content HTML complet
  }]
}
```

### Section `blog` - Propriétés incluses

```typescript
blog: {
  hero: {...},                    // ✅ Hero de la page blog
  description: string,            // ✅ Description de la page
  articles: [{                     // ✅ Articles avec métadonnées uniquement
    id, title, slug, excerpt,
    publishedAt, status
    // ❌ PAS de content HTML complet
  }]
}
```

### Section `home` - Propriétés incluses

```typescript
home: {
  hero: {...},                    // ✅ Hero de la page d'accueil
  title: string,                  // ✅ Titre de la page
  description: string,           // ✅ Description
  blocks: Array                  // ✅ Blocs de contenu
}
```

### Section `studio` - Propriétés incluses

```typescript
studio: {
  hero: {...},                    // ✅ Hero de la page studio
  title: string,                  // ✅ Titre
  description: string,           // ✅ Description
  blocks: Array                  // ✅ Blocs de contenu
}
```

### Section `contact` - Propriétés incluses

```typescript
contact: {
  hero: {...},                    // ✅ Hero de la page contact
  sections: Array,                // ✅ Sections de contact
  socials: Array,                 // ✅ Réseaux sociaux
  briefGenerator: {...}           // ✅ Générateur de brief
}
```

---

## ✅ Checklist : Ajouter une nouvelle propriété de configuration

Si tu ajoutes une nouvelle propriété de configuration dans l'admin (ex. `blog.columns`, `work.sort`, `home.layout`, etc.), **tu DOIS** :

### 1. Vérifier si elle est utilisée côté frontend

```bash
# Chercher dans les composants Pearl
grep -r "content\?\.work\?\.nouvellePropriete" src/templates/pearl
grep -r "content\?\.blog\?\.nouvellePropriete" src/templates/pearl
```

### 2. L'ajouter dans `/api/content/metadata/route.ts`

```typescript
// src/app/api/content/metadata/route.ts

work: {
  hero: content.work?.hero,
  description: content.work?.description,
  filters: content.work?.filters || [],
  columns: content.work?.columns,
  nouvellePropriete: content.work?.nouvellePropriete, // ✅ AJOUTER ICI
  // ...
}
```

### 3. Vérifier la fusion dans `pearl-client.tsx`

Si `fullContent` est utilisé, s'assurer que la fusion préserve toutes les propriétés :

```typescript
// src/templates/pearl/pearl-client.tsx

work: {
  ...metadata.work,  // ✅ Préserve toutes les propriétés de metadata.work
  ...(fullContent.work && {
    adminProjects: fullContent.work?.adminProjects || metadata.work?.adminProjects,
    projects: fullContent.work?.projects || metadata.work?.projects
  })
}
```

### 4. Tester

1. Configurer la nouvelle propriété dans l'admin
2. Recharger la page frontend (Ctrl+Shift+R pour vider le cache)
3. Vérifier que la propriété est bien appliquée
4. Vérifier dans DevTools → Network → `/api/content/metadata` que la propriété est présente

---

## 🔍 Comment détecter un problème similaire

### Symptômes

- Une configuration dans l'admin ne s'applique pas côté frontend
- Une valeur par défaut s'affiche toujours (ex. toujours 3 colonnes)
- Le comportement ne change pas après modification dans l'admin

### Diagnostic

1. **Ouvrir DevTools → Network**
2. **Recharger la page** (Ctrl+Shift+R)
3. **Vérifier la réponse de `/api/content/metadata`**
4. **Chercher la propriété manquante** dans le JSON

### Solution rapide

1. Ajouter la propriété dans `/api/content/metadata/route.ts`
2. Vider le cache navigateur (Ctrl+Shift+R)
3. Tester à nouveau

---

## 📝 Propriétés actuellement surveillées

### Section `work`
- ✅ `hero` - Hero de la page
- ✅ `description` - Description
- ✅ `filters` - Filtres de catégories
- ✅ `columns` - Nombre de colonnes (2, 3, ou 4) ⚠️ **Ajouté le 23/01/2025**

### Section `blog`
- ✅ `hero` - Hero de la page
- ✅ `description` - Description
- ⚠️ `columns` - **Non utilisé actuellement, mais à ajouter si besoin**

### Section `metadata`
- ✅ `typography` - Configuration typographique
- ✅ `colorPalette` - Palette de couleurs
- ✅ `layout` - Layout (standard, compact, wide)
- ✅ `reveal` - Configuration de l'animation reveal

---

## 🚨 Règles d'or

1. **Toute propriété de configuration utilisée côté frontend DOIT être dans `/api/content/metadata`**
2. **Toute nouvelle propriété ajoutée dans l'admin DOIT être ajoutée dans l'API metadata**
3. **Toujours préserver toutes les propriétés lors de la fusion avec `fullContent`**
4. **Tester après chaque ajout de propriété**

---

## 📚 Références

- **Fichier API** : `src/app/api/content/metadata/route.ts`
- **Composant Pearl** : `src/templates/pearl/pearl-client.tsx`
- **Composant Work** : `src/templates/pearl/components/Work.tsx`
- **Composant Blog** : `src/templates/pearl/components/Blog.tsx`
- **Documentation Phase 1** : `docs/PHASE1-IMPLEMENTATION.md`
- **Plan de scalabilité** : `docs/PLAN-ACTION-SCALABILITE.md`

---

## 🔄 Historique des modifications

| Date | Propriété | Section | Raison |
|------|-----------|---------|--------|
| 23/01/2025 | `columns` | `work` | Bug : configuration non appliquée |

---

**💡 Astuce** : Si tu ajoutes une nouvelle propriété, mets à jour ce document pour référence future !

