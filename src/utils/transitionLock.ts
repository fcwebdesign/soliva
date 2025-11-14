/**
 * Système de verrouillage global pour les View Transitions
 * Empêche les transitions multiples qui causent l'erreur "Skipped ViewTransition"
 * 
 * STRATÉGIE : Intercepter startViewTransition() au niveau global
 * plutôt que d'intercepter les clics (qui ajoutent des délais)
 */

let isTransitioning = false;
let transitionTimeout: NodeJS.Timeout | null = null;
let isIntercepted = false;
// Verrou atomique pour éviter les race conditions
let transitionLock = false;

/**
 * Intercepte document.startViewTransition() au niveau global
 * Cette fonction doit être appelée une seule fois au démarrage de l'app
 */
export function interceptViewTransitions(): void {
  if (typeof document === 'undefined' || isIntercepted) {
    return;
  }

  // Vérifier si l'API est disponible
  if (!('startViewTransition' in document)) {
    return;
  }

  // Sauvegarder la fonction native
  const originalStartViewTransition = (document as any).startViewTransition.bind(document);

  // Remplacer par notre version qui vérifie le verrouillage
  // Utiliser un verrou atomique pour éviter les race conditions
  (document as any).startViewTransition = function(callback: () => void | Promise<void>) {
    // Si une transition est déjà en cours, ignorer complètement SANS appeler la fonction native
    // Cela évite l'erreur "Skipped ViewTransition" du navigateur
    // IMPORTANT : Ne pas exécuter le callback car cela pourrait causer des problèmes de navigation
    if (transitionLock || isTransitioning) {
      console.log('🚫 startViewTransition ignoré - une transition est déjà en cours');
      
      // Retourner un objet mock qui simule l'API ViewTransition
      // Le callback n'est PAS exécuté pour éviter les conflits
      return {
        finished: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
        skipTransition: () => {}
      };
    }

    // VERROUILLER IMMÉDIATEMENT (atomique) - AVANT d'appeler la fonction native
    // Cette ligne doit être exécutée AVANT d'appeler originalStartViewTransition
    // pour éviter qu'un autre appel ne passe entre les deux
    transitionLock = true;
    isTransitioning = true;

    // Nettoyer le timeout précédent s'il existe
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    // Déverrouiller après un délai de sécurité (en cas d'erreur)
    transitionTimeout = setTimeout(() => {
      transitionLock = false;
      isTransitioning = false;
      transitionTimeout = null;
    }, 3000);

    try {
      // Appeler la fonction native
      // Si cette ligne échoue avec "Skipped ViewTransition", on gère l'erreur silencieusement
      const transition = originalStartViewTransition(callback);

      // Déverrouiller quand la transition se termine
      if (transition && transition.finished && typeof transition.finished.then === 'function') {
        transition.finished.then(() => {
          // Petit délai pour être sûr que tout est terminé
          setTimeout(() => {
            transitionLock = false;
            isTransitioning = false;
            if (transitionTimeout) {
              clearTimeout(transitionTimeout);
              transitionTimeout = null;
            }
          }, 100);
        }).catch(() => {
          // En cas d'erreur, déverrouiller quand même
          transitionLock = false;
          isTransitioning = false;
          if (transitionTimeout) {
            clearTimeout(transitionTimeout);
            transitionTimeout = null;
          }
        });
      } else {
        // Si la transition n'a pas de .finished, déverrouiller après un délai
        setTimeout(() => {
          transitionLock = false;
          isTransitioning = false;
          if (transitionTimeout) {
            clearTimeout(transitionTimeout);
            transitionTimeout = null;
          }
        }, 2000);
      }

      return transition;
    } catch (error: any) {
      // Gérer l'erreur "Skipped ViewTransition" silencieusement
      // C'est une erreur attendue quand une transition est déjà en cours
      if (error?.message?.includes('Skipped ViewTransition') || 
          error?.message?.includes('another transition starting')) {
        console.log('⚠️ Transition ignorée par le navigateur (déjà en cours)');
        // Déverrouiller immédiatement car la transition n'a pas démarré
        transitionLock = false;
        isTransitioning = false;
        if (transitionTimeout) {
          clearTimeout(transitionTimeout);
          transitionTimeout = null;
        }
        // Retourner un objet mock pour éviter que l'app ne plante
        return {
          finished: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          ready: Promise.resolve(),
          skipTransition: () => {}
        };
      }
      
      // Pour les autres erreurs, déverrouiller et re-lancer
      transitionLock = false;
      isTransitioning = false;
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
      }
      // Re-lancer l'erreur pour que l'app sache qu'il y a eu un problème
      throw error;
    }
  };

  isIntercepted = true;
  console.log('✅ View Transitions interceptées au niveau global');
}

/**
 * Vérifie si une transition est en cours
 */
export function isTransitionInProgress(): boolean {
  return isTransitioning;
}

/**
 * Démarre une transition (verrouille)
 * Retourne true si la transition peut démarrer, false si une transition est déjà en cours
 */
export function startTransition(): boolean {
  if (isTransitioning) {
    console.log('🚫 Transition déjà en cours, ignorée');
    return false;
  }
  
  isTransitioning = true;
  
  // Nettoyer le timeout précédent s'il existe
  if (transitionTimeout) {
    clearTimeout(transitionTimeout);
  }
  
  // Déverrouiller après un délai de sécurité (3 secondes max)
  // Cela évite que le verrou reste actif indéfiniment en cas d'erreur
  transitionTimeout = setTimeout(() => {
    isTransitioning = false;
    transitionTimeout = null;
    console.log('🔓 Verrou de transition libéré (timeout de sécurité)');
  }, 3000);
  
  return true;
}

/**
 * Termine une transition (déverrouille)
 */
export function endTransition(): void {
  transitionLock = false;
  isTransitioning = false;
  
  if (transitionTimeout) {
    clearTimeout(transitionTimeout);
    transitionTimeout = null;
  }
}

/**
 * Wrapper pour router.push qui gère le verrouillage
 */
export function safePush(
  router: any,
  path: string,
  options?: { onTransitionReady?: () => void }
): void {
  if (!startTransition()) {
    return;
  }
  
  // Déverrouiller après la navigation
  const originalOnTransitionReady = options?.onTransitionReady;
  
  router.push(path, {
    ...options,
    onTransitionReady: () => {
      originalOnTransitionReady?.();
      // Déverrouiller après un court délai pour laisser la transition se terminer
      setTimeout(() => {
        endTransition();
      }, 100);
    },
  });
}

