"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = ({ content, fullContent }) => {
  const [footerContent, setFooterContent] = useState(content);
  const [allPages, setAllPages] = useState([]);

  // Récupérer toutes les pages depuis l'API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/content');
        const data = await response.json();
        setAllPages(data.pages?.pages || []);
        console.log('🔍 Footer - Pages récupérées:', data.pages?.pages);
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
              <p className="text-sm text-gray-600">
                {footerContent.copyright || '© 2024 Soliva. Tous droits réservés.'}
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
                    let displayLabel, url, target;
                    if (customLabel && typeof customLabel === 'object') {
                      displayLabel = customLabel.title || defaultLabel;
                      url = customLabel.customUrl || page?.path || '#';
                      target = customLabel.target || '_blank';
                    } else {
                      displayLabel = customLabel || defaultLabel;
                      url = page?.path || '#';
                      target = '_self';
                    }
                    
                    return (
                      <li key={index}>
                        <Link 
                          href={url} 
                          target={target}
                          className="transition-colors hover:opacity-80 leading-tight text-gray-600"
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