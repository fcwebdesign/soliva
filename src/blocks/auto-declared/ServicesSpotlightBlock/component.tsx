'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './styles.css';

type SpotlightItem = {
  id?: string;
  title: string;
  indicator?: string;
  image?: { src?: string; alt?: string };
};

interface ServicesSpotlightData {
  title?: string;
  kicker?: string;
  indicatorLabel?: string;
  items?: SpotlightItem[];
  showIndicator?: boolean;
}

const FALLBACK_ITEMS: SpotlightItem[] = [
  { title: 'Camera Work', indicator: '[ Framing ]', image: { src: '/blocks/services-spotlight/spotlight-1.jpg', alt: 'Camera work' } },
  { title: 'Visual Direction', indicator: '[ Vision ]', image: { src: '/blocks/services-spotlight/spotlight-2.jpg', alt: 'Visual direction' } },
  { title: 'Sound Design', indicator: '[ Resonance ]', image: { src: '/blocks/services-spotlight/spotlight-3.jpg', alt: 'Sound design' } },
  { title: 'Film Editing', indicator: '[ Sequence ]', image: { src: '/blocks/services-spotlight/spotlight-4.jpg', alt: 'Film editing' } },
];

export default function ServicesSpotlightBlock({ data }: { data: ServicesSpotlightData | any }) {
  const blockData = useMemo(() => (data as any)?.data || data || {}, [data]);
  const items: SpotlightItem[] = useMemo(() => {
    const source = Array.isArray(blockData?.items) && blockData.items.length > 0 ? blockData.items : FALLBACK_ITEMS;
    return source
      .map((item, idx) => ({
        id: item.id || `spot-${idx}`,
        title: item.title || `Item ${idx + 1}`,
        indicator: item.indicator || item.title || `Item ${idx + 1}`,
        image: item.image || {},
      }))
      .filter((item) => item.title);
  }, [blockData?.items]);

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (blockData?.showIndicator === false) return;
    const indicatorEl = indicatorRef.current;
    const listEl = listRef.current;
    if (!indicatorEl || !listEl) return;

    const updateIndicator = () => {
      const current = itemRefs.current[activeIndex];
      if (!current) return;
      const itemRect = current.getBoundingClientRect();
      const listRect = listEl.getBoundingClientRect();
      const indicatorRect = indicatorEl.getBoundingClientRect();
      const targetY = itemRect.top - listRect.top + itemRect.height / 2 - indicatorRect.height / 2;

      gsap.to(indicatorEl, {
        y: targetY,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeIndex, items.length]);

  const headline = blockData?.title || 'Inside The Studio';
  const kicker = blockData?.kicker || '[ Discover ]';
  const indicatorLabel = blockData?.indicatorLabel || '[ Discover ]';
  const showIndicator = blockData?.showIndicator !== false;

  return (
    <section className="services-block" data-block-type="services-spotlight">
      <div className="services-block__container">
        <div className="services-block__list" ref={listRef}>
          {items.map((item, index) => (
            <div
              key={item.id || index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`services-block__item ${activeIndex === index ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              tabIndex={0}
            >
              <div className="services-block__image-wrapper">
                {item?.image?.src ? (
                  <img src={item.image.src} alt={item.image.alt || item.title} className="services-block__image" />
                ) : (
                  <div className="services-block__image placeholder" />
                )}
              </div>
              <div className="services-block__name">
                <h2>{item.title}</h2>
              </div>
            </div>
          ))}
        </div>

        {showIndicator && (
          <div className="services-block__indicator" ref={indicatorRef}>
            <span>{items[activeIndex]?.indicator || indicatorLabel}</span>
          </div>
        )}
      </div>

      <div className="services-block__footer">
        <div className="services-block__footer-row">
          <p className="services-block__kicker">{kicker}</p>
          <h3 className="services-block__title">{headline}</h3>
        </div>
      </div>
    </section>
  );
}
