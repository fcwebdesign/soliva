"use client";
import { Link } from "next-view-transitions";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildNavModel } from "@/utils/navModel";
import { useTemplate } from "@/templates/context";
import { getTypographyConfig, getTypographyClasses, defaultTypography } from "@/utils/typography";

export type HeaderVariant = 'classic' | 'centered' | 'minimal' | 'asymmetric' | 'split' | 'brand-centered';

interface HeaderPearlProps {
  nav: any;
  pages: any;
  variant?: HeaderVariant;
  layout?: string;
  fullContent?: any;
}

export default function HeaderPearl({ nav, pages, variant = 'classic', layout = 'standard', fullContent }: HeaderPearlProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { key } = useTemplate();
  const model = buildNavModel({ nav, pages, pathname, templateKey: key !== 'default' ? key : undefined });
  
  // Récupérer les styles typographiques pour la navigation (sans la couleur, on utilise la palette)
  const typoConfig = getTypographyConfig(fullContent || {});
  const navClassesRaw = getTypographyClasses('nav', typoConfig, defaultTypography.nav);
  // Retirer uniquement les classes de couleur pour laisser la palette décider
  const navTypographyClasses = navClassesRaw
    .replace(/\btext-[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Composants réutilisables
  // Utilisation de la palette : text-foreground au lieu de text-gray-900
  const Logo = () => (
    <Link href="/" className="flex items-center space-x-3">
      {model.brand.image ? (
        <img src={model.brand.image} alt="Logo" className="h-8 w-auto object-contain max-w-[180px] vt-brand" />
      ) : (
        <span className="text-xl font-bold tracking-tight text-foreground truncate vt-brand">{model.brand.text}</span>
      )}
    </Link>
  );

  // Utilisation de la palette : text-foreground au lieu de text-gray-900
  // Les classes typographiques (taille, poids) sont appliquées, mais la couleur vient de la palette
  const Navigation = () => (
    <nav className="hidden md:flex items-center space-x-2">
      {model.items.map((item: any) => (
        <Link
          key={item.key}
          href={item.href}
          target={item.target}
          className={`px-3 py-2 rounded-md transition-colors ${navTypographyClasses} ${item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  // Utilisation de la palette : text-muted-foreground, hover:text-foreground, hover:bg-muted
  const MobileButton = ({ alwaysVisible = false }: { alwaysVisible?: boolean }) => (
    <button 
      type="button" 
      className={(alwaysVisible ? '' : 'md:hidden ') + "inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"}
      onClick={() => setOpen(v => !v)} 
      aria-label="Ouvrir le menu" 
      aria-expanded={open}
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
      </svg>
    </button>
  );

  // Utilisation de la palette : bg-primary text-primary-foreground hover:opacity-90
  const CTAButton = () => (
    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
      Contact
    </button>
  );

  // Rendu selon la variante
  const renderHeaderContent = () => {
    switch (variant) {
      case 'classic':
        return (
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center min-w-0">
              <Logo />
            </div>
            <div className="flex items-center space-x-6">
              <Navigation />
              <div className="flex items-center space-x-3">
                <CTAButton />
                <MobileButton />
              </div>
            </div>
          </div>
        );

      case 'centered':
        return (
          <div className="grid grid-cols-3 items-center h-16">
            <div className="justify-self-start min-w-0">
              <Logo />
            </div>
            <div className="justify-self-center">
              <Navigation />
            </div>
            <div className="justify-self-end flex items-center space-x-3">
              <CTAButton />
              <MobileButton />
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center min-w-0">
              <Logo />
            </div>
            <div className="flex items-center space-x-3">
              <MobileButton alwaysVisible />
            </div>
          </div>
        );

      case 'asymmetric':
        return (
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Logo />
              <Navigation />
            </div>
            <div className="flex items-center space-x-3">
              <CTAButton />
              <MobileButton />
            </div>
          </div>
        );

      case 'split':
        // Nouveau split: logo centré, navigation divisée de part et d'autre
        // Desktop: deux groupes d'items autour du logo, CTA à droite
        // Mobile: logo + burger
        const items = model.items || [];
        const mid = Math.ceil(items.length / 2);
        const leftItems = items.slice(0, mid);
        const rightItems = items.slice(mid);
        return (
          <div>
            {/* Mobile bar */}
            <div className="flex md:hidden h-16 items-center justify-between">
              <div className="min-w-0">
                <Logo />
              </div>
              <div className="flex items-center space-x-3">
                <MobileButton />
              </div>
            </div>
            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-3 items-center h-16 md:gap-4">
              <nav className="justify-self-start flex items-center space-x-2">
                {leftItems.map((item: any) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    target={item.target}
                    className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="justify-self-center min-w-0">
                <Logo />
              </div>
              <div className="justify-self-end flex items-center space-x-4">
                <nav className="hidden md:flex items-center space-x-2">
                  {rightItems.map((item: any) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      target={item.target}
                      className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <CTAButton />
              </div>
            </div>
          </div>
        );

      case 'brand-centered':
        // Menu left, brand centered, CTA right (mobile: brand center + burger)
        return (
          <div className="grid grid-cols-3 items-center h-16">
            <div className="justify-self-start hidden md:flex items-center space-x-2">
              <Navigation />
            </div>
            <div className="justify-self-center min-w-0">
              <Logo />
            </div>
            <div className="justify-self-end flex items-center space-x-3">
              <span className="hidden md:inline-flex"><CTAButton /></span>
              <MobileButton />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center min-w-0">
              <Logo />
            </div>
            <div className="flex items-center space-x-6">
              <Navigation />
              <div className="flex items-center space-x-3">
                <CTAButton />
                <MobileButton />
              </div>
            </div>
          </div>
        );
    }
  };

  const overlayMobileOnly = variant !== 'minimal';

  // Détecter si le premier bloc a data-transparent-header="true"
  const [isTransparent, setIsTransparent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const checkTransparentHeader = () => {
      const firstBlock = document.querySelector('[data-transparent-header="true"]');
      setIsTransparent(!!firstBlock);
    };
    
    checkTransparentHeader();
    // Observer les changements de blocs
    const observer = new MutationObserver(checkTransparentHeader);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  // Garder le comportement de blur au scroll même quand transparent (header hors flux)
  useEffect(() => {
    if (!isTransparent || typeof window === 'undefined') return;

    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isTransparent]);

  const headerBaseClasses = isTransparent
    ? 'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300'
    : 'sticky top-0 z-40 w-full transition-all duration-300';

  const headerSkinClasses = isTransparent
    ? scrolled
      ? 'bg-background/80 backdrop-blur border-b border-border'
      : 'bg-transparent backdrop-blur-none border-transparent'
    : 'bg-background/80 backdrop-blur border-b border-border';

  // Utilisation de la palette : bg-background/80 au lieu de bg-white/80, border-border au lieu de border-gray-200
  return (
    <header className={`${headerBaseClasses} ${headerSkinClasses}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${
        layout === 'compact' ? 'max-w-7xl' :
        layout === 'wide' ? 'max-w-custom-1920' :
        'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
      }`}>
        {renderHeaderContent()}
      </div>
      {open && (
        <div className={(overlayMobileOnly ? 'md:hidden ' : '') + 'border-t border-border'}>
          <div className="px-4 py-3 space-y-1">
            {model.items.map((item: any) => (
              <div key={item.key} className="block">
                <Link
                  href={item.href}
                  target={item.target}
                  // Utilisation de la palette : text-foreground et text-muted-foreground
                  // On garde text-sm font-medium pour la cohérence mobile, mais les couleurs viennent de la palette
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
