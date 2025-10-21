# 🧩 AGENT BLOCKS - Guide Complet

## ✅ SYSTÈME VALIDÉ !

**Date** : 21 octobre 2025  
**Status** : ✅ Testé et fonctionnel  
**Test** : TestimonialBlock créé avec succès

Le système est **prêt en production** ! Tu peux créer des blocs en toute confiance. 🚀

---

## 🎯 Ton Rôle

Tu es responsable de **créer et maintenir les blocs de contenu** du CMS. Ces blocs sont les briques de base que les utilisateurs assemblent pour créer des pages.

---

## 📁 Zones d'Intervention

### Fichiers principaux
```
/src/blocks/auto-declared/
├── MonBloc/
│   ├── component.tsx    ← Composant React (rendu frontend)
│   ├── editor.tsx       ← Interface d'édition (admin)
│   ├── index.ts         ← Enregistrement du bloc
│   └── types.ts         ← Types spécifiques (optionnel)
├── registry.ts          ← Registre global (NE PAS modifier)
└── types/
    ├── columns.ts       ← Types pour colonnes
    └── fields.ts        ← Types pour champs
```

### Fichiers à NE PAS toucher
- `/src/blocks/BlockRenderer.tsx` - Géré par Agent UI
- `/src/blocks/registry.ts` - Géré par Agent Data
- `/src/blocks/types.ts` - Types legacy

---

## ✨ Créer un Nouveau Bloc

### Étape 1 : Créer la structure

```bash
cd /src/blocks/auto-declared
mkdir MonBloc
cd MonBloc
touch component.tsx editor.tsx index.ts
```

### Étape 2 : Composant Frontend (`component.tsx`)

```typescript
import React from 'react';

// 1. Définir l'interface des données
interface MonBlocData {
  id: string;
  type: 'mon-bloc';
  title: string;
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

// 2. Composant React
export default function MonBloc({ data }: { data: MonBlocData }) {
  return (
    <div 
      data-block-type="mon-bloc" 
      data-block-theme={data.theme || 'auto'}
      className="my-8 p-6"
    >
      <h2 className="text-2xl font-bold mb-4">{data.title}</h2>
      <div>{data.content}</div>
    </div>
  );
}
```

### Étape 3 : Éditeur Admin (`editor.tsx`)

```typescript
import React from 'react';
import { Label } from '@/components/ui/label';

interface MonBlocEditorProps {
  data: {
    title: string;
    content: string;
  };
  onChange: (data: any) => void;
}

export default function MonBlocEditor({ data, onChange }: MonBlocEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Titre</Label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="block-input"
          placeholder="Titre du bloc"
        />
      </div>

      <div>
        <Label>Contenu</Label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className="block-input"
          rows={4}
          placeholder="Contenu du bloc"
        />
      </div>
    </div>
  );
}
```

### Étape 4 : Enregistrement (`index.ts`)

```typescript
import { registerAutoBlock } from '../registry';
import MonBloc from './component';
import MonBlocEditor from './editor';

registerAutoBlock({
  type: 'mon-bloc',
  component: MonBloc,
  editor: MonBlocEditor,
  defaultData: {
    title: 'Mon nouveau bloc',
    content: 'Contenu par défaut'
  },
  label: 'Mon Bloc',
  icon: '🎨'
});
```

### Étape 5 : Régénérer les imports

```bash
npm run generate-blocks
```

✅ **C'est tout !** Le bloc apparaît automatiquement dans l'admin.

---

## 🎨 Bonnes Pratiques

### Structure de données

```typescript
// ✅ BON - Interface claire
interface MonBlocData {
  id: string;
  type: 'mon-bloc';
  title: string;
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

// ❌ MAUVAIS - Types any
interface MonBlocData {
  [key: string]: any;
}
```

### Attributs data pour thèmes

```typescript
// ✅ Toujours ajouter ces attributs
<div 
  data-block-type="mon-bloc" 
  data-block-theme={data.theme || 'auto'}
>
```

### Valeurs par défaut

```typescript
// ✅ Toujours gérer les valeurs vides
<input value={data.title || ''} />

// ❌ Erreur si undefined
<input value={data.title} />
```

### Classes CSS

```typescript
// ✅ Utiliser Tailwind + classes sémantiques
className="my-8 p-6 bg-white rounded-lg"

// ❌ Styles inline
style={{ marginTop: '2rem', padding: '1.5rem' }}
```

---

## 🔧 Composants Utiles

### Composants UI disponibles

```typescript
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

### Éditeur WYSIWYG

```typescript
import WysiwygEditor from '@/app/admin/components/WysiwygEditor';

<WysiwygEditor
  value={data.content}
  onChange={(html) => onChange({ ...data, content: html })}
/>
```

### Upload d'image

```typescript
import MediaUploader from '@/app/admin/components/MediaUploader';

<MediaUploader
  onUploadSuccess={(url) => onChange({ ...data, image: url })}
  currentImageUrl={data.image}
/>
```

---

## 🧪 Tester un Bloc

### 1. Tester visuellement (Frontend)

```bash
npm run dev
# Aller sur http://localhost:3000
# Ajouter le bloc sur une page via l'admin
```

### 2. Tester l'éditeur (Admin)

```bash
# Aller sur http://localhost:3000/admin?page=home
# Cliquer "Ajouter un bloc"
# Sélectionner ton bloc
# Vérifier les champs d'édition
```

### 3. Valider la structure de données

```bash
# Après édition, vérifier data/content.json
cat data/content.json | jq '.home.blocks[] | select(.type=="mon-bloc")'
```

---

## 🐛 Debugging

### Le bloc n'apparaît pas dans l'admin

```bash
# 1. Vérifier l'enregistrement
cat src/blocks/auto-declared/index.ts | grep "MonBloc"

# 2. Relancer la génération
npm run generate-blocks

# 3. Redémarrer le serveur
npm run dev
```

### Erreur de compilation

```bash
# Vérifier les types
npm run build

# Erreur fréquente : import manquant
# Solution : vérifier les imports en haut du fichier
```

### Le bloc s'affiche mal

```bash
# 1. Inspecter dans le navigateur
# 2. Vérifier les classes Tailwind
# 3. Vérifier data-block-type et data-block-theme
```

---

## 📦 Blocs Complexes

### Bloc avec sous-blocs (colonnes)

Voir `/src/blocks/auto-declared/TwoColumnsBlock/` comme exemple.

### Bloc avec état local

```typescript
import { useState } from 'react';

export default function MonBlocInteractif({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      {isOpen && <div>{data.content}</div>}
    </div>
  );
}
```

### Bloc avec animations

```typescript
import { motion } from 'framer-motion';

export default function MonBlocAnimé({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {data.content}
    </motion.div>
  );
}
```

---

## ✅ Checklist Qualité

Avant de push un nouveau bloc :

- [ ] TypeScript compile (`npm run build`)
- [ ] Types exportés si nécessaires
- [ ] Composant testé visuellement
- [ ] Éditeur fonctionnel dans l'admin
- [ ] Valeurs par défaut gérées
- [ ] Attributs `data-block-type` et `data-block-theme` présents
- [ ] Documentation inline (commentaires JSDoc)
- [ ] Pas de `console.log`

---

## 🚀 Aller Plus Loin

### Icônes personnalisées

```typescript
// Utiliser lucide-react
import { Star, Heart, Zap } from 'lucide-react';

registerAutoBlock({
  // ...
  icon: <Star className="w-4 h-4" />
});
```

### Validation des données

```typescript
import { z } from 'zod';

const MonBlocSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  content: z.string()
});

// Dans l'éditeur
try {
  MonBlocSchema.parse(data);
} catch (error) {
  // Afficher erreur
}
```

---

**Besoin d'aide ?** Consulte les blocs existants dans `/src/blocks/auto-declared/` pour des exemples concrets.

