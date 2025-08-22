"use client";
import { useState, useEffect } from 'react';
import Nav from './Nav';

const NavWrapper = ({ initialContent }) => {
  const [navContent, setNavContent] = useState(initialContent);

  // Écouter les changements de contenu via un événement personnalisé
  useEffect(() => {
    const handleContentUpdate = (event) => {
      console.log('🔄 NavWrapper: Événement content-updated reçu', event.detail);
      if (event.detail?.nav) {
        console.log('✅ NavWrapper: Mise à jour du nav avec', event.detail.nav);
        setNavContent(event.detail.nav);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'nav-updated') {
        console.log('🔄 NavWrapper: Changement détecté via localStorage, rechargement...');
        window.location.reload();
      }
    };

    // Écouter l'événement
    window.addEventListener('content-updated', handleContentUpdate);
    
    // Écouter les changements de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Log initial
    console.log('🚀 NavWrapper: Initialisé avec', initialContent);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialContent]);

  // Log quand navContent change
  useEffect(() => {
    console.log('📝 NavWrapper: navContent mis à jour', navContent);
  }, [navContent]);

  // Fonction pour forcer la mise à jour (pour debug)
  useEffect(() => {
    window.forceNavUpdate = (newNavContent) => {
      console.log('🔄 NavWrapper: Mise à jour forcée', newNavContent);
      setNavContent(newNavContent);
    };
  }, []);

  return <Nav content={navContent} />;
};

export default NavWrapper; 