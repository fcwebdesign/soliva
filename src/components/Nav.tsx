"use client";

import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { buildNavModel } from "@/utils/navModel";
import ThemeToggle from "./ThemeToggle";
import TransitionLink from "./TransitionLink";

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

  // Supprimer le code dupliqué - maintenant dans le hook

  // Remplace dynamiquement le "o" par un cercle pour éviter les erreurs SSR/CSR
  useEffect(() => {
    if (logoRef.current && !content?.logoImage) {
      const logoText = content?.logo || 'soliva';
      logoRef.current.innerHTML = logoText.replace('o', '<span class="logo-dot" aria-hidden="true"></span>');
    }
  }, [content?.logo, content?.logoImage]);

  // Crée un rideau bleu si besoin (Firefox/Safari) - maintenant dans le hook

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
          <TransitionLink href="/">
            {content?.logoImage ? (
              <img 
                src={content.logoImage} 
                alt="Logo" 
                className="h-8 max-w-[200px] object-contain"
              />
            ) : (
              <span ref={logoRef}>{content?.logo || 'soliva'}</span>
            )}
          </TransitionLink>
        </div>
      </div>

      <div className="col">
        <div className="nav-items">
          {navModel.items.map((item) => {
            const isExternal = item.target === '_blank';
            return (
              <div key={item.key} className="nav-item">
                <TransitionLink
                  href={item.href}
                  target={item.target}
                  className={item.active ? "active" : ""}
                >
                  {item.label}
                </TransitionLink>
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
