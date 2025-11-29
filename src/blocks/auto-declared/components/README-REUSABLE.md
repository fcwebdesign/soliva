# Composants Réutilisables pour les Blocs

Ce dossier contient des composants réutilisables pour créer rapidement de nouveaux blocs sans dupliquer le code.

## 🖼️ Composants Image

### `ReusableImage` - Affichage d'image frontend

Composant pour afficher une image avec gestion de l'aspect ratio et alignement.

```tsx
import { ReusableImage, ImageData } from '../components';

const image: ImageData = {
  src: '/uploads/image.jpg',
  alt: 'Description',
  aspectRatio: '16:9',
};

<ReusableImage 
  image={image}
  alignHorizontal="center"
  alignVertical="center"
  loading="lazy"
/>
```

### `ImageEditorField` - Édition d'image admin

Composant admin complet pour éditer une image (upload, alt text, aspect ratio).

```tsx
import { ImageEditorField, ImageData } from '../components';

const [image, setImage] = useState<ImageData>({
  src: '',
  alt: '',
  aspectRatio: 'auto',
});

<ImageEditorField
  image={image}
  onChange={setImage}
  compact={true} // Mode compact pour éditeur visuel
  showAspectRatio={true}
  showAltText={true}
  label="Image principale"
/>
```

## 📝 Exemple d'utilisation dans un bloc

### Component (frontend)

```tsx
import { ReusableImage, ImageData } from '../components';

interface MyBlockData {
  image: ImageData;
}

export default function MyBlock({ data }: { data: MyBlockData }) {
  const blockData = (data as any).data || data;
  
  return (
    <section>
      <ReusableImage 
        image={blockData.image}
        containerClassName="my-custom-class"
      />
    </section>
  );
}
```

### Editor (admin)

```tsx
import { ImageEditorField, ImageData } from '../components';

interface MyBlockData {
  image: ImageData;
}

export default function MyBlockEditor({ 
  data, 
  onChange, 
  compact = false 
}: { 
  data: MyBlockData; 
  onChange: (data: MyBlockData) => void; 
  compact?: boolean;
}) {
  return (
    <div>
      <ImageEditorField
        image={data.image || { src: '', alt: '', aspectRatio: 'auto' }}
        onChange={(image) => onChange({ ...data, image })}
        compact={compact}
        label="Image"
      />
    </div>
  );
}
```

## ✅ Avantages

- **Cohérence** : Toutes les images ont la même présentation
- **Scalabilité** : Pas besoin de recréer la logique d'upload/affichage
- **Maintenance** : Un seul endroit à modifier pour améliorer les images
- **Rapidité** : Création de nouveaux blocs plus rapide

