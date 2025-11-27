"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TransitionLink from './TransitionLink';

interface FooterLink {
  title: string;
  url: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface CustomLabel {
  title: string;
  customUrl?: string;
  target?: string;
}

interface FooterContent {
  logo?: string;
  logoImage?: string;
  description?: string;
  footerVariant?: string;
  links?: FooterLink[];
  socialLinks?: SocialLink[];
  copyright?: string;
  bottomLinks?: string[];
  legalPageLabels?: Record<string, string | CustomLabel>;
   stickyFooter?: {
    enabled?: boolean;
    height?: number;
  };
}

interface FooterProps {
  content: FooterContent;
  fullContent?: any;
}

interface Page {
  slug?: string;
  id?: string;
  title?: string;
}

const Footer: React.FC<FooterProps> = ({ content, fullContent }) => {
  const [footerContent, setFooterContent] = useState<FooterContent>(content);
  const [allPages, setAllPages] = useState<Page[]>([]);

  // Récupérer toutes les pages depuis l'API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/content');
        const data = await response.json();
        setAllPages(data.pages?.pages || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des pages:', error);
      }
    };

    fetchPages();
  }, []);

  useEffect(() => {
    setFooterContent(content);
  }, [content]);

  // Écouter les mises à jour du footer
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail?.footer) {
        setFooterContent(event.detail.footer);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'footer-updated') {
        window.location.reload();
      }
    };

    window.addEventListener('content-updated', handleContentUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [content]);

  if (!footerContent) {
    return null;
  }

  const VariantClassic = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="font-semibold text-xl" style={{ color: 'var(--fg)' }}>
          {footerContent.logoImage ? (
            <img src={footerContent.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
          ) : (
            footerContent.logo || 'soliva'
          )}
        </div>
        {footerContent.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>
            {footerContent.description}
          </p>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:justify-end gap-16">
        {footerContent.links && footerContent.links.length > 0 && (
          <div className="space-y-2">
            <ul className="space-y-1 text-left">
              {footerContent.links.map((link, index) => (
                <li key={index}>
                  <Link href={link.url || '#'} className="transition-colors text-sm hover:opacity-80 leading-tight" style={{ color: 'var(--fg)' }}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {footerContent.socialLinks && footerContent.socialLinks.length > 0 && (
          <div className="space-y-2">
            <ul className="space-y-1 text-left">
              {footerContent.socialLinks.map((social, index) => (
                <li key={index}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="transition-colors text-sm hover:opacity-80 leading-tight" style={{ color: 'var(--fg)' }}>
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const VariantColumns = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <div className="space-y-4">
        <div className="font-semibold text-xl" style={{ color: 'var(--fg)' }}>
          {footerContent.logoImage ? (
            <img src={footerContent.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
          ) : (
            footerContent.logo || 'soliva'
          )}
        </div>
        {footerContent.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>
            {footerContent.description}
          </p>
        )}
      </div>
      <div>
        {footerContent.links && footerContent.links.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Liens</div>
            <ul className="space-y-1">
              {footerContent.links.map((link, index) => (
                <li key={index}><Link href={link.url || '#'} className="text-sm text-gray-700 hover:text-gray-900">{link.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        {footerContent.socialLinks && footerContent.socialLinks.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Réseaux</div>
            <ul className="space-y-1">
              {footerContent.socialLinks.map((s, i) => (
                <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-gray-900">{s.platform}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const VariantCentered = () => (
    <div className="text-center space-y-4">
      <div className="font-semibold text-xl" style={{ color: 'var(--fg)' }}>
        {footerContent.logoImage ? (
          <img src={footerContent.logoImage} alt="Logo" className="h-8 mx-auto max-w-[200px] object-contain" />
        ) : (
          footerContent.logo || 'soliva'
        )}
      </div>
      {footerContent.description && (
        <p className="text-sm max-w-prose mx-auto text-gray-700">{footerContent.description}</p>
      )}
      {footerContent.links && footerContent.links.length > 0 && (
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {footerContent.links.map((l, i) => (
            <li key={i}><Link href={l.url || '#'} className="text-gray-700 hover:text-gray-900">{l.title}</Link></li>
          ))}
        </ul>
      )}
      {footerContent.socialLinks && footerContent.socialLinks.length > 0 && (
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {footerContent.socialLinks.map((s, i) => (
            <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">{s.platform}</a></li>
          ))}
        </ul>
      )}
    </div>
  );

  const VariantMinimal = () => null;

  const renderTop = () => {
    switch (footerContent.footerVariant || 'classic') {
      case 'columns':
        return <VariantColumns />;
      case 'centered':
        return <VariantCentered />;
      case 'minimal':
        return <VariantMinimal />;
      case 'classic':
      default:
        return <VariantClassic />;
    }
  };

  const footerElement = (
    <footer className="py-12" style={{ height: footerContent.stickyFooter?.enabled ? '100%' : undefined }}>
      <div className="mx-auto px-4 lg:px-6">
        {renderTop()}

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 footer-copyright-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Copyright - Colonne gauche */}
            <div className="text-left">
              <p className="text-sm text-gray-600">
                {footerContent.copyright || `© ${new Date().getFullYear()} ${footerContent.logo || 'Soliva'}. Tous droits réservés.`}
              </p>
            </div>
            
            {/* Liens du site - Colonne droite */}
            {footerContent.bottomLinks && footerContent.bottomLinks.length > 0 && (
              <div className="text-right">
                <ul className="flex flex-wrap justify-end gap-4 text-sm footer-custom-links">
                  {footerContent.bottomLinks.map((pageKey, index) => {
                    // Construire la liste des pages disponibles de manière dynamique
                    const availablePages = [
                      // Pages principales du site (toujours présentes)
                      { key: 'home', label: 'Accueil', path: '/' },
                      { key: 'work', label: 'Réalisations', path: '/work' },
                      { key: 'studio', label: 'Studio', path: '/studio' },
                      { key: 'blog', label: 'Journal', path: '/blog' },
                      { key: 'contact', label: 'Contact', path: '/contact' },
                      
                      // Pages légales et personnalisées (ajoutées automatiquement)
                      ...(allPages || []).map(page => ({
                        key: page.slug || page.id,
                        label: page.title || 'Page personnalisée',
                        path: `/${page.slug || page.id}`
                      }))
                    ];
                    
                    const page = availablePages.find(p => p.key === pageKey);
                    const defaultLabel = page?.label || pageKey;
                    const customLabel = footerContent.legalPageLabels?.[pageKey];
                    
                    // Gérer les liens personnalisés (objets) et les labels simples (chaînes)
                    let displayLabel: string, url: string, target: string;
                    if (customLabel && typeof customLabel === 'object') {
                      displayLabel = customLabel.title || defaultLabel;
                      url = customLabel.customUrl || page?.path || '#';
                      target = customLabel.target || '_blank';
                    } else {
                      displayLabel = (typeof customLabel === 'string' ? customLabel : '') || defaultLabel;
                      url = page?.path || '#';
                      target = '_self';
                    }
                    
                    return (
                      <li key={index}>
                        <TransitionLink 
                          href={url} 
                          target={target}
                          className="transition-colors hover:opacity-80 leading-tight text-gray-600"
                        >
                          {displayLabel}
                        </TransitionLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );

  // Effet sticky footer (inspiré Olivier Larose)
  if (footerContent.stickyFooter?.enabled) {
    const stickyHeight = footerContent.stickyFooter?.height || 800;
    return (
      <div 
        className="relative"
        style={{ height: `${stickyHeight}px`, clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      >
        <div 
          className="relative"
          style={{ height: `calc(100vh + ${stickyHeight}px)`, top: '-100vh' }}
        >
          <div 
            className="sticky w-full"
            style={{ top: `calc(100vh - ${stickyHeight}px)`, height: `${stickyHeight}px` }}
          >
            {footerElement}
          </div>
        </div>
      </div>
    );
  }

  return footerElement;
};

export default Footer;
