'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';

interface ServicesData {
  title?: string;
  offerings: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ServicesBlock({ data }: { data: ServicesData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = (data as any).data || data;
  const { title = "OUR CORE OFFERINGS", offerings = [] } = blockData;
  
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
  
  // Classes typographiques pour h3 (sans la couleur pour la gérer via style)
  const h3Classes = useMemo(() => {
    // S'assurer que la config typographie existe et utilise les valeurs par défaut si nécessaire
    const safeTypoConfig = typoConfig?.h3 ? { h3: typoConfig.h3 } : {};
    const classes = getTypographyClasses('h3', safeTypoConfig, defaultTypography.h3);
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
  
  return (
    <section className="service-offerings-section py-28">
      <div>
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
        
        <div className="space-y-0">
          {offerings.map((offering, index) => (
            <div 
              key={offering.id || index}
              className="service-offering-block border-b border-black/10 py-8 last:border-b-0 is-visible"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5">
                  {offering.icon && (
                    <div className="mb-2">
                      <span className="text-blue-400 text-lg">{offering.icon}</span>
                    </div>
                  )}
                  <h3 
                    className={h3Classes}
                    style={{ color: h3Color }}
                  >
                    {offering.title}
                  </h3>
                </div>
                
                <div className="md:col-span-5 flex justify-end">
                  <div 
                    className={`max-w-[68ch] ${pClasses}`}
                    style={{ color: pColor }}
                    dangerouslySetInnerHTML={{ __html: offering.description || '' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
