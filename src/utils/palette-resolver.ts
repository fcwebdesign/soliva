import type { BasePalette } from './palette';
import { defaultPaletteColors, getPaletteById } from '@/lib/palettes';

// Liste des palettes statiques (dupliquée depuis ColorPaletteSection pour usage SSR)
// En production, on pourrait charger depuis une API ou un fichier JSON
const STATIC_PALETTES: Record<string, BasePalette> = {
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
  // Ajouter quelques palettes supplémentaires pour éviter les erreurs
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

