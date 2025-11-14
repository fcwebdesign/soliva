"use client";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback } from "react";
import { isTransitionInProgress, startTransition, endTransition } from "@/utils/transitionLock";

export function usePageTransitions() {
  const router = useTransitionRouter();

  const isSafari = useCallback((): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  }, []);

  const isBasicTransition = useCallback((): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("firefox") || isSafari();
  }, [isSafari]);

  const triggerPageTransition = useCallback((path: string): void => {
    // Utiliser le verrouillage global
    if (!startTransition()) {
      return;
    }
    
    if (isBasicTransition()) {
      const curtain = document.getElementById("curtain");
      if (!curtain) {
        endTransition();
        return;
      }

      curtain.style.transform = "translateY(0%)";

      // SUPPRESSION DU DÉLAI : La transition doit démarrer immédiatement
      // Pas de setTimeout - navigation immédiate
      router.push(path);
      
      // Réinitialiser le flag après la navigation (court délai pour laisser le temps à la navigation)
      setTimeout(() => {
        endTransition();
      }, 100);

      return;
    }

    // Chrome → animation native via clipPath avec cercle
    document.documentElement.animate(
      [
        {
          // Étape 1 : cercle très petit au centre
          clipPath: "circle(0% at 50% 50%)"
        },
        {
          // Étape 2 : cercle qui s'agrandit pour couvrir tout l'écran
          clipPath: "circle(150% at 50% 50%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.9, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    ).addEventListener('finish', () => {
      // Réinitialiser le flag après l'animation
      setTimeout(() => {
        endTransition();
      }, 100);
    });
  }, [router, isBasicTransition, isSafari]);

  const handleNavigation = useCallback((path: string) => (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const currentPath = window.location.pathname;
    
    if (path === currentPath) {
      e.preventDefault();
      return;
    }

    // Utiliser le verrouillage global
    if (isTransitionInProgress()) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition(path);
    } else {
      if (!startTransition()) {
        return;
      }
      router.push(path, {
        onTransitionReady: () => {
          triggerPageTransition(path);
          setTimeout(() => endTransition(), 100);
        },
      });
    }
  }, [router, isBasicTransition, triggerPageTransition]);

  const handleLinkClick = useCallback((href: string, e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    const withMod = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

    // Toujours SPA pour l'interne (on ignore target _blank hérité par erreur)
    if (isInternal && !withMod) {
      e.preventDefault();
      
      // Utiliser le verrouillage global
      if (isTransitionInProgress()) {
        return;
      }
      
      if (href.startsWith("#")) {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Utiliser le système de transitions personnalisé
        if (isBasicTransition()) {
          triggerPageTransition(href);
        } else {
          if (!startTransition()) {
            return;
          }
          router.push(href, {
            onTransitionReady: () => {
              triggerPageTransition(href);
              setTimeout(() => endTransition(), 100);
            },
          });
        }
      }
    }
  }, [router, isBasicTransition, triggerPageTransition]);

  return {
    handleNavigation,
    handleLinkClick,
    triggerPageTransition,
    isBasicTransition,
    isSafari
  };
}
