import React from 'react';
import Image from 'next/image';

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
      <Image 
        src={data.image.src} 
        alt={data.image.alt || ''} 
        width={800}
        height={600}
        className="w-full h-auto"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}
