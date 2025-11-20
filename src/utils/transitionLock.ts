/**
 * Système de verrouillage global pour les View Transitions
 * 
 * STRATÉGIE SIMPLIFIÉE :
 * 1. Intercepter UNIQUEMENT startViewTransition() au niveau global
 * 2. Laisser next-view-transitions gérer TOUT le reste
 * 3. Pas de prévention de clics, pas de délais, pas de complexité
 * 
 * Principe : Si une transition est en cours, ignorer silencieusement les nouvelles tentatives
 */

let isTransitioning = false;
let transitionTimeout: NodeJS.Timeout | null = null;
let isIntercepted = false;

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
  (document as any).startViewTransition = function(callback: () => void | Promise<void>) {
    // ✅ Vérification atomique : Si une transition est déjà en cours, ignorer complètement
    if (isTransitioning) {
      // ✅ DEBUG : Log pour comprendre pourquoi une transition est bloquée
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 [TransitionLock] Transition bloquée - une transition est déjà en cours');
      }
      // Retourner un objet mock qui simule l'API ViewTransition
      // Le callback n'est PAS exécuté pour éviter les conflits
      return {
        finished: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        ready: Promise.resolve(),
        skipTransition: () => {}
      };
    }

    // VERROUILLER IMMÉDIATEMENT (atomique)
    isTransitioning = true;
    
    // Nettoyer le timeout précédent s'il existe
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    // ✅ OPTIMISATION : Timeout de sécurité très court pour éviter de bloquer
    // La transition se termine généralement très rapidement via l'événement 'finished'
    // Ce timeout est juste une sécurité au cas où 'finished' ne se déclencherait pas
    const safetyTimeout = 300; // Très court pour éviter de bloquer les nouvelles transitions
    transitionTimeout = setTimeout(() => {
      isTransitioning = false;
      transitionTimeout = null;
    }, safetyTimeout);

    try {
      // Appeler la fonction native
      const transition = originalStartViewTransition(callback);

      // Si la transition a une Promise finished, écouter sa résolution
      if (transition && transition.finished && typeof transition.finished.then === 'function') {
        transition.finished
          .then(() => {
            // ✅ Déverrouiller immédiatement quand la transition se termine
            isTransitioning = false;
            if (transitionTimeout) {
              clearTimeout(transitionTimeout);
              transitionTimeout = null;
            }
          })
          .catch((error: any) => {
            // Gérer l'erreur "Skipped ViewTransition" silencieusement
            if (error?.message?.includes('Skipped ViewTransition') || 
                error?.message?.includes('another transition starting')) {
              // Déverrouiller immédiatement car la transition n'a pas démarré
              isTransitioning = false;
              if (transitionTimeout) {
                clearTimeout(transitionTimeout);
                transitionTimeout = null;
              }
              return;
            }
            // Pour les autres erreurs, déverrouiller quand même
            isTransitioning = false;
            if (transitionTimeout) {
              clearTimeout(transitionTimeout);
              transitionTimeout = null;
            }
          });
      } else {
        // Si pas de .finished, utiliser le timeout de sécurité
        // (ne devrait jamais arriver avec l'API moderne)
      }

      return transition;
    } catch (error: any) {
      // Gérer l'erreur "Skipped ViewTransition" silencieusement
      if (error?.message?.includes('Skipped ViewTransition') || 
          error?.message?.includes('another transition starting')) {
        // Déverrouiller immédiatement car la transition n'a pas démarré
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
      isTransitioning = false;
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
      }
      throw error;
    }
  };

  isIntercepted = true;
}

/**
 * Vérifie si une transition est en cours
 */
export function isTransitionInProgress(): boolean {
  return isTransitioning;
}

/**
 * Démarre une transition (verrouille)
 * ⚠️ DÉPRÉCIÉ : Ne plus utiliser directement, l'interception globale gère tout
 */
export function startTransition(): boolean {
  // Cette fonction existe pour compatibilité mais ne devrait plus être utilisée
  // L'interception globale gère tout automatiquement
  if (isTransitioning) {
    return false;
  }
  isTransitioning = true;
  
  if (transitionTimeout) {
    clearTimeout(transitionTimeout);
  }
  
  const defaultTransitionDuration = 1500;
  const safetyMargin = 500;
  transitionTimeout = setTimeout(() => {
    isTransitioning = false;
    transitionTimeout = null;
  }, defaultTransitionDuration + safetyMargin);
  
  return true;
}

/**
 * Termine une transition (déverrouille)
 * ⚠️ DÉPRÉCIÉ : Ne plus utiliser directement, l'interception globale gère tout
 */
export function endTransition(): void {
  isTransitioning = false;
  
  if (transitionTimeout) {
    clearTimeout(transitionTimeout);
    transitionTimeout = null;
  }
}
