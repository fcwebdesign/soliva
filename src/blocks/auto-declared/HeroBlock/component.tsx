'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

type HeroBlockData = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: 'left' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  backgroundImage?: {
    src?: string;
    alt?: string;
  };
  isFirstHeading?: boolean; // Si true, utilise H1, sinon H2
};

export default function HeroBlock({ data }: { data: HeroBlockData | any }) {
  const blockData = (data as any).data || data;
  const [fullContent, setFullContent] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const content = await response.json();
          setFullContent(content);
        }
      } catch {
        // silencieux
      }
    };
    loadContent();
  }, []);

  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const content = await response.json();
          setFullContent(content);
        }
      } catch {
        // silencieux
      }
    };
    loadContent();
  });

  const typoConfig = useMemo(() => fullContent ? getTypographyConfig(fullContent) : {}, [fullContent]);

  const h1Classes = useMemo(() => {
    const classes = getTypographyClasses('h1Single', typoConfig, defaultTypography.h1Single);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const pClasses = useMemo(() => {
    const classes = getTypographyClasses('p', typoConfig, defaultTypography.p);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  const h1Color = useMemo(() => getCustomColor('h1Single', typoConfig) || 'var(--foreground)', [typoConfig]);
  const pColor = useMemo(() => getCustomColor('p', typoConfig) || 'var(--foreground)', [typoConfig]);

  // Déterminer si on utilise H1 ou H2 (SEO: un seul H1 par page)
  const isFirstHeading = (data as any).isFirstHeading !== false; // Par défaut true si non spécifié
  const HeadingTag = isFirstHeading ? 'h1' : 'h2';

  if (!blockData?.title && !blockData?.subtitle) {
    return null;
  }

  const align = blockData.align || 'left';
  const justify = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  const backgroundStyle = blockData.backgroundImage?.src
    ? {
        backgroundImage: `url(${blockData.backgroundImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <section
      className="hero-block py-16 md:py-24 relative overflow-hidden"
      data-block-type="hero"
      data-block-theme={blockData.theme || 'auto'}
      style={{ color: 'var(--foreground)' }}
    >
      {backgroundStyle && (
        <div
          className="absolute inset-0 opacity-20"
          aria-hidden="true"
          style={backgroundStyle}
        />
      )}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-6">
        <div className={`flex flex-col gap-4 ${justify}`}>
          {blockData.eyebrow && (
            <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              {blockData.eyebrow}
            </span>
          )}
          {blockData.title && (
            <HeadingTag className={h1Classes} style={{ color: h1Color }}>
              {blockData.title}
            </HeadingTag>
          )}
          {blockData.subtitle && (
            <p
              className={pClasses}
              style={{ color: pColor }}
              dangerouslySetInnerHTML={{ __html: blockData.subtitle }}
            />
          )}
          {(blockData.ctaLabel || blockData.ctaHref) && (
            <div className="pt-2">
              <a
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                href={blockData.ctaHref || '#'}
              >
                {blockData.ctaLabel || 'En savoir plus'}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
