import React from 'react';

interface ImageData {
  image?: {
    src?: string;
    alt?: string;
  };
}

export default function ImageBlock({ data }: { data: ImageData }) {
  // Vérifier si on a une image
  if (!data.image?.src) {
    return (
      <div className="block-image p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
        Aucune image sélectionnée
      </div>
    );
  }

  return (
    <div className="block-image">
      <img 
        src={data.image.src} 
        alt={data.image.alt || ''} 
        className="w-full h-auto"
      />
    </div>
  );
}
