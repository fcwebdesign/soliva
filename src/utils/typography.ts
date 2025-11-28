/**
 * Utilitaire pour appliquer les styles typographiques depuis le BO
 */

export interface TypographyConfig {
  h1?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  h2?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  h3?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  h4?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  h1Single?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  p?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  nav?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  footer?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
  kicker?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
  };
}

/**
 * Récupère la configuration typographique depuis le contenu
 */
export function getTypographyConfig(content: any): TypographyConfig {
  return content?.metadata?.typography || {};
}

/**
 * Génère les classes CSS pour un élément typographique
 */
export function getTypographyClasses(
  element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer' | 'kicker',
  config: TypographyConfig,
  defaults: {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    color: string;
    tracking: string;
  }
): string {
  const elementConfig = config[element] || {};
  const normalizeLineHeight = (val: string | undefined) => {
    if (!val) return val;
    const trimmed = val.trim();
    // Si c'est déjà une classe leading-[...], la retourner telle quelle
    if (/^leading-\[/.test(trimmed)) {
      return trimmed;
    }
    // Si c'est un nombre, on ne l'ajoute pas aux classes (on l'appliquera via style inline)
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return null; // Ne pas ajouter aux classes, sera appliqué via style inline
    }
    return trimmed;
  };
  
  // Si une couleur personnalisée (hex) est définie, on l'appliquera via style inline
  // Sinon, on utilise la classe Tailwind (qui peut être un token de palette)
  const colorValue = elementConfig.color || defaults.color;
  const isCustomColor = colorValue && colorValue.startsWith('#');
  const lineHeightValue = normalizeLineHeight(elementConfig.lineHeight) || normalizeLineHeight(defaults.lineHeight);
  
  const classes = [
    elementConfig.fontSize || defaults.fontSize,
    elementConfig.fontWeight || defaults.fontWeight,
    // Ne pas ajouter lineHeight si c'est une valeur numérique (sera appliqué via style inline)
    lineHeightValue,
    // Si c'est une couleur hex, on ne l'ajoute pas aux classes (on l'appliquera via style)
    // Sinon, on ajoute la classe Tailwind
    !isCustomColor ? colorValue : null,
    elementConfig.tracking || defaults.tracking,
  ].filter(Boolean).join(' ');
  
  return classes;
}


/**
 * Récupère la couleur personnalisée (hex) si elle existe, sinon null
 */
export function getCustomColor(
  element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer' | 'kicker',
  config: TypographyConfig
): string | null {
  const elementConfig = config[element];
  if (!elementConfig?.color) return null;
  
  // Si c'est une couleur hex, la retourner
  if (elementConfig.color.startsWith('#')) {
    return elementConfig.color;
  }
  
  return null;
}

/**
 * Récupère le line-height personnalisé (numérique) si il existe, sinon null
 * Les valeurs numériques seront appliquées via style inline pour éviter les conflits CSS
 */
export function getCustomLineHeight(
  element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer' | 'kicker',
  config: TypographyConfig
): string | null {
  const elementConfig = config[element];
  if (!elementConfig?.lineHeight) return null;
  
  const trimmed = elementConfig.lineHeight.trim();
  
  // Si c'est déjà une classe leading-[...], extraire la valeur
  const match = trimmed.match(/^leading-\[([^\]]+)\]$/);
  if (match) {
    return match[1];
  }
  
  // Si c'est un nombre pur (ex: "0.75"), le retourner
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }
  
  return null;
}

/**
 * Classes par défaut pour chaque élément (valeurs Pearl actuelles)
 */
export const defaultTypography = {
  h1: {
    fontSize: 'text-fluid-10xl',
    fontWeight: 'font-medium',
    lineHeight: 'leading-none',
    color: 'text-gray-900',
    tracking: 'tracking-tighter'
  },
  h2: {
    fontSize: 'text-fluid-4xl',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-tight',
    color: 'text-gray-900',
    tracking: 'tracking-tight'
  },
  h3: {
    fontSize: 'text-lg',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-normal',
    color: 'text-gray-900',
    tracking: 'tracking-normal'
  },
  h4: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
    color: 'text-gray-600',
    tracking: 'tracking-normal'
  },
  h1Single: {
    fontSize: 'text-fluid-10xl',
    fontWeight: 'font-medium',
    lineHeight: 'leading-none',
    color: 'text-gray-900',
    tracking: 'tracking-tighter'
  },
  p: {
    fontSize: 'text-base',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
    color: 'text-gray-700',
    tracking: 'tracking-normal'
  },
  nav: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
    color: 'text-gray-500',
    tracking: 'tracking-normal'
  },
  footer: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
    color: 'text-gray-600',
    tracking: 'tracking-normal'
  },
  kicker: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
    color: 'text-gray-500',
    tracking: 'tracking-wider'
  }
};
