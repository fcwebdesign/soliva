"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = ({ content }) => {
  const [footerContent, setFooterContent] = useState(content);

  useEffect(() => {
    setFooterContent(content);
  }, [content]);

  // Écouter les mises à jour du footer
  useEffect(() => {
    const handleContentUpdate = (event) => {
      if (event.detail?.footer) {
        console.log('🔄 Footer: Mise à jour reçue', event.detail.footer);
        setFooterContent(event.detail.footer);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'footer-updated') {
        console.log('🔄 Footer: Changement détecté via localStorage, rechargement...');
        window.location.reload();
      }
    };

    window.addEventListener('content-updated', handleContentUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [content]);

  if (!footerContent) {
    return null;
  }

  console.log('🔍 Footer Debug:', {
    bottomLinks: footerContent.bottomLinks,
    legalPageLabels: footerContent.legalPageLabels,
    footerContent
  });



  return (
    <footer className="py-12">
      <div className="mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo et Description - Colonne gauche */}
          <div className="space-y-4">
            <div className="font-semibold text-xl" style={{ color: 'var(--fg)' }}>
              {footerContent.logoImage ? (
                <img 
                  src={footerContent.logoImage} 
                  alt="Logo" 
                  className="h-8 max-w-[200px] object-contain"
                />
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

          {/* Liens et Réseaux sociaux - Colonne droite */}
          <div className="flex flex-col md:flex-row md:justify-end gap-48">
            {/* Liens */}
            {footerContent.links && footerContent.links.length > 0 && (
              <div className="space-y-4">
                <ul className="space-y-1 text-left">
                  {footerContent.links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.url || '#'} 
                        className="transition-colors text-sm hover:opacity-80 leading-tight"
                        style={{ color: 'var(--fg)' }}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Réseaux sociaux */}
            {footerContent.socialLinks && footerContent.socialLinks.length > 0 && (
              <div className="space-y-4">
                <ul className="space-y-1 text-left">
                  {footerContent.socialLinks.map((social, index) => (
                    <li key={index}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors text-sm hover:opacity-80 leading-tight"
                        style={{ color: 'var(--fg)' }}
                      >
                        {social.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 footer-copyright-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Copyright - Colonne gauche */}
            <div className="text-left">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {footerContent.copyright || '© 2024 Soliva. Tous droits réservés.'}
              </p>
            </div>
            
            {/* Liens du site - Colonne droite */}
            {footerContent.bottomLinks && footerContent.bottomLinks.length > 0 && (
              <div className="text-right">
                <ul className="flex flex-wrap justify-end gap-4 text-sm">
                  {footerContent.bottomLinks.map((pageKey, index) => {
                    // Trouver la page correspondante
                    const availablePages = [
                      { key: 'home', label: 'Accueil', path: '/' },
                      { key: 'work', label: 'Réalisations', path: '/work' },
                      { key: 'studio', label: 'Studio', path: '/studio' },
                      { key: 'blog', label: 'Journal', path: '/blog' },
                      { key: 'contact', label: 'Contact', path: '/contact' },
                      { key: 'mentions-legales', label: 'Mentions légales', path: '/mentions-legales' },
                      { key: 'politique-confidentialite', label: 'Politique de confidentialité', path: '/politique-confidentialite' },
                      { key: 'cgu', label: 'Conditions générales d\'utilisation', path: '/cgu' },
                      { key: 'cookies', label: 'Politique des cookies', path: '/cookies' },
                      { key: 'rgpd', label: 'RGPD', path: '/rgpd' },
                      { key: 'mentions-obligatoires', label: 'Mentions obligatoires', path: '/mentions-obligatoires' },
                      // Ajouter automatiquement les pages personnalisées
                      ...(content?.pages?.pages || []).map(page => ({
                        key: page.slug || page.id,
                        label: page.title || 'Page personnalisée',
                        path: `/${page.slug || page.id}`
                      }))
                    ];
                    
                    const page = availablePages.find(p => p.key === pageKey);
                    const defaultLabel = page?.label || pageKey;
                    const customLabel = footerContent.legalPageLabels?.[pageKey];
                    const displayLabel = customLabel || defaultLabel;
                    const url = page?.path || '#';
                    
                    return (
                      <li key={index}>
                        <Link 
                          href={url} 
                          className="transition-colors hover:opacity-80 leading-tight"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {displayLabel}
                        </Link>
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
};

export default Footer; 