/**
 * Utilitaire centralisé pour gérer la configuration des transitions
 * 
 * PROBLÈME RÉSOLU : Évite les incohérences entre _transitionConfig à la racine
 * et metadata._transitionConfig en centralisant la logique de lecture/écriture.
 * 
 * RÈGLE IMPORTANTE : La config peut être à deux endroits :
 * 1. À la racine : content._transitionConfig (priorité)
 * 2. Dans metadata : content.metadata._transitionConfig (fallback)
 * 
 * Cette fonction garantit qu'on lit toujours depuis le bon endroit.
 */

export interface TransitionConfig {
  type: string;
  duration: number;
  easing: string;
  updatedAt?: string;
  customStyles?: string;
}

/**
 * Lit la configuration des transitions depuis un objet content
 * Cherche d'abord à la racine, puis dans metadata
 */
export function getTransitionConfig(content: any): TransitionConfig | null {
  if (!content) return null;
  
  // Priorité 1 : À la racine
  if (content._transitionConfig) {
    return content._transitionConfig;
  }
  
  // Priorité 2 : Dans metadata
  if (content.metadata?._transitionConfig) {
    return content.metadata._transitionConfig;
  }
  
  return null;
}

/**
 * Écrit la configuration des transitions dans un objet content
 * Sauvegarde aux DEUX endroits pour garantir la cohérence
 */
export function setTransitionConfig(
  content: any,
  config: TransitionConfig
): void {
  if (!content) return;
  
  // Créer metadata si nécessaire
  if (!content.metadata) {
    content.metadata = {};
  }
  
  // Sauvegarder aux deux endroits pour la cohérence
  content._transitionConfig = config;
  content.metadata._transitionConfig = config;
}

/**
 * Vérifie si une configuration de transition existe
 */
export function hasTransitionConfig(content: any): boolean {
  return getTransitionConfig(content) !== null;
}

