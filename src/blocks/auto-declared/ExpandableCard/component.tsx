'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import './styles.css';

interface ExpandableCardData {
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

export default function ExpandableCard({ data }: { data: ExpandableCardData }) {
  const { mounted } = useTheme();
  const [isExpanded, setIsExpanded] = useState(data.isExpanded || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const blockTheme = data.theme || 'automation';

  // Durée de l'animation FLIP (déplacement des cartes)
  const ANIMATION_DURATION = 500;

  // FLIP Animation Helper (position only, no scale to avoid distortion)
  const animateWithFlip = useCallback((callback: () => void) => {
    if (isAnimating) return;
    setIsAnimating(true);

    // First: capture initial positions
    const card = cardRef.current;
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

  const toggleExpansion = useCallback(() => {
    if (isAnimating) return;

    animateWithFlip(() => {
      setIsExpanded(!isExpanded);
    });
  }, [isExpanded, isAnimating, animateWithFlip]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleExpansion();
        break;
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        // Navigation vers la carte suivante (si plusieurs cartes)
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        // Navigation vers la carte précédente (si plusieurs cartes)
        break;
      }
      default:
        break;
    }
  }, [toggleExpansion]);

  // Appliquer le thème
  useEffect(() => {
    if (!mounted) return;
    
    if (blockTheme !== 'auto') {
      document.documentElement.setAttribute('data-theme', blockTheme);
    }
  }, [blockTheme, mounted]);

  // Gérer l'état initial
  useEffect(() => {
    if (data.isExpanded) {
      setIsExpanded(true);
    }
  }, [data.isExpanded]);

  if (!mounted) {
    return null;
  }

  return (
    <article 
      ref={cardRef}
      className="kodza-expandable-card"
      data-theme={blockTheme}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={toggleExpansion}
      onKeyDown={handleKeyDown}
      data-block-type="expandable-card"
      data-block-theme={blockTheme}
    >
      <div className="kodza-expandable-card-header">
        <span className="kodza-expandable-card-label">{data.label}</span>
        <h2 className="kodza-expandable-card-title">{data.title}</h2>
        <p className="kodza-expandable-card-summary">{data.summary}</p>
      </div>
      
      <div 
        ref={bodyRef}
        className="kodza-expandable-card-body"
        aria-hidden={!isExpanded}
      >
        <div>
          {data.media?.src && (
            <div className="kodza-expandable-card-media">
              <img 
                src={data.media.src} 
                alt={data.media.alt || ''} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: data.content }} />
        </div>
      </div>
    </article>
  );
}
