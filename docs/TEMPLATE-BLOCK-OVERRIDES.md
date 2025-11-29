# 🎨 Surcharge des Blocs Auto-Déclarés par Template

## Vue d'ensemble

Ce système permet de surcharger les composants des blocs auto-déclarés pour un template spécifique, sans modifier les composants de base.

## Comment ça fonctionne

1. **Créer un composant surchargé** dans `src/templates/{template}/blocks/{BlockName}.tsx`
2. **L'enregistrer** dans `src/blocks/auto-declared/registry.ts`
3. Le composant surchargé sera utilisé automatiquement pour ce template

## Exemple : Surcharger HoverClientsBlock pour le template "pearl"

### 1. Créer le composant surchargé

```typescript
// src/templates/pearl/blocks/HoverClientsBlock.tsx
'use client';

import React from 'react';
import type { HoverClientsData } from '@/blocks/auto-declared/HoverClientsBlock/component';

// Importer le composant de base pour réutiliser la logique si nécessaire
import BaseHoverClientsBlock from '@/blocks/auto-declared/HoverClientsBlock/component';

export default function HoverClientsBlockPearl({ data }: { data: HoverClientsData }) {
  // Vous pouvez soit :
  // 1. Réutiliser le composant de base avec des props différentes
  // return <BaseHoverClientsBlock data={data} />;
  
  // 2. Créer une version complètement personnalisée
  return (
    <section className="hover-clients-pearl-custom">
      {/* Votre structure personnalisée ici */}
      <h2>{data.title}</h2>
      {/* ... */}
    </section>
  );
}
```

### 2. Enregistrer la surcharge

Dans `src/blocks/auto-declared/registry.ts`, ajoutez l'import en haut du fichier et la surcharge dans `TEMPLATE_OVERRIDES` :

```typescript
// En haut du fichier, avec les autres imports
import HoverClientsBlockPearl from '@/templates/pearl/blocks/HoverClientsBlock';

// Plus bas, dans TEMPLATE_OVERRIDES
const TEMPLATE_OVERRIDES: Record<string, Record<string, React.ComponentType<any>>> = {
  pearl: {
    'hover-clients': HoverClientsBlockPearl,
  },
};
```

### 3. C'est tout !

Le composant surchargé sera automatiquement utilisé pour le template "pearl", tandis que les autres templates utiliseront le composant de base.

## Structure recommandée

```
src/templates/
├── pearl/
│   ├── blocks/
│   │   ├── HoverClientsBlock.tsx    # Surcharge pour pearl
│   │   └── HeroBlock.tsx            # Autre surcharge
│   └── ...
├── starter/
│   ├── blocks/
│   │   └── Services.tsx             # Exemple existant
│   └── ...
└── ...
```

## Notes importantes

- ✅ Le composant surchargé doit avoir la **même signature** que le composant de base (`{ data: TData }`)
- ✅ L'éditeur (`editor.tsx`) reste le même pour tous les templates
- ✅ Les données (`data`) restent compatibles entre les templates
- ✅ Seul le rendu frontend change

## Avantages

1. **Séparation des préoccupations** : Les templates peuvent avoir leur propre structure visuelle
2. **Réutilisabilité** : Les blocs de base restent intacts
3. **Maintenabilité** : Facile de voir quels blocs sont surchargés pour quel template
4. **Flexibilité** : Vous pouvez surcharger partiellement ou complètement

## Exemple complet : ServicesBlock pour starter

Voir `src/templates/starter/blocks/Services.tsx` pour un exemple complet.

