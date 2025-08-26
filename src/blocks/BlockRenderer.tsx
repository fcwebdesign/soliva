'use client';

import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from './registry';
import type { AnyBlock } from './types';
import { useEffect } from 'react';

export default function BlockRenderer({ blocks }: { blocks: AnyBlock[] }) {
  const { key } = useTemplate();
  const registry = registries[key] ?? defaultRegistry;

  // Gestion du thème par bloc avec priorité sur le scroll
  useEffect(() => {
    // Observer les blocs pour détecter lequel est visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const blockType = element.dataset.blockType;
          const blockTheme = element.dataset.blockTheme;
          
          console.log('👁️ IntersectionObserver - Bloc détecté:', { blockType, blockTheme });
          
          // Si le bloc a un thème spécifique, l'appliquer
          if (blockTheme && blockTheme !== 'auto') {
            console.log('🎨 Application du thème:', blockTheme);
            document.documentElement.setAttribute('data-theme', blockTheme);
          } else {
            // Sinon, appliquer le thème par défaut selon le type
            if (blockType === 'services' || blockType === 'projects') {
              document.documentElement.setAttribute('data-theme', 'dark');
            } else if (blockType === 'logos') {
              document.documentElement.setAttribute('data-theme', 'light');
            } else if (blockType === 'two-columns') {
              // Pour two-columns avec thème auto, utiliser le thème global actuel
              const currentTheme = localStorage.getItem('theme') || 'light';
              console.log('🎨 TwoColumns avec thème auto - utilisation du thème global:', currentTheme);
              document.documentElement.setAttribute('data-theme', currentTheme);
            }
          }
        }
      });
    }, { threshold: 0.3 }); // Seuil plus bas pour une détection plus rapide

    // Observer tous les blocs
    setTimeout(() => {
      document.querySelectorAll('[data-block-type]').forEach(el => {
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [blocks]);

  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const Component = registry[block.type] ?? defaultRegistry[block.type];
        
        if (!Component) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`❌ Bloc inconnu: ${block.type}`, {
              availableTypes: Object.keys(registry),
              block: block
            });
          }
          return null;
        }
        
        // Ajouter les attributs data pour le système de thèmes
        const blockProps = {
          ...block,
          'data-block-type': block.type,
          'data-block-theme': block.theme || 'auto'
        };
        
        return <Component key={block.id} {...blockProps} />;
      })}
    </div>
  );
} 