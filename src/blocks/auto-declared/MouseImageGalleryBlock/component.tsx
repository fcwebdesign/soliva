'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  speed?: number; // 0-100 (plus haut = plus réactif)
}

export default function MouseImageGalleryBlock({ data }: { data: MouseImageGalleryData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const images = useMemo(
    () => (blockData.images || []).filter((img: GalleryImage) => img?.src && !img.hidden),
    [blockData]
  );

  const speed = typeof blockData.speed === 'number' ? blockData.speed : 60;
  const stageRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const indexRef = useRef(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || images.length === 0) return;

    const els = imageRefs.current.slice(0, images.length);
    const triggerDistance = 40; // px avant de changer d'image

    // Set initial state
    els.forEach((el) => {
      gsap.set(el, { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50 });
    });

    const getNext = () => {
      const idx = indexRef.current % images.length;
      indexRef.current += 1;
      return els[idx];
    };

    const handleMove = (evt: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      const x = evt.clientX - bounds.left;
      const y = evt.clientY - bounds.top;

      if (!lastPosRef.current) {
        lastPosRef.current = { x, y };
      }

      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist < triggerDistance) return;
      lastPosRef.current = { x, y };

      const el = getNext();
      const prev = els[(indexRef.current - 2 + images.length) % images.length];

      const damping = Math.max(0.12, 1 - speed / 120); // plus la vitesse est haute, plus l'anim est courte

      gsap.set(el, {
        x,
        y,
        scale: 0.8,
        rotation: gsap.utils.random(-6, 6),
        opacity: 0,
        zIndex: 10 + indexRef.current,
      });

      gsap.to(el, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: damping,
        ease: 'power3.out',
        overwrite: true,
      });

      if (prev) {
        gsap.to(prev, {
          opacity: 0,
          scale: 0.9,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true,
        });
      }
    };

    const handleLeave = () => {
      lastPosRef.current = null;
      els.forEach((el) => {
        gsap.to(el, { opacity: 0, scale: 0.9, duration: 0.25, ease: 'power2.out', overwrite: true });
      });
    };

    stage.addEventListener('pointermove', handleMove);
    stage.addEventListener('pointerenter', handleMove);
    stage.addEventListener('pointerleave', handleLeave);

    return () => {
      stage.removeEventListener('pointermove', handleMove);
      stage.removeEventListener('pointerenter', handleMove);
      stage.removeEventListener('pointerleave', handleLeave);
    };
  }, [images, speed]);

  if (!ready) {
    return <section className="mouse-gallery-block" style={{ minHeight: '70vh' }}></section>;
  }

  if (images.length === 0) {
    return (
      <section className="mouse-gallery-block" data-block-type="mouse-image-gallery">
        <div className="mouse-gallery__empty">Ajoutez des images pour activer la galerie.</div>
      </section>
    );
  }

  return (
    <section
      ref={stageRef}
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
          cursor: none;
        }
        .mouse-gallery__header {
          position: relative;
          z-index: 2;
          max-width: 960px;
          padding: clamp(1.5rem, 4vw, 3rem);
          pointer-events: none;
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
          height: 70vh;
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
          will-change: transform, opacity;
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
          .mouse-gallery-block {
            cursor: default;
          }
          .mouse-gallery__item {
            width: clamp(140px, 40vw, 220px);
          }
          .mouse-gallery__stage {
            height: 60vh;
          }
        }
      `}</style>
    </section>
  );
}
