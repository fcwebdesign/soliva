import React, { useMemo } from 'react';

interface ImageData {
  image?: {
    src?: string;
    alt?: string;
  };
}

export default function ImageBlock({ data }: { data: ImageData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = (data as any).data || data;
  
  // Récupérer l'image et l'alt de manière optimisée
  const { imageSrc, imageAlt } = useMemo(() => {
    const src = blockData.image?.src || (data as any).image?.src || blockData.src || (data as any).src;
    const alt = blockData.image?.alt || (data as any).image?.alt || blockData.alt || (data as any).alt || '';
    return { imageSrc: src, imageAlt: alt };
  }, [blockData, data]);
  
  // Vérifier si on a une image
  if (!imageSrc) {
    return (
      <div className="block-image p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
        Aucune image sélectionnée
      </div>
    );
  }

  // Utiliser un <img> natif pour un chargement immédiat
  // Limiter la hauteur à 90vh pour éviter le scroll excessif
  // object-fit: cover pour remplir l'espace (peut couper l'image)
  // Padding dynamique via data-block-type (géré par le CSS global)
  return (
    <section 
      className="block-image-section" 
      data-block-type="image" 
      data-block-theme={(data as any).theme || 'auto'}
    >
      <div className="w-full flex items-center justify-center">
        <img 
          src={imageSrc} 
          alt={imageAlt} 
          className="w-full h-auto max-h-[90vh] object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
