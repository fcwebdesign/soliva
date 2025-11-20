'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface H2Data {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function H2Block({ data }: { data: H2Data | any }) {
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
  
  // Classes typographiques pour h2 (sans la couleur pour la gérer via style)
  const h2Classes = useMemo(() => {
    // S'assurer que la config typographie existe et utilise les valeurs par défaut si nécessaire
    const safeTypoConfig = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
    
    const classes = getTypographyClasses('h2', safeTypoConfig, defaultTypography.h2);
    
    // Retirer uniquement les classes de couleur Tailwind
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Couleur pour h2 : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const h2Color = useMemo(() => {
    const customColor = getCustomColor('h2', typoConfig);
    if (customColor) return customColor;
    // Toujours utiliser var(--foreground) pour s'adapter aux palettes
    return 'var(--foreground)';
  }, [typoConfig]);
  
  if (!content) {
    return null;
  }

  return (
    <h2 
      className={h2Classes}
      style={{ color: h2Color }}
      data-block-type="h2"
      data-block-theme={blockData.theme || (data as any).theme || 'auto'}
    >
      {content}
    </h2>
  );
}
