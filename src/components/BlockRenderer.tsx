import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';
// Import du système scalable (charge automatiquement tous les blocs)
import '../blocks/auto-declared';
import { getAutoDeclaredBlock } from '../blocks/auto-declared/registry';

interface Block {
  id: string;
  type: string;
  title?: string;
  content?: string;
  theme?: string;
  ctaText?: string;
  [key: string]: any;
}

interface BlockRendererProps {
  blocks?: Block[];
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks = [] }) => {
  // Gestion du thème par bloc avec priorité sur le scroll
  React.useEffect(() => {
    // Observer les blocs pour détecter lequel est visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const blockType = entry.target.getAttribute('data-block-type');
          const blockTheme = entry.target.getAttribute('data-block-theme');
          
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

  const renderBlock = (block: Block) => {
    console.log('🔍 Rendu du bloc:', block.type, block);
    
    // Debug spécifique pour le bloc quote
    if (block.type === 'quote') {
      console.log('🎯 DEBUG QUOTE - Bloc complet:', block);
      console.log('🎯 DEBUG QUOTE - Registre disponible:', getAutoDeclaredBlock);
      console.log('🎯 DEBUG QUOTE - Bloc quote dans registre:', getAutoDeclaredBlock('quote'));
    }
    
    // Essayer d'abord le système scalable automatiquement
    const scalableBlock = getAutoDeclaredBlock(block.type);
    console.log('🔍 Bloc scalable trouvé pour', block.type, ':', scalableBlock);
    
    if (scalableBlock && scalableBlock.component) {
      const BlockComponent = scalableBlock.component;
      console.log('🔍 Composant du bloc', block.type, ':', BlockComponent);
      
      // Validation des données avec fallback automatique
      const blockData = {
        ...block,
        // Fallbacks génériques pour les propriétés communes
        title: block.title || '',
        content: block.content || '',
        theme: block.theme || 'auto',
        // Pour les blocs avec des propriétés spécifiques, les garder
        ...block
      };
      
      console.log('🔍 Données du bloc', block.type, ':', blockData);
      
      return (
        <BlockComponent 
          key={block.id}
          data={blockData}
        />
      );
    }

    console.warn('⚠️ Bloc scalable non trouvé pour', block.type);

    // Fallback pour les blocs non scalables (si on en a encore)
    switch (block.type) {
      case 'cta':
        return (
          <div key={block.id} className="block-cta">
            <button className="cta-button">
              {block.ctaText || block.content}
            </button>
          </div>
        );
      
      case 'hero-signature':
        return (
          <HeroSignature key={block.id} block={block} />
        );
      
      case 'storytelling':
        return (
          <StorytellingSection key={block.id} block={block} />
        );
      
      default:
        return (
          <div key={block.id} className="block-unknown">
            <p>Type de bloc non reconnu: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="blocks-container">
      {blocks.map(renderBlock)}
    </div>
  );
};

export default BlockRenderer;
