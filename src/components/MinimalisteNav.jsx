"use client";
import Link from "next/link";

const MinimalisteNav = ({ content }) => {
  // Debug: log des données reçues
  console.log('🎯 MinimalisteNav: Données reçues', content);

  // Convertir les données en format attendu par le template original
  const items = (content?.items || ['home', 'work', 'studio', 'contact']).map((item) => {
    const label = content?.pageLabels?.[item] || item;
    const href = item === 'home' ? '/' : `/${item}`;
    return { label, href };
  });

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/10">
      <div className="container h-[68px] flex items-center justify-between">
        <a href="/" className="tracking-tight">
          {content?.logo || "STUDIO"}
        </a>
        <nav className="hidden md:flex items-center gap-10 text-sm text-black/70">
          {items.map((it) => (
            <a key={it.label} href={it.href} className="hover:text-black">
              {it.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default MinimalisteNav; 