'use client';

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getAutoDeclaredBlock } from '../registry';
import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from '../../registry';

interface TwoColumnsData {
  title?: string;
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

  // Supporte à la fois { data: {...} } et des props à plat
  const blockData = (data as any).data || data;
  
  const title = blockData.title || '';
  const leftColumn = blockData.leftColumn || [];
  const rightColumn = blockData.rightColumn || [];
  const layout = blockData.layout || 'left-right';
  const gap = blockData.gap || 'medium';
  const alignment = blockData.alignment || 'top';
  const blockTheme = blockData.theme || 'auto';

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
  const gapValue = gap === 'small' ? 'var(--gap-sm)' : gap === 'large' ? 'var(--gap-lg)' : 'var(--gap)';
  
  // Ne rien rendre tant que le composant n'est pas monté
  if (!mounted) {
    return <div className="two-columns-section" style={{ minHeight: '200px' }}></div>;
  }

  // Fonction optimisée pour rendre les sous-blocs
  const renderSubBlock = (subBlock: any) => {
    // Wrapper pour ajouter data-block-id (nécessaire pour le scroll dans l'admin preview)
    const wrapWithBlockId = (element: React.ReactElement) => {
      if (!subBlock.id) return element;
      return (
        <div
          key={subBlock.id}
          data-block-id={subBlock.id}
          data-block-type={subBlock.type}
          className="relative"
          style={{ scrollMarginTop: '96px' }}
        >
          {React.cloneElement(element, { key: undefined })}
        </div>
      );
    };

    // 1) Tenter un override de template si disponible
    const TemplateComponent: any = templateRegistry[subBlock.type];
    if (TemplateComponent) {
      const props: any = {
        ...subBlock,
        'data-block-type': subBlock.type,
        'data-block-theme': blockTheme || subBlock.theme || 'auto',
      };
      return wrapWithBlockId(<TemplateComponent {...props} />);
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
      return wrapWithBlockId(<BlockComponent data={adaptedData} />);
    }

    // Fallback pour les blocs non scalables (si nécessaire)
    switch (subBlock.type) {
      case 'content':
        return wrapWithBlockId(
          <div className="text-black/70 leading-relaxed max-w-[68ch] mb-6" 
               dangerouslySetInnerHTML={{ __html: subBlock.content }} />
        );
      
      case 'h2':
        return wrapWithBlockId(
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {subBlock.content}
          </h2>
        );
      
      case 'h3':
        return wrapWithBlockId(
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {subBlock.content}
          </h3>
        );
      
      case 'image':
        return wrapWithBlockId(
          <div className="block-image">
            <img 
              src={subBlock.image?.src} 
              alt={subBlock.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      default:
        return wrapWithBlockId(
          <div className="text-gray-500">Type de bloc non supporté: {subBlock.type}</div>
        );
    }
  };
  
  return (
    <section className="two-columns-section" data-block-type="two-columns" data-block-theme={blockTheme}>
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
        {layout === 'right-left' ? (
          <>
            <div className="flex flex-col" style={{ gap: gapValue }}>
              {rightColumn.filter((block: any) => !block.hidden).map(renderSubBlock)}
            </div>
            <div className="flex flex-col" style={{ gap: gapValue }}>
              {leftColumn.filter((block: any) => !block.hidden).map(renderSubBlock)}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col" style={{ gap: gapValue }}>
              {leftColumn.filter((block: any) => !block.hidden).map(renderSubBlock)}
            </div>
            <div className="flex flex-col" style={{ gap: gapValue }}>
              {rightColumn.filter((block: any) => !block.hidden).map(renderSubBlock)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
