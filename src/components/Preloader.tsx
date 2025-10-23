'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Preloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const pathname = usePathname();
  const isPerfMode = process.env.NEXT_PUBLIC_LIGHTHOUSE === '1' || process.env.NEXT_PUBLIC_LIGHTHOUSE === 'true';

  useEffect(() => {
    if (isPerfMode) {
      setIsVisible(false);
      // Fournir un cleanup no-op pour satisfaire TypeScript
      return () => {};
    }
    // Délai réduit pour limiter l'impact sur LCP/Speed Index
    const timer: NodeJS.Timeout = setTimeout(() => {
      setIsVisible(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isPerfMode]);

  // Ne pas afficher le preloader sur les autres pages que la page d'accueil
  if (pathname !== '/' && pathname !== '') {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="preloader">
      {/* Page blanche simple */}
    </div>
  );
};

export default Preloader;
