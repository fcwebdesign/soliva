export type LinkKind = "internal" | "external" | "anchor" | "mailto" | "tel" | "invalid";

const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST?.replace(/\/$/, "");

export function detectLinkKind(href: string): LinkKind {
  const v = href.trim();
  if (!v) return "invalid";
  if (v.startsWith("#")) return "anchor";
  if (v.startsWith("/")) return "internal";
  if (v.startsWith("mailto:")) return "mailto";
  if (v.startsWith("tel:")) return "tel";
  try {
    const u = new URL(v.includes("://") ? v : `https://${v}`);
    if (SITE_HOST && new URL(SITE_HOST).host === u.host) return "internal";
    return "external";
  } catch { return "invalid"; }
}

export function normalizeHref(raw: string): { href: string; kind: LinkKind; target?: "_blank"; rel?: string } {
  let v = raw.trim();
  const kind = detectLinkKind(v);

  if (kind === "external") {
    if (!/^[a-z]+:\/\//i.test(v)) v = `https://${v}`;
    return { href: v, kind, target: "_blank", rel: "noopener noreferrer" };
  }
  if (kind === "internal") {
    if (!v.startsWith("/")) v = `/${v}`;
    return { href: v, kind }; // ⬅️ pas de target/rel
  }
  if (kind === "anchor" || kind === "mailto" || kind === "tel") {
    return { href: v, kind }; // ⬅️ pas de target/rel
  }
  return { href: "", kind: "invalid" };
}

// Pages internes disponibles
export const internalPages = [
  { value: '/', label: 'Accueil' },
  { value: '/work', label: 'Work' },
  { value: '/studio', label: 'Studio' },
  { value: '/blog', label: 'Blog' },
  { value: '/contact', label: 'Contact' },
];

// Fonction pour filtrer les pages selon une recherche
export function filterInternalPages(search: string) {
  const query = search.toLowerCase().trim();
  if (!query) return internalPages;
  
  return internalPages.filter(page => 
    page.label.toLowerCase().includes(query) || 
    page.value.toLowerCase().includes(query)
  );
}

// Fonction utilitaire pour valider une URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Fonction pour obtenir le type d'affichage d'un lien
export function getLinkDisplayType(href: string): string {
  const kind = detectLinkKind(href);
  switch (kind) {
    case 'internal': return 'Lien interne';
    case 'external': return 'Lien externe (nouvelle fenêtre)';
    case 'anchor': return 'Ancre de page';
    case 'mailto': return 'Email';
    case 'tel': return 'Téléphone';
    default: return 'URL invalide';
  }
} 