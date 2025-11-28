'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface GalleryImage {
  id?: string;
  src: string;
  alt?: string;
  hidden?: boolean;
}

interface MouseImageGalleryData {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  theme?: 'light' | 'dark' | 'auto';
  transparentHeader?: boolean;
  speed?: number; // 0-100
}

export default function MouseImageGalleryBlock({ data }: { data: MouseImageGalleryData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const images = useMemo(
    () => (blockData.images || []).filter((img: GalleryImage) => img?.src && !img.hidden),
    [blockData]
  );

  const speed = typeof blockData.speed === 'number' ? blockData.speed : 60;
  const containerRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    const els = imageRefs.current.slice(0, images.length);

    // Position initiale au centre
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    els.forEach((el) => {
      gsap.set(el, { x: centerX, y: centerY, opacity: 0, scale: 0.9 });
    });

    const handleMove = (e: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      els.forEach((el, idx) => {
        const damping = 0.25 + idx * 0.05;
        gsap.to(el, {
          x,
          y,
          scale: 1,
          rotate: gsap.utils.random(-3, 3),
          opacity: 1,
          duration: Math.max(0.15, (1 - speed / 120) + damping),
          ease: 'power3.out',
          overwrite: true,
          zIndex: 10 + idx,
        });
      });
    };

    const handleLeave = () => {
      els.forEach((el) => {
        gsap.to(el, { opacity: 0, duration: 0.25, scale: 0.9, ease: 'power2.out' });
      });
    };

    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerenter', handleMove);
    container.addEventListener('pointerleave', handleLeave);

    return () => {
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerenter', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
    };
  }, [images, speed]);

  if (images.length === 0) {
    return (
      <section className="mouse-gallery-block" data-block-type="mouse-image-gallery">
        <div className="mouse-gallery__empty">Ajoutez des images pour activer la galerie souris.</div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="mouse-gallery-block"
      data-block-type="mouse-image-gallery"
      data-block-theme={blockData.theme || 'auto'}
      data-transparent-header={blockData.transparentHeader ? 'true' : 'false'}
    >
      <div className="mouse-gallery__header">
        {blockData.title && <h1 className="mouse-gallery__title">{blockData.title}</h1>}
        {blockData.subtitle && <p className="mouse-gallery__subtitle">{blockData.subtitle}</p>}
      </div>

      <div className="mouse-gallery__stage">
        {images.map((img, idx) => (
          <div
            key={img.id || `mouse-image-${idx}`}
            ref={(el) => {
              if (el) imageRefs.current[idx] = el;
            }}
            className="mouse-gallery__item"
          >
            <img src={img.src} alt={img.alt || ''} loading="lazy" />
          </div>
        ))}
      </div>

      <style jsx>{`
        .mouse-gallery-block {
          position: relative;
          min-height: 85vh;
          overflow: hidden;
          background: var(--background, #0f0f0f);
          color: var(--foreground, #f7f7f7);
        }
        .mouse-gallery__header {
          position: relative;
          z-index: 2;
          max-width: 960px;
          padding: clamp(1.5rem, 4vw, 3rem);
        }
        .mouse-gallery__title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin: 0 0 0.5rem;
        }
        .mouse-gallery__subtitle {
          max-width: 60ch;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
        }
        .mouse-gallery__stage {
          position: relative;
          width: 100%;
          height: calc(85vh);
          pointer-events: none;
        }
        .mouse-gallery__item {
          position: absolute;
          top: 0;
          left: 0;
          width: clamp(160px, 18vw, 280px);
          aspect-ratio: 4 / 5;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, -50%);
        }
        .mouse-gallery__item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mouse-gallery__empty {
          padding: 2rem;
          text-align: center;
          color: #888;
        }
        @media (max-width: 768px) {
          .mouse-gallery__item {
            width: clamp(140px, 40vw, 220px);
          }
          .mouse-gallery__stage {
            height: 70vh;
          }
        }
      `}</style>
    </section>
  );
}
