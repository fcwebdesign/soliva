"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Composant pour forcer le scroll en haut de page lors des changements de route.
 * Résout le problème où la position de scroll est conservée lors des transitions
 * avec next-view-transitions et ReactLenis.
 */
export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Forcer le scroll en haut immédiatement lors du changement de route
    window.scrollTo(0, 0);
    
    // Une deuxième fois après un court délai pour être sûr que Lenis/Next.js n'ont pas interféré
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}


