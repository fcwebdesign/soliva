'use client';

import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from './registry';
import type { AnyBlock } from './types';

export default function BlockRenderer({ blocks }: { blocks: AnyBlock[] }) {
  const { key } = useTemplate();
  const registry = registries[key] ?? defaultRegistry;

  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const Component = registry[block.type] ?? defaultRegistry[block.type];
        
        if (!Component) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Bloc inconnu: ${block.type}`);
          }
          return null;
        }
        
        return <Component key={block.id} {...block} />;
      })}
    </div>
  );
} 