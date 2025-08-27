'use client';

import React from 'react';
import FormattedText from '../../components/FormattedText';
import { useTheme } from '../../hooks/useTheme';
import type { TwoColumnsBlock } from '../types';

function TwoColumns(block: TwoColumnsBlock) {
  // Utiliser le hook useTheme pour avoir le même comportement que ThemeToggle
  const { theme: currentTheme, toggleTheme, mounted } = useTheme();
  
  // Debug: vérifier le thème reçu
  console.log('🎨 TwoColumns - Thème reçu:', { 
    blockTheme: block.theme, 
    currentTheme,
    themeType: typeof block.theme,
    hasTheme: 'theme' in block,
    allProps: Object.keys(block),
    blockData: JSON.stringify(block, null, 2)
  });
  
  // S'assurer que les valeurs par défaut sont cohérentes entre serveur et client
  const leftColumn = block.leftColumn || [];
  const rightColumn = block.rightColumn || [];
  const layout = block.layout || 'left-right';
  const gap = block.gap || 'medium';
  const alignment = block.alignment || 'top';

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

  // Générer les classes CSS de manière cohérente
  const layoutClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2';
  const gapClass = gapClasses[gap] || 'gap-8';
  const alignmentClass = alignmentClasses[alignment] || 'items-start';
  
  // Utiliser seulement le thème du bloc, comme les autres blocs
  const blockTheme = block.theme || 'auto';
  
  // Debug: vérifier le thème final
  console.log('🎨 TwoColumns - Thème final:', { 
    blockTheme,
    willApplyTheme: blockTheme !== 'auto',
    currentGlobalTheme: typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'SSR'
  });
  
  // Ne rien rendre tant que le composant n'est pas monté (comme ThemeToggle)
  if (!mounted) {
    return <div className="two-columns-section py-28" style={{ minHeight: '200px' }}></div>;
  }

  // Fonction pour rendre les sous-blocs en utilisant les mêmes composants que le BlockRenderer
  const renderSubBlock = (subBlock: any) => {
    switch (subBlock.type) {
      case 'content':
        return (
          <div key={subBlock.id} className="block-content">
            <FormattedText>
              {subBlock.content}
            </FormattedText>
          </div>
        );
      
      case 'h2':
        return (
          <h2 key={subBlock.id} className="block-h2">
            {subBlock.content}
          </h2>
        );
      
      case 'h3':
        return (
          <h3 key={subBlock.id} className="block-h3">
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
      
      case 'cta':
        return (
          <div key={subBlock.id} className="block-cta">
            <button className="cta-button">
              {subBlock.ctaText || subBlock.content}
            </button>
          </div>
        );
      
      case 'about':
        return (
          <div key={subBlock.id} className="about-block">
            <h3 className="text-xl font-semibold mb-4">{subBlock.title}</h3>
            <FormattedText>
              {subBlock.content}
            </FormattedText>
          </div>
        );
      
      case 'services':
        return (
          <section key={subBlock.id} className="service-offerings-section py-16" data-block-type="services" data-block-theme={subBlock.theme || 'auto'}>
            <div className="container mx-auto">
              {subBlock.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {subBlock.title}
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(subBlock.offerings || []).map((offering: any) => (
                  <div key={offering.id} className="service-offering-block">
                    <h3 className="text-xl font-semibold mb-4">{offering.title}</h3>
                    <div 
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: offering.description || '' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'projects':
        return (
          <section key={subBlock.id} className="projects-section py-16" data-block-type="projects" data-block-theme={subBlock.theme || 'auto'}>
            <div className="container mx-auto">
              {subBlock.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {subBlock.title}
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Ici vous pouvez ajouter la logique pour afficher les projets */}
                <p className="text-gray-600">Projets à afficher</p>
              </div>
            </div>
          </section>
        );
      
      case 'logos':
        return (
          <section key={subBlock.id} className="logos-section py-16" data-block-type="logos" data-block-theme={subBlock.theme || 'auto'}>
            <div className="container mx-auto">
              {subBlock.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {subBlock.title}
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center">
                {(subBlock.logos || []).map((logo: any, index: number) => (
                  <div key={index} className="logo-item">
                    <img
                      src={logo.src || logo.image}
                      alt={logo.alt || logo.name || `Logo client ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      default:
        return <div key={subBlock.id} className="text-gray-500">Type de bloc non supporté: {subBlock.type}</div>;
    }
  };
  
  return (
          <section className="two-columns-section py-28" data-block-type="two-columns" data-block-theme={blockTheme}>
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

export default TwoColumns;