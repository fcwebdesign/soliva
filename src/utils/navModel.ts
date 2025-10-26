export type PageLink = {
  slug?: string;
  id?: string;
  title?: string;
};

export type PageLabels = Record<string, string | { title: string; customUrl?: string; target?: string }>;

export function buildNavModel({
  nav,
  pages,
  pathname,
  templateKey,
}: {
  nav: {
    logo?: string;
    logoImage?: string;
    items?: string[];
    pageLabels?: PageLabels;
    location?: string;
  };
  pages?: { pages?: PageLink[]; hiddenSystem?: string[] } | undefined;
  pathname: string;
  templateKey?: string; // optionnel: conserve ?template=...
}) {
  const defaults = ["home", "work", "studio", "blog", "contact"];
  const defaultItems = nav.items?.length ? nav.items : defaults;

  const customPages = pages?.pages || [];
  const customKeys = customPages.map((p) => p.slug || p.id).filter(Boolean) as string[];
  const merged = [...defaultItems];
  customKeys.forEach((k) => {
    if (!merged.includes(k)) merged.push(k);
  });

  const hidden = new Set(pages?.hiddenSystem || []);
  const visible = merged.filter((k) => !hidden.has(k));

  const labelDefaults: Record<string, string> = {
    home: "Accueil",
    work: "Réalisations",
    studio: "Studio",
    blog: "Journal",
    contact: "Contact",
  };

  const items = visible.map((key) => {
    const defPath = key === "home" ? "/" : `/${key}`;
    const meta = nav.pageLabels?.[key];
    let label = labelDefaults[key] || key;
    let href = defPath;
    let target: "_self" | "_blank" = "_self";

    const custom = customPages.find((p) => (p.slug || p.id) === key);
    if (custom?.title) label = custom.title;

    if (typeof meta === "string") label = meta;
    if (meta && typeof meta === "object") {
      label = meta.title || label;
      href = meta.customUrl || href;
      target = meta.target === "_blank" ? "_blank" : "_self";
    }

    // Préserver ?template=<key> pour les previews si demandé
    if (templateKey && target === "_self") {
      href = href + `?template=${templateKey}`;
    }

    const active = target === "_self" && (pathname === defPath || pathname === href);
    return { key, label, href, target, active };
  });

  const brand = { text: nav.logo || "soliva", image: nav.logoImage || "" };
  return { brand, items, location: nav.location || "" };
}
