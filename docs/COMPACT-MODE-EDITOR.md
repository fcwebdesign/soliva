# 🎯 Mode Compact - Guide pour les Éditeurs de Blocs

## ⚠️ OBLIGATOIRE pour tous les nouveaux blocs

**Tous les éditeurs de blocs DOIVENT supporter le mode compact** pour fonctionner correctement dans l'éditeur visuel (TwoColumnsBlock, ThreeColumnsBlock, etc.).

---

## 📋 Template Complet

```typescript
"use client";

import React from 'react';

interface MonBlocData {
  title: string;
  content: string;
}

export default function MonBlocEditor({ 
  data, 
  onChange, 
  compact = false  // ⚠️ OBLIGATOIRE
}: { 
  data: MonBlocData; 
  onChange: (data: MonBlocData) => void; 
  compact?: boolean;  // ⚠️ OBLIGATOIRE
}) {
  // Version compacte pour l'éditeur visuel (OBLIGATOIRE)
  if (compact) {
    return (
      <div className="space-y-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Titre du bloc"
            className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Contenu</label>
          <textarea
            value={data.content || ''}
            onChange={(e) => onChange({ ...data, content: e.target.value })}
            placeholder="Contenu du bloc"
            rows={3}
            className="w-full px-2 py-2 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none resize-none transition-colors min-h-[80px]"
          />
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="block-input"
          placeholder="Titre du bloc"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contenu</label>
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

---

## 🎨 Standards de Style (à respecter)

### Labels
```tsx
<label className="block text-[10px] text-gray-400 mb-1">Label</label>
```

### Inputs texte
```tsx
<input
  className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
/>
```

### Textareas
```tsx
<textarea
  rows={3}
  className="w-full px-2 py-2 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none resize-none transition-colors min-h-[80px]"
/>
```

### Selects
```tsx
<select className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none">
  <option>Option 1</option>
</select>
```

### Espacement
- Entre les champs : `space-y-2`
- Grilles : `grid grid-cols-2 gap-2`

### Couleurs
- Labels : `text-gray-400`
- Bordures : `border-gray-200`
- Focus : `focus:border-blue-400`
- Texte : `text-[13px]` pour inputs, `text-[12px]` pour petits textes

---

## ✅ Checklist

Avant de créer un nouvel éditeur, vérifier :

- [ ] Le paramètre `compact?: boolean` est présent dans les props
- [ ] Le mode compact est géré avec `if (compact) { return ... }`
- [ ] Les styles respectent les standards ci-dessus
- [ ] L'éditeur fonctionne dans l'éditeur visuel (test dans TwoColumnsBlock)
- [ ] L'éditeur fonctionne dans le BO classique (mode normal)

---

## 📚 Exemples de Référence

### Simple
- `/src/blocks/auto-declared/QuoteBlock/editor.tsx`
- `/src/blocks/auto-declared/ContactBlock/editor.tsx`

### Moyen
- `/src/blocks/auto-declared/HoverClientsBlock/editor.tsx`
- `/src/blocks/auto-declared/ImageBlock/editor.tsx`

### Complexe
- `/src/blocks/auto-declared/GalleryGridBlock/editor.tsx`
- `/src/blocks/auto-declared/TwoColumnsBlock/editor.tsx`

---

## 🧪 Comment Tester

1. Aller dans l'admin : `http://localhost:3000/admin?page=home`
2. Ajouter un bloc dans une colonne (TwoColumnsBlock, ThreeColumnsBlock, etc.)
3. L'éditeur doit s'afficher en mode compact avec :
   - Labels petits (`text-[10px]`)
   - Inputs compacts (`py-1.5`, `text-[13px]`)
   - Espacement réduit (`space-y-2`)
4. Si l'éditeur ne s'affiche pas ou est mal formaté → le mode compact n'est pas implémenté

---

## 🚨 Erreurs Courantes

### ❌ Oubli du paramètre compact
```typescript
// MAUVAIS
export default function MonBlocEditor({ data, onChange }: { ... }) {

// BON
export default function MonBlocEditor({ data, onChange, compact = false }: { ... compact?: boolean }) {
```

### ❌ Pas de gestion du mode compact
```typescript
// MAUVAIS - Pas de if (compact)
export default function MonBlocEditor({ data, onChange, compact = false }: { ... }) {
  return <div>...</div>;
}

// BON
export default function MonBlocEditor({ data, onChange, compact = false }: { ... }) {
  if (compact) {
    return <div className="space-y-2">...</div>;
  }
  return <div className="space-y-4">...</div>;
}
```

### ❌ Styles non conformes
```typescript
// MAUVAIS - Styles trop grands
<label className="text-sm font-medium">Label</label>
<input className="px-4 py-3 text-base" />

// BON - Styles compacts
<label className="block text-[10px] text-gray-400 mb-1">Label</label>
<input className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded" />
```

---

**💡 Astuce** : Copiez-collez un éditeur existant (QuoteBlock par exemple) et adaptez-le à vos besoins !

