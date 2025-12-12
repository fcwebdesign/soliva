export interface SpacingConfig {
  // Valeur directe (px/rem/clamp) lorsqu'en mode "custom"
  sectionY?: string;
  // Mode auto: clamp calculé depuis la cible et le layout
  mode?: 'auto' | 'custom';
  autoTarget?: number;
  gap?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  defaultGap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const defaultSpacing: SpacingConfig = {
  sectionY: '7rem', // équivalent Tailwind py-28
  gap: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '4rem',
  },
  defaultGap: 'md',
};

function getLayoutWidth(layout: string | undefined): number {
  if (layout === 'compact') return 1280;
  if (layout === 'wide') return 1920;
  return 1536; // standard
}

function clampFromTarget(targetPx: number, layoutWidth: number): string {
  const vw = (targetPx / layoutWidth) * 100;
  const minPx = Math.round(targetPx * 0.6);
  const maxPx = Math.round(targetPx * 1.4);
  return `clamp(${minPx}px, ${vw.toFixed(2)}vw, ${maxPx}px)`;
}

export function getSpacingConfig(content: any): SpacingConfig {
  const meta = content?.metadata || {};
  const spacing = meta.spacing || {};
  const mode: 'auto' | 'custom' = spacing.mode || 'custom';

  let sectionY = spacing.sectionY || defaultSpacing.sectionY;
  if (mode === 'auto') {
    const layoutWidth = getLayoutWidth(meta?.layout);
    const target = typeof spacing.autoTarget === 'number' && !isNaN(spacing.autoTarget)
      ? spacing.autoTarget
      : 120; // valeur par défaut raisonnable
    sectionY = clampFromTarget(target, layoutWidth);
  }

  return {
    mode,
    autoTarget: spacing.autoTarget,
    sectionY,
    gap: {
      sm: spacing.gap?.sm || defaultSpacing.gap!.sm,
      md: spacing.gap?.md || defaultSpacing.gap!.md,
      lg: spacing.gap?.lg || defaultSpacing.gap!.lg,
      xl: spacing.gap?.xl || defaultSpacing.gap!.xl,
    },
    defaultGap: spacing.defaultGap || defaultSpacing.defaultGap,
  };
}

export function spacingVarsCSS(config: SpacingConfig): string {
  const gapSm = config.gap?.sm || defaultSpacing.gap!.sm!;
  const gapMd = config.gap?.md || defaultSpacing.gap!.md!;
  const gapLg = config.gap?.lg || defaultSpacing.gap!.lg!;
  const gapXl = config.gap?.xl || defaultSpacing.gap!.xl!;
  const chosen = config.defaultGap || 'md';
  const chosenValue = chosen === 'sm' ? gapSm : chosen === 'lg' ? gapLg : chosen === 'xl' ? gapXl : gapMd;
  return `:root{--section:${config.sectionY || defaultSpacing.sectionY};--gap-sm:${gapSm};--gap-md:${gapMd};--gap-lg:${gapLg};--gap-xl:${gapXl};--gap:${chosenValue};}`;
}
