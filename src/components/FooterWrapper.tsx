"use client";
import { useState, useEffect } from 'react';
import Footer from './Footer';

interface FooterWrapperProps {
  initialContent: any;
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ initialContent }) => {
  const [footerContent, setFooterContent] = useState(initialContent);
  const [hasContactBlockLast, setHasContactBlockLast] = useState(false);

  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail?.footer) {
        console.log('🔄 FooterWrapper: Mise à jour reçue', event.detail.footer);
        setFooterContent(event.detail.footer);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'footer-updated') {
        console.log('🔄 FooterWrapper: Changement détecté via localStorage, rechargement...');
        window.location.reload();
      }
    };

    // Détecter si le dernier bloc est un bloc contact
    const detectLastContactBlock = () => {
      const blocks = document.querySelectorAll('[data-block-type]');
      if (blocks.length > 0) {
        const lastBlock = blocks[blocks.length - 1];
        const isLastBlockContact = lastBlock.getAttribute('data-block-type') === 'contact';
        setHasContactBlockLast(isLastBlockContact);
        console.log('🔍 FooterWrapper: Dernier bloc est contact:', isLastBlockContact);
        
        // Ajouter/supprimer la classe CSS au body
        if (isLastBlockContact) {
          document.body.classList.add('contact-block-last');
        } else {
          document.body.classList.remove('contact-block-last');
        }
      }
    };

    // Détecter immédiatement et après un délai pour les blocs qui se chargent
    detectLastContactBlock();
    const timeoutId = setTimeout(detectLastContactBlock, 1000);

    window.addEventListener('content-updated', handleContentUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timeoutId);
      document.body.classList.remove('contact-block-last');
    };
  }, [initialContent]);

  return <Footer content={footerContent} fullContent={initialContent} />;
};

export default FooterWrapper; 