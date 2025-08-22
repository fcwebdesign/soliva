"use client";
import { useState, useEffect } from 'react';
import Footer from './Footer';

const FooterWrapper = ({ initialContent }) => {
  const [footerContent, setFooterContent] = useState(initialContent);

  useEffect(() => {
    const handleContentUpdate = (event) => {
      if (event.detail?.footer) {
        console.log('🔄 FooterWrapper: Mise à jour reçue', event.detail.footer);
        setFooterContent(event.detail.footer);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'footer-updated') {
        console.log('🔄 FooterWrapper: Changement détecté via localStorage, rechargement...');
        window.location.reload();
      }
    };

    window.addEventListener('content-updated', handleContentUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialContent]);

  return <Footer content={footerContent} />;
};

export default FooterWrapper; 