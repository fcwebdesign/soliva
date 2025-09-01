import { ImageBlock } from '../types';

export default function Image({ image }: ImageBlock) {
  if (!image?.src) return null;
  
  return (
    <div className="mb-6">
      {/* Texte très visible pour confirmer que c'est le système scalable */}
      <div className="mb-4 p-4 bg-red-500 text-white text-center font-bold text-lg">
        🚀 SYSTÈME SCALABLE ACTIF - IMAGE MODIFIÉE
      </div>
      <img 
        src={image.src} 
        alt={image.alt || ''} 
        className="w-full h-auto"
      />
    </div>
  );
}
