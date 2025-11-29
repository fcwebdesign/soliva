# Exemple : Bloc Carousel avec composants réutilisables

Voici comment créer un bloc carousel en utilisant les composants réutilisables.

## Structure du bloc

```
CarouselBlock/
  ├── component.tsx  (utilise ReusableImage)
  ├── editor.tsx     (utilise ImageEditorField)
  └── index.ts
```

## component.tsx

```tsx
'use client';

import React, { useMemo } from 'react';
import { ReusableImage, ImageData } from '../components';
import { useContentUpdate } from '../../../hooks/useContentUpdate';

interface CarouselData {
  images?: ImageData[];
  autoplay?: boolean;
  interval?: number;
}

export default function CarouselBlock({ data }: { data: CarouselData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  
  useContentUpdate(() => {
    // Le useMemo se mettra à jour automatiquement
  });

  const images = blockData.images || [];

  if (images.length === 0) {
    return (
      <div className="block-carousel p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
        Aucune image dans le carousel
      </div>
    );
  }

  return (
    <section 
      className="block-carousel-section" 
      data-block-type="carousel"
    >
      <div className="carousel-container">
        {images.map((image: ImageData, index: number) => (
          <div key={index} className="carousel-slide">
            <ReusableImage 
              image={image}
              containerClassName="w-full"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

## editor.tsx

```tsx
'use client';

import React, { useState } from 'react';
import { ImageEditorField, ImageData } from '../components';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CarouselData {
  images?: ImageData[];
}

export default function CarouselBlockEditor({ 
  data, 
  onChange, 
  compact = false 
}: { 
  data: CarouselData; 
  onChange: (data: CarouselData) => void; 
  compact?: boolean;
}) {
  const images = data.images || [];

  const updateImage = (index: number, image: ImageData) => {
    const newImages = [...images];
    newImages[index] = image;
    onChange({ ...data, images: newImages });
  };

  const addImage = () => {
    onChange({
      ...data,
      images: [...images, { src: '', alt: '', aspectRatio: 'auto' }],
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...data, images: newImages });
  };

  if (compact) {
    return (
      <div className="block-editor space-y-2">
        <div className="space-y-2">
          {images.map((image, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <ImageEditorField
                  image={image}
                  onChange={(img) => updateImage(index, img)}
                  compact={true}
                  label={`Image ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeImage(index)}
                className="text-red-600"
              >
                Supprimer
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addImage}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter une image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="block-editor space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Images du carousel</h4>
        <Button type="button" onClick={addImage}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une image
        </Button>
      </div>

      <div className="space-y-4">
        {images.map((image, index) => (
          <div key={index} className="border rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-medium">Image {index + 1}</h5>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeImage(index)}
                className="text-red-600"
              >
                Supprimer
              </Button>
            </div>
            <ImageEditorField
              image={image}
              onChange={(img) => updateImage(index, img)}
              compact={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## index.ts

```tsx
import { registerAutoBlock } from '../registry';
import CarouselBlock from './component';
import CarouselBlockEditor from './editor';

registerAutoBlock({
  type: 'carousel',
  label: 'Carousel',
  icon: '🎠',
  category: 'media',
  component: CarouselBlock,
  editor: CarouselBlockEditor,
  description: 'Carousel d\'images avec navigation',
  defaultData: {
    images: [],
  },
});
```

## ✅ Avantages

- **Code minimal** : Pas besoin de recréer la logique d'upload/affichage
- **Cohérence** : Toutes les images ont la même présentation
- **Maintenance** : Un seul endroit à modifier pour améliorer les images
- **Rapidité** : Création du bloc en quelques minutes

