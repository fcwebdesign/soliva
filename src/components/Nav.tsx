"use client";

import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

interface NavProps {
  content: {
    logo?: string;
    logoImage?: string;
    items?: string[];
    pageLabels?: Record<string, string | { title: string; customUrl?: string; target?: string }>;
    pages?: {
      pages?: Array<{ slug?: string; id?: string; title?: string }>;
    };
    location?: string;
  };
}

const Nav: React.FC<NavProps> = ({ content }) => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const logoRef = useRef<HTMLSpanElement>(null);

  const isSafari = (): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  };

  const isBasicTransition = (): boolean => {
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

  function triggerPageTransition(path: string): void {
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

  const handleNavigation = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
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
  const pageLabels: Record<string, string> = {
    'home': 'Accueil',
    'work': 'Réalisations', 
    'studio': 'Studio',
    'blog': 'Journal',
    'contact': 'Contact'
  };

  // Fonction pour obtenir le label d'une page (personnalisée ou par défaut)
  const getPageLabel = (pageKey: string): string => {
    // Vérifier d'abord les pages personnalisées
    const customPage = content?.pages?.pages?.find(page => 
      (page.slug || page.id) === pageKey
    );
    if (customPage) {
      return customPage.title || 'Page personnalisée';
    }
    
    // Gérer les liens personnalisés (objets) et les labels simples (chaînes)
    const customLabel = content?.pageLabels?.[pageKey];
    if (customLabel && typeof customLabel === 'object') {
      return customLabel.title || pageLabels[pageKey] || pageKey;
    }
    
    // Sinon utiliser les labels par défaut
    return (typeof customLabel === 'string' ? customLabel : '') || pageLabels[pageKey] || pageKey;
  };

  // Créer une clé unique pour forcer le re-render
  const navKey = JSON.stringify(content);

  // Construire la liste des pages de navigation
  const getNavigationItems = (): string[] => {
    const defaultItems = content?.items || ['home', 'work', 'studio', 'blog', 'contact'];
    
    // Ajouter automatiquement les pages personnalisées qui ne sont pas déjà dans la liste
    const customPages = content?.pages?.pages || [];
    const customPageKeys = customPages.map(page => page.slug || page.id);
    
    // Filtrer pour éviter les doublons
    const uniqueItems = [...defaultItems];
    customPageKeys.forEach(key => {
      if (!uniqueItems.includes(key)) {
        uniqueItems.push(key);
      }
    });
    
    return uniqueItems;
  };

  const navigationItems = getNavigationItems();

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
          {navigationItems.map((item) => {
            const defaultPath = item === 'home' ? "/" : `/${item}`;
            const isActive = pathname === defaultPath;
            const label = getPageLabel(item);
            
            // Gérer les liens personnalisés (objets) et les liens normaux (chaînes)
            let href: string, target: string, onClick: ((e: React.MouseEvent<HTMLAnchorElement>) => void) | undefined;
            const customLabel = content?.pageLabels?.[item];
            if (customLabel && typeof customLabel === 'object') {
              // Lien personnalisé
              href = customLabel.customUrl || defaultPath;
              target = customLabel.target || '_blank';
              onClick = target === '_blank' ? undefined : handleNavigation(href);
            } else {
              // Lien normal
              href = defaultPath;
              target = '_self';
              onClick = handleNavigation(href);
            }
            
            return (
              <div key={item} className="nav-item">
                <Link 
                  onClick={onClick} 
                  href={href}
                  target={target}
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
