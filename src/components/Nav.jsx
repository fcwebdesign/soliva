"use client";

import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

const Nav = ({ content }) => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const logoRef = useRef();

  // Debug: log des données reçues
  console.log('🎯 Nav: Données reçues', content);

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  };

  const isBasicTransition = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("firefox") || isSafari();
  };

  // Remplace dynamiquement le "o" par un cercle pour éviter les erreurs SSR/CSR
  useEffect(() => {
    if (logoRef.current && !content?.logoImage) {
      const logoText = content?.logo || 'soliva';
      logoRef.current.innerHTML = logoText.replace('o', '<span class="logo-dot" aria-hidden="true"></span>');
    }
  }, [content?.logo, content?.logoImage]);

  // Crée un rideau bleu si besoin (Firefox/Safari)
  useEffect(() => {
    if (!isBasicTransition()) return;
    if (document.getElementById("curtain")) return;

    const curtain = document.createElement("div");
    curtain.id = "curtain";
    curtain.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--accent);
      transform: translateY(-100%);
      z-index: 9999;
      transition: transform 0.6s ease;
      pointer-events: none;
    `;
    document.body.appendChild(curtain);
  }, []);

  function triggerPageTransition(path) {
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
    
  }

  const handleNavigation = (path) => (e) => {
    if (path === pathname) {
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
  };

  // Replie le rideau après navigation
  useEffect(() => {
    if (!isBasicTransition()) return;
    const curtain = document.getElementById("curtain");
    if (!curtain) return;

    curtain.style.transform = "translateY(-100%)";
  }, [pathname]);

  // Pages disponibles avec leurs labels
  const pageLabels = {
    'home': 'Accueil',
    'work': 'Réalisations', 
    'studio': 'Studio',
    'blog': 'Journal',
    'contact': 'Contact'
  };

  // Fonction pour obtenir le label d'une page (personnalisé ou par défaut)
  const getPageLabel = (pageKey) => {
    return content?.pageLabels?.[pageKey] || pageLabels[pageKey] || pageKey;
  };

  // Créer une clé unique pour forcer le re-render
  const navKey = JSON.stringify(content);

  return (
    <div className="nav" key={navKey}>
      <div className="col">
        <div className="nav-logo">
          <Link onClick={handleNavigation("/")} href="/">
            {content?.logoImage ? (
              <img 
                src={content.logoImage} 
                alt="Logo" 
                className="h-8 max-w-[200px] object-contain"
              />
            ) : (
              <span ref={logoRef}>{content?.logo || 'soliva'}</span>
            )}
          </Link>
        </div>
      </div>

      <div className="col">
        <div className="nav-items">
          {(content?.items || ['home', 'work', 'studio', 'blog', 'contact']).map((item) => {
            const path = item === 'home' ? "/" : `/${item}`;
            const isActive = pathname === path;
            const label = getPageLabel(item);
            
            return (
              <div key={item} className="nav-item">
                <Link 
                  onClick={handleNavigation(path)} 
                  href={path}
                  className={isActive ? "active" : ""}
                >
                  {label}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="nav-copy">
          <ThemeToggle />
          <p>{content?.location || 'paris, le havre'}</p>
        </div>
      </div>
    </div>
  );
};

export default Nav;
