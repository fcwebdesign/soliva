/**
 * Utilitaire pour appliquer les styles typographiques depuis le BO
 */

export const SYSTEM_FONT_FALLBACK = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

export type TypographyFontSettings = {
  mode?: 'system' | 'google' | 'custom';
  family?: string;
  weights?: string;
  cssUrl?: string;
};

export interface TypographyConfig {
  h1?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  h2?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  h3?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  h4?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  h1Single?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  p?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  nav?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  footer?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  kicker?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    color?: string;
    tracking?: string;
    font?: 'primary' | 'secondary';
  };
  fonts?: {
    primary?: TypographyFontSettings;
    secondary?: TypographyFontSettings;
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
    font?: 'primary' | 'secondary';
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
  const fontChoice = (elementConfig as any).font || defaults.font || 'primary';
  const fontClass = fontChoice === 'secondary' ? 'font-secondary' : 'font-primary';
  
  const classes = [
    elementConfig.fontSize || defaults.fontSize,
    elementConfig.fontWeight || defaults.fontWeight,
    // Ne pas ajouter lineHeight si c'est une valeur numérique (sera appliqué via style inline)
    lineHeightValue,
    // Si c'est une couleur hex, on ne l'ajoute pas aux classes (on l'appliquera via style)
    // Sinon, on ajoute la classe Tailwind
    !isCustomColor ? colorValue : null,
    elementConfig.tracking || defaults.tracking,
    fontClass,
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
    tracking: 'tracking-tighter',
    font: 'primary'
  },
  h2: {
    fontSize: 'text-fluid-4xl',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-tight',
    color: 'text-gray-900',
    tracking: 'tracking-tight',
    font: 'primary'
  },
  h3: {
    fontSize: 'text-lg',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-normal',
    color: 'text-gray-900',
    tracking: 'tracking-normal',
    font: 'primary'
  },
  h4: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
    color: 'text-gray-600',
    tracking: 'tracking-normal',
    font: 'primary'
  },
  h1Single: {
    fontSize: 'text-fluid-10xl',
    fontWeight: 'font-medium',
    lineHeight: 'leading-none',
    color: 'text-gray-900',
    tracking: 'tracking-tighter',
    font: 'primary'
  },
  p: {
    fontSize: 'text-base',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
    color: 'text-gray-700',
    tracking: 'tracking-normal',
    font: 'primary'
  },
  nav: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
    color: 'text-gray-500',
    tracking: 'tracking-normal',
    font: 'primary'
  },
  footer: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
    color: 'text-gray-600',
    tracking: 'tracking-normal',
    font: 'primary'
  },
  kicker: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
    color: 'text-gray-500',
    tracking: 'tracking-wider',
    font: 'primary'
  }
};

const normalizeFontFamily = (family?: string) => family?.trim();

const buildFontResource = (settings?: TypographyFontSettings) => {
  const safeSettings = settings || {};
  const mode = safeSettings.mode || 'system';
  const family = normalizeFontFamily(safeSettings.family);
  const weights = (safeSettings.weights || '400;600;700').trim();
  const cssUrl = safeSettings.cssUrl?.trim();

  if (mode === 'google' && family) {
    const familyParam = family.replace(/\s+/g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyParam)}:wght@${weights}&display=swap`;
    return { href, fontFamily: `'${family}', ${SYSTEM_FONT_FALLBACK}` };
  }

  if (mode === 'custom' && family && cssUrl) {
    return { href: cssUrl, fontFamily: `${family}` };
  }

  // mode système ou données incomplètes -> fallback
  return { href: null as string | null, fontFamily: SYSTEM_FONT_FALLBACK };
};

const ensureFontLink = (id: string, href: string | null) => {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id) as HTMLLinkElement | null;

  if (!href) {
    if (existing) existing.remove();
    return;
  }

  if (existing) {
    const currentHref = existing.getAttribute('href');
    if (currentHref === href) return;
    existing.href = href;
    return;
  }

  const linkEl = document.createElement('link');
  linkEl.id = id;
  linkEl.rel = 'stylesheet';
  linkEl.href = href;
  document.head.appendChild(linkEl);
};

/**
 * Applique les polices (CSS variables + @import) dans le front
 */
export const applyTypographyFonts = (config?: TypographyConfig) => {
  if (typeof document === 'undefined') return;
  const fonts = config?.fonts || {};

  const primary = buildFontResource(fonts.primary);
  const secondary = buildFontResource(fonts.secondary);

  // CSS variables (fallback système par défaut)
  document.documentElement.style.setProperty('--font-primary', primary.fontFamily || SYSTEM_FONT_FALLBACK);
  document.documentElement.style.setProperty('--font-secondary', secondary.fontFamily || SYSTEM_FONT_FALLBACK);

  // Charger les @import nécessaires
  ensureFontLink('typo-font-primary', primary.href);
  ensureFontLink('typo-font-secondary', secondary.href);
};
