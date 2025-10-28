"use client";
import { useEffect, useState } from 'react';

export interface RevealConfig {
  duration?: number;
  images?: string[];
  text?: {
    title: string;
    subtitle: string;
    author: string;
  };
  colors?: {
    background: string;
    text: string;
    progress: string;
  };
  easing?: string;
}

export function useRevealAnimation(config: RevealConfig = {}) {
  const [shouldShowReveal, setShouldShowReveal] = useState(false);
  const [isRevealComplete, setIsRevealComplete] = useState(false);

  useEffect(() => {
    // Vérifier si l'animation a déjà été vue dans cette session
    const hasSeenReveal = sessionStorage.getItem('pearl-reveal-seen');
    
    console.log('🎬 Hook Debug:', {
      hasSeenReveal,
      shouldShow: !hasSeenReveal
    });
    
    if (!hasSeenReveal) {
      setShouldShowReveal(true);
    } else {
      setIsRevealComplete(true);
    }
  }, [config]);

  const completeReveal = () => {
    setIsRevealComplete(true);
    setShouldShowReveal(false);
    // Marquer comme vu dans cette session
    sessionStorage.setItem('pearl-reveal-seen', 'true');
  };

  const resetReveal = () => {
    sessionStorage.removeItem('pearl-reveal-seen');
    setShouldShowReveal(true);
    setIsRevealComplete(false);
  };

  return {
    shouldShowReveal,
    isRevealComplete,
    completeReveal,
    resetReveal,
    config: {
      duration: 4000,
      images: ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'],
      text: {
        title: "Pearl",
        subtitle: "Un template moderne et élégant",
        author: "Soliva"
      },
      colors: {
        background: '#000000',
        text: '#ffffff',
        progress: '#ffffff'
      },
      easing: 'hop',
      ...config
    }
  };
}
