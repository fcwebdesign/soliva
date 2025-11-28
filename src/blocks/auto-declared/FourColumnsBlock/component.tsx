'use client';

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getAutoDeclaredBlock } from '../registry';

interface FourColumnsData {
  title?: string;
  column1?: any[];
  column2?: any[];
  column3?: any[];
  column4?: any[];
  layout?: 'four-columns' | 'stacked-mobile' | 'stacked-tablet';
  gap?: 'small' | 'medium' | 'large';
  column1RowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large';
  column2RowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large';
  column3RowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large';
  column4RowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

export default function FourColumnsBlock({ data }: { data: FourColumnsData }) {
  const { mounted } = useTheme();
  // Supporte à la fois { data: {...} } et des props à plat
  const blockData = (data as any).data || data;

  const title = blockData.title || '';
  const column1 = blockData.column1 || [];
  const column2 = blockData.column2 || [];
  const column3 = blockData.column3 || [];
  const column4 = blockData.column4 || [];
  const layout = blockData.layout || 'four-columns';
  const gap = blockData.gap || 'medium';
  const column1RowGap = blockData.column1RowGap || 'inherit';
  const column2RowGap = blockData.column2RowGap || 'inherit';
  const column3RowGap = blockData.column3RowGap || 'inherit';
  const column4RowGap = blockData.column4RowGap || 'inherit';
  const alignment = blockData.alignment || 'top';
  const blockTheme = blockData.theme || 'auto';

  const gapClasses = {
    small: 'gap-3',
    medium: 'gap-4',
    large: 'gap-6'
  };

  const alignmentClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  };

  const layoutClasses = {
    'four-columns': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    'stacked-mobile': 'grid-cols-1 lg:grid-cols-4',
    'stacked-tablet': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
  };
  const layoutClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  const gapClass = gapClasses[gap] || 'gap-4';
  const alignmentClass = alignmentClasses[alignment] || 'items-start';
  const gapValue = gap === 'small' ? 'var(--gap-sm)' : gap === 'large' ? 'var(--gap-lg)' : 'var(--gap)';
  const rowGapFor = (val: 'inherit' | 'none' | 'small' | 'medium' | 'large') => {
    if (val === 'none') return '0px';
    if (val === 'small') return 'var(--gap-sm)';
    if (val === 'large') return 'var(--gap-lg)';
    if (val === 'medium') return 'var(--gap)';
    return '1.5rem';
  };
  const column1RowGapValue = rowGapFor(column1RowGap);
  const column2RowGapValue = rowGapFor(column2RowGap);
  const column3RowGapValue = rowGapFor(column3RowGap);
  const column4RowGapValue = rowGapFor(column4RowGap);
  
  // Ne rien rendre tant que le composant n'est pas monté
  if (!mounted) {
    return <div className="four-columns-section" style={{ minHeight: '200px' }}></div>;
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
        // Pour les blocs H2/H3, passer le thème du bloc FourColumns
        adaptedData = {
          content: subBlock.content,
          theme: blockTheme // Utiliser le thème du bloc FourColumns
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
    <section className="four-columns-section" data-block-type="four-columns" data-block-theme={blockTheme}>
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
        <div className="flex flex-col" style={{ rowGap: column1RowGapValue }}>
          {column1.filter((block: any) => !block.hidden).map(renderSubBlock)}
        </div>
        <div className="flex flex-col" style={{ rowGap: column2RowGapValue }}>
          {column2.filter((block: any) => !block.hidden).map(renderSubBlock)}
        </div>
        <div className="flex flex-col" style={{ rowGap: column3RowGapValue }}>
          {column3.filter((block: any) => !block.hidden).map(renderSubBlock)}
        </div>
        <div className="flex flex-col" style={{ rowGap: column4RowGapValue }}>
          {column4.filter((block: any) => !block.hidden).map(renderSubBlock)}
        </div>
      </div>
    </section>
  );
}
