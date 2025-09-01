import React from 'react';

interface ImageBlockProps {
  id: string;
  type: string;
  image?: {
    src: string;
    alt: string;
  };
}

export default function ImageBlock({ id, type, image }: ImageBlockProps) {
  if (!image?.src) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Aucune image sélectionnée
      </div>
    );
  }

  return (
    <div className="image-block">
      {/* Texte pour confirmer que c'est le système scalable */}
      <img
        src={image.src}
        alt={image.alt || ''}
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  );
}
