'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';

interface CarouselImage {
  src?: string;
  alt?: string;
}

interface FullscreenCarouselData {
  title?: string;
  images?: CarouselImage[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function FullscreenCarouselBlock({ data }: { data: FullscreenCarouselData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const images: CarouselImage[] = blockData.images || [];

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

  if (!images.length) return null;

  return (
    <section
      className="fullscreen-carousel-block"
      data-block-type="fullscreen-carousel"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
      }}
    >
      <div
        className="fullscreen-carousel__inner"
        style={{
          padding: 'clamp(1.5rem, 3vw, 3.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1rem, 2vw, 2rem)',
        }}
      >
        {blockData.title && (
          <h2
            className="fullscreen-carousel__title"
            style={{
              textAlign: 'center',
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
              gap: 'clamp(1rem, 2vw, 2rem)',
              transform: `translateX(${translate}px)`,
              transition: pointer.current.dragging ? 'none' : 'transform 0.25s ease',
              willChange: 'transform',
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="fullscreen-carousel__slide"
                style={{
                  minWidth: 'clamp(220px, 23vw, 420px)',
                  maxWidth: 'clamp(220px, 23vw, 420px)',
                  height: 'clamp(240px, 32vw, 520px)',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  backgroundColor: 'var(--muted, #f4f4f4)',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {img?.src ? (
                  <img
                    src={img.src}
                    alt={img.alt || ''}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
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
            ))}
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
