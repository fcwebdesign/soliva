'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../../hooks/useTheme';
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
  cards?: CardItem[];
}

export default function ExpandableCard({ data }: { data: ExpandableCardData }) {
  const { mounted } = useTheme();
  const [cards, setCards] = useState<CardItem[]>(data.cards || []);
  const [isAnimating, setIsAnimating] = useState(false);
  // Un ref par carte pour animer la bonne carte (évite le bug du dernier élément)
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  // Durée de l'animation FLIP (déplacement des cartes)
  const ANIMATION_DURATION = 500;

  // FLIP Animation Helper (position only, no scale to avoid distortion)
  const animateWithFlip = useCallback((cardEl: HTMLElement | null, callback: () => void) => {
    if (isAnimating) return;
    setIsAnimating(true);

    // First: capture initial positions
    const card = cardEl;
    if (!card) {
      setIsAnimating(false);
      return;
    }

    const firstRect = card.getBoundingClientRect();

    // Execute the change
    callback();

    // Last: capture final positions
    requestAnimationFrame(() => {
      const lastRect = card.getBoundingClientRect();
      
      // Invert: calculate the difference (position only)
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;

      // Play: animate from inverted to final (only translate, no scale)
      if (deltaX !== 0 || deltaY !== 0) {
        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        requestAnimationFrame(() => {
          card.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          card.style.transform = 'translate(0, 0)';
        });
      }

      setTimeout(() => {
        card.style.transition = '';
        card.style.transform = '';
        setIsAnimating(false);
      }, ANIMATION_DURATION);
    });
  }, [isAnimating, ANIMATION_DURATION]);

  const toggleCard = useCallback((index: number) => {
    if (isAnimating) return;
    const el = cardRefs.current[index] || null;
    animateWithFlip(el, () => {
      setCards(prev => prev.map((c, i) => {
        if (i === index) return { ...c, isExpanded: !c.isExpanded };
        // fermer les autres
        return { ...c, isExpanded: false };
      }));
    });
  }, [isAnimating, animateWithFlip]);

  // Gestion clavier sera attachée par carte avec l'index

  // Rien à appliquer globalement: chaque carte porte son propre thème via attribut

  if (!mounted) {
    return null;
  }

  return (
    <section className="kodza-expandable">
      {cards.map((card, index) => (
        <article
          key={index}
          ref={(el) => { cardRefs.current[index] = el; }}
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
            <span className="kodza-expandable-card-label">{card.label}</span>
            <h2 className="kodza-expandable-card-title">{card.title}</h2>
            <p className="kodza-expandable-card-summary">{card.summary}</p>
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
  );
}
