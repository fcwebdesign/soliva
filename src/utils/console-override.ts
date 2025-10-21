/**
 * Override console.log en production pour éviter les logs inutiles
 * Ce fichier doit être importé le plus tôt possible dans l'application
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // En production côté client, désactiver les console.log
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  
  // Garder console.warn et console.error pour les vrais problèmes
}

// Export vide pour permettre l'import
export {};

