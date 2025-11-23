'use client';

import React, { useMemo } from 'react';
import { useContentUpdate } from '../../../hooks/useContentUpdate';

interface ImageItem {
  id?: string;
  src: string;
  alt: string;
  hidden?: boolean;
}

interface ImageData {
  image?: {
    src?: string;
    alt?: string;
  };
  images?: ImageItem[];
}

export default function ImageBlock({ data }: { data: ImageData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = useMemo(() => {
    return (data as any).data || data;
  }, [data]);
  
  // Écouter les mises à jour de contenu
  useContentUpdate(() => {
    // Le useMemo se mettra à jour automatiquement
  });
  
  // Migrer l'ancienne structure vers la nouvelle si nécessaire
  const images = useMemo(() => {
    if (blockData.images && Array.isArray(blockData.images)) {
      return blockData.images.filter((img: ImageItem) => !img.hidden && img.src);
    }
    // Compatibilité avec l'ancienne structure (une seule image)
    if (blockData.image?.src) {
      return [{
        src: blockData.image.src,
        alt: blockData.image.alt || '',
      }];
    }
    return [];
  }, [blockData]);
  
  // Vérifier si on a des images
  if (images.length === 0) {
    return (
      <div className="block-image p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
        Aucune image sélectionnée
      </div>
    );
  }

  // Afficher toutes les images
  return (
    <section 
      className="block-image-section" 
      data-block-type="image" 
      data-block-theme={(data as any).theme || 'auto'}
    >
      <div className="w-full space-y-4">
        {images.map((image: ImageItem, index: number) => (
          <div key={image.id || `image-${index}`} className="w-full flex items-center justify-center">
            {image.src ? (
              <img 
                src={image.src} 
                alt={image.alt || ''} 
                className="w-full h-auto max-h-[90vh] object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
