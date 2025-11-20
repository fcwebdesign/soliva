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

  // ✅ OPTIMISATION : Ne plus intercepter les clics du tout
  // Laisser le Link de next-view-transitions gérer directement les clics
  // L'interception globale de startViewTransition() dans transitionLock.ts
  // empêche déjà les doubles transitions au niveau de l'API native
  // Cela élimine toute latence liée à l'interception des événements

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

