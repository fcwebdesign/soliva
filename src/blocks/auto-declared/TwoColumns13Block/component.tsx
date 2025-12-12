'use client';

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getAutoDeclaredBlock } from '../registry';
import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from '../../registry';

interface TwoColumns13Data {
  title?: string;
  leftColumn?: any[];
  rightColumn?: any[];
  gap?: 'small' | 'medium' | 'large' | 'xlarge';
  leftRowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  rightRowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

export default function TwoColumns13Block({ data }: { data: TwoColumns13Data }) {
  const { mounted } = useTheme();
  const { key } = useTemplate();
  const templateRegistry = registries[key] ?? defaultRegistry;

  // Supporte à la fois { data: {...} } et des props à plat
  const blockData = (data as any).data || data;
  
  const title = blockData.title || '';
  const leftColumn = blockData.leftColumn || [];
  const rightColumn = blockData.rightColumn || [];
  const gap = blockData.gap || 'medium';
  const leftRowGap = blockData.leftRowGap || 'inherit';
  const rightRowGap = blockData.rightRowGap || 'inherit';
  const alignment = blockData.alignment || 'top';
  const blockTheme = blockData.theme || 'auto';

  const alignmentClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  };
  const alignmentClass = alignmentClasses[alignment] || 'items-start';
  
  // Espacement entre colonnes : utiliser les variables CSS globales (configurables dans /admin?page=spacing)
  const columnGapValue = gap === 'small' 
    ? 'var(--gap-sm)' 
    : gap === 'large' 
    ? 'var(--gap-lg)' 
    : gap === 'xlarge'
    ? 'var(--gap-xl)' // Utilise la variable globale
    : 'var(--gap)'; // medium par défaut
  
  // Espacement vertical dans les colonnes : utiliser les variables CSS globales
  const rowGapFor = (val: 'inherit' | 'none' | 'small' | 'medium' | 'large' | 'xlarge') => {
    if (val === 'none') return '0px';
    if (val === 'small') return 'var(--gap-sm)';
    if (val === 'large') return 'var(--gap-lg)';
    if (val === 'xlarge') return 'var(--gap-xl)'; // Utilise la variable globale
    if (val === 'medium') return 'var(--gap)';
    return 'var(--gap)'; // valeur par défaut si inherit (utilise le gap par défaut)
  };
  const leftRowGapValue = rowGapFor(leftRowGap);
  const rightRowGapValue = rowGapFor(rightRowGap);
  
  // Ne rien rendre tant que le composant n'est pas monté
  if (!mounted) {
    return <div className="two-columns-13-section" style={{ minHeight: '200px' }}></div>;
  }

  // Fonction optimisée pour rendre les sous-blocs
  const renderSubBlock = (subBlock: any, index: number) => {
    // Wrapper pour ajouter data-block-id (nécessaire pour le scroll dans l'admin preview)
    const wrapWithBlockId = (element: React.ReactElement) => {
      const fallbackKey = `${subBlock.type || 'block'}-${index}`;
      const key = subBlock.id || fallbackKey;
      return (
        <div
          key={key}
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
    <section className="two-columns-13-section" data-block-type="two-columns-13" data-block-theme={blockTheme}>
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
      {/* Grid avec ratio 1/3 - 2/3 */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${alignmentClass}`} style={{ columnGap: columnGapValue, rowGap: '1.5rem' }}>
        {/* Colonne gauche : 1/3 */}
        <div className="md:col-span-1 flex flex-col" style={{ rowGap: leftRowGapValue }}>
          {leftColumn
            .filter((block: any) => !block.hidden)
            .map((block: any, idx: number) => renderSubBlock(block, idx))}
        </div>
        {/* Colonne droite : 2/3 */}
        <div className="md:col-span-2 flex flex-col" style={{ rowGap: rightRowGapValue }}>
          {rightColumn
            .filter((block: any) => !block.hidden)
            .map((block: any, idx: number) => renderSubBlock(block, idx))}
        </div>
      </div>
    </section>
  );
}

