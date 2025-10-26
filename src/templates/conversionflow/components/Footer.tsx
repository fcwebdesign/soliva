type PageLink = { slug?: string; id?: string; title?: string };

export default function FooterConversionflow({ footer, pages }: { footer?: any; pages?: { pages?: PageLink[] } }) {
  const year = new Date().getFullYear();
  const copyright = footer?.copyright || ('© ' + year + ' Conversionflow. Tous droits réservés.');
  const links: string[] = footer?.bottomLinks || [];
  const labelMap: Record<string, string | { title: string; customUrl?: string; target?: string }> = footer?.legalPageLabels || {};
  const allPages = pages?.pages || [];

  const defaultPages = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
  ];

  const customPages = allPages.map(p => ({ key: p.slug || p.id, label: p.title || 'Page', path: '/' + (p.slug || p.id) }));
  const available = [...defaultPages, ...customPages];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>{copyright}</p>
          {links.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-4 justify-center">
              {links.map((key) => {
                const page = available.find(p => p.key === key);
                const meta = labelMap[key];
                let label = page?.label || key;
                let href = page?.path || '#';
                let target: '_self'|'_blank' = '_self';
                if (typeof meta === 'string') label = meta;
                if (meta && typeof meta === 'object') { label = meta.title || label; href = meta.customUrl || href; target = meta.target === '_blank' ? '_blank' : '_self'; }
                return (
                  <li key={key}>
                    <a href={href} target={target} className="text-gray-500 hover:text-gray-900 transition-colors">{label}</a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}