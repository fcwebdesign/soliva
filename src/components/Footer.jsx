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

  const getSocialIcon = (platform) => {
    const icons = {
      linkedin: '💼',
      twitter: '🐦',
      instagram: '📸',
      facebook: '📘',
      youtube: '📺',
      tiktok: '🎵',
      behance: '🎨',
      dribbble: '🏀',
      github: '💻',
      medium: '📝',
      pinterest: '📌',
      snapchat: '👻',
      twitch: '🎮',
      discord: '💬',
      telegram: '📱',
      whatsapp: '💚',
      spotify: '🎵',
      'apple-music': '🍎',
      soundcloud: '🎧',
      vimeo: '🎬'
    };
    return icons[platform] || '🔗';
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et Description */}
          <div className="space-y-4">
            <div className="font-semibold text-xl">
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
              <p className="text-gray-300 text-sm leading-relaxed">
                {footerContent.description}
              </p>
            )}
          </div>

          {/* Liens */}
          {footerContent.links && footerContent.links.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Liens</h3>
              <ul className="space-y-2">
                {footerContent.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.url || '#'} 
                      className="text-gray-300 hover:text-white transition-colors text-sm"
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
              <h3 className="font-semibold text-lg">Suivez-nous</h3>
              <div className="flex space-x-4">
                {footerContent.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors text-2xl"
                    title={social.platform}
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {footerContent.copyright || '© 2024 Soliva. Tous droits réservés.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 