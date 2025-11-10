import { resolvePalette } from './palette';
import { varsFromPalette } from './palette-css';
import type { BasePalette, ResolvedPalette } from './palette';

/**
 * Génère le CSS des variables de palette côté serveur (optimisé pour performance)
 * Cette fonction évite les calculs côté client et génère le CSS une seule fois
 * Retourne uniquement les variables CSS (sans :root) pour plus de flexibilité
 */
export function generatePaletteCSS(palette: BasePalette): string {
  try {
    const resolved = resolvePalette(palette);
    const vars = varsFromPalette(resolved);
    
    // Convertir les variables en CSS string optimisé
    const cssVars = Object.entries(vars)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    return cssVars;
  } catch (error) {
    console.error('Erreur generatePaletteCSS:', error);
    return '';
  }
}

/**
 * Génère le className pour le thème dark si nécessaire
 */
export function getPaletteThemeClass(palette: BasePalette): string | undefined {
  try {
    const resolved = resolvePalette(palette);
    return resolved.isDark ? 'dark' : undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * OPTIMISATION: Résout la palette une seule fois et retourne à la fois le CSS et le className
 * Évite de calculer resolvePalette deux fois
 */
export function generatePaletteStyles(palette: BasePalette): { css: string; themeClass?: string } {
  try {
    const resolved = resolvePalette(palette);
    const vars = varsFromPalette(resolved);
    
    const cssVars = Object.entries(vars)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    return {
      css: cssVars,
      themeClass: resolved.isDark ? 'dark' : undefined
    };
  } catch (error) {
    console.error('Erreur generatePaletteStyles:', error);
    return { css: '' };
  }
}

