"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { interceptViewTransitions, isTransitionInProgress } from "@/utils/transitionLock";

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
    
    // ✅ OPTIMISATION : Intercepter TOUTES les erreurs "Skipped ViewTransition"
    // Même si elles sont gérées dans transitionLock.ts, elles peuvent remonter
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Gérer silencieusement les erreurs "Skipped ViewTransition"
      if (errorMessage.includes('Skipped ViewTransition') || 
          errorMessage.includes('another transition starting')) {
        event.preventDefault(); // Empêcher l'erreur de remonter
        event.stopPropagation(); // Empêcher la propagation
        return;
      }
    };
    
    // ✅ OPTIMISATION : Intercepter aussi les erreurs synchrones
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      
      // Gérer silencieusement les erreurs "Skipped ViewTransition"
      if (errorMessage.includes('Skipped ViewTransition') || 
          errorMessage.includes('another transition starting')) {
        event.preventDefault(); // Empêcher l'erreur de remonter
        event.stopPropagation(); // Empêcher la propagation
        return;
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // ✅ SIMPLIFICATION : Intercepter uniquement les double-clics très rapides (< 100ms)
  // L'interception globale de startViewTransition() gère le reste
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

        // ✅ SIMPLIFICATION : Empêcher uniquement les double-clics très rapides (< 100ms)
        // ET si une transition est en cours
        if (timeSinceLastClick < 100 && isTransitionInProgress()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
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

  // ✅ SIMPLIFICATION : Ne plus déverrouiller ici
  // L'interception globale de startViewTransition() déverrouille automatiquement
  // via l'événement 'finished' de la transition
  // Le pathname change est juste utilisé pour le tracking
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
    }
  }, [pathname]);

  return null; // Ce composant ne rend rien
}

