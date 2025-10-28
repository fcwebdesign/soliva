import { Link } from "next-view-transitions";

type PageLink = { slug?: string; id?: string; title?: string };

export default function FooterPearl({ footer, pages, layout = 'standard' }: { footer?: any; pages?: { pages?: PageLink[] }; layout?: string }) {
  const year = new Date().getFullYear();
  const copyright = footer?.copyright || ('© ' + year + ' Pearl. Tous droits réservés.');
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

  // Helper pour normaliser les URLs des liens de navigation
  const normalizeUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('/')) return url;
    if (url.startsWith('http')) return url;
    // Mapper les clés vers les chemins
    const page = available.find(p => p.key === url);
    return page?.path || `/${url}`;
  };

  const isInternalUrl = (url: string) => {
    const normalized = normalizeUrl(url);
    return normalized.startsWith('/') && !normalized.startsWith('//');
  };

  const VariantClassic = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="space-y-4">
        <div className="font-semibold text-xl text-gray-900">
          {footer?.logoImage ? (
            <img src={footer.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
          ) : (
            footer?.logo || 'Pearl'
          )}
        </div>
        {footer?.description && (
          <p className="text-sm text-gray-600 max-w-prose">{footer.description}</p>
        )}
      </div>
      <div className="flex flex-col md:flex-row md:justify-end gap-12">
        {Array.isArray(footer?.links) && footer.links.length > 0 && (
          <div className="space-y-2 text-left">
            <ul className="space-y-1">
              {footer.links.map((l: any, idx: number) => {
                const href = normalizeUrl(l.url);
                const isInternal = isInternalUrl(l.url);
                return (
                  <li key={idx}>
                    {isInternal ? (
                      <Link href={href} className="text-sm text-gray-700 hover:text-gray-900">{l.title}</Link>
                    ) : (
                      <a href={href} className="text-sm text-gray-700 hover:text-gray-900">{l.title}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
          <div className="space-y-2 text-left">
            <ul className="space-y-1">
              {footer.socialLinks.map((s: any, idx: number) => (
                <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-gray-900">{s.platform}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const VariantColumns = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
      <div className="space-y-4">
        <div className="font-semibold text-xl text-gray-900">
          {footer?.logoImage ? (
            <img src={footer.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
          ) : (
            footer?.logo || 'Pearl'
          )}
        </div>
        {footer?.description && (
          <p className="text-sm text-gray-600 max-w-prose">{footer.description}</p>
        )}
      </div>
      <div>
        {Array.isArray(footer?.links) && footer.links.length > 0 && (
          <div className="space-y-2 text-left">
            <div className="text-sm font-semibold text-gray-700">Liens</div>
            <ul className="space-y-1">
              {footer.links.map((l: any, idx: number) => {
                const href = normalizeUrl(l.url);
                const isInternal = isInternalUrl(l.url);
                return (
                  <li key={idx}>
                    {isInternal ? (
                      <Link href={href} className="text-sm text-gray-700 hover:text-gray-900">{l.title}</Link>
                    ) : (
                      <a href={href} className="text-sm text-gray-700 hover:text-gray-900">{l.title}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div>
        {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
          <div className="space-y-2 text-left">
            <div className="text-sm font-semibold text-gray-700">Réseaux</div>
            <ul className="space-y-1">
              {footer.socialLinks.map((s: any, idx: number) => (
                <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-gray-900">{s.platform}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const VariantCentered = () => (
    <div className="text-center space-y-4 mb-8">
      <div className="font-semibold text-xl text-gray-900">
        {footer?.logoImage ? (
          <img src={footer.logoImage} alt="Logo" className="h-8 mx-auto max-w-[200px] object-contain" />
        ) : (
          footer?.logo || 'Pearl'
        )}
      </div>
      {footer?.description && (
        <p className="text-sm text-gray-600 max-w-prose mx-auto">{footer.description}</p>
      )}
      {Array.isArray(footer?.links) && footer.links.length > 0 && (
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {footer.links.map((l: any, idx: number) => {
            const href = normalizeUrl(l.url);
            const isInternal = isInternalUrl(l.url);
            return (
              <li key={idx}>
                {isInternal ? (
                  <Link href={href} className="text-gray-700 hover:text-gray-900">{l.title}</Link>
                ) : (
                  <a href={href} className="text-gray-700 hover:text-gray-900">{l.title}</a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {footer.socialLinks.map((s: any, idx: number) => (
            <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">{s.platform}</a></li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderTop = () => {
    switch (footer?.footerVariant || 'classic') {
      case 'columns':
        return <VariantColumns />;
      case 'centered':
        return <VariantCentered />;
      case 'minimal':
        return null;
      case 'classic':
      default:
        return <VariantClassic />;
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
        layout === 'compact' ? 'max-w-7xl' :
        layout === 'wide' ? 'max-w-custom-1920' :
        'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
      }`}>
        {renderTop()}

        {/* Bas de page: copyright + liens */}
        <div className="border-t pt-6 text-center text-gray-500 text-sm">
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
                const isInternal = href.startsWith('/') && target === '_self';
                return (
                  <li key={key}>
                    {isInternal ? (
                      <Link href={href} className="text-gray-500 hover:text-gray-900 transition-colors">{label}</Link>
                    ) : (
                      <a href={href} target={target} className="text-gray-500 hover:text-gray-900 transition-colors" rel={target === '_blank' ? 'noopener noreferrer' : undefined}>{label}</a>
                    )}
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
