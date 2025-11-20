"use client";
import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';
import ScrollAnimated from './ScrollAnimated';
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
  content?: any; // Contenu complet pour les animations
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks = [], content: contentProp }) => {
  const [fullContent, setFullContent] = useState<any>(contentProp || null);

  // Charger le contenu complet si non fourni (pour les animations)
  useEffect(() => {
    if (contentProp) {
      setFullContent(contentProp);
      if (process.env.NODE_ENV === 'development') {
        console.log('🎬 [BlockRenderer] Contenu fourni via props:', !!contentProp?.metadata?.scrollAnimations);
      }
      return;
    }

    const loadContent = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎬 [BlockRenderer] Chargement du contenu depuis /api/content/metadata...');
        }
        const response = await fetch('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
          if (process.env.NODE_ENV === 'development') {
            console.log('🎬 [BlockRenderer] Contenu chargé:', {
              hasMetadata: !!data.metadata,
              hasScrollAnimations: !!data.metadata?.scrollAnimations,
              enabled: data.metadata?.scrollAnimations?.enabled,
              globalType: data.metadata?.scrollAnimations?.global?.type
            });
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('🎬 [BlockRenderer] Erreur chargement contenu:', response.status);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('🎬 [BlockRenderer] Erreur fetch contenu:', error);
        }
      }
    };
    loadContent();
  }, [contentProp]);

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

  // Helper pour wrapper un bloc avec ScrollAnimated si nécessaire
  const wrapWithAnimation = (blockElement: React.ReactElement, blockType: string) => {
    const scrollAnimations = fullContent?.metadata?.scrollAnimations;
    
    // Debug en développement
    if (process.env.NODE_ENV === 'development' && blockElement.key) {
      if (!fullContent) {
        console.log('🎬 [BlockRenderer] Contenu non chargé pour bloc', blockType);
      } else if (!scrollAnimations) {
        console.log('🎬 [BlockRenderer] scrollAnimations non trouvé pour bloc', blockType);
      } else if (!scrollAnimations.enabled) {
        console.log('🎬 [BlockRenderer] Animations désactivées pour bloc', blockType);
      } else {
        console.log('🎬 [BlockRenderer] Animation activée pour bloc', blockType, scrollAnimations.global?.type);
      }
    }
    
    if (!scrollAnimations?.enabled) {
      return blockElement;
    }

    // Helper pour obtenir le nom d'animation depuis le type de bloc
    // Utilise le registre des blocs auto-déclarés pour détecter automatiquement les nouveaux blocs
    const getAnimationBlockType = (blockType: string): string => {
      // Mapping manuel pour les blocs spéciaux/legacy
      const specialMapping: Record<string, string> = {
        'h1': 'H2Block', // H1 utilise la même animation que H2
        'cta': 'ContentBlock',
        'hero-signature': 'ContentBlock',
        'storytelling': 'ContentBlock'
      };

      if (specialMapping[blockType]) {
        return specialMapping[blockType];
      }

      // Pour les blocs auto-déclarés, convertir le type en PascalCase
      // Ex: 'content-block' -> 'ContentBlock', 'h2' -> 'H2Block'
      const pascalCase = blockType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      // Vérifier si le bloc existe dans le registre
      const block = getAutoDeclaredBlock(blockType);
      if (block) {
        // Utiliser le nom PascalCase avec "Block" suffix
        return pascalCase.endsWith('Block') ? pascalCase : `${pascalCase}Block`;
      }

      // Fallback: retourner le type tel quel
      return blockType;
    };

    const animationBlockType = getAnimationBlockType(blockType);

    return (
      <ScrollAnimated
        key={blockElement.key || blockType}
        blockType={animationBlockType}
        content={fullContent}
      >
        {blockElement}
      </ScrollAnimated>
    );
  };

  const renderBlock = (block: Block) => {
    // Debug: toujours logger pour voir ce qui se passe
    if (process.env.NODE_ENV === 'development') {
      console.log('🎬 [BlockRenderer] Rendu bloc:', block.type, {
        hasFullContent: !!fullContent,
        hasScrollAnimations: !!fullContent?.metadata?.scrollAnimations,
        enabled: fullContent?.metadata?.scrollAnimations?.enabled
      });
    }
    
    // Essayer d'abord le système scalable automatiquement
    const scalableBlock = getAutoDeclaredBlock(block.type);
    
    if (scalableBlock && scalableBlock.component) {
      const BlockComponent = scalableBlock.component;
      
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
      
      const blockElement = (
        <BlockComponent 
          key={block.id}
          data={blockData}
        />
      );

      return wrapWithAnimation(blockElement, block.type);
    }

    console.warn('⚠️ Bloc scalable non trouvé pour', block.type);

    // Fallback pour les blocs non scalables (si on en a encore)
    switch (block.type) {
      case 'cta':
        return wrapWithAnimation(
          <div key={block.id} className="block-cta">
            <button className="cta-button">
              {block.ctaText || block.content}
            </button>
          </div>,
          block.type
        );
      
      case 'hero-signature':
        return wrapWithAnimation(
          <HeroSignature key={block.id} block={block} />,
          block.type
        );
      
      case 'storytelling':
        return wrapWithAnimation(
          <StorytellingSection key={block.id} block={block} />,
          block.type
        );
      
      default:
        return wrapWithAnimation(
          <div key={block.id} className="block-unknown">
            <p>Type de bloc non reconnu: {block.type}</p>
          </div>,
          block.type
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
