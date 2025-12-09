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
    if (isBasicTransition()) {
      const curtain = document.getElementById("curtain");
      if (!curtain) {
        return;
      }

      curtain.style.transform = "translateY(0%)";
      // Navigation immédiate
      router.push(path);
      return;
    }

    // Chrome → Navigation immédiate, l'animation se fait automatiquement via View Transitions
    // Plus besoin d'attendre onTransitionReady, ça crée de la latence
    router.push(path);
  }, [router, isBasicTransition]);

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

    // ✅ OPTIMISATION : Navigation immédiate, pas d'attente
    triggerPageTransition(path);
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
        // ✅ OPTIMISATION : Navigation immédiate, pas d'attente
        triggerPageTransition(href);
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
