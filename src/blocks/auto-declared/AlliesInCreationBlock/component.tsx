'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';
import TransitionLink from '@/components/TransitionLink';
import { getTypographyConfig, getTypographyClasses, getCustomColor, getCustomLineHeight, defaultTypography } from '@/utils/typography';

type AllyItem = {
  id?: string;
  label?: string;
  link?: string;
  featured?: boolean;
  hidden?: boolean;
};

type AlliesData = {
  title?: string;
  subtitle?: string;
  items?: AllyItem[];
};

const defaultItems: AllyItem[] = [
  { id: 'ally-1', label: 'Blackline Studio', link: '/' },
  { id: 'ally-2', label: 'North Axis', link: '/work' },
  { id: 'ally-3', label: 'Vanta Works', link: '/studio' },
  { id: 'ally-4', label: 'Oblique Films', link: '/blog' },
  { id: 'ally-5', label: 'Hollow Syndicate', link: '/contact' },
  { id: 'ally-6', label: 'Ferrotype', link: '/work' },
  { id: 'ally-7', label: 'Glasshaus', link: '/work' },
  { id: 'ally-8', label: 'Orbit Division', link: '/work' },
];

export default function AlliesInCreationBlock({ data }: { data: AlliesData | any }) {
  const blockData = useMemo(() => (data as any)?.data || data || {}, [data]);
  const items: AllyItem[] = useMemo(
    () => (Array.isArray(blockData?.items) && blockData.items.length ? blockData.items.filter((i) => !i.hidden) : defaultItems),
    [blockData?.items]
  );
  // Utiliser Flexbox avec des lignes séparées (comme dans negative-films)
  // Chaque ligne est un conteneur flex indépendant, ce qui permet d'avoir
  // un nombre variable d'items par ligne (3, puis 5, etc.)
  const columns = useMemo(() => 5, []);
  
  // Grouper les items par lignes
  // Si la dernière ligne aurait 3 items, on les met sur la première ligne à la place
  const rows = useMemo(() => {
    const result: AllyItem[][] = [];
    const total = items.length;
    const lastRowCount = total % columns;
    
    // Si la dernière ligne aurait exactement 3 items, on met 3 items sur la première ligne
    if (lastRowCount === 3 && total > columns) {
      // Première ligne : 3 items
      result.push(items.slice(0, 3));
      // Lignes suivantes : le reste par groupes de 5
      for (let i = 3; i < items.length; i += columns) {
        result.push(items.slice(i, i + columns));
      }
    } else {
      // Distribution normale : groupes de 5
      for (let i = 0; i < items.length; i += columns) {
        result.push(items.slice(i, i + columns));
      }
    }
    return result;
  }, [items, columns]);

  const [fullContent, setFullContent] = useState<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const currentActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/content/metadata', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);

  const titleClasses = useMemo(() => {
    const safe = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
    const classes = getTypographyClasses('h2', safe, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const titleColor = useMemo(() => {
    const custom = getCustomColor('h2', typoConfig);
    return custom || 'var(--foreground)';
  }, [typoConfig]);

  const titleLineHeight = useMemo(() => getCustomLineHeight('h2', typoConfig) || undefined, [typoConfig]);

  const subtitleClasses = useMemo(() => {
    const safe = typoConfig?.h3 ? { h3: typoConfig.h3 } : {};
    const classes = getTypographyClasses('h3', safe, defaultTypography.h3);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const subtitleColor = useMemo(() => {
    const custom = getCustomColor('h3', typoConfig);
    return custom || 'var(--muted-foreground)';
  }, [typoConfig]);

  // Configuration typographie pour les labels (h3)
  const labelClasses = useMemo(() => {
    const safe = typoConfig?.h3 ? { h3: typoConfig.h3 } : {};
    const classes = getTypographyClasses('h3', safe, defaultTypography.h3);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const labelColor = useMemo(() => {
    const custom = getCustomColor('h3', typoConfig);
    return custom || 'var(--foreground)';
  }, [typoConfig]);

  const labelLineHeight = useMemo(() => getCustomLineHeight('h3', typoConfig) || undefined, [typoConfig]);

  useEffect(() => {
    const container = gridRef.current;
    const highlight = highlightRef.current;
    if (!container || !highlight) return;

    const getHighlightColor = () => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#ff1a1a';

    const resetText = () => {
      const prev = currentActive.current;
      if (prev) {
        const span = prev.querySelector('span');
        if (span) span.style.color = '';
      }
    };

    const moveToElement = (el: HTMLElement | null) => {
      if (!el || isMobile) return;
      if (currentActive.current === el) return;

      resetText();

      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      highlight.style.transform = `translate(${rect.left - containerRect.left}px, ${rect.top - containerRect.top}px)`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.backgroundColor = getHighlightColor();
      highlight.style.opacity = '1';

      currentActive.current = el;
      // we keep text color as-is (palette foreground)
    };

    const handleMove = (e: MouseEvent) => {
      if (isMobile) return;
      const hovered = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      let target: HTMLElement | null = null;
      if (hovered?.classList.contains('collab-item')) {
        target = hovered;
      } else if (hovered?.classList.contains('collab-item__link')) {
        target = hovered.querySelector('.collab-item') as HTMLElement | null;
      } else if (hovered?.parentElement?.classList.contains('collab-item')) {
        target = hovered.parentElement;
      } else if (hovered?.parentElement?.classList.contains('collab-item__link')) {
        target = hovered.parentElement.querySelector('.collab-item') as HTMLElement | null;
      }
      if (target) moveToElement(target);
    };

    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (mobile) {
        highlight.style.opacity = '0';
        resetText();
        currentActive.current = null;
      } else {
        highlight.style.opacity = '1';
        const first = container.querySelector('.allies-item') as HTMLElement | null;
        moveToElement(first);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMove);

    if (!isMobile) {
      const first = container.querySelector('.collab-item') as HTMLElement | null;
      moveToElement(first);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMove);
    };
  }, [isMobile]);

  return (
    <section className="collab-block" data-block-type="collaborations-grid">
      <div className="collab-block__inner">
        {(blockData.subtitle || blockData.title) && (
          <div className="collab-block__heading mb-12">
            {blockData.subtitle && (
              <p className={`collab-block__supertitle ${subtitleClasses}`} style={{ color: subtitleColor }}>
                {blockData.subtitle}
              </p>
            )}
            {blockData.title && (
              <h2
                className={`collab-block__title ${titleClasses}`}
                style={{ color: titleColor, ...(titleLineHeight && { lineHeight: titleLineHeight }) }}
              >
                {blockData.title}
              </h2>
            )}
          </div>
        )}

        <div className="collab-grid" ref={gridRef}>
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="collab-grid-row">
              {row.map((item) => {
                const content = (
                  <div className="collab-item">
                    <h3
                      className={labelClasses}
                      style={{
                        color: labelColor,
                        ...(labelLineHeight && { lineHeight: labelLineHeight }),
                        margin: 0,
                      }}
                    >
                      {item.label}
                    </h3>
                  </div>
                );

                if (item.link) {
                  return (
                    <TransitionLink
                      key={item.id || item.label}
                      href={item.link}
                      className="collab-item__link"
                    >
                      {content}
                    </TransitionLink>
                  );
                }

                return (
                  <div key={item.id || item.label} className="collab-item__link">
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="collab-highlight" ref={highlightRef} />
        </div>
      </div>
    </section>
  );
}
