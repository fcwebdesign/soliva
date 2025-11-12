'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface ContactData {
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContactBlock({ data }: { data: ContactData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  // BlockRenderer peut passer les données directement ou dans une structure imbriquée
  const blockData = (data as any).data || data;
  const title = blockData.title || (data as any).title;
  const ctaText = blockData.ctaText || (data as any).ctaText;
  const ctaLink = blockData.ctaLink || (data as any).ctaLink;
  
  const [content, setContent] = useState<any>(null);
  
  // Charger le contenu pour accéder à la typographie
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
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
        const response = await fetchContentWithNoCache('/api/content');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
  });
  
  // Récupérer la config typographie
  const typoConfig = useMemo(() => {
    return content ? getTypographyConfig(content) : {};
  }, [content]);
  
  // Classes typographiques pour h2 (sans la couleur pour la gérer via style)
  const h2Classes = useMemo(() => {
    const classes = getTypographyClasses('h2', typoConfig, defaultTypography.h2);
    // Retirer uniquement les classes de couleur Tailwind (text-gray-*, text-black, text-white, etc.)
    // mais garder les classes de taille (text-fluid-*, text-xl, etc.)
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
  
  if (!title && !ctaText && !ctaLink) {
    return null;
  }

  return (
    <section 
      className="contact-section py-28" 
      data-block-type="contact" 
      data-block-theme={data.theme || 'auto'}
    >
      <div 
        className="border rounded-lg p-8"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Titre de la section */}
          {title && (
            <h2 
              className={h2Classes}
              style={{ color: h2Color }}
            >
              {title}
            </h2>
          )}
          
          {/* Bouton CTA */}
          {ctaText && ctaLink && (
            <a 
              href={ctaLink}
              className="contact-button inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
