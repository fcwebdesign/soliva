'use client';

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getAutoDeclaredBlock } from '../registry';
import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from '../../registry';

interface TwoColumnsData {
  leftColumn?: any[];
  rightColumn?: any[];
  layout?: 'left-right' | 'right-left' | 'stacked-mobile';
  gap?: 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

export default function TwoColumnsBlock({ data }: { data: TwoColumnsData }) {
  const { mounted } = useTheme();
  const { key } = useTemplate();
  const templateRegistry = registries[key] ?? defaultRegistry;
  
  const leftColumn = data.leftColumn || [];
  const rightColumn = data.rightColumn || [];
  const layout = data.layout || 'left-right';
  const gap = data.gap || 'medium';
  const alignment = data.alignment || 'top';
  const blockTheme = data.theme || 'auto';

  const gapClasses = {
    small: 'gap-4',
    medium: 'gap-8',
    large: 'gap-12'
  };

  const alignmentClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  };

  const layoutClasses = {
    'left-right': 'grid-cols-1 md:grid-cols-2',
    'right-left': 'grid-cols-1 md:grid-cols-2',
    'stacked-mobile': 'grid-cols-1 lg:grid-cols-2'
  };

  const layoutClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2';
  const gapClass = gapClasses[gap] || 'gap-8';
  const alignmentClass = alignmentClasses[alignment] || 'items-start';
  
  // Ne rien rendre tant que le composant n'est pas monté
  if (!mounted) {
    return <div className="two-columns-section" style={{ minHeight: '200px' }}></div>;
  }

  // Fonction optimisée pour rendre les sous-blocs
  const renderSubBlock = (subBlock: any) => {
    // 1) Tenter un override de template si disponible
    const TemplateComponent: any = templateRegistry[subBlock.type];
    if (TemplateComponent) {
      const props: any = {
        ...subBlock,
        'data-block-type': subBlock.type,
        'data-block-theme': blockTheme || subBlock.theme || 'auto',
      };
      return <TemplateComponent key={subBlock.id} {...props} />;
    }

    // 2) Sinon, utiliser le bloc scalable auto-déclaré
    const scalableBlock = getAutoDeclaredBlock(subBlock.type);
    if (scalableBlock) {
      const BlockComponent = scalableBlock.component as any;
      // Adapter les données selon le type de bloc
      let adaptedData = subBlock;
      if (subBlock.type === 'image' && subBlock.image) {
        adaptedData = { ...subBlock, src: subBlock.image.src, alt: subBlock.image.alt };
      } else if (subBlock.type === 'h2' || subBlock.type === 'h3') {
        adaptedData = { content: subBlock.content, theme: blockTheme };
      }
      return <BlockComponent key={subBlock.id} data={adaptedData} />;
    }

    // Fallback pour les blocs non scalables (si nécessaire)
    switch (subBlock.type) {
      case 'content':
        return (
          <div key={subBlock.id} className="text-black/70 leading-relaxed max-w-[68ch] mb-6" 
               dangerouslySetInnerHTML={{ __html: subBlock.content }} />
        );
      
      case 'h2':
        return (
          <h2 key={subBlock.id} className="text-3xl font-bold text-gray-900 mb-6">
            {subBlock.content}
          </h2>
        );
      
      case 'h3':
        return (
          <h3 key={subBlock.id} className="text-xl font-semibold text-gray-900 mb-4">
            {subBlock.content}
          </h3>
        );
      
      case 'image':
        return (
          <div key={subBlock.id} className="block-image">
            <img 
              src={subBlock.image?.src} 
              alt={subBlock.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      default:
        return <div key={subBlock.id} className="text-gray-500">Type de bloc non supporté: {subBlock.type}</div>;
    }
  };
  
  return (
    <section className="two-columns-section" data-block-type="two-columns" data-block-theme={blockTheme}>
      <div className="container mx-auto">
        <div className={`grid ${layoutClass} ${gapClass} ${alignmentClass}`}>
          <div className="space-y-4">
            {leftColumn.map(renderSubBlock)}
          </div>
          <div className="space-y-4">
            {rightColumn.map(renderSubBlock)}
          </div>
        </div>
      </div>
    </section>
  );
}
