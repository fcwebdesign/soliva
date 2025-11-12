export type BasePalette = {
  id?: string;
  name?: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;          // (= foreground)
  textSecondary: string; // (= muted-foreground)
  border: string;
};

export type ResolvedPalette = BasePalette & {
  // dérivés auto
  ring: string;
  muted: string;
  card: string;
  popover: string;
  input: string;
  primaryFg: string;
  secondaryFg: string;
  accentFg: string;
  isDark: boolean;
};

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const v = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  const num = parseInt(v, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const luminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const contrastRatio = (fg: string, bg: string) => {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
};

const pickReadableFg = (bg: string, light = '#ffffff', dark = '#0a0a0a') =>
  contrastRatio(light, bg) >= contrastRatio(dark, bg) ? light : dark;

const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = ch(A.r, B.r), g = ch(A.g, B.g), bl = ch(A.b, B.b);
  return `#${[r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('')}`;
};

export const resolvePalette = (p: BasePalette): ResolvedPalette => {
  const isDark = luminance(p.background) < 0.45;
  const primaryFg   = pickReadableFg(p.primary);
  const secondaryFg = pickReadableFg(p.secondary);
  const accentFg    = pickReadableFg(p.accent);

  // dérivés simples
  const ring   = p.primary;
  const muted  = mix(p.background, p.text, isDark ? 0.12 : 0.06); // surface discrète
  const card   = mix(p.background, isDark ? '#101010' : '#ffffff', isDark ? 0.06 : 0.02);
  const popover= card;
  const input  = mix(p.background, p.border, 0.5);

  return { ...p, ring, muted, card, popover, input, primaryFg, secondaryFg, accentFg, isDark };
};


