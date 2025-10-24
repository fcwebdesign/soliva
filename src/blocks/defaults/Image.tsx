import { ImageBlock } from '../types';

export default function Image({ image }: ImageBlock) {
  if (!image?.src) return null;
  
  return (
    <img 
      src={image.src} 
      alt={image.alt || ''} 
      className="w-full h-auto"
      loading="lazy"
      decoding="async"
    />
  );
}
