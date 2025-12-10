'use client';

import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';
import { getTypographyConfig, getTypographyClasses, getCustomColor, getCustomLineHeight, defaultTypography } from '@/utils/typography';
import TransitionLink from '@/components/TransitionLink';

type TemplateItem = {
  id?: string;
  label?: string;
  detail?: string;
  hidden?: boolean;
};

type TemplateImage = {
  src?: string;
  alt?: string;
  aspectRatio?: string;
};

type TemplateGuidelinesData = {
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'stacked' | 'split';
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: TemplateImage;
  items?: TemplateItem[];
};

export default function TemplateGuidelinesBlock({ data }: { data: TemplateGuidelinesData | any }) {
  const blockData = useMemo(() => (data as any)?.data || data || {}, [data]);
  const items = useMemo(() => (Array.isArray(blockData?.items) ? blockData.items.filter((i) => !i.hidden) : []), [blockData?.items]);

  const layout = blockData.layout === 'stacked' ? 'stacked' : 'split';
  const themeClass = '';
  const [fullContent, setFullContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/content/metadata', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch (e) {
        // ignore fetch errors
      }
    };
    load();
  }, []);

  const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);
  const titleClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
    const classes = getTypographyClasses('h2', safeTypoConfig, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  const titleColor = useMemo(() => {
    const customColor = getCustomColor('h2', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  const titleLineHeight = useMemo(() => {
    const lh = getCustomLineHeight('h2', typoConfig);
    return lh || undefined;
  }, [typoConfig]);

  return (
    <section
      className={`template-guidelines template-guidelines--${layout} ${themeClass}`}
      data-block-type="template-guidelines"
      data-block-theme={blockData.theme || 'auto'}
    >
      <div className="template-guidelines__inner">
        <div className="template-guidelines__copy">
          {blockData.subtitle && <p className="tg-subtitle">{blockData.subtitle}</p>}
          {blockData.title && (
            <h2
              className={`tg-title ${titleClasses}`}
              style={{ color: titleColor, ...(titleLineHeight && { lineHeight: titleLineHeight }) }}
            >
              {blockData.title}
            </h2>
          )}
          {blockData.description && <p className="tg-description">{blockData.description}</p>}

          {(blockData.ctaText || blockData.ctaHref) && (
            <TransitionLink className="tg-cta" href={blockData.ctaHref || '#'} aria-label={blockData.ctaText}>
              {blockData.ctaText || 'CTA'}
            </TransitionLink>
          )}
        </div>

        <div className="template-guidelines__media">
          {blockData.image?.src ? (
            <div className="tg-image">
              <img src={blockData.image.src} alt={blockData.image.alt || blockData.title || ''} />
            </div>
          ) : (
            <div className="tg-image tg-image--placeholder">
              <span>Image placeholder</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
