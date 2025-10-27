// Configuration des transitions par thème
export type TransitionType = 'slide-up' | 'slide-down' | 'fade' | 'zoom' | 'flip' | 'curtain';

export interface TransitionConfig {
  type: TransitionType;
  duration?: number;
  easing?: string;
  customStyles?: string;
}

// Configuration par défaut des transitions
export const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
  type: 'slide-up',
  duration: 1500,
  easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
};

// Configuration des transitions par thème
export const THEME_TRANSITIONS: Record<string, TransitionConfig> = {
  // Pearl : Animation de référence (nextjs-view-transitions)
  pearl: {
    type: 'slide-up',
    duration: 1500,
    easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
    customStyles: `
      .vt-brand { view-transition-name: pearl-brand; }
    `
  },

  // Starter : Transition rapide et simple
  starter: {
    type: 'fade',
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Praxis : Effet zoom avec rebond
  praxis: {
    type: 'zoom',
    duration: 1200,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Effica : Slide vers le bas
  effica: {
    type: 'slide-down',
    duration: 1500,
    easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
  },

  // Designhub : Effet de rideau
  designhub: {
    type: 'curtain',
    duration: 1800,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Talentify : Effet flip 3D
  talentify: {
    type: 'flip',
    duration: 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Conversionflow : Slide up rapide
  conversionflow: {
    type: 'slide-up',
    duration: 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Salescore : Fade avec zoom subtil
  salescore: {
    type: 'fade',
    duration: 1200,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    customStyles: `
      @keyframes vt-fade-out { 
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
      @keyframes vt-fade-in { 
        from { opacity: 0; transform: scale(1.05); }
        to { opacity: 1; transform: scale(1); }
      }
    `
  },

  // Omnis : Transition fluide
  omnis: {
    type: 'slide-up',
    duration: 1400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Artboard : Effet créatif
  artboard: {
    type: 'curtain',
    duration: 1600,
    easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
  },

  // Pixend : Zoom dynamique
  pixend: {
    type: 'zoom',
    duration: 1100,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Limitless : Transition épique
  limitless: {
    type: 'flip',
    duration: 2000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Sereenity : Transition douce
  sereenity: {
    type: 'fade',
    duration: 1800,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
};

// Fonction pour obtenir la configuration d'un thème
export function getTransitionConfig(themeKey: string): TransitionConfig {
  return THEME_TRANSITIONS[themeKey] || DEFAULT_TRANSITION_CONFIG;
}

// Fonction pour mettre à jour la configuration d'un thème
export function updateTransitionConfig(themeKey: string, config: Partial<TransitionConfig>): void {
  if (THEME_TRANSITIONS[themeKey]) {
    THEME_TRANSITIONS[themeKey] = { ...THEME_TRANSITIONS[themeKey], ...config };
  } else {
    THEME_TRANSITIONS[themeKey] = { ...DEFAULT_TRANSITION_CONFIG, ...config };
  }
}

// Liste des types de transitions disponibles avec descriptions
export const TRANSITION_TYPES: Record<TransitionType, { name: string; description: string }> = {
  'slide-up': {
    name: 'Slide Up',
    description: 'L\'ancienne page glisse vers le haut, la nouvelle se déplie depuis le bas'
  },
  'slide-down': {
    name: 'Slide Down', 
    description: 'L\'ancienne page glisse vers le bas, la nouvelle se déplie depuis le haut'
  },
  'fade': {
    name: 'Fade',
    description: 'Transition en fondu simple entre les pages'
  },
  'zoom': {
    name: 'Zoom',
    description: 'Effet de zoom avec échelle et opacité'
  },
  'flip': {
    name: 'Flip 3D',
    description: 'Rotation 3D autour de l\'axe Y'
  },
  'curtain': {
    name: 'Curtain',
    description: 'Effet de rideau qui se déplie'
  }
};
