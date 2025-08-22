import { H2Block } from '@/blocks/types';

export default function H2Minimaliste({ content }: H2Block) {
  return (
    <h2 className="title text-2xl md:text-4xl font-semibold tracking-tight mb-6">
      {content}
    </h2>
  );
} 