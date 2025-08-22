import { ImageBlock } from '../types';

export default function Image({ image }: ImageBlock) {
  if (!image?.src) return null;
  
  return (
    <div className="mb-6">
      <img 
        src={image.src} 
        alt={image.alt || ''} 
        className="w-full h-auto rounded-lg"
      />
    </div>
  );
} 