'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface LogosData {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  logos: Array<{
    src?: string;
    image?: string;
    alt?: string;
    name?: string;
  }>;
}

export default function LogosBlock({ data }: { data: LogosData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  const [blockData, setBlockData] = useState<any>((data as any).data || data);
  
  // Forcer la mise à jour des données quand le contenu change
  useEffect(() => {
    const newBlockData = (data as any).data || data;
    // Comparer les logos pour détecter les changements
    const currentLogos = JSON.stringify(blockData.logos || []);
    const newLogos = JSON.stringify(newBlockData.logos || []);
    if (currentLogos !== newLogos || blockData.title !== newBlockData.title) {
      setBlockData(newBlockData);
    }
  }, [data, blockData.logos, blockData.title]);
  
  // Écouter les mises à jour de contenu pour forcer le rechargement
  useContentUpdate(() => {
    // Forcer la mise à jour en réextrayant les données
    const newBlockData = (data as any).data || data;
    setBlockData(newBlockData);
  });
  
  const { title = "NOS CLIENTS", logos = [] } = blockData;
  
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
    const classes = getTypographyClasses('h2', typoConfig, defaultTypography.h2);
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
  
  return (
    <section className="logos-section" data-block-type="logos" data-block-theme={data.theme || 'auto'}>
      <div>
        {/* Titre de la section */}
        {title && (
          <div className="mb-12">
            <h2 
              className={h2Classes}
              style={{ color: h2Color }}
              data-block-type="h2"
            >
              {title}
            </h2>
          </div>
        )}
        
        {/* Grille des logos clients */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center">
          {logos.map((logo, index) => (
            <div 
              key={index} 
              className="logo-item rounded-lg p-4"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              <Image
                src={logo.src || logo.image}
                alt={logo.alt || logo.name || `Logo client ${index + 1}`}
                width={120}
                height={60}
                className="w-full h-auto object-contain"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
