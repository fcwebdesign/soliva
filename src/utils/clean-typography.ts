/**
 * Utilitaires pour nettoyer et valider la structure typography
 * Empêche la corruption de typography qui pourrait contenir tout le contenu
 */

const VALID_TYPO_KEYS = ['h1', 'h2', 'h3', 'h4', 'h1Single', 'p', 'nav', 'footer', 'kicker'] as const;
const VALID_TYPO_PROPS = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'tracking', 'font'] as const;
const VALID_FONT_MODES = ['system', 'google', 'custom'] as const;
const VALID_FONT_NAMES = ['primary', 'secondary'] as const;

type FontSettings = {
  mode?: typeof VALID_FONT_MODES[number];
  family?: string;
  weights?: string;
  cssUrl?: string;
};

export type TypographyConfig = {
  [K in typeof VALID_TYPO_KEYS[number]]?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: typeof VALID_FONT_NAMES[number];
  };
} & {
  fonts?: {
    primary?: FontSettings;
    secondary?: FontSettings;
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

  const isValidFontMode = (mode: any): mode is FontSettings['mode'] => {
    return typeof mode === 'string' && VALID_FONT_MODES.includes(mode as any);
  };

  const sanitizeFontSettings = (font: any): FontSettings | undefined => {
    if (!font || typeof font !== 'object') return undefined;

    if (suspiciousKeys.some(sk => sk in font)) return undefined;

    const hasAnyValue = typeof font.mode === 'string' || typeof font.family === 'string' || typeof font.weights === 'string' || typeof font.cssUrl === 'string';
    if (!hasAnyValue) return undefined;

    const cleanedFont: FontSettings = {
      mode: isValidFontMode(font.mode) ? font.mode : 'system'
    };

    if (typeof font.family === 'string' && font.family.trim()) {
      cleanedFont.family = font.family.trim();
    }
    if (typeof font.weights === 'string' && font.weights.trim()) {
      cleanedFont.weights = font.weights.trim();
    }
    if (typeof font.cssUrl === 'string' && font.cssUrl.trim()) {
      cleanedFont.cssUrl = font.cssUrl.trim();
    }

    return cleanedFont;
  };

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
          if (prop === 'font') {
            // N'accepter que primary/secondary
            if (VALID_FONT_NAMES.includes(value[prop] as any)) {
              cleanedValue[prop] = value[prop];
            }
          } else {
            cleanedValue[prop] = value[prop];
          }
        }
      }

      if (Object.keys(cleanedValue).length > 0) {
        cleaned[key] = cleanedValue;
      }
    }
  }

  if (typography.fonts && typeof typography.fonts === 'object') {
    const primary = sanitizeFontSettings(typography.fonts.primary);
    const secondary = sanitizeFontSettings(typography.fonts.secondary);

    const cleanedFonts: NonNullable<TypographyConfig['fonts']> = {};

    if (primary) {
      cleanedFonts.primary = primary;
    }
    if (secondary) {
      cleanedFonts.secondary = secondary;
    }

    if (Object.keys(cleanedFonts).length > 0) {
      cleaned.fonts = cleanedFonts;
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
  const allowedKeys = [...VALID_TYPO_KEYS, 'fonts'];
  const allKeysValid = keys.every(key => allowedKeys.includes(key as any));
  
  if (!allKeysValid) {
    return false;
  }

  const isValidFontMode = (mode: any): mode is FontSettings['mode'] => {
    return typeof mode === 'string' && VALID_FONT_MODES.includes(mode as any);
  };

  const validateFontSettings = (font: any): boolean => {
    if (font === undefined) return true; // Slot absent = OK
    if (font === null || typeof font !== 'object') return false;

    if (suspiciousKeys.some(sk => sk in font)) return false;
    if (font.mode !== undefined && !isValidFontMode(font.mode)) return false;
    if (font.family !== undefined && typeof font.family !== 'string') return false;
    if (font.weights !== undefined && typeof font.weights !== 'string') return false;
    if (font.cssUrl !== undefined && typeof font.cssUrl !== 'string') return false;

    return true;
  };

  // Vérifier que les valeurs sont des objets simples avec les bonnes propriétés
  for (const key of keys) {
    const value = typography[key];
    if (key === 'fonts') {
      if (value === null || typeof value !== 'object') return false;
      if (!validateFontSettings((value as any).primary)) return false;
      if (!validateFontSettings((value as any).secondary)) return false;
      continue;
    }

    if (typeof value !== 'object' || value === null) {
      return false;
    }
    
    // Vérifier qu'il n'y a pas de données suspectes dans les valeurs
    if (suspiciousKeys.some(sk => sk in value)) {
      return false;
    }

    // Vérifier le champ font (primary/secondary)
    if ('font' in value && value.font !== undefined) {
      if (typeof (value as any).font !== 'string' || !VALID_FONT_NAMES.includes((value as any).font as any)) {
        return false;
      }
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
