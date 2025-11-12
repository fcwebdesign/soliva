'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook pour écouter les mises à jour de contenu et forcer le rechargement
 * Utilise 3 mécanismes pour garantir la détection :
 * 1. Événement 'content-updated' (immédiat)
 * 2. Vérification périodique de localStorage (fallback toutes les 2s)
 * 3. Écoute des changements de storage (onglets multiples)
 */
export function useContentUpdate(onUpdate: () => void, interval: number = 2000) {
  const lastUpdateTimeRef = useRef<string>('0');
  const onUpdateRef = useRef(onUpdate);

  // Mettre à jour la référence de la fonction callback
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    // Initialiser avec la valeur actuelle
    lastUpdateTimeRef.current = localStorage.getItem('content-updated') || '0';

    // Fonction de rechargement
    const handleUpdate = () => {
      onUpdateRef.current();
    };

    // 1. Écouter les mises à jour de contenu via événement
    const handleContentUpdate = () => {
      handleUpdate();
    };
    window.addEventListener('content-updated', handleContentUpdate);

    // 2. Vérifier régulièrement les changements dans localStorage (fallback)
    const checkForUpdates = () => {
      const currentUpdateTime = localStorage.getItem('content-updated') || '0';
      if (currentUpdateTime !== lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = currentUpdateTime;
        handleUpdate();
      }
    };

    // Vérifier toutes les X secondes si le contenu a été mis à jour
    const intervalId = setInterval(checkForUpdates, interval);

    // 3. Écouter les changements de storage (pour les onglets multiples)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'content-updated' && e.newValue !== lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = e.newValue || '0';
        handleUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [interval]);
}

/**
 * Fonction utilitaire pour faire un fetch avec headers anti-cache
 */
export function fetchContentWithNoCache(url: string): Promise<Response> {
  const timestamp = Date.now();
  const urlWithTimestamp = url.includes('?') 
    ? `${url}&t=${timestamp}` 
    : `${url}?t=${timestamp}`;
  
  return fetch(urlWithTimestamp, {
    cache: 'no-store',
    headers: { 
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

