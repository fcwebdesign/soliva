"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { interceptViewTransitions, endTransition, isTransitionInProgress } from "@/utils/transitionLock";

/**
 * Composant global qui intercepte startViewTransition() au niveau global
 * et empêche les transitions multiples SANS ajouter de délais
 * 
 * STRATÉGIE : 
 * 1. Intercepter l'API native startViewTransition()
 * 2. Intercepter les clics rapides pour éviter les doubles clics
 * → Pas de délai, transition démarre immédiatement
 */
export default function TransitionGuard() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const lastClickTime = useRef(0);

  // Intercepter startViewTransition() une seule fois au montage
  useEffect(() => {
    interceptViewTransitions();
  }, []);

  // Intercepter les clics rapides (double-clics) sur les liens
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;
      
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      // Vérifier si c'est un lien interne
      const isInternal = href.startsWith("/");
      const withMod = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

      if (isInternal && !withMod) {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime.current;

        // Si un clic a eu lieu il y a moins de 150ms ET qu'une transition est en cours
        // → C'est probablement un double-clic accidentel, l'ignorer
        if (timeSinceLastClick < 150 && isTransitionInProgress()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }

        lastClickTime.current = now;
      }
    };

    // Intercepter avec capture pour être le premier
    document.addEventListener("click", handleClick, { capture: true, passive: false });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  // Déverrouiller quand le pathname change (transition terminée)
  useEffect(() => {
    // Si le pathname a changé, c'est qu'une transition s'est terminée
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      
      // Déverrouiller après un court délai pour être sûr que la transition est terminée
      const timer = setTimeout(() => {
        endTransition();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null; // Ce composant ne rend rien
}

