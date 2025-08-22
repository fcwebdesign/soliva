import { ContentBlock } from '../types';

export default function Content({ content }: ContentBlock) {
  return (
    <div 
      className="text-black/70 leading-relaxed max-w-[68ch] mb-6" 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
} 