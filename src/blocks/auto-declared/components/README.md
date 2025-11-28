# Composants Réutilisables pour Blocs Auto-Déclarés

Cette bibliothèque de composants permet de créer rapidement de nouveaux blocs sans dupliquer le code d'upload, de gestion d'images, etc.

## 📦 Composants disponibles

### 1. `useImageUpload` - Hook pour l'upload d'images

Hook réutilisable pour gérer l'upload d'images via `/api/admin/upload`.

```tsx
import { useImageUpload } from '@/blocks/auto-declared/components';

function MyEditor() {
  const { fileInputRef, isUploading, uploadImage, triggerFileSelect } = useImageUpload({
    onSuccess: (url) => {
      console.log('Image uploadée:', url);
      // Mettre à jour votre état
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) uploadImage(file);
      }} />
      <button onClick={triggerFileSelect} disabled={isUploading}>
        {isUploading ? 'Upload...' : 'Choisir une image'}
      </button>
    </>
  );
}
```

### 2. `ImageThumbnail` - Miniature avec dropdown

Composant pour afficher une miniature d'image avec menu dropdown (Remplacer, Modifier, Supprimer).

```tsx
import { ImageThumbnail } from '@/blocks/auto-declared/components';

<ImageThumbnail
  currentUrl={image.src}
  alt={image.alt}
  size={8} // 8, 12 ou 16 (taille en unités Tailwind)
  onUpload={(url) => updateImage({ src: url })}
  onRemove={() => removeImage()}
  onEdit={() => openAccordion()} // Optionnel
  stopPropagation={true} // Empêche la propagation (utile dans accordions)
/>
```

### 3. `AspectRatioSelect` - Select de ratio d'aspect

Composant pour sélectionner un ratio d'aspect (auto, 16:9, 1:1, etc.).

```tsx
import { AspectRatioSelect } from '@/blocks/auto-declared/components';

<AspectRatioSelect
  value={image.aspectRatio || 'auto'}
  onValueChange={(value) => updateImage({ aspectRatio: value })}
  open={openSelect === `aspect-${index}`}
  onOpenChange={(open) => setOpenSelect(open ? `aspect-${index}` : null)}
  size="compact" // ou "normal"
  stopPropagation={true}
/>
```

### 4. `SortableImageItem` - Item image sortable complet

Composant générique pour un item image avec drag & drop, upload, ratio, etc.

```tsx
import { SortableImageItem, ImageItemData } from '@/blocks/auto-declared/components';

interface MyImageItem extends ImageItemData {
  title: string;
  description?: string;
}

<SortableImageItem<MyImageItem>
  item={image}
  index={index}
  compact={true} // Mode compact pour éditeur visuel
  onUpdate={(field, value) => updateImage({ [field]: value })}
  onRemove={() => removeImage()}
  onToggleVisibility={() => toggleVisibility()}
  compactFields={[
    { key: 'title', placeholder: 'Titre' },
    { key: 'alt', placeholder: 'Description' },
  ]}
  accordionContent={
    <div>
      <label>Description détaillée</label>
      <textarea
        value={image.description || ''}
        onChange={(e) => updateImage({ description: e.target.value })}
      />
    </div>
  }
/>
```

## 🎯 Exemple complet : Créer un nouveau bloc avec images

```tsx
'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  SortableImageItem, 
  ImageItemData,
  useImageUpload 
} from '@/blocks/auto-declared/components';

interface MySlide extends ImageItemData {
  title: string;
  description?: string;
}

export default function MyBlockEditor({ data, onChange, compact = false }) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const { triggerFileSelect, isUploading, fileInputRef } = useImageUpload({
    onSuccess: (url) => {
      const newSlide: MySlide = {
        id: `slide-${Date.now()}`,
        title: '',
        src: url,
        alt: '',
      };
      onChange({ ...data, slides: [...(data.slides || []), newSlide] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const slides = data.slides || [];
    const oldIndex = slides.findIndex(s => s.id === active.id);
    const newIndex = slides.findIndex(s => s.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      onChange({ ...data, slides: arrayMove(slides, oldIndex, newIndex) });
    }
  };

  const updateSlide = (index: number, updates: Partial<MySlide>) => {
    const slides = [...(data.slides || [])];
    slides[index] = { ...slides[index], ...updates };
    onChange({ ...data, slides });
  };

  const removeSlide = (index: number) => {
    const slides = (data.slides || []).filter((_, i) => i !== index);
    onChange({ ...data, slides });
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={(data.slides || []).map(s => s.id || '')}
            strategy={verticalListSortingStrategy}
          >
            {(data.slides || []).map((slide, index) => (
              <SortableImageItem<MySlide>
                key={slide.id || `slide-${index}`}
                item={slide}
                index={index}
                compact={true}
                onUpdate={(field, value) => updateSlide(index, { [field]: value })}
                onRemove={() => removeSlide(index)}
                compactFields={[
                  { key: 'title', placeholder: 'Titre du slide' },
                ]}
                openSelect={openSelect}
                onOpenSelectChange={setOpenSelect}
                accordionContent={
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Description</label>
                    <textarea
                      value={slide.description || ''}
                      onChange={(e) => updateSlide(index, { description: e.target.value })}
                      className="w-full px-2 py-1.5 text-[13px] border rounded"
                    />
                  </div>
                }
              />
            ))}
          </SortableContext>
        </DndContext>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="w-full border border-dashed border-gray-300 rounded py-2 text-xs"
        >
          {isUploading ? 'Upload...' : 'Ajouter un slide'}
        </button>
      </div>
    );
  }

  // Mode normal...
}
```

## ✅ Avantages

- ✅ **Pas de duplication** : Code d'upload, ratio, thumbnail centralisé
- ✅ **Bugs corrigés une fois** : Si un bug est trouvé, il est corrigé pour tous les blocs
- ✅ **Création rapide** : Nouveaux blocs créés en quelques minutes
- ✅ **Type-safe** : TypeScript avec génériques pour flexibilité
- ✅ **Scalable** : Facile d'ajouter de nouveaux composants réutilisables

## 🚀 Prochaines étapes

Pour créer un nouveau bloc avec images :
1. Importer les composants depuis `@/blocks/auto-declared/components`
2. Utiliser `SortableImageItem` avec vos champs personnalisés
3. Utiliser `useImageUpload` pour l'upload
4. C'est tout ! 🎉

