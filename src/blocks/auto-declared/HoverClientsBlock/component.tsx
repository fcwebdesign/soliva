'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

interface HoverClientItem {
  id?: string;
  name: string;
  image?: {
    src?: string;
    alt?: string;
  };
  hidden?: boolean;
}

interface HoverClientsData {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  items?: HoverClientItem[];
}

export default function HoverClientsBlock({ data }: { data: HoverClientsData }) {
  const blockData = (data as any)?.data || data || {};
  const {
    title = 'Trusted us',
    subtitle = 'Selected clients',
    backgroundColor = '#0d0d10',
    textColor = '#ffffff',
    mutedColor = '#b3b3b3',
    accentColor = '#ffffff',
    theme = 'auto',
    items: rawItems = [],
  } = blockData;

  const items = useMemo(
    () => (rawItems || []).filter((item) => item && !item.hidden && (item.name || item.image?.src)),
    [rawItems]
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current || !listRef.current || items.length === 0) return;
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(CustomEase);
    try {
      CustomEase.create(
        'hop',
        'M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1'
      );
    } catch (e) {
      // ignore duplicate ease creation
    }

    const preview = previewRef.current;
    const entries = Array.from(listRef.current.querySelectorAll<HTMLElement>('[data-client-item]'));
    let active: { wrapper: HTMLDivElement; img: HTMLImageElement; index: number } | null = null;

    const hideActive = () => {
      if (!active) return;
      const target = active;
      active = null;
      gsap.to(target.img, {
        opacity: 0,
        duration: 0.45,
        ease: 'power1.out',
        onComplete: () => target.wrapper.remove(),
      });
    };

    const showIndex = (index: number) => {
      const item = items[index];
      if (!item?.image?.src) return;
      if (active && active.index === index) return;
      hideActive();

      const wrapper = document.createElement('div');
      wrapper.className = 'hover-client-img-wrapper';

      const img = document.createElement('img');
      img.src = item.image.src || '';
      img.alt = item.image.alt || item.name || 'Client';
      wrapper.appendChild(img);
      preview.appendChild(wrapper);

      gsap.set(wrapper, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      });
      gsap.set(img, { scale: 1.15, opacity: 0 });

      active = { wrapper, img, index };

      gsap.to(wrapper, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.55,
        ease: 'hop',
      });
      gsap.to(img, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      gsap.to(img, { scale: 1, duration: 1.1, ease: 'hop' });
    };

    const cleanups: Array<() => void> = [];
    entries.forEach((entry, index) => {
      const onEnter = () => showIndex(index);
      const onLeave = (evt: PointerEvent) => {
        if (entry.contains(evt.relatedTarget as Node)) return;
        if (active?.index === index) {
          hideActive();
        }
      };
      entry.addEventListener('pointerenter', onEnter);
      entry.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        entry.removeEventListener('pointerenter', onEnter);
        entry.removeEventListener('pointerleave', onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      hideActive();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="hover-clients-section"
      data-block-type="hover-clients"
      data-block-theme={theme}
      style={
        {
          '--hc-bg': backgroundColor,
          '--hc-text': textColor,
          '--hc-muted': mutedColor,
          '--hc-accent': accentColor,
        } as React.CSSProperties
      }
    >
      <div className="hover-clients-preview" ref={previewRef} aria-hidden />

      <div className="hover-clients-header">
        {subtitle && <p className="hover-clients-kicker">{subtitle}</p>}
        {title && <h2 className="hover-clients-title">{title}</h2>}
      </div>

      <div className="hover-clients-list" ref={listRef}>
        {items.map((item, idx) => (
          <div
            key={item.id || `${item.name}-${idx}`}
            data-client-item
            className="hover-client-name"
            role="button"
            tabIndex={0}
            onFocus={() => showForKeyboard(previewRef, items, idx)}
          >
            <h3>{item.name}</h3>
          </div>
        ))}
      </div>

      <style jsx>{`
        .hover-clients-section {
          position: relative;
          width: 100%;
          min-height: min(100vh, 900px);
          padding: clamp(1.5rem, 3vw, 2.5rem);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: clamp(1.5rem, 3vw, 2.5rem);
          background: var(--hc-bg);
          color: var(--hc-text);
          overflow: hidden;
          isolation: isolate;
        }

        .hover-clients-preview {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .hover-client-img-wrapper {
          position: absolute;
          inset: 15% 20%;
          will-change: clip-path;
          overflow: hidden;
        }

        .hover-client-img-wrapper img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform, opacity;
        }

        .hover-clients-header {
          position: relative;
          z-index: 2;
          mix-blend-mode: difference;
        }

        .hover-clients-kicker {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.85rem;
          color: var(--hc-muted);
          margin-bottom: 0.35rem;
        }

        .hover-clients-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1;
          color: var(--hc-text);
        }

        .hover-clients-list {
          position: relative;
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          gap: clamp(0.5rem, 1vw, 0.9rem);
          max-width: 1200px;
          mix-blend-mode: difference;
        }

        .hover-client-name {
          position: relative;
          cursor: pointer;
          outline: none;
        }

        .hover-client-name h3 {
          font-size: clamp(2rem, 3vw, 3.2rem);
          font-weight: 500;
          line-height: 1;
          color: var(--hc-text);
          text-wrap: balance;
        }

        .hover-client-name::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 0.14rem;
          background: var(--hc-accent);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 260ms ease-out;
        }

        .hover-client-name:hover::after,
        .hover-client-name:focus-visible::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        @media (max-width: 1000px) {
          .hover-client-img-wrapper {
            inset: 10% 8%;
          }

          .hover-clients-section {
            min-height: 80vh;
          }
        }

        @media (max-width: 640px) {
          .hover-clients-list {
            gap: 0.4rem;
          }

          .hover-client-name h3 {
            font-size: clamp(1.5rem, 6vw, 2.4rem);
          }
        }
      `}</style>
    </section>
  );
}

// Focus support: show image on keyboard focus
function showForKeyboard(
  previewRef: React.RefObject<HTMLDivElement>,
  items: HoverClientItem[],
  index: number
) {
  const preview = previewRef.current;
  const item = items[index];
  if (!preview || !item?.image?.src) return;

  const existing = preview.querySelector('.hover-client-img-wrapper');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');
  wrapper.className = 'hover-client-img-wrapper';

  const img = document.createElement('img');
  img.src = item.image.src || '';
  img.alt = item.image.alt || item.name || 'Client';
  wrapper.appendChild(img);
  preview.appendChild(wrapper);
}
