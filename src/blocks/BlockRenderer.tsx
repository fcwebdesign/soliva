'use client';

import { useTemplate } from '@/templates/context';
import { registries, defaultRegistry } from './registry';
import type { AnyBlock } from './types';
import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import ScrollAnimated from '@/components/ScrollAnimated';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography, applyTypographyFonts } from '@/utils/typography';
import { fetchContentWithNoCache, useContentUpdate } from '@/hooks/useContentUpdate';
// Charger les blocs auto-déclarés et accéder au registre scalable
import './auto-declared';
import { getAutoDeclaredBlock } from './auto-declared/registry';

type BlockRendererProps = {
  blocks: AnyBlock[];
  content?: any;
  /** Ajoute data-block-id sur chaque bloc, utile pour l'admin preview (scroll/selection). */
  withDebugIds?: boolean;
  /** Facultatif: force une surbrillance visuelle d'un bloc précis (admin preview). */
  highlightBlockId?: string;
  /** Désactive les animations ScrollTrigger (utile pour l'iframe) */
  disableScrollAnimations?: boolean;
};

export default function BlockRenderer({ blocks, content: contentProp, withDebugIds = false, highlightBlockId, disableScrollAnimations = false }: BlockRendererProps) {
  const { key } = useTemplate();
  const registry = registries[key] ?? defaultRegistry;
  const [fullContent, setFullContent] = useState<any>(contentProp || null);

  // Charger le contenu complet (toujours depuis l'API pour avoir la typographie à jour)
  useEffect(() => {
    const loadContent = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎬 [BlockRenderer] Chargement du contenu depuis /api/content/metadata...');
        }
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
          if (process.env.NODE_ENV === 'development') {
            console.log('🎬 [BlockRenderer] Contenu chargé:', {
              hasMetadata: !!data.metadata,
              hasTypography: !!data.metadata?.typography,
              hasH1: !!data.metadata?.typography?.h1,
              h1FontSize: data.metadata?.typography?.h1?.fontSize,
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
  }, []);
  
  // Écouter les mises à jour de contenu pour recharger fullContent (typographie + animations)
  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement
      }
    };
    loadContent();
  });

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
    // Désactiver les animations si demandé (iframe)
    if (disableScrollAnimations) return;
    
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
      const observer = new MutationObserver((mutations) => {
        if (!isMounted) return;
        
        // Ignorer les changements causés par ScrollTrigger pin (pin-spacer)
        // Ces changements causent des boucles infinies
        const hasPinSpacer = mutations.some(mutation => {
          return Array.from(mutation.addedNodes).some((node: any) => {
            return node?.classList?.contains?.('pin-spacer') || 
                   node?.querySelector?.('.pin-spacer');
          });
        });
        
        if (hasPinSpacer) {
          // Ignorer les changements de pin-spacer pour éviter les boucles
          return;
        }
        
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
  }, [blocks.length, fullContent?.metadata?.scrollAnimations?.enabled, disableScrollAnimations]);

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

  // Liste des blocs qui utilisent GSAP ScrollTrigger avec pin: true
  // Pour ces blocs, on applique l'animation uniquement sur les enfants (pas le wrapper)
  // pour éviter les conflits avec le pin qui contrôle le wrapper
  const PINNED_BLOCKS = [
    'pinned-section',
    'pinned-grid-demo',
    'pinned-grid-explorations',
    'sticky-sections-codrops',
    'scroll-slider',
    'sticky-cards',
  ];

  // Helper pour wrapper un bloc avec ScrollAnimated si nécessaire
  const wrapWithAnimation = (blockElement: React.ReactElement, blockType: string) => {
    // Désactiver les animations si demandé (iframe)
    if (disableScrollAnimations) {
      return blockElement;
    }
    const scrollAnimations = fullContent?.metadata?.scrollAnimations;
    const defaultConfig = {
      type: 'fade-in-up',
      duration: 1,
      delay: 0,
      stagger: 0,
      easing: 'power3.out',
      threshold: 0.2,
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎬 [BlockRenderer] wrapWithAnimation pour bloc', blockType, {
        hasFullContent: !!fullContent,
        hasScrollAnimations: !!scrollAnimations,
        enabled: scrollAnimations?.enabled
      });
    }
    
    const enabled = scrollAnimations?.enabled ?? true;

    if (!enabled) {
      return blockElement;
    }

    const animationBlockType = getAnimationBlockType(blockType);
    const isPinnedBlock = PINNED_BLOCKS.includes(blockType);

    // Blocs avec animations GSAP natives : désactiver l'animation automatique
    // car ils gèrent déjà leurs propres animations ScrollTrigger
    const BLOCKS_WITH_NATIVE_ANIMATIONS = ['sticky-cards'];
    if (BLOCKS_WITH_NATIVE_ANIMATIONS.includes(blockType)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎬 [BlockRenderer] Bloc avec animations natives - animation automatique désactivée:', blockType);
      }
      return blockElement;
    }

    // Pour les blocs avec pin, on applique l'animation uniquement sur les enfants
    // pour éviter les conflits avec le ScrollTrigger du pin qui contrôle le wrapper
    if (isPinnedBlock) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📌 [BlockRenderer] Bloc avec pin - animation sur enfants uniquement:', blockType);
      }
      return (
        <ScrollAnimated
          key={blockElement.key || blockType}
          blockType={animationBlockType}
          content={fullContent}
          animationConfig={
            scrollAnimations?.blocks?.[animationBlockType] ||
            scrollAnimations?.global ||
            defaultConfig
          }
          animateChildrenOnly={true}
        >
          {blockElement}
        </ScrollAnimated>
      );
    }

    return (
      <ScrollAnimated
        key={blockElement.key || blockType}
        blockType={animationBlockType}
        content={fullContent}
        animationConfig={
          scrollAnimations?.blocks?.[animationBlockType] ||
          scrollAnimations?.global ||
          defaultConfig
        }
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

  // Déterminer quel bloc doit avoir le H1 (le premier page-intro ou hero)
  const headingBlocks = ['page-intro', 'hero', 'hero-floating-gallery', 'hero-simple'];
  
  // Trouver le premier bloc hero visible (pas masqué)
  const firstVisibleHeroIndex = blocks.findIndex(b => 
    ['hero', 'hero-floating-gallery', 'hero-simple'].includes(b.type) && !(b as any).hidden
  );
  const hasVisibleHero = firstVisibleHeroIndex !== -1;
  
  // Trouver le premier bloc heading (page-intro ou hero) visible
  const firstHeadingBlockIndex = blocks.findIndex(b => 
    headingBlocks.includes(b.type) && !(b as any).hidden
  );
  const hasHeadingBlock = firstHeadingBlockIndex !== -1;
  
  // Récupérer le titre de la page si aucun bloc page-intro ou hero visible
  const pathname = usePathname();
  const [pageData, setPageData] = useState<any>(null);
  
  // Charger pageData pour le titre automatique (comme PageIntroBlock)
  useEffect(() => {
    // Ne pas charger pageData si un hero visible est présent
    if (hasVisibleHero) return;
    if (hasHeadingBlock) return;
    
    const loadPageData = async () => {
      try {
        const content = fullContent || await (await fetchContentWithNoCache('/api/content/metadata')).json();
        
        // Trouver la page courante
        const slug = pathname?.split('/').filter(Boolean).pop() || '';
        let currentPage = null;
        
        if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
          currentPage = content[slug];
        } else if (content.pages?.pages) {
          currentPage = content.pages.pages.find((p: any) => 
            p.slug === slug || p.id === slug
          );
        }
        
        setPageData(currentPage);
      } catch (error) {
        // Ignorer silencieusement
      }
    };
    
    loadPageData();
  }, [pathname, hasVisibleHero, hasHeadingBlock, fullContent]);
  
  // Typographie pour le titre automatique (même style que PageIntroBlock)
  const typoConfig = useMemo(() => {
    if (!fullContent) return {};
    const config = getTypographyConfig(fullContent);
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 [BlockRenderer] Typo config:', {
        hasFullContent: !!fullContent,
        hasMetadata: !!fullContent?.metadata,
        hasTypography: !!fullContent?.metadata?.typography,
        hasH1: !!fullContent?.metadata?.typography?.h1,
        h1Config: fullContent?.metadata?.typography?.h1
      });
    }
    return config;
  }, [fullContent]);

  // Charger les polices globales dès que la typo est disponible
  useEffect(() => {
    applyTypographyFonts(typoConfig);
  }, [typoConfig]);
  
  const headingClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.h1 ? { h1: typoConfig.h1 } : {};
    const classes = getTypographyClasses('h1', safeTypoConfig, defaultTypography.h1);
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 [BlockRenderer] Heading classes:', {
        typoConfig: safeTypoConfig,
        defaultTypography: defaultTypography.h1,
        finalClasses: classes
      });
    }
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  const h1Color = useMemo(() => {
    const customColor = getCustomColor('h1', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  
  // Classes typographiques pour p (identique à PageIntroBlock)
  const pClasses = useMemo(() => {
    const classes = getTypographyClasses('p', typoConfig, defaultTypography.p);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Couleur pour p (identique à PageIntroBlock)
  const pColor = useMemo(() => {
    const customColor = getCustomColor('p', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  
  // Déterminer le layout (comme PageIntroBlock)
  const { key: templateKey } = useTemplate();
  const useTwoColumns = templateKey === 'pearl';
  const pageTitle = pageData?.title || pageData?.hero?.title;
  const pageDescription = pageData?.description || pageData?.hero?.description;
  
  return (
    <div className="blocks-container">
      {/* Afficher le titre de la page automatiquement si aucun bloc page-intro ou hero visible */}
      {!hasVisibleHero && !hasHeadingBlock && pageTitle && (
        <div 
          className="page-intro-block py-10"
          data-block-type="page-intro"
          data-block-theme="auto"
        >
          {useTwoColumns ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-end">
              <div className="text-left mb-4 lg:mb-0">
                <h1 
                  className={headingClasses}
                  style={{ color: h1Color }}
                >
                  {pageTitle}
                </h1>
              </div>
              {pageDescription && (
                <div className="text-left lg:ml-auto lg:pl-8">
                  <div
                    className={`max-w-2xl ${pClasses}`}
                    style={{ color: pColor }}
                    dangerouslySetInnerHTML={{ __html: pageDescription }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 
                  className={`${headingClasses} mb-4`}
                  style={{ color: h1Color }}
                >
                  {pageTitle}
                </h1>
                {pageDescription && (
                  <div
                    className={`max-w-3xl mx-auto ${pClasses}`}
                    style={{ color: pColor }}
                    dangerouslySetInnerHTML={{ __html: pageDescription }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {(() => {
        // Trouver le premier bloc hero visible (hero ou hero-floating-gallery)
        const firstVisibleHeroIndex = blocks.findIndex(b => 
          ['hero', 'hero-floating-gallery'].includes(b.type) && !(b as any).hidden
        );
        const hasVisibleHero = firstVisibleHeroIndex !== -1;
        
        // Filtrer les blocs masqués
        const visibleBlocks = blocks.filter((block, index) => {
          // Filtrer les blocs masqués
          if ((block as any).hidden) return false;
          
          // Ne pas masquer les blocs page-intro manuels - ils restent visibles
          // Seul le titre automatique de la page est masqué si un hero visible est présent
          
          
          // Pour les blocs two-columns, vérifier aussi les sous-blocs dans les colonnes
          if (block.type === 'two-columns') {
            const data = (block as any).data || block;
            const hasVisibleItems = (colKey: 'leftColumn' | 'rightColumn') => {
              const items = data[colKey] || [];
              return items.some((item: any) => !item?.hidden);
            };
            // Garder le bloc seulement s'il a au moins un item visible dans une colonne
            return hasVisibleItems('leftColumn') || hasVisibleItems('rightColumn');
          }
          
          return true;
        });
        
        // Recalculer firstHeadingBlockIndex après le filtre
        const visibleHeadingBlocks = visibleBlocks.filter(b => headingBlocks.includes(b.type));
        const newFirstHeadingBlockIndex = visibleHeadingBlocks.length > 0 
          ? visibleBlocks.findIndex(b => b.id === visibleHeadingBlocks[0].id)
          : -1;
        
        return visibleBlocks.map((block, index) => {
        // Le premier bloc page-intro ou hero a le H1, les autres utilisent H2
        const isFirstHeading = headingBlocks.includes(block.type) && index === newFirstHeadingBlockIndex;
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
                    <div className="block-highlight-label pointer-events-none absolute -top-6 -left-4 bg-blue-600 text-[12px] px-3 py-1 shadow font-semibold z-10" style={{ color: 'white' }}>
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
        // Passer le templateKey pour permettre les surcharges par template
        const scalable = getAutoDeclaredBlock(block.type, key);
        if (scalable?.component) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`✅ [BlockRenderer] Utilisation du bloc auto-déclaré pour ${block.type}`);
          }
          const BlockComponent = scalable.component as any;
          const data = { 
            ...block, 
            title: (block as any).title || '', 
            content: (block as any).content || '', 
            theme: (block as any).theme || 'auto',
            isFirstHeading // Passer la prop pour gérer H1 vs H2
          };
          // Debug temporaire pour fullscreen-carousel
          if ((block as any).type === 'fullscreen-carousel' && process.env.NODE_ENV !== 'production') {
            console.log('🔍 [BlockRenderer] fullscreen-carousel block data:', {
              'block.fullscreen': (block as any).fullscreen,
              'block.gap': (block as any).gap,
              'data.fullscreen': (data as any).fullscreen,
              'data.gap': (data as any).gap,
              'block keys': Object.keys(block),
              'data keys': Object.keys(data),
              'full block': block,
              'full data': data
            });
          }
          const blockElement = <BlockComponent key={block.id} data={data} />;
          const wrapped = wrapWithAnimation(blockElement, block.type);
          // Cas particulier : pinned-section ne supporte pas d'être rewrapé (ScrollTrigger pin-spacer)
          if (withDebugIds) {
            if ((block as any).type === 'pinned-section') {
              return React.cloneElement(wrapped as any, {
                key: block.id,
                'data-block-id': block.id,
              });
            }
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
                    <div className="block-highlight-label pointer-events-none absolute -top-6 -left-4 bg-blue-600 text-[12px] px-3 py-1 shadow font-semibold z-10" style={{ color: 'white' }}>
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
      });
      })()}
    </div>
  );
}
