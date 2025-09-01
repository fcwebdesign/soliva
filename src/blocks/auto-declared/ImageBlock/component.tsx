import React from 'react';

interface ImageData {
  src: string;
  alt: string;
}

export default function ImageBlock({ data }: { data: ImageData }) {
  if (!data?.src) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Aucune image sélectionnée
      </div>
    );
  }

  return (
    <div className="image-block">
      <img
        src={data.src}
        alt={data.alt || ''}
        className="w-full h-auto"
      />
    </div>
  );
}
