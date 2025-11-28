/**
 * Utilitaires pour nettoyer et valider la structure typography
 * Empêche la corruption de typography qui pourrait contenir tout le contenu
 */

const VALID_TYPO_KEYS = ['h1', 'h2', 'h3', 'h4', 'h1Single', 'p', 'nav', 'footer', 'kicker'] as const;
const VALID_TYPO_PROPS = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'tracking'] as const;

export type TypographyConfig = {
  [K in typeof VALID_TYPO_KEYS[number]]?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
};

/**
 * Nettoie un objet typography pour garder seulement les clés et propriétés valides
 * Supprime toute donnée corrompue qui pourrait contenir tout le contenu
 */
export function cleanTypography(typography: any): TypographyConfig {
  if (!typography || typeof typography !== 'object') {
    return {};
  }

  // Détecter si typography est corrompu (contient des clés qui ne devraient pas être là)
  // EXCLURE les clés valides de typography de la liste des suspectes
  const suspiciousKeys = ['_template', 'metadata', 'home', 'site', 'work', 'blog', 'contact', 'studio'];
  const hasSuspiciousKeys = suspiciousKeys.some(key => key in typography);
  
  if (hasSuspiciousKeys) {
    console.warn('⚠️ Typography corrompu détecté, nettoyage complet...');
    return {};
  }

  const cleaned: TypographyConfig = {};

  for (const key of VALID_TYPO_KEYS) {
    if (typography[key] && typeof typography[key] === 'object') {
      const value = typography[key];
      
      // Vérifier que la valeur ne contient pas de données corrompues
      if (suspiciousKeys.some(sk => sk in value)) {
        console.warn(`⚠️ Clé typography "${key}" corrompue, ignorée`);
        continue;
      }

      // Nettoyer pour garder seulement les propriétés valides
      const cleanedValue: any = {};
      for (const prop of VALID_TYPO_PROPS) {
        if (value[prop] !== undefined && typeof value[prop] === 'string') {
          cleanedValue[prop] = value[prop];
        }
      }

      if (Object.keys(cleanedValue).length > 0) {
        cleaned[key] = cleanedValue;
      }
    }
  }

  return cleaned;
}

/**
 * Valide qu'un objet typography est valide (pas corrompu)
 */
export function isValidTypography(typography: any): boolean {
  if (!typography || typeof typography !== 'object') {
    return false;
  }

  // Vérifier qu'il n'y a pas de clés suspectes
  // EXCLURE les clés valides de typography de la liste des suspectes
  const suspiciousKeys = ['_template', 'metadata', 'home', 'site', 'work', 'blog', 'contact', 'studio'];
  if (suspiciousKeys.some(key => key in typography)) {
    return false;
  }

  // Vérifier que toutes les clés sont valides
  const keys = Object.keys(typography);
  const allKeysValid = keys.every(key => VALID_TYPO_KEYS.includes(key as any));
  
  if (!allKeysValid) {
    return false;
  }

  // Vérifier que les valeurs sont des objets simples avec les bonnes propriétés
  for (const key of keys) {
    const value = typography[key];
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    
    // Vérifier qu'il n'y a pas de données suspectes dans les valeurs
    if (suspiciousKeys.some(sk => sk in value)) {
      return false;
    }
  }

  return true;
}

/**
 * Nettoie récursivement typography dans un objet (pour nettoyer reveal.typography, etc.)
 */
export function cleanTypographyRecursive(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanTypographyRecursive(item));
  }

  const cleaned: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'typography' && typeof value === 'object' && value !== null) {
      // Nettoyer typography partout où il apparaît
      cleaned[key] = cleanTypography(value);
    } else if (typeof value === 'object' && value !== null) {
      // Nettoyer récursivement
      cleaned[key] = cleanTypographyRecursive(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

