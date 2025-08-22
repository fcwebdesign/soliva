import { ImageBlock } from '@/blocks/types';

export default function ImageMinimaliste({ image }: ImageBlock) {
  if (!image?.src) return null;
  
  return (
    <div className="my-8">
      <img 
        src={image.src} 
        alt={image.alt || ''} 
        className="w-full h-auto object-cover"
      />
    </div>
  );
} 