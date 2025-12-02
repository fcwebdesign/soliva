# Référence éditeur d'images (blocs auto-déclarés)

Objectif : utiliser la même UI d’images partout (upload, alt, ratio, drag) via le composant réutilisable, sans recoder chaque fois.

## Composant à utiliser
- `ImageListEditor` (depuis `src/blocks/auto-declared/components`).
- Gère : upload (`/api/admin/upload`), miniature, champ alt, select de ratio, drag & drop, ajout/suppression de slots.

## Shape des données attendues
```ts
type ImageItemData = {
  id?: string;
  src: string;
  alt?: string;
  aspectRatio?: string; // ex: 'auto' | '1:1' | '3:2' | '4:3' | '16:9' | '2:1'
  hidden?: boolean;
};
```

## Exemple d’éditeur dans un bloc
```tsx
import ImageListEditor from '@/blocks/auto-declared/components/ImageListEditor';
import type { ImageItemData } from '@/blocks/auto-declared/components';

function MyBlockEditor({ data, onChange }) {
  const images: ImageItemData[] = (data.images || []).map((img, idx) => ({
    id: img.id || `img-${idx}`,
    src: img.src || img,          // accepte string ou objet
    alt: img.alt || '',
    aspectRatio: img.aspectRatio || '16:9',
  }));

  return (
    <ImageListEditor
      items={images}
      onChange={(next) => onChange({ ...data, images: next })}
      label="Images"
      compact          // rend l’UI compacte (comme l’aperçu en screenshot)
      defaultAspectRatio="16:9"
      altPlaceholder="Description (alt text)"
    />
  );
}
```

## Props principales de `ImageListEditor`
- `items`: `ImageItemData[]`
- `onChange(next: ImageItemData[])`
- `label?: string`
- `compact?: boolean` (true pour l’UI compacte)
- `defaultAspectRatio?: string` (par ex. '16:9' ou 'auto')
- `altPlaceholder?: string`

## Points à retenir
- Pour rester cohérent avec tes autres blocs, passe `compact` à `true`.
- Stocke toujours `src` et `alt`; `aspectRatio` est optionnel mais utile pour le rendu.
- Si tu dois pré-remplir avec des images de démo, injecte-les dans `data.images` avant de passer à `ImageListEditor`.
