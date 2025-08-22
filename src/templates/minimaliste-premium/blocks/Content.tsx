import { ContentBlock } from '@/blocks/types';

export default function ContentMinimaliste({ content }: ContentBlock) {
  return (
    <div 
      className="text-black/70 leading-relaxed max-w-[68ch] prose prose-lg"
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
} 