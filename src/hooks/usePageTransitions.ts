"use client";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback } from "react";
import { isTransitionInProgress } from "@/utils/transitionLock";

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
    // ✅ SIMPLIFICATION : Ne plus utiliser startTransition() manuellement
    // L'interception globale de startViewTransition() gère tout automatiquement
    
    if (isBasicTransition()) {
      const curtain = document.getElementById("curtain");
      if (!curtain) {
        return;
      }

      curtain.style.transform = "translateY(0%)";

      // Navigation immédiate - l'interception globale gère le verrouillage
      router.push(path);
      return;
    }

    // Chrome → animation native via clipPath avec cercle
    document.documentElement.animate(
      [
        {
          clipPath: "circle(0% at 50% 50%)"
        },
        {
          clipPath: "circle(150% at 50% 50%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.9, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
    // ✅ SIMPLIFICATION : Ne plus déverrouiller manuellement
    // L'interception globale gère le déverrouillage automatiquement
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
      // ✅ SIMPLIFICATION : Laisser next-view-transitions gérer tout
      // L'interception globale gère le verrouillage automatiquement
      router.push(path, {
        onTransitionReady: () => {
          triggerPageTransition(path);
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
          // ✅ SIMPLIFICATION : Laisser next-view-transitions gérer tout
          // L'interception globale gère le verrouillage automatiquement
          router.push(href, {
            onTransitionReady: () => {
              triggerPageTransition(href);
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
