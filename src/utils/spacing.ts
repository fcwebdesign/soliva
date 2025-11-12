export interface SpacingConfig {
  sectionY?: string; // ex: '7rem' ou 'clamp(72px, 12vw, 128px)'
  gap?: {
    sm?: string; // ex: '0.5rem'
    md?: string; // ex: '1rem'
    lg?: string; // ex: '1.5rem'
  };
  defaultGap?: 'sm' | 'md' | 'lg';
}

export const defaultSpacing: SpacingConfig = {
  sectionY: '7rem', // équivalent Tailwind py-28
  gap: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
  defaultGap: 'md',
};

export function getSpacingConfig(content: any): SpacingConfig {
  const meta = content?.metadata || {};
  const spacing = meta.spacing || {};
  return {
    sectionY: spacing.sectionY || defaultSpacing.sectionY,
    gap: {
      sm: spacing.gap?.sm || defaultSpacing.gap!.sm,
      md: spacing.gap?.md || defaultSpacing.gap!.md,
      lg: spacing.gap?.lg || defaultSpacing.gap!.lg,
    },
    defaultGap: spacing.defaultGap || defaultSpacing.defaultGap,
  };
}

export function spacingVarsCSS(config: SpacingConfig): string {
  const gapSm = config.gap?.sm || defaultSpacing.gap!.sm!;
  const gapMd = config.gap?.md || defaultSpacing.gap!.md!;
  const gapLg = config.gap?.lg || defaultSpacing.gap!.lg!;
  const chosen = config.defaultGap || 'md';
  const chosenValue = chosen === 'sm' ? gapSm : chosen === 'lg' ? gapLg : gapMd;
  return `:root{--section:${config.sectionY || defaultSpacing.sectionY};--gap-sm:${gapSm};--gap-md:${gapMd};--gap-lg:${gapLg};--gap:${chosenValue};}`;
}

