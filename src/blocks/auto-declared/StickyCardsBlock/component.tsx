'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './styles.css';
import { getTypographyConfig, getTypographyClasses, getCustomColor, getCustomLineHeight, defaultTypography } from '@/utils/typography';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
gsap.registerPlugin(ScrollTrigger);
}

type AspectRatioValue = 'auto' | '1:1' | '1:2' | '2:3' | '3:4' | '4:5' | '9:16' | '3:2' | '4:3' | '5:4' | '16:9' | '2:1' | '4:1' | '8:1' | 'stretch';

type StickyCard = {
  id?: string;
  index?: string;
  title?: string;
  image?: { src?: string; alt?: string; aspectRatio?: AspectRatioValue };
  aspectRatio?: AspectRatioValue;
  copyTitle?: string;
  description?: string;
  hidden?: boolean;
};

type StickyCardsData = {
  title?: string;
  subtitle?: string;
  cards?: StickyCard[];
  theme?: 'light' | 'dark' | 'auto';
};

const defaultCards: StickyCard[] = [
  {
    id: 'card-1',
    index: '01',
    title: 'Modularity',
    image: { src: '/sticky-cards/card_1.jpg', alt: 'Modularity' },
    copyTitle: '(About the state)',
    description: 'Every element is built to snap into place. We design modular systems where clarity, structure, and reuse come first—no clutter, no excess.',
  },
  {
    id: 'card-2',
    index: '02',
    title: 'Materials',
    image: { src: '/sticky-cards/card_2.jpg', alt: 'Materials' },
    copyTitle: '(About the state)',
    description: 'From soft gradients to hard edges, our design language draws from real-world materials—elevating interfaces that feel both digital and tangible.',
  },
  {
    id: 'card-3',
    index: '03',
    title: 'Precision',
    image: { src: '/sticky-cards/card_3.jpg', alt: 'Precision' },
    copyTitle: '(About the state)',
    description: 'Details matter. We work with intention—aligning pixels, calibrating contrast, and obsessing over every edge until it just feels right.',
  },
  {
    id: 'card-4',
    index: '04',
    title: 'Character',
    image: { src: '/sticky-cards/card_4.jpg', alt: 'Character' },
    copyTitle: '(About the state)',
    description: 'Interfaces should have personality. We embed small moments of play and irregularity to bring warmth, charm, and a human feel to the digital.',
  },
];

export default function StickyCardsBlock({ data }: { data: StickyCardsData | any }) {
  const blockData = useMemo(() => (data as any)?.data || data || {}, [data]);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[StickyCardsBlock] Component render:', {
      blockData,
      hasCards: !!blockData?.cards,
      cardsLength: blockData?.cards?.length,
    });
  }
  
  /**
   * Cartes stables : filtrées, ordre d'origine respecté (reorder admin),
   * avec une clé dérivée (id puis index). Pas de tri pour conserver l'ordre.
   */
  const stableCards = useMemo(() => {
    const base = Array.isArray(blockData?.cards) && blockData.cards.length
      ? blockData.cards.filter((c) => !c.hidden)
      : defaultCards;

    return base.map((c, i) => ({
      card: c,
      key: c.id || `sticky-card-${c.index || i}`,
    }));
  }, [blockData?.cards]);

  // Logs supplémentaires pour suivre l'ordre (dev uniquement)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log('[StickyCardsBlock] blockData.cards order:', (blockData?.cards || []).map((c: any, i: number) => ({
      order: i,
      id: c.id,
      title: c.title,
    })));
    console.log('[StickyCardsBlock] stableCards order:', stableCards.map(({ card, key }, i) => ({
      order: i,
      key,
      id: card.id,
      title: card.title,
    })));
  }, [blockData?.cards, stableCards]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [fullContent, setFullContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/content/metadata', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);

  const titleClasses = useMemo(() => {
    const safe = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
    const classes = getTypographyClasses('h2', safe, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const titleColor = useMemo(() => {
    const custom = getCustomColor('h2', typoConfig);
    return custom || 'var(--foreground)';
  }, [typoConfig]);

  const titleLineHeight = useMemo(() => getCustomLineHeight('h2', typoConfig) || undefined, [typoConfig]);

  const subtitleClasses = useMemo(() => {
    const safe = typoConfig?.h3 ? { h3: typoConfig.h3 } : {};
    const classes = getTypographyClasses('h3', safe, defaultTypography.h3);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const subtitleColor = useMemo(() => {
    const custom = getCustomColor('h3', typoConfig);
    return custom || 'var(--muted-foreground)';
  }, [typoConfig]);

  // Typographie pour l'index (h1 pour la taille, mais on garde h3 sémantiquement)
  const indexClasses = useMemo(() => {
    const safe = typoConfig?.h1 ? { h1: typoConfig.h1 } : {};
    const classes = getTypographyClasses('h1', safe, defaultTypography.h1);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  // IMPORTANT : Les cartes ont un fond var(--foreground) (blanc), donc le texte doit être var(--background) (noir)
  // pour avoir un bon contraste. On utilise la typographie globale mais avec la couleur inverse.
  const indexColor = useMemo(() => {
    // Les cartes ont un fond clair, donc le texte doit être foncé
    return 'var(--background)';
  }, []);

  const indexLineHeight = useMemo(() => getCustomLineHeight('h1', typoConfig) || undefined, [typoConfig]);

  // Typographie pour le titre de carte (h2)
  const cardTitleClasses = useMemo(() => {
    const safe = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
    const classes = getTypographyClasses('h2', safe, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const cardTitleColor = useMemo(() => {
    // Les cartes ont un fond clair, donc le texte doit être foncé
    return 'var(--background)';
  }, []);

  const cardTitleLineHeight = useMemo(() => getCustomLineHeight('h2', typoConfig) || undefined, [typoConfig]);

  // Typographie pour le copyTitle (h3)
  const copyTitleClasses = useMemo(() => {
    const safe = typoConfig?.h3 ? { h3: typoConfig.h3 } : {};
    const classes = getTypographyClasses('h3', safe, defaultTypography.h3);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const copyTitleColor = useMemo(() => {
    // Les cartes ont un fond clair, donc le texte doit être foncé
    return 'var(--background)';
  }, []);

  // Typographie pour la description (p)
  const descriptionClasses = useMemo(() => {
    const safe = typoConfig?.p ? { p: typoConfig.p } : {};
    const classes = getTypographyClasses('p', safe, defaultTypography.p);
    const result = classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\btext-muted-foreground\b/g, '') // Retirer aussi text-muted-foreground car on gère la couleur via style
      .replace(/\s+/g, ' ')
      .trim();
    if (process.env.NODE_ENV === 'development') {
      console.log('[StickyCardsBlock] descriptionClasses computed:', {
        original: classes,
        result,
        type: typeof result,
      });
    }
    return result;
  }, [typoConfig]);

  const descriptionColor = useMemo(() => {
    // Les cartes ont un fond clair, donc le texte doit être foncé
    const result = 'var(--background)';
    if (process.env.NODE_ENV === 'development') {
      console.log('[StickyCardsBlock] descriptionColor:', result);
    }
    return result;
  }, []);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;
    const isAdminPreview =
      (typeof document !== 'undefined' && document.body.classList.contains('admin-page')) ||
      (typeof window !== 'undefined' && window.location.pathname.includes('/admin'));
    if (isAdminPreview) return;

    const container = containerRef.current;
    const triggers: ScrollTrigger[] = [];

    // Fonction utilitaire pour supprimer les pin-spacers laissés par GSAP
    const cleanupPinSpacers = () => {
      const pinSpacers = container.querySelectorAll('.pin-spacer');
      pinSpacers.forEach((spacer) => {
        const pinnedChild = spacer.querySelector('.sticky-card');
        if (pinnedChild && spacer.parentElement) {
          spacer.parentElement.insertBefore(pinnedChild, spacer);
          spacer.parentElement.removeChild(spacer);
        }
      });
    };

    // Attendre que React ait fini de rendre avant de manipuler avec GSAP
    const timeoutId = setTimeout(() => {
      const stickyCards = container.querySelectorAll('.sticky-card');
      if (stickyCards.length === 0) return;

      // S'assurer que les éléments sont bien dans le DOM
      if (!document.body.contains(container)) return;

      // Cleanup des ScrollTriggers existants pour éviter les doublons
      try {
        ScrollTrigger.getAll().forEach((trigger) => {
          const target = (trigger as any).vars?.trigger || (trigger as any).trigger;
          if (target && container.contains(target as Node)) {
            trigger.kill(true);
          }
        });
        cleanupPinSpacers();
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [StickyCardsBlock] Erreur cleanup pré-ScrollTrigger:', e);
        }
      }

      stickyCards.forEach((card, index) => {
        if (index < stickyCards.length - 1) {
          // Pin trigger
          const pinTrigger = ScrollTrigger.create({
            trigger: card as Element,
            start: 'top top',
            endTrigger: stickyCards[stickyCards.length - 1] as Element,
            end: 'top top',
            pin: true,
            pinSpacing: false,
            refreshPriority: 1,
            invalidateOnRefresh: true,
          });
          triggers.push(pinTrigger);

          // Animation trigger (scale, rotation, opacity)
          const animTrigger = ScrollTrigger.create({
            trigger: stickyCards[index + 1] as Element,
            start: 'top bottom',
            end: 'top top',
            refreshPriority: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.25;
              const rotation = (index % 2 === 0 ? 5 : -5) * progress;
              const afterOpacity = progress;

              gsap.set(card as Element, {
                scale: scale,
                rotation: rotation,
                '--after-opacity': afterOpacity,
              });
            },
          });
          triggers.push(animTrigger);
        }
      });

      // Refresh ScrollTrigger après un court délai pour s'assurer que le DOM est prêt
      const refreshTimeout = setTimeout(() => {
        try {
          ScrollTrigger.refresh();
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [StickyCardsBlock] ScrollTrigger.refresh() appelé après montage');
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ [StickyCardsBlock] Erreur refresh ScrollTrigger:', e);
          }
        }
      }, 100);

      // Cleanup des triggers et des pin-spacers quand on démonte ou rerend
      triggers.push({
        kill: () => clearTimeout(refreshTimeout),
      } as any);
    }, 50); // Petit délai pour laisser React finir le rendu

    return () => {
      clearTimeout(timeoutId);
      triggers.forEach((trigger) => trigger.kill(true));
      // Nettoyer les pin-spacers résiduels
      if (containerRef.current) {
        const pinSpacers = containerRef.current.querySelectorAll('.pin-spacer');
        pinSpacers.forEach((spacer) => {
          const pinnedChild = spacer.querySelector('.sticky-card');
          if (pinnedChild && spacer.parentElement) {
            spacer.parentElement.insertBefore(pinnedChild, spacer);
            spacer.parentElement.removeChild(spacer);
          }
        });
      }
    };
  }, [stableCards]);

  return (
    <section className="sticky-cards-block" data-block-type="sticky-cards" data-block-theme={blockData.theme || 'auto'}>
      {(blockData.subtitle || blockData.title) && (
        <div className="sticky-cards-block__heading mb-12">
          {blockData.subtitle && (
            <p className={`sticky-cards-block__supertitle ${subtitleClasses}`} style={{ color: subtitleColor }}>
              {blockData.subtitle}
            </p>
          )}
          {blockData.title && (
            <h2
              className={`sticky-cards-block__title ${titleClasses}`}
              style={{ color: titleColor, ...(titleLineHeight && { lineHeight: titleLineHeight }) }}
            >
              {blockData.title}
            </h2>
          )}
        </div>
      )}

      <div className="sticky-cards" ref={containerRef}>
        {stableCards.map(({ card, key }, index) => {
          const imageStyle = (() => {
            if (!card.image?.src) return {};
            const ratio = card.aspectRatio || card.image?.aspectRatio || '16:9';
            if (ratio === 'auto' || ratio === 'stretch') {
              return {};
            }
            return { aspectRatio: ratio.replace(':', '/') };
          })();

          if (process.env.NODE_ENV === 'development') {
            console.log('[StickyCardsBlock] map entry', {
              index,
              key,
              id: card.id,
              title: card.title,
              hasImage: !!card.image?.src,
            });
            console.log(`[StickyCardsBlock] Card ${index} imageStyle:`, imageStyle);
            console.log(`[StickyCardsBlock] Card ${index} typography classes:`, {
              indexClasses,
              cardTitleClasses,
              copyTitleClasses,
              descriptionClasses,
            });
            console.log(`[StickyCardsBlock] Rendering card ${index}:`, {
              id: card.id,
              title: card.title,
              hasImage: !!card.image?.src,
              hasCopyTitle: !!card.copyTitle,
              hasDescription: !!card.description,
              descriptionType: typeof card.description,
              descriptionValue: card.description,
            });
          }

          return (
            <div className="sticky-card" key={key}>
              <div className="sticky-card-index">
                <h3
                  className={indexClasses || ''}
                  style={{
                    color: indexColor || 'var(--background)',
                    ...(indexLineHeight && { lineHeight: indexLineHeight }),
                    margin: 0,
                  }}
                >
                  {card.index || String(index + 1).padStart(2, '0')}
                </h3>
              </div>
              <div className="sticky-card-content">
                <div className="sticky-card-content-wrapper">
                  <h2
                    className={`sticky-card-header ${cardTitleClasses || ''}`}
                    style={{
                      color: cardTitleColor || 'var(--background)',
                      ...(cardTitleLineHeight && { lineHeight: cardTitleLineHeight }),
                      margin: 0,
                    }}
                  >
                    {card.title || 'Untitled'}
                  </h2>

                  {card.image?.src ? (
                    <div className="sticky-card-img">
                      <img 
                        src={card.image.src} 
                        alt={card.image.alt || card.title || ''}
                        style={imageStyle}
                      />
                    </div>
                  ) : null}

                {(card.copyTitle || card.description) && (
                  <div className="sticky-card-copy">
                    {card.copyTitle && (
                      <div className="sticky-card-copy-title">
                        <h3
                          className={copyTitleClasses || ''}
                          style={{
                            color: copyTitleColor || 'var(--background)',
                            margin: 0,
                          }}
                        >
                          {card.copyTitle}
                        </h3>
                      </div>
                    )}
                    {card.description && (() => {
                      if (process.env.NODE_ENV === 'development') {
                        console.log(`[StickyCardsBlock] Rendering description for card ${index}:`, {
                          description: card.description,
                          descriptionType: typeof card.description,
                          descriptionClasses,
                          descriptionColor,
                        });
                      }
                      return (
                        <div className="sticky-card-copy-description">
                          <p
                            className={descriptionClasses || ''}
                            style={{
                              color: descriptionColor || 'var(--background)',
                              margin: 0,
                            }}
                          >
                            {String(card.description || '')}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

