'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PinnedSectionData {
  kicker?: string;
  title?: string;
  description?: string;
  background?: string;
  textColor?: string;
  pinDuration?: number; // durée du pin en % de hauteur viewport
  paddingY?: number; // padding vertical en pixels
  theme?: 'light' | 'dark' | 'auto';
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function PinnedSectionBlock({ data }: { data: PinnedSectionData | any }) {
  // Les blocs auto-déclarés peuvent recevoir les données directement ou via data.data
  const blockData = (data as any).data || data;
  const wrapperRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const debugId = (data as any).id || (blockData as any).id;

  const {
    kicker = 'Pinned block',
    title = 'Section pinée simple',
    description = "Cette section reste fixée pendant le scroll pour tester rapidement l'effet pin de GSAP.",
    background = 'linear-gradient(135deg, #0f172a, #111827)',
    textColor = '#f8fafc',
    pinDuration = 180,
    paddingY = 96,
    theme = 'auto',
  } = blockData;

  const clampedDuration = clamp(typeof pinDuration === 'number' ? pinDuration : 180, 60, 400);

  // ScrollTrigger natif avec pin: true (le bloc n'est plus rewrapé en admin)
  useLayoutEffect(() => {
    if (!pinRef.current) return;
    const el = pinRef.current;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${clampedDuration}%`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        el.style.setProperty('--pin-progress', `${self.progress}`);
      },
    });
    return () => trigger.kill();
  }, [clampedDuration]);

  return (
    <section
      ref={wrapperRef}
      data-block-type="pinned-section"
      data-block-theme={theme}
      {...(debugId ? { 'data-block-id': debugId } : {})}
      style={{ marginTop: 'var(--section)' }}
      className="relative"
    >
      <div
        ref={pinRef}
        style={{
          background,
          color: textColor,
          paddingTop: typeof paddingY === 'number' ? paddingY : 96,
          paddingBottom: typeof paddingY === 'number' ? paddingY : 96,
        }}
        className="relative overflow-hidden"
      >
        <div
          ref={contentRef}
          className="max-w-4xl mx-auto px-6 md:px-10 flex flex-col gap-4 md:gap-6"
          style={{ position: 'sticky', top: 0, zIndex: 1 }}
        >
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]" style={{ opacity: 0.9 }}>
            <span className="opacity-80">{kicker}</span>
            <span className="h-px w-12 bg-current opacity-40" aria-hidden />
            <span
              className="px-2 py-[2px] rounded-full text-[11px] font-semibold"
              style={{ border: `1px solid currentColor`, opacity: 0.8 }}
            >
              Pinned
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold leading-tight">{title}</h2>

          {description && (
            <p className="max-w-3xl text-base md:text-lg leading-relaxed" style={{ opacity: 0.9 }}>
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide" style={{ opacity: 0.75 }}>
            <span
              className="px-3 py-1 rounded-full border"
              style={{ borderColor: 'currentColor' }}
            >
              Durée: {clampedDuration}%
            </span>
            <span
              className="px-3 py-1 rounded-full border"
              style={{ borderColor: 'currentColor' }}
            >
              ScrollTrigger pin
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
