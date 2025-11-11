import type { BasePalette } from './palette';
import { defaultPaletteColors, getPaletteById } from '@/lib/palettes';

// Liste des palettes statiques (dupliquée depuis ColorPaletteSection pour usage SSR)
// IMPORTANT: Cette liste doit être synchronisée avec COLOR_PALETTES dans ColorPaletteSection.tsx
// En production, on pourrait charger depuis une API ou un fichier JSON
const STATIC_PALETTES: Record<string, BasePalette> = {
  // Palettes classiques et intemporelles
  'classic': {
    id: 'classic',
    name: 'Classique',
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#3B82F6',
    background: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e5e7eb'
  },
  'monochrome': {
    id: 'monochrome',
    name: 'Monochrome',
    primary: '#1F2937',
    secondary: '#374151',
    accent: '#6B7280',
    background: '#F9FAFB',
    text: '#111827',
    textSecondary: '#4B5563',
    border: '#D1D5DB'
  },
  'minimal': {
    id: 'minimal',
    name: 'Minimaliste',
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#3B82F6',
    background: '#F9FAFB',
    text: '#374151',
    textSecondary: '#6B7280',
    border: '#E5E7EB'
  },
  
  // Palettes professionnelles
  'modern': {
    id: 'modern',
    name: 'Moderne',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#10B981',
    background: '#ffffff',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB'
  },
  'corporate': {
    id: 'corporate',
    name: 'Corporate',
    primary: '#1E3A8A',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    background: '#ffffff',
    text: '#1F2937',
    textSecondary: '#475569',
    border: '#CBD5E1'
  },
  'executive': {
    id: 'executive',
    name: 'Executive',
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#3B82F6',
    background: '#F8FAFC',
    text: '#0F172A',
    textSecondary: '#475569',
    border: '#E2E8F0'
  },
  
  // Palettes sombres
  'dark': {
    id: 'dark',
    name: 'Sombre',
    primary: '#ffffff',
    secondary: '#1F2937',
    accent: '#3B82F6',
    background: '#111827',
    text: '#ffffff',
    textSecondary: '#D1D5DB',
    border: '#374151'
  },
  'midnight': {
    id: 'midnight',
    name: 'Minuit',
    primary: '#ffffff',
    secondary: '#000000',
    accent: '#8B5CF6',
    background: '#0A0A0A',
    text: '#ffffff',
    textSecondary: '#A3A3A3',
    border: '#262626'
  },
  'charcoal': {
    id: 'charcoal',
    name: 'Charbon',
    primary: '#ffffff',
    secondary: '#1F2937',
    accent: '#10B981',
    background: '#171717',
    text: '#F5F5F5',
    textSecondary: '#A3A3A3',
    border: '#404040'
  },
  
  // Palettes chaleureuses
  'warm': {
    id: 'warm',
    name: 'Chaleureux',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#EF4444',
    background: '#FEF3C7',
    text: '#78350F',
    textSecondary: '#92400E',
    border: '#FCD34D'
  },
  'sunset': {
    id: 'sunset',
    name: 'Coucher de Soleil',
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#EC4899',
    background: '#FFF7ED',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    border: '#FED7AA'
  },
  'terracotta': {
    id: 'terracotta',
    name: 'Terre cuite',
    primary: '#C2410C',
    secondary: '#9A3412',
    accent: '#F97316',
    background: '#FFF7ED',
    text: '#431407',
    textSecondary: '#7C2D12',
    border: '#FED7AA'
  },
  
  // Palettes nature
  'nature': {
    id: 'nature',
    name: 'Nature',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#F59E0B',
    background: '#F0FDF4',
    text: '#064E3B',
    textSecondary: '#047857',
    border: '#86EFAC'
  },
  'forest': {
    id: 'forest',
    name: 'Forêt',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
    background: '#ECFDF5',
    text: '#064E3B',
    textSecondary: '#065F46',
    border: '#6EE7B7'
  },
  'sage': {
    id: 'sage',
    name: 'Sauge',
    primary: '#84CC16',
    secondary: '#65A30D',
    accent: '#A3E635',
    background: '#F7FEE7',
    text: '#365314',
    textSecondary: '#4D7C0F',
    border: '#D9F99D'
  },
  'moss': {
    id: 'moss',
    name: 'Mousse',
    primary: '#65A30D',
    secondary: '#4D7C0F',
    accent: '#84CC16',
    background: '#F7FEE7',
    text: '#365314',
    textSecondary: '#3F6212',
    border: '#BEF264'
  },
  
  // Palettes océaniques
  'ocean': {
    id: 'ocean',
    name: 'Océan',
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#06B6D4',
    background: '#F0F9FF',
    text: '#0C4A6E',
    textSecondary: '#075985',
    border: '#BAE6FD'
  },
  'azure': {
    id: 'azure',
    name: 'Azur',
    primary: '#3B82F6',
    secondary: '#2563EB',
    accent: '#60A5FA',
    background: '#EFF6FF',
    text: '#1E3A8A',
    textSecondary: '#1E40AF',
    border: '#93C5FD'
  },
  'navy': {
    id: 'navy',
    name: 'Marine',
    primary: '#1E3A8A',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    background: '#F8FAFC',
    text: '#0F172A',
    textSecondary: '#1E293B',
    border: '#CBD5E1'
  },
  'turquoise': {
    id: 'turquoise',
    name: 'Turquoise',
    primary: '#06B6D4',
    secondary: '#0891B2',
    accent: '#22D3EE',
    background: '#ECFEFF',
    text: '#083344',
    textSecondary: '#0E7490',
    border: '#67E8F9'
  },
  
  // Palettes violettes
  'purple': {
    id: 'purple',
    name: 'Violet',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#A78BFA',
    background: '#FAF5FF',
    text: '#4C1D95',
    textSecondary: '#6D28D9',
    border: '#DDD6FE'
  },
  'lavender': {
    id: 'lavender',
    name: 'Lavande',
    primary: '#A78BFA',
    secondary: '#8B5CF6',
    accent: '#C4B5FD',
    background: '#F5F3FF',
    text: '#5B21B6',
    textSecondary: '#7C3AED',
    border: '#E9D5FF'
  },
  'plum': {
    id: 'plum',
    name: 'Prune',
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#8B5CF6',
    background: '#FAF5FF',
    text: '#4C1D95',
    textSecondary: '#5B21B6',
    border: '#C4B5FD'
  },
  
  // Palettes audacieuses
  'bold': {
    id: 'bold',
    name: 'Audacieux',
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#F59E0B',
    background: '#ffffff',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#FEE2E2'
  },
  'crimson': {
    id: 'crimson',
    name: 'Cramoisi',
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#EF4444',
    background: '#FEF2F2',
    text: '#7F1D1D',
    textSecondary: '#991B1B',
    border: '#FECACA'
  },
  'coral': {
    id: 'coral',
    name: 'Corail',
    primary: '#F87171',
    secondary: '#EF4444',
    accent: '#FB7185',
    background: '#FFF1F2',
    text: '#7F1D1D',
    textSecondary: '#BE123C',
    border: '#FECDD3'
  },
  'amber': {
    id: 'amber',
    name: 'Ambre',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FBBF24',
    background: '#FFFBEB',
    text: '#78350F',
    textSecondary: '#92400E',
    border: '#FDE68A'
  },
  
  // Palettes créatives
  'neon': {
    id: 'neon',
    name: 'Néon',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#F59E0B',
    background: '#000000',
    text: '#ffffff',
    textSecondary: '#D1D5DB',
    border: '#374151'
  },
  'vibrant': {
    id: 'vibrant',
    name: 'Vibrant',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F59E0B',
    background: '#FDF2F8',
    text: '#831843',
    textSecondary: '#9F1239',
    border: '#FBCFE8'
  },
  'electric': {
    id: 'electric',
    name: 'Électrique',
    primary: '#3B82F6',
    secondary: '#2563EB',
    accent: '#8B5CF6',
    background: '#EFF6FF',
    text: '#1E3A8A',
    textSecondary: '#1E40AF',
    border: '#93C5FD'
  },
  
  // Palettes douces / Pastels
  'pastel': {
    id: 'pastel',
    name: 'Pastel',
    primary: '#A78BFA',
    secondary: '#C4B5FD',
    accent: '#F0ABFC',
    background: '#FAF5FF',
    text: '#5B21B6',
    textSecondary: '#7C3AED',
    border: '#E9D5FF'
  },
  'blush': {
    id: 'blush',
    name: 'Rose poudré',
    primary: '#FB7185',
    secondary: '#F472B6',
    accent: '#F0ABFC',
    background: '#FFF1F2',
    text: '#9F1239',
    textSecondary: '#BE123C',
    border: '#FECDD3'
  },
  'mint': {
    id: 'mint',
    name: 'Menthe',
    primary: '#34D399',
    secondary: '#10B981',
    accent: '#6EE7B7',
    background: '#ECFDF5',
    text: '#064E3B',
    textSecondary: '#047857',
    border: '#A7F3D0'
  },
  'peach': {
    id: 'peach',
    name: 'Pêche',
    primary: '#FB923C',
    secondary: '#F97316',
    accent: '#FDBA74',
    background: '#FFF7ED',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    border: '#FED7AA'
  },
  'lavender-pastel': {
    id: 'lavender-pastel',
    name: 'Lavande pastel',
    primary: '#C4B5FD',
    secondary: '#A78BFA',
    accent: '#DDD6FE',
    background: '#FAF5FF',
    text: '#6D28D9',
    textSecondary: '#7C3AED',
    border: '#E9D5FF'
  },
  'sky-pastel': {
    id: 'sky-pastel',
    name: 'Ciel pastel',
    primary: '#93C5FD',
    secondary: '#60A5FA',
    accent: '#BFDBFE',
    background: '#EFF6FF',
    text: '#1E40AF',
    textSecondary: '#2563EB',
    border: '#DBEAFE'
  },
  'rose-pastel': {
    id: 'rose-pastel',
    name: 'Rose pastel',
    primary: '#FBCFE8',
    secondary: '#F9A8D4',
    accent: '#FCE7F3',
    background: '#FDF2F8',
    text: '#9F1239',
    textSecondary: '#BE185D',
    border: '#FDE2E4'
  },
  'lemon-pastel': {
    id: 'lemon-pastel',
    name: 'Citron pastel',
    primary: '#FEF3C7',
    secondary: '#FDE68A',
    accent: '#FEF9C3',
    background: '#FFFBEB',
    text: '#78350F',
    textSecondary: '#92400E',
    border: '#FEF3C7'
  },
  'coral-pastel': {
    id: 'coral-pastel',
    name: 'Corail pastel',
    primary: '#FED7AA',
    secondary: '#FCD34D',
    accent: '#FEE2E2',
    background: '#FFF7ED',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    border: '#FED7AA'
  },
  'mint-pastel': {
    id: 'mint-pastel',
    name: 'Menthe pastel',
    primary: '#A7F3D0',
    secondary: '#6EE7B7',
    accent: '#D1FAE5',
    background: '#ECFDF5',
    text: '#065F46',
    textSecondary: '#047857',
    border: '#A7F3D0'
  },
  'lilac-pastel': {
    id: 'lilac-pastel',
    name: 'Lilas pastel',
    primary: '#E9D5FF',
    secondary: '#DDD6FE',
    accent: '#F3E8FF',
    background: '#FAF5FF',
    text: '#6B21A8',
    textSecondary: '#7C3AED',
    border: '#E9D5FF'
  },
  'powder-blue': {
    id: 'powder-blue',
    name: 'Bleu poudré',
    primary: '#BFDBFE',
    secondary: '#93C5FD',
    accent: '#DBEAFE',
    background: '#EFF6FF',
    text: '#1E3A8A',
    textSecondary: '#1E40AF',
    border: '#DBEAFE'
  },
  'apricot': {
    id: 'apricot',
    name: 'Abricot',
    primary: '#FED7AA',
    secondary: '#FDBA74',
    accent: '#FEE2E2',
    background: '#FFF7ED',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    border: '#FED7AA'
  },
  'sakura': {
    id: 'sakura',
    name: 'Sakura',
    primary: '#FCE7F3',
    secondary: '#FBCFE8',
    accent: '#FDF2F8',
    background: '#FFF1F2',
    text: '#9F1239',
    textSecondary: '#BE185D',
    border: '#FCE7F3'
  },
  'vanilla': {
    id: 'vanilla',
    name: 'Vanille',
    primary: '#FEF3C7',
    secondary: '#FDE68A',
    accent: '#FFFBEB',
    background: '#FFFBEB',
    text: '#78350F',
    textSecondary: '#92400E',
    border: '#FEF3C7'
  },
  
  // Palettes élégantes
  'ivory': {
    id: 'ivory',
    name: 'Ivoire',
    primary: '#78716C',
    secondary: '#57534E',
    accent: '#A78BFA',
    background: '#FEFCFB',
    text: '#292524',
    textSecondary: '#44403C',
    border: '#E7E5E4'
  },
  'champagne': {
    id: 'champagne',
    name: 'Champagne',
    primary: '#D97706',
    secondary: '#B45309',
    accent: '#F59E0B',
    background: '#FFFBEB',
    text: '#78350F',
    textSecondary: '#92400E',
    border: '#FDE68A'
  },
  'slate': {
    id: 'slate',
    name: 'Ardoise',
    primary: '#475569',
    secondary: '#334155',
    accent: '#64748B',
    background: '#F8FAFC',
    text: '#0F172A',
    textSecondary: '#1E293B',
    border: '#CBD5E1'
  },
  
  // Palettes saisonnières
  'spring': {
    id: 'spring',
    name: 'Printemps',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#EC4899',
    background: '#F0FDF4',
    text: '#064E3B',
    textSecondary: '#047857',
    border: '#86EFAC'
  },
  'summer': {
    id: 'summer',
    name: 'Été',
    primary: '#FBBF24',
    secondary: '#F59E0B',
    accent: '#F97316',
    background: '#FFFBEB',
    text: '#78350F',
    textSecondary: '#92400E',
    border: '#FDE68A'
  },
  'autumn': {
    id: 'autumn',
    name: 'Automne',
    primary: '#EA580C',
    secondary: '#C2410C',
    accent: '#D97706',
    background: '#FFF7ED',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    border: '#FED7AA'
  },
  'winter': {
    id: 'winter',
    name: 'Hiver',
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#64748B',
    background: '#F0F9FF',
    text: '#0C4A6E',
    textSecondary: '#075985',
    border: '#BAE6FD'
  }
};

export const resolvePaletteFromContent = (content: any): BasePalette => {
  const paletteId = content?.metadata?.colorPalette;
  if (!paletteId) return defaultPaletteColors;

  // Chercher dans les palettes personnalisées d'abord
  const customPalettes = content?.metadata?.customPalettes || [];
  const customPalette = customPalettes.find((p: any) => p.id === paletteId);
  if (customPalette && customPalette.colors) {
    return {
      id: customPalette.id,
      name: customPalette.name,
      ...customPalette.colors
    };
  }

  // Chercher dans les palettes statiques
  const staticPalette = STATIC_PALETTES[paletteId];
  if (staticPalette) {
    return staticPalette;
  }

  // Fallback vers la palette par défaut
  return defaultPaletteColors;
};

// Export de la palette par défaut
export const defaultPalette: BasePalette = defaultPaletteColors;
