"use client";
import { useState, useEffect } from 'react';

interface SocialLink {
  url?: string;
  target?: string;
  platform?: string;
}

interface MinimalisteFooterProps {
  content: {
    socials?: SocialLink[];
    socialLinks?: SocialLink[];
  };
}

const MinimalisteFooter: React.FC<MinimalisteFooterProps> = ({ content }) => {
  const [footerContent, setFooterContent] = useState(content);

  useEffect(() => {
    setFooterContent(content);
  }, [content]);

  // Écouter les mises à jour du footer
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail?.footer) {
        console.log('🔄 MinimalisteFooter: Mise à jour reçue', event.detail.footer);
        setFooterContent(event.detail.footer);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'footer-updated') {
        console.log('🔄 MinimalisteFooter: Changement détecté via localStorage, rechargement...');
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

  return (
    <footer className="border-t border-black/5">
      <div className="container h-[80px] flex items-center justify-between text-sm text-black/60">
        <p>© {new Date().getFullYear()} Studio — Tous droits réservés</p>
        <div className="flex items-center gap-6">
          {(footerContent.socials || footerContent.socialLinks || []).map((social, index) => (
            <a 
              key={index} 
              href={social.url || "#"} 
              target={social.target || "_blank"}
              className="hover:text-black transition-colors capitalize"
            >
              {social.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default MinimalisteFooter;
