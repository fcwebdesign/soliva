'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ReusableImage, ImageData, ImageItemData, AspectRatioValue } from '@/blocks/auto-declared/components';
import { useContentUpdate } from '../../../hooks/useContentUpdate';

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
  
  useContentUpdate(() => {
    // Le useMemo se mettra à jour automatiquement
  });

  // Filtrer les images cachées (comme ImageBlock)
  const images: CarouselImage[] = useMemo(() => {
    const allImages = blockData.images || [];
    return allImages.filter((img: CarouselImage) => !img.hidden && img.src);
  }, [blockData.images]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ dragging: boolean; startX: number; startTranslate: number; pointerId: number | null }>({
    dragging: false,
    startX: 0,
    startTranslate: 0,
    pointerId: null,
  });
  const [translate, setTranslate] = useState(0);

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

  const clampTranslate = (value: number) => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const trackWidth = trackRef.current?.scrollWidth || 0;
    if (trackWidth <= containerWidth) return 0;
    const min = containerWidth - trackWidth;
    return Math.min(0, Math.max(value, min));
  };

  const handleNext = () => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    setTranslate((prev) => clampTranslate(prev - containerWidth * 0.5));
  };
  const handlePrev = () => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    setTranslate((prev) => clampTranslate(prev + containerWidth * 0.5));
  };

  useEffect(() => {
    setTranslate(0);
  }, [images]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!pointer.current.dragging) return;
      const delta = e.clientX - pointer.current.startX;
      setTranslate(clampTranslate(pointer.current.startTranslate + delta));
    };
    const onPointerUp = () => {
      pointer.current.dragging = false;
      if (pointer.current.pointerId !== null) {
        containerRef.current?.releasePointerCapture(pointer.current.pointerId);
      }
      pointer.current.pointerId = null;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointer.current.dragging = true;
    pointer.current.startX = e.clientX;
    pointer.current.startTranslate = translate;
    pointer.current.pointerId = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

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
          padding: isFullscreen
            ? 'clamp(1.5rem, 3vw, 3.5rem) clamp(0.5rem, 1vw, 1.25rem)'
            : 'clamp(1.5rem, 3vw, 3.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1rem, 2vw, 2rem)',
        }}
      >
        {blockData.title && (
          <h2
            className="fullscreen-carousel__title"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.75rem)',
              margin: 0,
            }}
          >
            {blockData.title}
          </h2>
        )}

        <div
          ref={containerRef}
          className="fullscreen-carousel__viewport"
          onPointerDown={handlePointerDown}
          style={{
            overflow: 'hidden',
            cursor: 'grab',
          }}
        >
          <div
            ref={trackRef}
            className="fullscreen-carousel__track"
            style={{
              display: 'flex',
              gap: blockData.gap === 'small' ? 'var(--gap-sm, 1rem)' : 
                   blockData.gap === 'large' ? 'var(--gap-lg, 3rem)' : 
                   'var(--gap, 2rem)',
              transform: `translateX(${translate}px)`,
              transition: pointer.current.dragging ? 'none' : 'transform 0.25s ease',
              willChange: 'transform',
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

        <div
          className="fullscreen-carousel__nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Image précédente"
            className="fullscreen-carousel__nav-btn"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Image suivante"
            className="fullscreen-carousel__nav-btn"
          >
            →
          </button>
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
          background: transparent;
          border: 1px solid currentColor;
          border-radius: 9999px;
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .fullscreen-carousel__nav-btn:hover {
          background: currentColor;
          color: ${getBackgroundColor()};
        }
      `}</style>
    </section>
  );
}
