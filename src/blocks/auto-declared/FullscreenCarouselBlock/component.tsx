'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { ReusableImage, ImageData, ImageItemData, AspectRatioValue } from '@/blocks/auto-declared/components';
import { getTypographyConfig, getTypographyClasses, getCustomLineHeight, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '../../../hooks/useContentUpdate';
import useEmblaCarousel from 'embla-carousel-react';

interface CarouselImage extends ImageItemData {
  aspectRatio?: AspectRatioValue | string;
}

interface FullscreenCarouselData {
  title?: string;
  images?: CarouselImage[];
  theme?: 'light' | 'dark' | 'auto';
  gap?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
}

export default function FullscreenCarouselBlock({ data }: { data: FullscreenCarouselData | any }) {
  const blockData = useMemo(() => {
    // Les blocs auto-déclarés reçoivent directement le bloc complet comme data
    // Pas de wrapper data, donc on prend data directement
    const result = (data as any).data || data;
    // Debug temporaire
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [FullscreenCarousel] blockData extraction:', {
        'data.fullscreen': (data as any).fullscreen,
        'data.data': (data as any).data,
        'result.fullscreen': result.fullscreen,
        'result keys': Object.keys(result)
      });
    }
    return result;
  }, [data]);
  const [fullContent, setFullContent] = useState<any>(null);

  // Charger la typographie globale
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetchContentWithNoCache('/api/content/metadata');
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch {
        // silencieux
      }
    };
    loadContent();
  }, []);

  useContentUpdate(() => {
    const reload = async () => {
      try {
        const res = await fetchContentWithNoCache('/api/content/metadata');
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch {
        // silencieux
      }
    };
    reload();
  });

  // Filtrer les images cachées (comme ImageBlock)
  const images: CarouselImage[] = useMemo(() => {
    const allImages = blockData.images || [];
    return allImages.filter((img: CarouselImage) => !img.hidden && img.src);
  }, [blockData.images]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: true,
  });

  const getBackgroundColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') return '#ffffff';
    if (theme === 'dark') return '#050505';
    return 'var(--background)';
  };
  const getTextColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') return '#000000';
    if (theme === 'dark') return '#ffffff';
    return 'var(--foreground)';
  };

  // Typographie H2 (titre)
  const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);
  const titleClasses = useMemo(() => {
    const safe = (typoConfig as any)?.h2 ? { h2: (typoConfig as any).h2 } : {};
    const classes = getTypographyClasses('h2', safe as any, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  const titleLineHeight = useMemo(() => getCustomLineHeight('h2', typoConfig as any), [typoConfig]);
  const titleColor = useMemo(() => {
    const custom = getCustomColor('h2', typoConfig as any);
    if (custom) return custom;
    return 'var(--foreground)';
  }, [typoConfig]);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const handleNext = () => emblaApi?.scrollNext();
  const handlePrev = () => emblaApi?.scrollPrev();

  // Mettre à jour les états de bord pour styler les flèches (inactif en bout de piste)
  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setAtStart(!emblaApi.canScrollPrev());
      setAtEnd(!emblaApi.canScrollNext());
    };
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    update();
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  // Réinitialiser Embla quand la liste d'images change
  useEffect(() => {
    emblaApi?.reInit();
  }, [images, emblaApi]);

  // Vérifier si on a des images
  if (images.length === 0) {
    return (
      <div className="block-fullscreen-carousel p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
        Aucune image dans le carousel
      </div>
    );
  }

  // Vérifier fullscreen de manière stricte (peut être true, false, undefined, ou string "true"/"false")
  const isFullscreen = blockData.fullscreen === true || blockData.fullscreen === 'true';

  return (
    <section
      className={`fullscreen-carousel-block ${isFullscreen ? 'fullscreen-carousel-block--fullscreen' : ''}`}
      data-block-type="fullscreen-carousel"
      data-fullscreen={isFullscreen ? 'true' : 'false'}
      style={{
        ...(isFullscreen ? {
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        } : {}),
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        marginTop: 'var(--section)',
      }}
    >
      <div
        className="fullscreen-carousel__inner"
        style={{
          // Pas de padding vertical : la section a déjà la marge globale.
          // En mode non fullscreen, on suit strictement le padding horizontal global (sans fallback clamp).
          padding: isFullscreen ? '0' : '0 var(--container-padding, 0)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {blockData.title && (
          <div
            className="fullscreen-carousel__title-container mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex items-center justify-between gap-4 flex-wrap"
            style={{
              width: '100%',
              maxWidth: 'var(--max-width)',
            }}
          >
            <h2
              className={`fullscreen-carousel__title ${titleClasses}`}
              style={{
                margin: 0,
                color: titleColor,
                ...(titleLineHeight ? { lineHeight: titleLineHeight } : {}),
              }}
            >
              {blockData.title}
            </h2>

            <div
              className="fullscreen-carousel__nav"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Image précédente"
                className={`fullscreen-carousel__nav-btn ${atStart ? 'is-disabled' : ''}`}
                disabled={atStart}
                style={{
                  backgroundColor: atStart ? 'var(--muted)' : 'var(--primary)',
                  color: atStart ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: atStart ? '1px solid var(--border)' : 'none',
                  opacity: atStart ? 0.5 : 1,
                  cursor: atStart ? 'not-allowed' : 'pointer',
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Image suivante"
                className={`fullscreen-carousel__nav-btn ${atEnd ? 'is-disabled' : ''}`}
                disabled={atEnd}
                style={{
                  backgroundColor: atEnd ? 'var(--muted)' : 'var(--primary)',
                  color: atEnd ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: atEnd ? '1px solid var(--border)' : 'none',
                  opacity: atEnd ? 0.5 : 1,
                  cursor: atEnd ? 'not-allowed' : 'pointer',
                }}
              >
                →
              </button>
            </div>
          </div>
        )}

        <div
          className="fullscreen-carousel__viewport"
          style={{
            overflow: 'hidden',
            cursor: 'grab',
            userSelect: 'auto',
          }}
          ref={emblaRef}
        >
          <div
            className="fullscreen-carousel__track"
            style={{
              display: 'flex',
              gap: blockData.gap === 'small' ? 'var(--gap-sm, 1rem)' : 
                   blockData.gap === 'large' ? 'var(--gap-lg, 3rem)' : 
                   'var(--gap, 2rem)',
              // Garder un espace de part et d'autre, même en loop
              paddingLeft: blockData.gap === 'small' ? 'var(--gap-sm, 1rem)' :
                           blockData.gap === 'large' ? 'var(--gap-lg, 3rem)' :
                           'var(--gap, 2rem)',
              paddingRight: blockData.gap === 'small' ? 'var(--gap-sm, 1rem)' :
                            blockData.gap === 'large' ? 'var(--gap-lg, 3rem)' :
                            'var(--gap, 2rem)',
            }}
          >
            {images.map((img, idx) => {
              const imageData: ImageData = {
                src: img.src || '',
                alt: img.alt || '',
                aspectRatio: img.aspectRatio || 'auto',
              };

              return (
                <div
                  key={img.id || `slide-${idx}`}
                  className="fullscreen-carousel__slide"
                  style={{
                    minWidth: 'clamp(220px, 23vw, 420px)',
                    maxWidth: 'clamp(220px, 23vw, 420px)',
                    height: img?.aspectRatio && img.aspectRatio !== 'auto' ? 'auto' : 'clamp(240px, 32vw, 520px)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {img?.src ? (
                    <div
                      className="fullscreen-carousel__image-wrapper"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: img?.aspectRatio && img.aspectRatio !== 'auto' ? 'auto' : '100%',
                      }}
                    >
                      <ReusableImage
                        image={imageData}
                        containerClassName="w-full h-full"
                        imageClassName="object-cover"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        fetchPriority={idx === 0 ? 'high' : 'auto'}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        color: 'var(--foreground, #111)',
                        background: 'rgba(0,0,0,0.05)',
                      }}
                    >
                      Image manquante
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style jsx>{`
        .fullscreen-carousel-block[data-fullscreen="true"] .fullscreen-carousel__inner {
          padding: 0 !important;
        }
        .fullscreen-carousel-block--fullscreen .fullscreen-carousel__inner {
          padding: 0 !important;
        }
        .fullscreen-carousel__nav-btn {
          border-radius: 9999px;
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .fullscreen-carousel__nav-btn:not(.is-disabled):hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .fullscreen-carousel__nav-btn.is-disabled {
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
