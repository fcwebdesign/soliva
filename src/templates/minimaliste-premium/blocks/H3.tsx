import { H3Block } from '@/blocks/types';

export default function H3Minimaliste({ content }: H3Block) {
  return (
    <h3 className="title text-xl md:text-2xl font-semibold tracking-tight mb-4">
      {content}
    </h3>
  );
} 