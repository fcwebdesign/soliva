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
  
  return [
    elementConfig.fontSize || defaults.fontSize,
    elementConfig.fontWeight || defaults.fontWeight,
    elementConfig.lineHeight || defaults.lineHeight,
    elementConfig.color || defaults.color,
    elementConfig.tracking || defaults.tracking,
  ].filter(Boolean).join(' ');
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

