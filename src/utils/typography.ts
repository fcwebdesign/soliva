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
  element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer',
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
  
  // Si une couleur personnalisée (hex) est définie, on l'appliquera via style inline
  // Sinon, on utilise la classe Tailwind (qui peut être un token de palette)
  const colorValue = elementConfig.color || defaults.color;
  const isCustomColor = colorValue && colorValue.startsWith('#');
  
  const classes = [
    elementConfig.fontSize || defaults.fontSize,
    elementConfig.fontWeight || defaults.fontWeight,
    elementConfig.lineHeight || defaults.lineHeight,
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
  element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer',
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
  }
};

