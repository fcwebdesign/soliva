'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import './styles.css';

interface CardItem {
  title: string;
  label: string;
  summary: string;
  content: string;
  media?: {
    src: string;
    alt: string;
  };
  theme?: 'automation' | 'research' | 'marketing' | 'go-to-market';
  isExpanded?: boolean;
}

interface ExpandableCardData {
  title?: string;
  cards?: CardItem[];
}

export default function ExpandableCard({ data }: { data: ExpandableCardData | any }) {
  const { mounted } = useTheme();
  
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = (data as any).data || data;
  const title = blockData.title;
  const cardsData = blockData.cards || [];
  
  const [cards, setCards] = useState<CardItem[]>(cardsData);
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
    return 'var(--foreground)';
  }, [typoConfig]);
  
  // Synchroniser les données quand elles changent depuis l'admin (sans écraser isExpanded)
  useEffect(() => {
    const blockData = (data as any).data || data;
    const newCards = blockData.cards || [];
    
    // Préserver l'état isExpanded des cartes existantes si elles existent toujours
    setCards(prevCards => {
      // Comparer les cartes sans tenir compte de isExpanded (qui est géré localement)
      const prevCardsWithoutExpanded = prevCards.map(({ isExpanded, ...rest }) => rest);
      const newCardsWithoutExpanded = newCards.map(({ isExpanded, ...rest }: any) => rest);
      
      // Si les données ont changé (hors isExpanded), mettre à jour
      if (JSON.stringify(prevCardsWithoutExpanded) !== JSON.stringify(newCardsWithoutExpanded)) {
        return newCards.map((newCard: CardItem, index: number) => {
          const existingCard = prevCards.find((c, i) => 
            i === index || 
            (c.title === newCard.title && c.label === newCard.label)
          );
          return {
            ...newCard,
            isExpanded: existingCard?.isExpanded ?? newCard.isExpanded ?? false
          };
        });
      }
      
      // Sinon, garder l'état actuel
      return prevCards;
    });
  }, [data]);

  // Toggle simple sans animation FLIP - laisser CSS gérer les transitions
  const toggleCard = useCallback((index: number) => {
    setCards(prev => prev.map((c, i) => {
      if (i === index) return { ...c, isExpanded: !c.isExpanded };
      // fermer les autres
      return { ...c, isExpanded: false };
    }));
  }, []);

  // Gestion clavier sera attachée par carte avec l'index

  // Rien à appliquer globalement: chaque carte porte son propre thème via attribut

  if (!mounted) {
    return <div className="min-h-[200px]" />;
  }

  return (
    <section className="expandable-card-block" data-block-type="expandable-card" data-block-theme={blockData?.theme || 'auto'}>
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

      {cards.length === 0 ? (
        <div className="py-12 px-4 text-center opacity-50">
          <p>Aucune carte pour le moment.</p>
        </div>
      ) : (
        <section className="kodza-expandable">
        {cards.map((card, index) => (
        <article
          key={index}
          className="kodza-expandable-card"
          data-theme={card.theme || 'automation'}
          role="button"
          tabIndex={0}
          aria-expanded={!!card.isExpanded}
          onClick={() => toggleCard(index)}
          onKeyDown={(e) => {
            switch (e.key) {
              case 'Enter':
              case ' ': {
                e.preventDefault();
                toggleCard(index);
                break;
              }
              default:
                break;
            }
          }}
          data-block-type="expandable-card"
          data-block-theme={card.theme || 'automation'}
        >
          <div className="kodza-expandable-card-header">
            {card.label && (
              <span className="kodza-expandable-card-label">{card.label}</span>
            )}
            <h3 
              className={`kodza-expandable-card-title ${h3Classes}`}
              style={{ color: h3Color }}
            >
              {card.title}
            </h3>
            {card.summary && (
              <p className="kodza-expandable-card-summary">{card.summary}</p>
            )}
          </div>

          <div
            className="kodza-expandable-card-body"
            aria-hidden={!card.isExpanded}
          >
            <div>
              {card.media?.src && (
                <div className="kodza-expandable-card-media">
                  <img
                    src={card.media.src}
                    alt={card.media.alt || ''}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: card.content }} />
            </div>
          </div>
        </article>
      ))}
        </section>
      )}
    </section>
  );
}
