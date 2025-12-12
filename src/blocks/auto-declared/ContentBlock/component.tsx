'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface ContentData {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
  width?: 'full' | 'small' | 'medium' | 'large';
  descriptionSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export default function ContentBlock({ data }: { data: ContentData | any }) {
  // Extraire les données
  const blockData = (data as any).data || data;
  const content = blockData.content || (data as any).content;
  const descriptionSize = blockData.descriptionSize || (data as any).descriptionSize || 'p';
  const [fullContent, setFullContent] = useState<any>(null);
  
  // Charger le contenu pour accéder à la typographie
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
  }, []);
  
  // Écouter les mises à jour de contenu pour recharger la typographie
  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
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
  
  const descriptionTypographyKey = useMemo(() => {
    const allowed = new Set(['h1', 'h2', 'h3', 'h4', 'p']);
    return allowed.has(descriptionSize as any) ? (descriptionSize as any) : 'p';
  }, [descriptionSize]);

  // Classes typographiques (sans la couleur pour la gérer via style)
  const textClasses = useMemo(() => {
    const defaults: any = {
      h1: defaultTypography.h1,
      h2: defaultTypography.h2,
      h3: defaultTypography.h3,
      h4: defaultTypography.h4,
      p: defaultTypography.p,
    };
    const classes = getTypographyClasses(descriptionTypographyKey as any, typoConfig, defaults[descriptionTypographyKey] || defaultTypography.p);
    // Retirer uniquement les classes de couleur Tailwind
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig, descriptionTypographyKey]);
  
  // Couleur pour p : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const textColor = useMemo(() => {
    const customColor = getCustomColor(descriptionTypographyKey as any, typoConfig) || getCustomColor('p', typoConfig);
    if (customColor) return customColor;
    // Toujours utiliser var(--foreground) pour s'adapter aux palettes
    return 'var(--foreground)';
  }, [typoConfig, descriptionTypographyKey]);

  const widthClass = (() => {
    switch (blockData.width) {
      case 'xsmall':
        return 'max-w-sm';
      case 'small':
        return 'max-w-xl';
      case 'medium':
        return 'max-w-2xl';
      case 'large':
        return 'max-w-5xl';
      case 'full':
      default:
        return 'max-w-none';
    }
  })();
  
  if (!content) {
    return null;
  }

  return (
    <div 
      className="content-block"
      data-block-type="content"
      data-block-theme={blockData.theme || (data as any).theme || 'auto'}
    >
      <div 
        className={`prose prose-lg custom-lists ${textClasses} ${widthClass}`}
        style={{ color: textColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
