"use client";
import { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { getTypographyConfig, getTypographyClasses, defaultTypography } from "@/utils/typography";

type PageLink = { slug?: string; id?: string; title?: string };

export default function FooterPearl({ footer, pages, layout = 'standard', fullContent }: { footer?: any; pages?: { pages?: PageLink[] }; layout?: string; fullContent?: any }) {
  const pathname = usePathname(); // Pour détecter les changements de page
  
  // Refs pour le sticky footer
  const containerRef = useRef<HTMLDivElement>(null);
  const footerElementRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const [hasEnoughContent, setHasEnoughContent] = useState(true); // Déclaré en haut
  
  // Récupérer les styles typographiques pour le footer
  const typoConfig = getTypographyConfig(fullContent || {});
  const footerClasses = getTypographyClasses('footer', typoConfig, defaultTypography.footer);
  const year = new Date().getFullYear();
  const copyright = footer?.copyright || ('© ' + year + ' Pearl. Tous droits réservés.');
  const links: string[] = footer?.bottomLinks || [];
  const labelMap: Record<string, string | { title: string; customUrl?: string; target?: string }> = footer?.legalPageLabels || {};
  const allPages = pages?.pages || [];

  const defaultPages = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
  ];

  const customPages = allPages.map(p => ({ key: p.slug || p.id, label: p.title || 'Page', path: '/' + (p.slug || p.id) }));
  const available = [...defaultPages, ...customPages];

  // Helper pour normaliser les URLs des liens de navigation
  const normalizeUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('/')) return url;
    if (url.startsWith('http')) return url;
    // Mapper les clés vers les chemins
    const page = available.find(p => p.key === url);
    return page?.path || `/${url}`;
  };

  const isInternalUrl = (url: string) => {
    const normalized = normalizeUrl(url);
    return normalized.startsWith('/') && !normalized.startsWith('//');
  };

  const VariantClassic = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="space-y-4">
        <div className="text-xl font-bold tracking-tight text-foreground">
          {footer?.logoImage ? (
            <img src={footer.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
          ) : (
            footer?.logo || 'Pearl'
          )}
        </div>
        {footer?.description && (
          <p className={`max-w-prose ${footerClasses}`}>{footer.description}</p>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:justify-end gap-12">
        {Array.isArray(footer?.links) && footer.links.length > 0 && (
          <div className="space-y-2 text-left">
            <ul className="space-y-1">
              {footer.links.map((l: any, idx: number) => {
                const href = normalizeUrl(l.url);
                const isInternal = isInternalUrl(l.url);
                return (
                  <li key={idx}>
                    {isInternal ? (
                      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">{l.title}</Link>
                    ) : (
                      <a href={href} className="text-sm text-muted-foreground hover:text-foreground">{l.title}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
          <div className="space-y-2 text-left">
            <ul className="space-y-1">
              {footer.socialLinks.map((s: any, idx: number) => (
                <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">{s.platform}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const VariantColumns = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
      <div className="space-y-4">
        <div className="text-xl font-bold tracking-tight text-foreground">
          {footer?.logoImage ? (
            <img src={footer.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
          ) : (
            footer?.logo || 'Pearl'
          )}
        </div>
        {footer?.description && (
          <p className={`max-w-prose ${footerClasses}`}>{footer.description}</p>
        )}
      </div>
      <div>
        {Array.isArray(footer?.links) && footer.links.length > 0 && (
          <div className="space-y-2 text-left">
            <div className="text-sm font-semibold text-foreground">Liens</div>
            <ul className="space-y-1">
              {footer.links.map((l: any, idx: number) => {
                const href = normalizeUrl(l.url);
                const isInternal = isInternalUrl(l.url);
                return (
                  <li key={idx}>
                    {isInternal ? (
                      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">{l.title}</Link>
                    ) : (
                      <a href={href} className="text-sm text-muted-foreground hover:text-foreground">{l.title}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div>
        {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
          <div className="space-y-2 text-left">
            <div className="text-sm font-semibold text-foreground">Réseaux</div>
            <ul className="space-y-1">
              {footer.socialLinks.map((s: any, idx: number) => (
                <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">{s.platform}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const VariantCentered = () => (
    <div className="text-center space-y-4 mb-8">
      <div className="text-xl font-bold tracking-tight text-foreground">
        {footer?.logoImage ? (
          <img src={footer.logoImage} alt="Logo" className="h-8 mx-auto max-w-[200px] object-contain" />
        ) : (
          footer?.logo || 'Pearl'
        )}
      </div>
      {footer?.description && (
        <p className={`max-w-prose mx-auto ${footerClasses}`}>{footer.description}</p>
      )}
      {Array.isArray(footer?.links) && footer.links.length > 0 && (
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {footer.links.map((l: any, idx: number) => {
            const href = normalizeUrl(l.url);
            const isInternal = isInternalUrl(l.url);
            return (
              <li key={idx}>
                {isInternal ? (
                  <Link href={href} className="text-muted-foreground hover:text-foreground">{l.title}</Link>
                ) : (
                  <a href={href} className="text-muted-foreground hover:text-foreground">{l.title}</a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {footer.socialLinks.map((s: any, idx: number) => (
            <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">{s.platform}</a></li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderTop = () => {
    switch (footer?.footerVariant || 'classic') {
      case 'columns':
        return <VariantColumns />;
      case 'centered':
        return <VariantCentered />;
      case 'minimal':
        return null;
      case 'classic':
      default:
        return <VariantClassic />;
    }
  };

  // Contenu du footer (réutilisable)
  const footerContent = (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
      layout === 'compact' ? 'max-w-7xl' :
      layout === 'wide' ? 'max-w-custom-1920' :
      'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
    }`}>
      {renderTop()}

      {/* Bas de page: copyright + liens */}
      <div className={`border-t border-border pt-6 text-center ${footerClasses}`}>
        <p>{copyright}</p>
        {links.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-4 justify-center">
            {links.map((key) => {
              const page = available.find(p => p.key === key);
              const meta = labelMap[key];
              let label = page?.label || key;
              let href = page?.path || '#';
              let target: '_self'|'_blank' = '_self';
              if (typeof meta === 'string') label = meta;
              if (meta && typeof meta === 'object') { label = meta.title || label; href = meta.customUrl || href; target = meta.target === '_blank' ? '_blank' : '_self'; }
              const isInternal = href.startsWith('/') && target === '_self';
              return (
                <li key={key}>
                  {isInternal ? (
                    <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                  ) : (
                    <a href={href} target={target} className="text-muted-foreground hover:text-foreground transition-colors" rel={target === '_blank' ? 'noopener noreferrer' : undefined}>{label}</a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  // Calculer automatiquement la hauteur du footer
  useEffect(() => {
    if (!footer?.stickyFooter?.enabled) return;
    
    const updateHeight = () => {
      if (footerElementRef.current) {
        const height = footerElementRef.current.offsetHeight;
        if (height > 0 && height !== footerHeight) {
          setFooterHeight(height);
        }
      }
    };
    
    // Calculer la hauteur après un court délai pour que le DOM soit prêt
    const timeout = setTimeout(updateHeight, 100);
    
    // Recalculer si la fenêtre change de taille
    window.addEventListener('resize', updateHeight);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateHeight);
    };
  }, [footer?.stickyFooter?.enabled, footer, footerHeight]);
  
  // Pas besoin d'animation GSAP - la démo utilise CSS sticky pur

  // Callback ref pour mesurer la hauteur du footer
  const measureFooterRef = (element: HTMLElement | null) => {
    if (element) {
      footerElementRef.current = element;
      if (footer?.stickyFooter?.enabled) {
        setTimeout(() => {
          const height = element.offsetHeight;
          if (height > 0 && height !== footerHeight) {
            setFooterHeight(height);
          }
        }, 100);
      }
    }
  };

  // Vérifier si le contenu est assez haut pour permettre l'animation
  useEffect(() => {
    // Réinitialiser à chaque changement de page
    setHasEnoughContent(true);
    
    if (!footer?.stickyFooter?.enabled) return;
    
    const checkContentHeight = () => {
      const mainElement = document.querySelector('main') || document.body;
      const viewportHeight = window.innerHeight;
      const mainHeight = mainElement.scrollHeight;
      
      // Désactiver si le contenu principal est plus petit que le viewport + la hauteur du footer
      // Il faut au moins viewport + footerHeight pour que l'animation fonctionne
      const minRequiredHeight = viewportHeight + footerHeight;
      const enoughContent = mainHeight >= minRequiredHeight;
      
      setHasEnoughContent(enoughContent);
    };
    
    // Attendre un peu que le DOM soit prêt après le changement de page
    const timeout = setTimeout(checkContentHeight, 100);
    window.addEventListener('resize', checkContentHeight);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkContentHeight);
    };
  }, [footer?.stickyFooter?.enabled, footerHeight, pathname]); // pathname dans les dépendances

  // Si sticky est activé, hauteur calculée ET contenu suffisant, appliquer l'effet sticky
  // Structure exacte de la démo Footer1.jsx
  if (footer?.stickyFooter?.enabled && footerHeight > 0 && hasEnoughContent) {
    return (
      <>
        {/* Footer invisible pour mesurer (toujours présent pour le calcul) */}
        <footer 
          ref={measureFooterRef} 
          className="bg-muted border-t border-border"
          style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none', top: '-9999px' }}
        >
          {footerContent}
        </footer>
        
        {/* Structure exacte de la démo Footer1.jsx */}
        <div
          ref={containerRef}
          className="relative"
          style={{ 
            height: `${footerHeight}px`,
            clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" // Toujours visible comme dans la démo
          }}
        >
          {/* Div avec hauteur calculée et top négatif pour créer l'espace de scroll - exactement comme la démo */}
          <div 
            className="relative"
            style={{ 
              height: `calc(100vh + ${footerHeight}px)`,
              top: `-100vh`
            }}
          >
            {/* Div sticky qui reste collé en bas pendant le scroll - exactement comme la démo */}
            <div 
              style={{ 
                height: `${footerHeight}px`,
                position: 'sticky',
                top: `calc(100vh - ${footerHeight}px)`
              }}
            >
              <footer className="bg-muted border-t border-border">
                {footerContent}
              </footer>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Footer normal si sticky désactivé ou hauteur pas encore calculée
  return (
    <footer ref={measureFooterRef} className="bg-muted border-t border-border">
      {footerContent}
    </footer>
  );
}
