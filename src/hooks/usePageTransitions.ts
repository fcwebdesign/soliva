"use client";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback } from "react";

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
      if (!curtain) return;

      curtain.style.transform = "translateY(0%)";

      const delay = isSafari() ? 1000 : 600;

      setTimeout(() => {
        router.push(path);
      }, delay);

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
    );
  }, [router, isBasicTransition, isSafari]);

  const handleNavigation = useCallback((path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const currentPath = window.location.pathname;
    
    if (path === currentPath) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition(path);
    } else {
      router.push(path, {
        onTransitionReady: () => triggerPageTransition(path),
      });
    }
  }, [router, isBasicTransition, triggerPageTransition]);

  const handleLinkClick = useCallback((href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    const withMod = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

    // Toujours SPA pour l'interne (on ignore target _blank hérité par erreur)
    if (isInternal && !withMod) {
      e.preventDefault();
      if (href.startsWith("#")) {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Utiliser le système de transitions personnalisé
        if (isBasicTransition()) {
          triggerPageTransition(href);
        } else {
          router.push(href, {
            onTransitionReady: () => triggerPageTransition(href),
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
