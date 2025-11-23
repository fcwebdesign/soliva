'use client';

import React, { useMemo } from 'react';
import { useContentUpdate } from '../../../hooks/useContentUpdate';

interface ImageItem {
  id?: string;
  src: string;
  alt: string;
  hidden?: boolean;
  aspectRatio?: string; // 'auto' | '1:1' | '1:2' | '2:3' | '3:4' | '4:5' | '9:16' | '3:2' | '4:3' | '5:4' | '16:9' | '2:1' | '4:1' | '8:1' | 'stretch'
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
        {images.map((image: ImageItem, index: number) => {
          // Calculer le style selon le ratio d'aspect
          const getImageStyle = () => {
            if (!image.aspectRatio || image.aspectRatio === 'auto') {
              return { className: 'w-full h-auto max-h-[90vh] object-contain' };
            }
            // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
            const ratio = image.aspectRatio.replace(':', '/');
            return {
              className: 'w-full object-cover',
              style: { aspectRatio: ratio }
            };
          };
          
          const imageStyle = getImageStyle();
          
          return (
            <div key={image.id || `image-${index}`} className="w-full flex items-center justify-center">
              {image.src ? (
                <img 
                  src={image.src} 
                  alt={image.alt || ''} 
                  className={imageStyle.className}
                  style={imageStyle.style}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
