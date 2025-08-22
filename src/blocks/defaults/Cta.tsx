import { CtaBlock } from '../types';

export default function Cta({ ctaText, ctaLink }: CtaBlock) {
  if (!ctaText && !ctaLink) return null;
  
  return (
    <div className="mb-6">
      <a 
        href={ctaLink || '#'} 
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {ctaText || 'En savoir plus'}
      </a>
    </div>
  );
} 