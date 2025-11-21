import type { ResolvedPalette } from './palette';

export const varsFromPalette = (p: ResolvedPalette) => {
  // shadcn attend hsl(var(--token)) ; on pose des hex → OK via arbitrary bg-[var(--...)] ou
  // on reste cohérent et met directement des hex dans les vars, Tailwind lira var() sans souci.
  return {
    // shadcn/ui tokens
    '--background':            p.background,
    '--foreground':            p.text,
    '--card':                  p.card,
    '--card-foreground':       p.text,
    '--popover':               p.popover,
    '--popover-foreground':    p.text,
    '--primary':               p.primary,
    '--primary-foreground':    p.primaryFg,
    '--secondary':             p.secondary,
    '--secondary-foreground':  p.secondaryFg,
    '--muted':                 p.muted,
    '--muted-foreground':      p.textSecondary,
    '--accent':                p.accent,
    '--accent-foreground':     p.accentFg,
    '--destructive':           '#ef4444',
    '--destructive-foreground':'#ffffff',
    '--border':                p.border,
    '--input':                 p.input,
    '--ring':                  p.ring,
    '--radius':                '0.75rem',

    // alias pour tes anciennes variables (migration douce)
    '--bg':                    'var(--background)',
    '--fg':                    'var(--foreground)',
    '--text':                  'var(--foreground)',
    '--text-secondary':        'var(--muted-foreground)',
    '--accent-legacy':         'var(--accent)',
  } as Record<string,string>;
};




