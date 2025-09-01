# �� Système de Blocs Scalable

## 🎯 Problème résolu

Avant : Pour ajouter un nouveau bloc, il fallait modifier 6+ fichiers
Maintenant : **1 seul fichier** à créer !

## ✨ Avantages

- ✅ **Auto-déclaration** : Chaque bloc contient ses métadonnées
- ✅ **Zéro configuration** : Pas besoin de modifier des registres
- ✅ **Interface générique** : L'admin se génère automatiquement
- ✅ **Type-safe** : TypeScript complet
- ✅ **Hot-reload** : Ajout/modification en temps réel

## 🏗️ Architecture

```
src/utils/blockUtils.ts          # Système de base
src/components/GenericBlockEditor.tsx    # Éditeur générique
src/components/ScalableBlockRenderer.tsx # Rendu scalable
src/blocks/scalable/             # Nouveaux blocs auto-déclarés
├── index.ts                     # Auto-import
├── Hero.tsx                     # Bloc Hero
└── Testimonial.tsx              # Bloc Testimonial
```

## 🎮 Test du système

1. **Front-end** : `http://localhost:3000/test-scalable`
2. **Admin** : `http://localhost:3000/admin-test`

## ➕ Ajouter un nouveau bloc (ULTRA SIMPLE!)

### 1. Créer le fichier bloc
```typescript
// src/blocks/scalable/MonNouveauBloc.tsx
import { registerBlock } from '@/utils/blockUtils';

// 1. Interface du bloc
interface MonBlocData {
  id: string;
  type: 'mon-bloc';
  titre: string;
  couleur: string;
}

// 2. Composant React
function MonBlocComponent({ titre, couleur }: MonBlocData) {
  return (
    <div style={{ backgroundColor: couleur }} className="p-8">
      <h2>{titre}</h2>
    </div>
  );
}

// 3. Métadonnées (définit l'interface d'édition!)
const metadata = {
  type: 'mon-bloc',
  label: 'Mon Super Bloc',
  description: 'Un bloc coloré avec titre',
  icon: '🎨',
  category: 'content',
  fields: {
    titre: {
      type: 'text',
      label: 'Titre',
      required: true
    },
    couleur: {
      type: 'color',
      label: 'Couleur de fond',
      defaultValue: '#3B82F6'
    }
  }
};

// 4. Auto-enregistrement
registerBlock({
  metadata,
  component: MonBlocComponent,
  createDefault: () => ({
    titre: 'Mon nouveau bloc',
    couleur: '#3B82F6'
  })
});

export default MonBlocComponent;
```

### 2. L'ajouter à l'index
```typescript
// src/blocks/scalable/index.ts
import './Hero';
import './Testimonial';
import './MonNouveauBloc'; // ← Juste cette ligne !
```

**C'est tout ! 🎉**

Le bloc apparaît automatiquement :
- Dans la liste des blocs disponibles
- Avec son interface d'édition générée
- Avec ses validations
- Dans le rendu front-end

## 🔥 Types de champs supportés

- `text` : Champ texte simple
- `textarea` : Zone de texte multi-lignes  
- `rich-text` : Éditeur WYSIWYG (à implémenter)
- `image` : Upload/URL d'image
- `select` : Liste déroulante
- `number` : Nombre avec min/max
- `toggle` : Case à cocher
- `array` : Liste d'éléments (à implémenter)
- `color` : Sélecteur de couleur
- `link` : Champ URL/lien

## 🎨 Exemple concret

Regardez `Hero.tsx` et `Testimonial.tsx` pour voir des exemples complets.

## 🔄 Migration

Les anciens blocs continuent de fonctionner normalement.
Le nouveau système est **additionnel**, pas de rupture !
