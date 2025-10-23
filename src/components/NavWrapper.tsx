"use client";
import { useState, useEffect } from 'react';
import Nav from './Nav';

interface NavWrapperProps {
  initialContent: any;
}

const NavWrapper: React.FC<NavWrapperProps> = ({ initialContent }) => {
  const [navContent, setNavContent] = useState(initialContent);

  // Écouter les changements de contenu via un événement personnalisé
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('🔄 NavWrapper: Événement content-updated reçu', event.detail);
      if (event.detail?.nav) {
        console.log('✅ NavWrapper: Mise à jour du nav avec', event.detail.nav);
        setNavContent(event.detail.nav);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nav-updated') {
        console.log('🔄 NavWrapper: Changement détecté via localStorage, rechargement...');
        window.location.reload();
      }
    };

    // Écouter l'événement
    window.addEventListener('content-updated', handleContentUpdate as EventListener);
    
    // Écouter les changements de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialContent]);


  // Fonction pour forcer la mise à jour (pour debug)
  useEffect(() => {
    (window as any).forceNavUpdate = (newNavContent: any) => {
      console.log('🔄 NavWrapper: Mise à jour forcée', newNavContent);
      setNavContent(newNavContent);
    };
  }, []);

  return <Nav content={navContent} />;
};

export default NavWrapper; 