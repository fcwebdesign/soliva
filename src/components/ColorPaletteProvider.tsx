import React from 'react';
import { generatePaletteStyles } from '@/utils/palette-css-server';
import type { BasePalette } from '@/utils/palette';

type Props = {
  palette: BasePalette;
  children: React.ReactNode;
  scopeId?: string; // pour scoper localement si besoin (data-theme)
};

/**
 * Composant serveur optimisé pour injecter les variables CSS de palette
 * Tous les calculs sont faits côté serveur pour éviter les re-renders côté client
 * OPTIMISATION: Utilise generatePaletteStyles pour calculer la palette une seule fois
 */
export default function ColorPaletteProvider({ palette, children, scopeId }: Props) {
  // Générer le CSS et le className en une seule passe (optimisation)
  const { css: cssString, themeClass } = generatePaletteStyles(palette);

  // Option A: global → injecter dans :root sans wrapper (pour ne pas casser la structure)
  if (!scopeId) {
    return (
      <>
        {cssString && (
          <style dangerouslySetInnerHTML={{ __html: `:root { ${cssString} }` }} />
        )}
        {children}
      </>
    );
  }

  // Option B: scope local → wrapper data-theme
  return (
    <>
      {cssString && (
      <style dangerouslySetInnerHTML={{
          __html: `[data-theme="${scopeId}"] { ${cssString} }`
      }} />
      )}
      <div 
        data-theme={scopeId} 
        className={themeClass}
        data-palette-id={palette.id}
      >
        {children}
      </div>
    </>
  );
}

/**
 * Composant pour injecter uniquement le style dans le <head>
 * Utilisé dans layout.tsx pour injecter les variables CSS globales
 */
export function ColorPaletteStyle({ palette }: { palette: BasePalette }) {
  const { css: cssString } = generatePaletteStyles(palette);
  
  if (!cssString) return null;
  
  return (
    <style dangerouslySetInnerHTML={{ __html: `:root { ${cssString} }` }} />
  );
}

