'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

interface PinnedGridExplorationsData {
  colors?: string[];
  duration?: number; // durée du pin en % de viewport
  images?: Array<string | { src: string; alt?: string; aspectRatio?: string }>;
  globalAspect?: 'auto' | '1:1' | '3:2' | '4:3' | '16:9' | '2:1';
}

const demoImages = [
  '/blocks/pinned-grid-explorations/1.webp',
  '/blocks/pinned-grid-explorations/2.webp',
  '/blocks/pinned-grid-explorations/3.webp',
  '/blocks/pinned-grid-explorations/4.webp',
  '/blocks/pinned-grid-explorations/5.webp',
  '/blocks/pinned-grid-explorations/6.webp',
  '/blocks/pinned-grid-explorations/7.webp',
  '/blocks/pinned-grid-explorations/8.webp',
  '/blocks/pinned-grid-explorations/9.webp',
];

export default function PinnedGridExplorationsBlock({ data }: { data: PinnedGridExplorationsData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const debugId = (data as any).id || (blockData as any).id;

  const {
    colors = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
    duration = 200,
    images = [],
    globalAspect = '16:9',
  } = blockData;

  const cells = useMemo(() => {
    const hasImages = Array.isArray(images) && images.length > 0;
    const srcs = hasImages
      ? Array.from({ length: 9 }, (_, i) => images[i % images.length])
      : Array.from({ length: 9 }, () => ({ src: '' }));
    return srcs.map((item) => (typeof item === 'string' ? { src: item } : item));
  }, [images]);

  const clampedDuration = Math.max(150, Math.min(duration, 400)); // la démo est à 200%

  useLayoutEffect(() => {
    if (!pinRef.current || !gridRef.current) return;
    const pinEl = pinRef.current;
    const gridEl = gridRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: gridEl,
          start: 'center center',
          end: `+=${clampedDuration}%`,
          pin: pinEl, // pin du parent de la grille
          scrub: 0.5,
        },
      });

      const items = gridEl.querySelectorAll('.pinned-explorations__item');

      tl.from(items, {
        stagger: {
          amount: 0.03,
          from: 'edges',
          grid: [3, 3],
        },
        scale: 0.7,
        autoAlpha: 0,
      }).from(
        gridEl,
        {
          scale: 0.7,
          skewY: 5,
        },
        0
      );
    }, pinEl);

    return () => ctx.revert();
  }, [clampedDuration]);

  return (
    <section
      ref={wrapperRef}
      data-block-type="pinned-grid-explorations"
      data-block-theme="auto"
      {...(debugId ? { 'data-block-id': debugId } : {})}
      style={{ marginTop: 'var(--section)' }}
      className="relative"
    >
      <div
      ref={pinRef}
      className="relative overflow-hidden"
      style={{
          padding: '48px 0 56px',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          background: 'radial-gradient(circle at 20% 20%, #0b1224, #080c16 60%, #060910)',
          color: '#e2e8f0',
        }}
      >
        <div
          ref={gridRef}
        className="pinned-explorations-grid pinned-explorations-grid--unspoken"
          data-global-aspect={globalAspect}
        >
          {cells.map((src, idx) => {
            return (
              <div
                key={idx}
                className="pinned-explorations__item"
                style={{
                  backgroundImage: `url(${src.src})`,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
