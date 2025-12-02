'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PinnedGridDemoData {
  colors?: string[];
  duration?: number; // durée du pin en % de viewport
}

export default function PinnedGridDemoBlock({ data }: { data: PinnedGridDemoData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const debugId = (data as any).id || (blockData as any).id;

  const {
    colors = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
    duration = 250,
  } = blockData;

  const cells = useMemo(() => {
    const base = colors.length > 0 ? colors : ['#0f172a'];
    return Array.from({ length: 12 }, (_, i) => base[i % base.length]);
  }, [colors]);

  const clampedDuration = Math.max(120, Math.min(duration, 400));

  useLayoutEffect(() => {
    if (!pinRef.current || !gridRef.current) {
      return () => {}; // Cleanup vide si les refs ne sont pas prêtes
    }
    const pinEl = pinRef.current;
    const gridEl = gridRef.current;

    // Supprimer d'éventuels restes d'un ancien pin (pin-spacer ou triggers non nettoyés)
    try {
      // Dé-emballer si le pin est encore dans un pin-spacer
      const parent = pinEl.parentElement;
      if (parent?.classList.contains('pin-spacer')) {
        parent.parentElement?.insertBefore(pinEl, parent);
        parent.parentElement?.removeChild(parent);
      }
      // Tuer tout trigger qui cible déjà cet élément (evite les doublons après navigation)
      ScrollTrigger.getAll().forEach((trigger) => {
        const target = (trigger as any).vars?.trigger || (trigger as any).trigger;
        if (target === pinEl || target === gridEl || (target instanceof Element && target.contains(pinEl))) {
          trigger.kill(true);
        }
      });
    } catch (e) {
      // ignorer silencieusement en production
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [PinnedGridDemoBlock] Erreur cleanup pré-pin:', e);
      }
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () => `+=${(clampedDuration / 100) * window.innerHeight}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 0.5,
          scrub: 0.6,
          refreshPriority: 1, // Priorité élevée pour le refresh
          invalidateOnRefresh: true,
        },
      });

      const items = gridEl.querySelectorAll('.pinned-grid__item');

      tl.from(items, {
        stagger: 0.08,
        y: () => gsap.utils.random(window.innerHeight * 0.4, window.innerHeight * 1.1),
        rotation: () => gsap.utils.random(-10, 10),
        scale: () => gsap.utils.random(0.85, 1),
        autoAlpha: 0,
        transformOrigin: '50% 0%',
      });
    }, pinEl);

    // Refresh ScrollTrigger après un court délai pour s'assurer que le DOM est prêt
    const refreshTimeout = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [PinnedGridDemoBlock] ScrollTrigger.refresh() appelé après montage');
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [PinnedGridDemoBlock] Erreur refresh ScrollTrigger:', e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, [clampedDuration]);

  return (
    <section
      ref={wrapperRef}
      data-block-type="pinned-grid-demo"
      data-block-theme="auto"
      {...(debugId ? { 'data-block-id': debugId } : {})}
      style={{ marginTop: 'var(--section)' }}
      className="relative"
    >
      <div
        ref={pinRef}
        className="relative overflow-hidden"
        style={{
          height: '100vh',
          padding: 0,
          background: 'radial-gradient(circle at 20% 20%, #0b1224, #080c16 60%, #060910)',
          color: '#e2e8f0',
        }}
      >
        <div
          ref={gridRef}
          className="pinned-grid h-full flex items-center justify-center px-6 md:px-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto max-5xl">
            {cells.map((color, idx) => (
              <div
                key={idx}
                className="pinned-grid__item aspect-square rounded-xl shadow-lg"
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
