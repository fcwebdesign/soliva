'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  hidden?: boolean;
}

interface FAQBlockData {
  title?: string;
  items?: FAQItem[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function FAQBlock({ data }: { data: FAQBlockData | any }) {
  const { mounted } = useTheme();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = (data as any).data || data;
  const items = blockData.items || [];
  const theme = blockData.theme || 'auto';
  const title = blockData.title;
  
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

  if (!mounted) {
    return <div className="min-h-[200px]" />;
  }

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filtrer les items masqués
  const visibleItems = items.filter(item => !item.hidden);

  if (visibleItems.length === 0) {
    return (
      <div className="py-12 px-4 text-center opacity-50">
        <p>Aucune question pour le moment.</p>
      </div>
    );
  }

  return (
    <section 
      className="faq-block"
      data-block-type="faq"
      data-block-theme={theme || 'auto'}
      style={{ color: 'var(--foreground)' }}
    >
      <div className="space-y-4">
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
        
        {visibleItems.map((item) => {
          const isOpen = openItems.has(item.id);
          
          return (
            <div
              key={item.id}
              className="faq-item border-b border-current/10 last:border-0"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full py-6 flex items-start justify-between text-left gap-4 hover:opacity-70 transition-opacity duration-300"
                aria-expanded={isOpen}
              >
                <h3 
                  className={`${h3Classes} flex-1`}
                  style={{ color: h3Color }}
                >
                  {item.question}
                </h3>
                <span 
                  className="text-2xl font-light transition-transform duration-300 flex-shrink-0"
                  style={{
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}
                >
                  +
                </span>
              </button>
              
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? '1000px' : '0px',
                  opacity: isOpen ? 1 : 0
                }}
              >
                <div 
                  className="pb-6 prose prose-lg max-w-none"
                  style={{ color: 'var(--foreground)' }}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
