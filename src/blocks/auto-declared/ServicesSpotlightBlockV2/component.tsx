'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import TransitionLink from '@/components/TransitionLink';
import gsap from 'gsap';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import './styles.css';

type SpotlightItem = {
  id?: string;
  title: string;
  indicator?: string;
  image?: { src?: string; alt?: string };
  hidden?: boolean;
  link?: string;
};

interface ServicesSpotlightData {
  title?: string;
  indicatorLabel?: string;
  items?: SpotlightItem[];
  showIndicator?: boolean;
  itemHeadingVariant?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
}

const FALLBACK_ITEMS: SpotlightItem[] = [
  { title: 'Camera Work', indicator: '[ Framing ]', image: { src: '/blocks/services-spotlight/spotlight-1.jpg', alt: 'Camera work' } },
  { title: 'Visual Direction', indicator: '[ Vision ]', image: { src: '/blocks/services-spotlight/spotlight-2.jpg', alt: 'Visual direction' } },
  { title: 'Sound Design', indicator: '[ Resonance ]', image: { src: '/blocks/services-spotlight/spotlight-3.jpg', alt: 'Sound design' } },
  { title: 'Film Editing', indicator: '[ Sequence ]', image: { src: '/blocks/services-spotlight/spotlight-4.jpg', alt: 'Film editing' } },
];

export default function ServicesSpotlightBlockV2({ data }: { data: ServicesSpotlightData | any }) {
  const blockData = useMemo(() => (data as any)?.data || data || {}, [data]);
  const items: SpotlightItem[] = useMemo(() => {
    const source = Array.isArray(blockData?.items) && blockData.items.length > 0 ? blockData.items : FALLBACK_ITEMS;
    return source
      .map((item, idx) => ({
        id: item.id || `spot-${idx}`,
        title: item.title || `Item ${idx + 1}`,
        indicator: item.indicator || item.title || `Item ${idx + 1}`,
        image: item.image || {},
        hidden: item.hidden || false,
        link: item.link,
      }))
      .filter((item) => !item.hidden && item.title);
  }, [blockData?.items]);

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fullContent, setFullContent] = useState<any>(null);

  // Charger le contenu pour récupérer la typo globale
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const json = await response.json();
          setFullContent(json);
        }
      } catch (error) {
        // silence
      }
    };
    loadContent();
  }, []);

  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const json = await response.json();
          setFullContent(json);
        }
      } catch (error) {
        // silence
      }
    };
    loadContent();
  });

  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);

  const variantToType: Record<'small' | 'medium' | 'large', 'h1' | 'h2' | 'h3'> = {
    small: 'h3',
    medium: 'h2',
    large: 'h1',
  };
  const headingType: 'h1' | 'h2' | 'h3' = 'h2'; // titre section : h2 par défaut
  const itemHeadingVariant: 'small' | 'medium' | 'large' = blockData?.itemHeadingVariant || 'medium';
  const itemHeadingType = variantToType[itemHeadingVariant];

  const headingClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.[headingType] ? { [headingType]: (typoConfig as any)[headingType] } : {};
    const classes = getTypographyClasses(headingType as any, safeTypoConfig, (defaultTypography as any)[headingType]);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig, headingType]);

  const headingColor = useMemo(() => {
    const customColor = getCustomColor(headingType as any, typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig, headingType]);

  const itemHeadingClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.[itemHeadingType] ? { [itemHeadingType]: (typoConfig as any)[itemHeadingType] } : {};
    const classes = getTypographyClasses(itemHeadingType as any, safeTypoConfig, (defaultTypography as any)[itemHeadingType]);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig, itemHeadingType]);

  const itemHeadingColor = useMemo(() => {
    const customColor = getCustomColor(itemHeadingType as any, typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig, itemHeadingType]);

  const indicatorClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.h4 ? { h4: (typoConfig as any).h4 } : {};
    const classes = getTypographyClasses('h4', safeTypoConfig, defaultTypography.h4);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const indicatorColor = useMemo(() => {
    const customColor = getCustomColor('h4', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);

  useLayoutEffect(() => {
    if (blockData?.showIndicator === false) {
      return undefined;
    }
    const indicatorEl = indicatorRef.current;
    const listEl = listRef.current;
    const containerEl = containerRef.current;
    if (!indicatorEl || !listEl) return undefined;

    const updateIndicator = () => {
      const current = itemRefs.current[activeIndex];
      if (!current) return;
      const itemRect = current.getBoundingClientRect();
      const listRect = listEl.getBoundingClientRect();
      const indicatorRect = indicatorEl.getBoundingClientRect();
      const containerRect = containerEl?.getBoundingClientRect();
      const listOffset = containerRect ? listRect.top - containerRect.top : 0;
      const targetY = listOffset + (itemRect.top - listRect.top) + itemRect.height / 2 - indicatorRect.height / 2;

      gsap.to(indicatorEl, {
        y: targetY,
        duration: 0.4,
          ease: 'power2.out',
      });
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeIndex, items.length, blockData?.showIndicator]);

  const headline = blockData?.title || 'Nos services';
  const indicatorLabel = blockData?.indicatorLabel || '[ Discover ]';
  const showIndicator = blockData?.showIndicator !== false;

  return (
    <section className="services-block" data-block-type="services-spotlight-v2" data-block-theme={blockData?.theme || 'auto'}>
      <div className="services-block__container" ref={containerRef}>
        <div className="services-block__heading-wrapper">
          <h3
            className={`services-block__heading ${headingClasses}`}
            style={{ color: headingColor }}
            data-block-type={headingType}
          >
            {headline}
          </h3>
      </div>

        <div className="services-block__list" ref={listRef}>
          {items.map((item, index) => {
            const ItemContent = (
              <>
                <div className="services-block__image-wrapper">
                  {item?.image?.src ? (
                    <img src={item.image.src} alt={item.image.alt || item.title} className="services-block__image" />
                  ) : (
                    <div className="services-block__image placeholder" />
                  )}
                </div>
                <div className="services-block__name">
                  <h3
                    className={itemHeadingClasses}
                    style={{ color: itemHeadingColor }}
                    data-block-type={itemHeadingType}
                  >
                    {item.title}
                  </h3>
                </div>
              </>
            );

            const itemElement = item.link ? (
              <TransitionLink
                href={item.link}
                className={`services-block__item ${activeIndex === index ? 'is-active' : ''} services-block__item-link`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              >
                {ItemContent}
              </TransitionLink>
            ) : (
              <div
                className={`services-block__item ${activeIndex === index ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                tabIndex={0}
              >
                {ItemContent}
              </div>
            );

            return (
              <div
                key={item.id || index}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
              >
                {itemElement}
              </div>
            );
          })}
        </div>

        {showIndicator && (
          <div className="services-block__indicator" ref={indicatorRef}>
            <span className={indicatorClasses} style={{ color: indicatorColor }} data-block-type="h4">
              {items[activeIndex]?.indicator || indicatorLabel}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
