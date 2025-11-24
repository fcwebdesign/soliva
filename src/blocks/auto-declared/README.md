# 🚀 Système de Blocs Auto-Déclarés

## Comment ajouter un nouveau bloc (ULTRA SIMPLE)

### 1. Créer un dossier pour votre bloc
```
src/blocks/auto-declared/MonNouveauBloc/
├── index.ts          # Auto-déclaration du bloc
├── component.tsx     # Composant React
└── editor.tsx        # Interface d'édition (optionnel)
```

### 2. C'est tout !
Le bloc apparaît automatiquement dans votre admin existant.

## Structure d'un bloc

### index.ts (obligatoire)
```typescript
import { registerAutoBlock } from '../registry';
import Component from './component';
import Editor from './editor';

export default registerAutoBlock({
  type: 'mon-bloc',
  label: 'Mon Super Bloc',
  icon: '🎯',
  component: Component,
  editor: Editor,
  defaultData: {
    titre: 'Mon titre',
    couleur: '#3B82F6'
  }
});
```

### component.tsx (obligatoire)
```typescript
interface Props {
  titre: string;
  couleur: string;
}

export default function MonBlocComponent({ titre, couleur }: Props) {
  return (
    <div style={{ backgroundColor: couleur }} className="p-8">
      <h2>{titre}</h2>
    </div>
  );
}
```

### editor.tsx (optionnel - sinon interface générique)
```typescript
"use client";
import React, { useState } from 'react';
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';

export default function MonBlocEditor({ 
  data, 
  onChange, 
  compact = false,  // ⚠️ TOUJOURS ajouter le support compact
  context 
}: { 
  data: MonBlocData; 
  onChange: (data: MonBlocData) => void; 
  compact?: boolean;  // ⚠️ Mode compact pour l'éditeur visuel
  context?: any;      // Contexte pour l'IA
}) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  // Fonction pour l'IA (si besoin de contenu riche)
  const getBlockContentSuggestion = async (field: string) => {
    setIsLoadingBlockAI(field);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType: 'mon-bloc',
          pageKey: field,
          context: `Contexte pour ${field}`
        })
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Erreur API');
      onChange({ ...data, [field]: responseData.suggestedContent });
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor space-y-4">
      {/* Pour les champs texte simples */}
      <input
        value={data.titre}
        onChange={(e) => onChange({ ...data, titre: e.target.value })}
        placeholder="Titre"
        className="block-input w-full"
      />
      
      {/* Pour les champs texte riche : TOUJOURS utiliser WysiwygEditor avec compact */}
      <WysiwygEditor
        value={data.description || ''}
        onChange={(content: string) => onChange({ ...data, description: content })}
        placeholder="Description..."
        onAISuggestion={() => getBlockContentSuggestion('description')}
        isLoadingAI={isLoadingBlockAI === 'description'}
        compact={compact}  // ⚠️ TOUJOURS passer compact
      />
    </div>
  );
}
```

## 🎯 Conventions importantes pour les nouveaux blocs

### ⚠️ Mode Compact (OBLIGATOIRE)
**Tous les nouveaux blocs DOIVENT supporter le mode compact** pour être cohérents dans l'éditeur visuel :

```typescript
export default function MonBlocEditor({ 
  data, 
  onChange, 
  compact = false,  // ⚠️ TOUJOURS ajouter
  context 
}: { 
  data: MonBlocData; 
  onChange: (data: MonBlocData) => void; 
  compact?: boolean;  // ⚠️ Mode compact pour l'éditeur visuel
  context?: any;      // Contexte pour l'IA
}) {
  // ...
}
```

### 📝 Tiptap avec IA (pour contenu riche)
**Pour tous les champs de texte riche, utiliser `WysiwygEditor` avec IA** :

```typescript
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';

<WysiwygEditor
  value={data.description || ''}
  onChange={(content: string) => onChange({ ...data, description: content })}
  placeholder="Description..."
  onAISuggestion={() => getBlockContentSuggestion('description')}
  isLoadingAI={isLoadingBlockAI === 'description'}
  compact={compact}  // ⚠️ TOUJOURS passer compact
/>
```

### ✅ Checklist pour un nouveau bloc

- [ ] Support du paramètre `compact = false` dans l'éditeur
- [ ] Utilisation de `WysiwygEditor` pour les champs texte riche
- [ ] Intégration de l'IA avec `onAISuggestion` et `isLoadingAI`
- [ ] Passage de `compact={compact}` à tous les composants enfants
- [ ] Support du paramètre `context` pour enrichir les suggestions IA
- [ ] Catégorie appropriée (`text`, `layout`, `media`, `content`, `interactive`, `data`)
- [ ] Icône dans `blockCategories.tsx` si nécessaire

## Avantages

- ✅ **1 dossier = 1 bloc** (tout est contenu)
- ✅ **Auto-détection** (pas de configuration)
- ✅ **Compatible** avec votre admin existant
- ✅ **Interface d'édition** personnalisable
- ✅ **Type-safe** avec TypeScript
- ✅ **Mode compact** pour cohérence visuelle
- ✅ **IA intégrée** pour génération de contenu
