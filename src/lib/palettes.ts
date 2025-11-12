// Export des palettes pour utilisation côté serveur et client
// Cette structure correspond à celle de ColorPaletteSection

export type ColorPalette = {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
};

// On va importer dynamiquement depuis ColorPaletteSection ou dupliquer ici
// Pour l'instant, on crée une fonction qui charge depuis le contenu
export const getPaletteById = (paletteId: string, content: any): ColorPalette['colors'] | null => {
  if (!paletteId) return null;

  // Chercher dans les palettes personnalisées d'abord
  const customPalettes = content?.metadata?.customPalettes || [];
  const customPalette = customPalettes.find((p: any) => p.id === paletteId);
  if (customPalette && customPalette.colors) {
    return customPalette.colors;
  }

  // Chercher dans les palettes statiques (on va les charger dynamiquement)
  // Pour l'instant, on retourne null et on utilisera la palette par défaut
  return null;
};

// Palette par défaut (fallback)
export const defaultPaletteColors = {
  id: 'classic',
  name: 'Classique',
  primary: '#000000',
  secondary: '#ffffff',
  accent: '#3B82F6',
  background: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e5e7eb'
};


