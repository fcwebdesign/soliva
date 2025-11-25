'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import { useTemplate } from '@/templates/context';

interface PageIntroData {
  title?: string; // Si vide, utilise pageData.title
  description?: string; // Si vide, utilise pageData.description
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'default' | 'two-columns'; // Layout adaptatif selon template
}

export default function PageIntroBlock({ data }: { data: PageIntroData | any }) {
  const pathname = usePathname();
  const { key: templateKey } = useTemplate();
  
  // Extraire les données
  const blockData = (data as any).data || data;
  const customTitle = blockData.title || (data as any).title;
  const customDescription = blockData.description || (data as any).description;
  const layout = blockData.layout || (data as any).layout || 'default';
  
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
  
  // Classes typographiques pour h1
  const h1Classes = useMemo(() => {
    const safeTypoConfig = typoConfig?.h1 ? { h1: typoConfig.h1 } : {};
    const classes = getTypographyClasses('h1', safeTypoConfig, defaultTypography.h1);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Classes typographiques pour p
  const pClasses = useMemo(() => {
    const classes = getTypographyClasses('p', typoConfig, defaultTypography.p);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Couleurs personnalisées
  const h1Color = useMemo(() => {
    const customColor = getCustomColor('h1', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  
  const pColor = useMemo(() => {
    const customColor = getCustomColor('p', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  
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
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-end">
          {/* Titre à gauche */}
          {title && (
            <div className="text-left mb-4 lg:mb-0">
              <h1 
                className={h1Classes}
                style={{ color: h1Color }}
              >
                {title}
              </h1>
            </div>
          )}
          
          {/* Description à droite, alignée à droite et en bas */}
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
  
  // Layout simple (centré par défaut)
  return (
    <div 
      className="page-intro-block py-16"
      data-block-type="page-intro"
      data-block-theme={blockData.theme || (data as any).theme || 'auto'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {title && (
            <h1 
              className={`${h1Classes} mb-4`}
              style={{ color: h1Color }}
            >
              {title}
            </h1>
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

