'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

type StickyItem = {
  id?: string;
  src: string;
  alt?: string;
  title?: string;
  text?: string;
  background?: string;
};

interface StickySectionsData {
  headingTitle?: string;
  headingSubtitle?: string;
  introText?: string;
  outroText?: string;
  items?: StickyItem[];
}

const palette = ['#2f251e', '#43392f', '#2f251e', '#43392f', '#2f251e', '#43392f'];

const defaultItems: StickyItem[] = [
  { src: 'https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9430460_11zon.jpg', title: 'The Algorithm', text: "The algorithm's workings are shrouded in complexity, and its decision-making processes are inscrutable to the general populace." },
  { src: 'https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9421335_11zon.jpg', title: 'The Dogma', text: 'The digital gospel etched into the very code of the algorithmic society, served as the bedrock of the cognitive regime.' },
  { src: 'https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9489270_11zon.jpg', title: 'The Architects', text: 'The elusive entities, lacking human form, operate in the shadows, skillfully shaping societal norms through the complex interplay of algorithms and Dogmas.' },
];

export default function StickySectionsCodropsBlock({ data }: { data: StickySectionsData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const debugId = (data as any).id || (blockData as any).id;
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo<StickyItem[]>(() => {
    const arr = Array.isArray(blockData.items) && blockData.items.length ? blockData.items : defaultItems;
    return arr.map((item, idx) => ({
      ...item,
      id: item.id || `sticky-${idx}`,
      background: item.background || palette[idx % palette.length],
    }));
  }, [blockData.items]);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('.ssc-section');
      if (!sections.length) return;

      sections.forEach((el, idx) => {
        const img = el.querySelector('.ssc-img');
        const isLast = idx === sections.length - 1;
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=100%',
            scrub: true,
            pin: true,
            pinSpacing: false, // superposer comme la démo (pas d'espace ajouté)
            anticipatePin: 1,
            refreshPriority: 1, // Priorité élevée pour le refresh
          },
        })
          .to(
            el,
            {
              ease: 'none',
              startAt: { filter: 'brightness(100%) contrast(100%)' },
              filter: isLast ? 'none' : 'brightness(60%) contrast(135%)',
              yPercent: isLast ? 0 : -15,
            },
            0
          )
          .to(
            img,
            {
              ease: 'power1.in',
              yPercent: -40,
              rotation: -20,
            },
            0
          );
      });
    }, wrapRef);

    // Refresh ScrollTrigger après un court délai pour s'assurer que le DOM est prêt
    const refreshTimeout = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [StickySectionsCodropsBlock] ScrollTrigger.refresh() appelé après montage');
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [StickySectionsCodropsBlock] Erreur refresh ScrollTrigger:', e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <section
      data-block-type="sticky-sections-codrops"
      data-block-theme="auto"
      {...(debugId ? { 'data-block-id': debugId } : {})}
      style={{ marginTop: 'var(--section)' }}
      className="relative"
    >
      <div ref={wrapRef} className="ssc-root">
        {(blockData.headingTitle || blockData.headingSubtitle) && (
          <div className="ssc-header">
            {blockData.headingTitle && <h2>{blockData.headingTitle}</h2>}
            {blockData.headingSubtitle && <p>{blockData.headingSubtitle}</p>}
          </div>
        )}

        {blockData.introText && (
          <div className="ssc-intro">
            <p>{blockData.introText}</p>
          </div>
        )}

        <div className="ssc-stack">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`ssc-section ssc-bg-${(idx % 6) + 1}`}
              style={{ background: item.background, zIndex: items.length - idx }}
            >
              <div className="ssc-inner">
                <img className="ssc-img ssc-img--left" src={item.src} alt={item.alt || item.title || ''} />
                {item.title && (
                  <h3 className="ssc-title">
                    <i>The</i> {item.title}
                  </h3>
                )}
                {item.text && <p className="ssc-text">{item.text}</p>}
              </div>
            </div>
          ))}
        </div>

        {blockData.outroText && (
          <div className="ssc-outro">
            <p>{blockData.outroText}</p>
          </div>
        )}
      </div>
    </section>
  );
}
