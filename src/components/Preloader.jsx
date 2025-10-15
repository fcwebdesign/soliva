'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Simple délai de 1 seconde avant de masquer
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
}
