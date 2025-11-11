'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';

interface H3Data {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function H3Block({ data }: { data: H3Data | any }) {
  // Extraire les données
  const blockData = (data as any).data || data;
  const content = blockData.content || (data as any).content;
  const [fullContent, setFullContent] = useState<any>(null);
  
  // Charger le contenu pour accéder à la typographie
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content?t=' + Date.now(), { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
    
    // Écouter les mises à jour de contenu
    const handleContentUpdate = () => {
      loadContent();
    };
    window.addEventListener('content-updated', handleContentUpdate);
    return () => window.removeEventListener('content-updated', handleContentUpdate);
  }, []);
  
  // Récupérer la config typographie
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);
  
  // Classes typographiques pour h3 (sans la couleur pour la gérer via style)
  const h3Classes = useMemo(() => {
    const classes = getTypographyClasses('h3', typoConfig, defaultTypography.h3);
    // Retirer uniquement les classes de couleur Tailwind
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Couleur pour h3 : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const h3Color = useMemo(() => {
    const customColor = getCustomColor('h3', typoConfig);
    if (customColor) return customColor;
    // Toujours utiliser var(--foreground) pour s'adapter aux palettes
    return 'var(--foreground)';
  }, [typoConfig]);
  
  if (!content) {
    return null;
  }

  return (
    <h3 
      className={h3Classes}
      style={{ color: h3Color }}
      data-block-type="h3"
      data-block-theme={blockData.theme || (data as any).theme || 'auto'}
    >
      {content}
    </h3>
  );
}
