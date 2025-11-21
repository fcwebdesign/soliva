'use client';

import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from './registry';
import type { AnyBlock } from './types';
import { useEffect, useState } from 'react';
import ScrollAnimated from '@/components/ScrollAnimated';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Charger les blocs auto-déclarés et accéder au registre scalable
import './auto-declared';
import { getAutoDeclaredBlock } from './auto-declared/registry';

type BlockRendererProps = {
  blocks: AnyBlock[];
  content?: any;
  /** Ajoute data-block-id sur chaque bloc, utile pour l’admin preview (scroll/selection). */
  withDebugIds?: boolean;
  /** Facultatif: force une surbrillance visuelle d’un bloc précis (admin preview). */
  highlightBlockId?: string;
};

export default function BlockRenderer({ blocks, content: contentProp, withDebugIds = false, highlightBlockId }: BlockRendererProps) {
  const { key } = useTemplate();
  const registry = registries[key] ?? defaultRegistry;
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

  // Refresh ScrollTrigger après que tous les blocs sont rendus
  useEffect(() => {
    if (blocks.length > 0 && fullContent?.metadata?.scrollAnimations?.enabled) {
      let isMounted = true;
      const timeoutIds: NodeJS.Timeout[] = [];
      
      // Attendre que tous les blocs soient dans le DOM
      const refreshScrollTrigger = () => {
        if (!isMounted) return;
        // Vérifier que le document est toujours valide
        if (!document.body || !document.documentElement) return;
        try {
          // Vérifier que ScrollTrigger est disponible
          if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
            ScrollTrigger.refresh();
            if (process.env.NODE_ENV === 'development') {
              console.log('🎬 [BlockRenderer] ScrollTrigger refresh après rendu des blocs');
            }
          }
        } catch (e) {
          // Ignorer silencieusement toutes les erreurs
        }
      };
      
      // Refresh immédiatement et après un délai pour les éléments chargés dynamiquement
      refreshScrollTrigger();
      const timeout1 = setTimeout(() => {
        if (isMounted) refreshScrollTrigger();
      }, 300);
      const timeout2 = setTimeout(() => {
        if (isMounted) refreshScrollTrigger();
      }, 1000);
      timeoutIds.push(timeout1, timeout2);
      
      // Observer pour détecter quand de nouveaux éléments sont ajoutés au DOM
      const observer = new MutationObserver(() => {
        if (!isMounted) return;
        // Vérifier que le conteneur existe toujours avant de refresh
        const container = document.querySelector('.blocks-container');
        if (container && document.body.contains(container)) {
          try {
            refreshScrollTrigger();
          } catch (e) {
            // Ignorer les erreurs si le DOM a changé
          }
        }
      });
      
      // Observer les changements dans le conteneur de blocs
      const container = document.querySelector('.blocks-container');
      if (container && document.body.contains(container)) {
        observer.observe(container, {
          childList: true,
          subtree: true
        });
      }
      
      return () => {
        isMounted = false;
        // Nettoyer tous les timeouts
        timeoutIds.forEach(id => {
          try {
            clearTimeout(id);
          } catch (e) {
            // Ignorer
          }
        });
        try {
          observer.disconnect();
        } catch (e) {
          // Ignorer les erreurs si l'observer a déjà été déconnecté
        }
      };
    }
    
    // Retourner undefined si la condition n'est pas remplie
    return undefined;
  }, [blocks, fullContent]);

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

  // Helper pour wrapper un bloc avec ScrollAnimated si nécessaire
  const wrapWithAnimation = (blockElement: React.ReactElement, blockType: string) => {
    const scrollAnimations = fullContent?.metadata?.scrollAnimations;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎬 [BlockRenderer] wrapWithAnimation pour bloc', blockType, {
        hasFullContent: !!fullContent,
        hasScrollAnimations: !!scrollAnimations,
        enabled: scrollAnimations?.enabled
      });
    }
    
    if (!scrollAnimations?.enabled) {
      return blockElement;
    }

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

  if (!blocks || !Array.isArray(blocks)) return null;

  // Debug: afficher tous les blocs reçus
  if (process.env.NODE_ENV !== 'production' && blocks.length > 0) {
    console.log('🎨 [BlockRenderer] Rendu de', blocks.length, 'blocs:', blocks.map(b => ({ id: b.id, type: b.type })));
  }

  return (
    <div className="blocks-container">
      {blocks.map((block) => {
        // Debug pour TOUS les types de blocs en développement
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🎨 [BlockRenderer] Traitement bloc ${block.type}:`, { 
            block, 
            hasTemplateComponent: !!(registry[block.type] ?? defaultRegistry[block.type]),
            scalable: getAutoDeclaredBlock(block.type)
          });
        }

        // 1) Template registry override en priorité
        const TemplateComponent = registry[block.type] ?? defaultRegistry[block.type];
        if (TemplateComponent) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`✅ [BlockRenderer] Utilisation du TemplateComponent pour ${block.type}`);
          }
          const props = { ...block, 'data-block-type': block.type, 'data-block-theme': block.theme || 'auto' } as any;
          const blockElement = <TemplateComponent key={block.id} {...props} />;
          const wrapped = wrapWithAnimation(blockElement, block.type);
          if (withDebugIds) {
            return (
              <div
                key={block.id}
                data-block-id={block.id}
                data-block-type={block.type}
                className="relative"
                style={{ scrollMarginTop: '96px' }}
              >
                {highlightBlockId === block.id && (
                  <>
                    <div className="pointer-events-none absolute -inset-4 border-2 border-blue-500 shadow-sm bg-blue-50/10"></div>
                    <div className="pointer-events-none absolute -top-6 -left-4 bg-blue-600 text-white text-[12px] px-3 py-1 shadow font-semibold z-10">
                      {block.type}
                    </div>
                  </>
                )}
                {wrapped}
              </div>
            );
          }
          return wrapped;
        }

        // 2) Fallback sur les blocs auto-déclarés (scalable)
        const scalable = getAutoDeclaredBlock(block.type);
        if (scalable?.component) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`✅ [BlockRenderer] Utilisation du bloc auto-déclaré pour ${block.type}`);
          }
          const BlockComponent = scalable.component as any;
          const data = { ...block, title: (block as any).title || '', content: (block as any).content || '', theme: (block as any).theme || 'auto' };
          const blockElement = <BlockComponent key={block.id} data={data} />;
          const wrapped = wrapWithAnimation(blockElement, block.type);
          if (withDebugIds) {
            return (
              <div
                key={block.id}
                data-block-id={block.id}
                data-block-type={block.type}
                className="relative"
                style={{ scrollMarginTop: '96px' }}
              >
                {highlightBlockId === block.id && (
                  <>
                    <div className="pointer-events-none absolute -inset-4 border-2 border-blue-500 shadow-sm bg-blue-50/10"></div>
                    <div className="pointer-events-none absolute -top-6 -left-4 bg-blue-600 text-white text-[12px] px-3 py-1 shadow font-semibold z-10">
                      {block.type}
                    </div>
                  </>
                )}
                {wrapped}
              </div>
            );
          }
          return wrapped;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.warn(`❌ Bloc inconnu: ${block.type}`, { availableTypes: Object.keys(registry), block });
        }
        return null;
      })}
    </div>
  );
}
