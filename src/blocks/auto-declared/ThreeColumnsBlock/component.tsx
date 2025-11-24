'use client';

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getAutoDeclaredBlock } from '../registry';

interface ThreeColumnsData {
  title?: string;
  leftColumn?: any[];
  middleColumn?: any[];
  rightColumn?: any[];
  layout?: 'left-middle-right' | 'stacked-mobile' | 'stacked-tablet';
  gap?: 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

export default function ThreeColumnsBlock({ data }: { data: ThreeColumnsData }) {
  const { mounted } = useTheme();
  // Supporte à la fois { data: {...} } et des props à plat
  const blockData = (data as any).data || data;

  const title = blockData.title || '';
  const leftColumn = blockData.leftColumn || [];
  const middleColumn = blockData.middleColumn || [];
  const rightColumn = blockData.rightColumn || [];
  const layout = blockData.layout || 'left-middle-right';
  const gap = blockData.gap || 'medium';
  const alignment = blockData.alignment || 'top';
  const blockTheme = blockData.theme || 'auto';

  const gapClasses = {
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8'
  };

  const alignmentClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  };

  const layoutClasses = {
    'left-middle-right': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'stacked-mobile': 'grid-cols-1 lg:grid-cols-3',
    'stacked-tablet': 'grid-cols-1 md:grid-cols-3'
  };
  const layoutClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  const gapClass = gapClasses[gap] || 'gap-6';
  const alignmentClass = alignmentClasses[alignment] || 'items-start';
  const gapValue = gap === 'small' ? 'var(--gap-sm)' : gap === 'large' ? 'var(--gap-lg)' : 'var(--gap)';
  
  // Ne rien rendre tant que le composant n'est pas monté
  if (!mounted) {
    return <div className="three-columns-section" style={{ minHeight: '200px' }}></div>;
  }

  // Fonction optimisée pour rendre les sous-blocs en utilisant les blocs scalables
  const renderSubBlock = (subBlock: any) => {
    // Wrapper div pour contrôler la largeur du contenu et ajouter data-block-id (nécessaire pour le scroll dans l'admin preview)
    const blockWrapper = (content: React.ReactNode) => (
      <div 
        key={subBlock.id} 
        className="w-full relative"
        data-block-id={subBlock.id}
        data-block-type={subBlock.type}
        style={{ scrollMarginTop: '96px' }}
      >
        {content}
      </div>
    );

    // Essayer d'abord le système scalable
    const scalableBlock = getAutoDeclaredBlock(subBlock.type);
    if (scalableBlock) {
      const BlockComponent = scalableBlock.component;
      
      // Adapter les données selon le type de bloc
      let adaptedData = subBlock;
      if (subBlock.type === 'image' && subBlock.image) {
        // Pour les blocs image, adapter la structure
        adaptedData = {
          ...subBlock,
          src: subBlock.image.src,
          alt: subBlock.image.alt
        };
      } else if (subBlock.type === 'h2' || subBlock.type === 'h3') {
        // Pour les blocs H2/H3, passer le thème du bloc ThreeColumns
        adaptedData = {
          content: subBlock.content,
          theme: blockTheme // Utiliser le thème du bloc ThreeColumns
        };
      }
      
      return blockWrapper(
        <BlockComponent 
          data={adaptedData}
        />
      );
    }

    // Fallback pour les blocs non scalables (si nécessaire)
    switch (subBlock.type) {
      case 'content':
        return blockWrapper(
          <div className="text-black/70 leading-relaxed max-w-[68ch] mb-6" 
               dangerouslySetInnerHTML={{ __html: subBlock.content }} />
        );
      
      case 'h2':
        return blockWrapper(
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {subBlock.content}
          </h2>
        );
      
      case 'h3':
        return blockWrapper(
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {subBlock.content}
          </h3>
        );
      
      case 'image':
        return blockWrapper(
          <div className="block-image">
            <img 
              src={subBlock.image?.src} 
              alt={subBlock.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      default:
        return blockWrapper(
          <div className="text-gray-500">Type de bloc non supporté: {subBlock.type}</div>
        );
    }
  };
  
  return (
    <section className="three-columns-section" data-block-type="three-columns" data-block-theme={blockTheme}>
      {title && (() => {
        const heading = getAutoDeclaredBlock('h2');
        const HeadingComponent = heading?.component;
        return (
          <div className="mb-8">
            {HeadingComponent ? (
              <HeadingComponent data={{ content: title, theme: blockTheme }} />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            )}
          </div>
        );
      })()}
      <div className={`grid ${layoutClass} ${gapClass} ${alignmentClass}`} style={{ gap: gapValue }}>
        <div className="flex flex-col" style={{ gap: gapValue }}>
          {leftColumn.map(renderSubBlock)}
        </div>
        <div className="flex flex-col" style={{ gap: gapValue }}>
          {middleColumn.map(renderSubBlock)}
        </div>
        <div className="flex flex-col" style={{ gap: gapValue }}>
          {rightColumn.map(renderSubBlock)}
        </div>
      </div>
    </section>
  );
}
