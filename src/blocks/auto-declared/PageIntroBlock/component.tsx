'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import { useTemplate } from '@/templates/context';

interface PageIntroData {
  title?: string; // Si vide, utilise pageData.title
  description?: string; // Si vide, utilise pageData.description
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'default' | 'two-columns'; // Layout adaptatif selon template
  isFirstHeading?: boolean; // Si true, utilise H1, sinon H2
  // Utilise directement les clés typographiques configurées (plus modulaire)
  descriptionSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  parallax?: {
    enabled?: boolean;
    speed?: number;
  };
}

export default function PageIntroBlock({ data }: { data: PageIntroData | any }) {
  const pathname = usePathname();
  const { key: templateKey } = useTemplate();
  
  // Extraire les données
  const blockData = (data as any).data || data;
  const customTitle = blockData.title || (data as any).title;
  const customDescription = blockData.description || (data as any).description;
  const layout = blockData.layout || (data as any).layout || 'default';
  const descriptionSize = blockData.descriptionSize || (data as any).descriptionSize || 'h3';
  const parallaxEnabled = !!blockData.parallax?.enabled;
  const parallaxSpeed = typeof blockData.parallax?.speed === 'number' ? blockData.parallax.speed : 0.25;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  
  const [fullContent, setFullContent] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  
  // Charger le contenu pour accéder à la typographie et aux métadonnées de page
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
          
          // Trouver la page courante
          const slug = pathname?.split('/').filter(Boolean).pop() || '';
          let currentPage = null;
          
          // Chercher dans les pages système
          if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
            currentPage = data[slug];
          } else if (data.pages?.pages) {
            // Chercher dans les pages custom
            currentPage = data.pages.pages.find((p: any) => 
              p.slug === slug || p.id === slug
            );
          }
          
          setPageData(currentPage);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
  }, [pathname]);
  
  // Écouter les mises à jour de contenu
  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
          
          const slug = pathname?.split('/').filter(Boolean).pop() || '';
          let currentPage = null;
          
          if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
            currentPage = data[slug];
          } else if (data.pages?.pages) {
            currentPage = data.pages.pages.find((p: any) => 
              p.slug === slug || p.id === slug
            );
          }
          
          setPageData(currentPage);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
  });
  
  // Récupérer la config typographie
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);
  
  // Déterminer si on utilise H1 ou H2 (SEO: un seul H1 par page)
  const isFirstHeading = (data as any).isFirstHeading !== false; // Par défaut true si non spécifié
  const HeadingTag = isFirstHeading ? 'h1' : 'h2';
  
  // Classes typographiques pour h1 (ou h2 si pas le premier)
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

  // Parallax léger (scroll)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const handle = () => {
      if (!parallaxEnabled) {
        el.style.transform = '';
        return;
      }
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
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
      if (el) el.style.transform = '';
    };
  }, [parallaxEnabled, parallaxSpeed, title, description]);
  
  // La taille correspond directement à une clé de typographie (h1, h1Single, h2, h3, h4, p)
  const descriptionTypographyKey = useMemo(() => {
    const allowed = new Set(['h1', 'h2', 'h3', 'h4', 'p']);
    return allowed.has(descriptionSize as any) ? (descriptionSize as any) : 'h3';
  }, [descriptionSize]);

  // Classes typographiques pour la description (taille paramétrable)
  const descriptionClasses = useMemo(() => {
    const key = descriptionTypographyKey;
    const defaults = (defaultTypography as any)[key] || defaultTypography.p;
    const classes = getTypographyClasses(key as any, typoConfig, defaults);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig, descriptionTypographyKey]);
  
  // Couleurs personnalisées
  const h1Color = useMemo(() => {
    const customColor = getCustomColor('h1', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  
  const descriptionColor = useMemo(() => {
    const customColor = getCustomColor(descriptionTypographyKey as any, typoConfig) || getCustomColor('p', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig, descriptionTypographyKey]);
  
  // Déterminer le titre et la description (priorité: custom > pageData.hero > pageData)
  const title = customTitle || pageData?.hero?.title || pageData?.title || '';
  const description = customDescription || pageData?.hero?.subtitle || pageData?.description || '';
  
  // Si rien à afficher, ne rien rendre
  if (!title && !description) {
    return null;
  }
  
  // Rendu adaptatif selon le template
  // Pearl utilise un layout 2 colonnes, les autres templates un layout simple
  const useTwoColumns = layout === 'two-columns' || (layout === 'default' && templateKey === 'pearl');
  
  if (useTwoColumns) {
    // Layout 2 colonnes (Pearl style)
    return (
      <div 
        className="page-intro-block py-10"
        data-block-type="page-intro"
        data-block-theme={blockData.theme || (data as any).theme || 'auto'}
        ref={sectionRef}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-end">
          {/* Titre à gauche */}
          {title && (
            <div className="text-left mb-4 lg:mb-0">
              <HeadingTag 
                className={headingClasses}
                style={{ color: h1Color }}
              >
                {title}
              </HeadingTag>
            </div>
          )}
          
          {/* Description à droite, alignée à droite et en bas */}
          {description && (
            <div className="text-left lg:ml-auto lg:pl-8">
              <div
                className={`max-w-2xl ${descriptionClasses}`}
                style={{ color: descriptionColor }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Layout simple (centré par défaut)
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
            <HeadingTag 
              className={`${headingClasses} mb-4`}
              style={{ color: h1Color }}
            >
              {title}
            </HeadingTag>
          )}
          {description && (
            <div
              className={`max-w-3xl mx-auto ${descriptionClasses}`}
              style={{ color: descriptionColor }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
