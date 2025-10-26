"use client";

import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { buildNavModel } from "@/utils/navModel";
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

  // Modèle de navigation partagé (pages peut être absente ici; fallback sur items uniquement)
  const navModel = buildNavModel({
    nav: {
      logo: content?.logo,
      logoImage: content?.logoImage,
      items: content?.items,
      pageLabels: content?.pageLabels,
      location: content?.location,
    },
    pages: content?.pages ? { pages: content.pages.pages } : undefined,
    pathname,
  });

  // Clé de re-render minimale
  const navKey = JSON.stringify({
    logo: content?.logo,
    logoImage: content?.logoImage,
    items: content?.items,
    pageLabels: content?.pageLabels,
    location: content?.location,
  });

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
          {navModel.items.map((item) => {
            const isExternal = item.target === '_blank';
            const onClick = isExternal ? undefined : handleNavigation(item.href);
            return (
              <div key={item.key} className="nav-item">
                <Link
                  onClick={onClick}
                  href={item.href}
                  target={item.target}
                  className={item.active ? "active" : ""}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="nav-copy">
          <ThemeToggle />
          <p>{navModel.location || 'paris, le havre'}</p>
        </div>
      </div>
    </div>
  );
};

export default Nav;
