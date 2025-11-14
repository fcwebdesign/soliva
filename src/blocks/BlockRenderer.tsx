'use client';

import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from './registry';
import type { AnyBlock } from './types';
import { useEffect } from 'react';
// Charger les blocs auto-déclarés et accéder au registre scalable
import './auto-declared';
import { getAutoDeclaredBlock } from './auto-declared/registry';

export default function BlockRenderer({ blocks }: { blocks: AnyBlock[] }) {
  const { key } = useTemplate();
  const registry = registries[key] ?? defaultRegistry;

  // Gestion du thème par bloc avec priorité sur le scroll
  useEffect(() => {
    // Starter et Pearl: désactiver les changements auto de thème au scroll
    if (key === 'starter' || key === 'pearl') {
      return undefined; // ne pas attacher d'observer pour starter et pearl
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const blockType = element.dataset.blockType;
          const blockTheme = element.dataset.blockTheme;
          // Respecter un thème explicite du bloc
          if (blockTheme && blockTheme !== 'auto') {
            document.documentElement.setAttribute('data-theme', blockTheme);
          } else if (blockType === 'services' || blockType === 'projects') {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else if (blockType === 'logos') {
            document.documentElement.setAttribute('data-theme', 'light');
          } else if (blockType === 'two-columns') {
            const currentTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
          }
        }
      });
    }, { threshold: 0.3 });

    setTimeout(() => {
      document.querySelectorAll('[data-block-type]').forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [blocks]);

  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <div className="blocks-container">
      {blocks.map((block) => {
        // Debug pour les blocs image
        if (process.env.NODE_ENV !== 'production' && block.type === 'image') {
          console.log('🖼️ BlockRenderer - Bloc image détecté:', { 
            block, 
            hasTemplateComponent: !!(registry[block.type] ?? defaultRegistry[block.type]),
            scalable: getAutoDeclaredBlock(block.type)
          });
        }

        // 1) Template registry override en priorité
        const TemplateComponent = registry[block.type] ?? defaultRegistry[block.type];
        if (TemplateComponent) {
          if (process.env.NODE_ENV !== 'production' && block.type === 'image') {
            console.log('✅ BlockRenderer - Utilisation du TemplateComponent pour image');
          }
          const props = { ...block, 'data-block-type': block.type, 'data-block-theme': block.theme || 'auto' } as any;
          return <TemplateComponent key={block.id} {...props} />;
        }

        // 2) Fallback sur les blocs auto-déclarés (scalable)
        const scalable = getAutoDeclaredBlock(block.type);
        if (scalable?.component) {
          if (process.env.NODE_ENV !== 'production' && block.type === 'image') {
            console.log('✅ BlockRenderer - Utilisation du bloc auto-déclaré ImageBlock');
          }
          const BlockComponent = scalable.component as any;
          const data = { ...block, title: (block as any).title || '', content: (block as any).content || '', theme: (block as any).theme || 'auto' };
          return <BlockComponent key={block.id} data={data} />;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.warn(`❌ Bloc inconnu: ${block.type}`, { availableTypes: Object.keys(registry), block });
        }
        return null;
      })}
    </div>
  );
}
