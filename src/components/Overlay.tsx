'use client';

import { useState, useEffect } from 'react';

export default function Overlay(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Démarrer l'animation de sortie après un court délai
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 1000); // Durée de l'animation de sortie
    }, 500); // Délai avant de commencer l'animation

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-1000 ease-out ${
        isAnimating ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      <div className="text-center">
        <div className="text-white text-6xl font-light tracking-wider mb-4">
          soliva
        </div>
        <div className="text-white/60 text-sm tracking-wide uppercase">
          creative studio
        </div>
      </div>
    </div>
  );
} 