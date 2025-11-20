'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface ContentData {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContentBlock({ data }: { data: ContentData | any }) {
  // Extraire les données
  const blockData = (data as any).data || data;
  const content = blockData.content || (data as any).content;
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
  
  // Classes typographiques pour p (sans la couleur pour la gérer via style)
  const pClasses = useMemo(() => {
    const classes = getTypographyClasses('p', typoConfig, defaultTypography.p);
    // Retirer uniquement les classes de couleur Tailwind
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Couleur pour p : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const pColor = useMemo(() => {
    const customColor = getCustomColor('p', typoConfig);
    if (customColor) return customColor;
    // Toujours utiliser var(--foreground) pour s'adapter aux palettes
    return 'var(--foreground)';
  }, [typoConfig]);
  
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
        className={`prose prose-lg custom-lists ${pClasses}`}
        style={{ color: pColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
