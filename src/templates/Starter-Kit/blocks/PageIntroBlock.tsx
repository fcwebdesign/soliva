'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import { useTemplate } from '@/templates/context';

interface PageIntroData {
  title?: string;
  description?: string;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'default' | 'two-columns';
  isFirstHeading?: boolean;
  // Accepte à la fois les alias (small/medium/large) et les clés de typo directes
  descriptionSize?: 'small' | 'medium' | 'large' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  parallax?: {
    enabled?: boolean;
    speed?: number;
  };
}

// Override Starter-Kit : description en font-weight light
export default function PageIntroBlockStarterKit({ data }: { data: PageIntroData | any }) {
  const pathname = usePathname();
  const { key: templateKey } = useTemplate();

  const blockData = (data as any).data || data;
  const customTitle = blockData.title || (data as any).title;
  const customDescription = blockData.description || (data as any).description;
  const layout = blockData.layout || (data as any).layout || 'default';

  const [fullContent, setFullContent] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);

  // Charger le contenu pour typographie + page courante
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (!response.ok) return;
        const content = await response.json();
        setFullContent(content);

        const slug = pathname?.split('/').filter(Boolean).pop() || '';
        let currentPage = null;

        if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
          currentPage = content[slug];
        } else if (content.pages?.pages) {
          currentPage = content.pages.pages.find((p: any) => p.slug === slug || p.id === slug);
        }

        setPageData(currentPage);
      } catch {
        // noop
      }
    };
    loadContent();
  }, [pathname]);

  // Écouter les mises à jour de contenu
  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (!response.ok) return;
        const content = await response.json();
        setFullContent(content);

        const slug = pathname?.split('/').filter(Boolean).pop() || '';
        let currentPage = null;

        if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
          currentPage = content[slug];
        } else if (content.pages?.pages) {
          currentPage = content.pages.pages.find((p: any) => p.slug === slug || p.id === slug);
        }

        setPageData(currentPage);
      } catch {
        // noop
      }
    };
    loadContent();
  });

  const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);

  const isFirstHeading = (data as any).isFirstHeading !== false;
  const HeadingTag = isFirstHeading ? 'h1' : 'h2';

  const headingClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.h1 ? { h1: typoConfig.h1 } : {};
    const classes = getTypographyClasses('h1', safeTypoConfig, defaultTypography.h1);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  // Description : taille selon descriptionSize (utilise directement les clés typographiques), poids forcé en light
  const pClasses = useMemo(() => {
    const legacyMap: Record<string, PageIntroData['descriptionSize']> = {
      small: 'h4',
      medium: 'h3',
      large: 'h2',
    };
    const normalizedSize = (legacyMap[(blockData.descriptionSize as any) || ''] || blockData.descriptionSize || 'h3') as
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'p';

    const allowed = new Set(['h1', 'h2', 'h3', 'h4', 'p']);
    const sizeKey = allowed.has(normalizedSize as any) ? normalizedSize : 'h3';

    const defaults: any = {
      h1: defaultTypography.h1,
      h2: defaultTypography.h2,
      h3: defaultTypography.h3,
      h4: defaultTypography.h4,
      p: defaultTypography.p,
    };

    const classes = getTypographyClasses(sizeKey as any, typoConfig, defaults[sizeKey] || defaultTypography.p);
    const withoutWeight = classes.replace(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '').trim();
    return `${withoutWeight} font-light`.replace(/\s+/g, ' ').trim();
  }, [typoConfig, blockData.descriptionSize]);

  const h1Color = useMemo(() => getCustomColor('h1', typoConfig) || 'var(--foreground)', [typoConfig]);
  const pColor = useMemo(() => {
    const legacyMap: Record<string, PageIntroData['descriptionSize']> = {
      small: 'h4',
      medium: 'h3',
      large: 'h2',
    };
    const normalizedSize = (legacyMap[(blockData.descriptionSize as any) || ''] || blockData.descriptionSize || 'h3') as
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'p';
    const allowed = new Set(['h1', 'h2', 'h3', 'h4', 'p']);
    const sizeKey = allowed.has(normalizedSize as any) ? normalizedSize : 'p';
    return getCustomColor(sizeKey as any, typoConfig) || getCustomColor('p', typoConfig) || 'var(--foreground)';
  }, [typoConfig, blockData.descriptionSize]);

  const title = customTitle || pageData?.hero?.title || pageData?.title || '';
  const description = customDescription || pageData?.hero?.subtitle || pageData?.description || '';
  const parallaxEnabled = !!blockData.parallax?.enabled;
  const parallaxSpeed = typeof blockData.parallax?.speed === 'number' ? blockData.parallax.speed : 0.25;
  const sectionRef = React.useRef<HTMLDivElement | null>(null);

  // Parallax simple
  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const handle = () => {
      if (!parallaxEnabled) {
        el.style.transform = '';
        return;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      const delta = Math.max(0, window.scrollY - top);
      const offset = delta * parallaxSpeed;
      el.style.transform = `translateY(${offset}px)`;
    };

    handle();
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);

    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
      el.style.transform = '';
    };
  }, [parallaxEnabled, parallaxSpeed, title, description]);

  if (!title && !description) {
    return null;
  }

  const useTwoColumns = layout === 'two-columns' || (layout === 'default' && templateKey === 'pearl');

  if (useTwoColumns) {
    return (
      <div
        className="page-intro-block py-10"
        data-block-type="page-intro"
        data-block-theme={blockData.theme || (data as any).theme || 'auto'}
        ref={sectionRef}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-end">
          {title && (
            <div className="text-left mb-8 lg:mb-0">
              <HeadingTag className={headingClasses} style={{ color: h1Color }}>
                {title}
              </HeadingTag>
            </div>
          )}

          {description && (
            <div className="text-left lg:ml-auto lg:pl-8">
              <div
                className={`max-w-2xl ${pClasses}`}
                style={{ color: pColor }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-intro-block py-16"
      data-block-type="page-intro"
      data-block-theme={blockData.theme || (data as any).theme || 'auto'}
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {title && (
            <HeadingTag className={`${headingClasses} mb-8`} style={{ color: h1Color }}>
              {title}
            </HeadingTag>
          )}
          {description && (
            <div
              className={`max-w-3xl mx-auto ${pClasses}`}
              style={{ color: pColor }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
