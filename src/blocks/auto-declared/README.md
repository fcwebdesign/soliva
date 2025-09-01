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
export default function MonBlocEditor({ data, onChange }) {
  return (
    <div className="space-y-4">
      <input
        value={data.titre}
        onChange={(e) => onChange({ ...data, titre: e.target.value })}
        placeholder="Titre"
        className="w-full p-2 border rounded"
      />
      <input
        type="color"
        value={data.couleur}
        onChange={(e) => onChange({ ...data, couleur: e.target.value })}
        className="w-16 h-10"
      />
    </div>
  );
}
```

## Avantages

- ✅ **1 dossier = 1 bloc** (tout est contenu)
- ✅ **Auto-détection** (pas de configuration)
- ✅ **Compatible** avec votre admin existant
- ✅ **Interface d'édition** personnalisable
- ✅ **Type-safe** avec TypeScript
