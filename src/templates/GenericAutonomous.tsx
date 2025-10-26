import Link from 'next/link';
import { headers } from 'next/headers';
import { readContent } from '@/lib/content';
import BlockRenderer from '@/blocks/BlockRenderer';
import { buildNavModel } from '@/utils/navModel';

export default async function GenericAutonomous({ keyName, pathname: pathnameProp }: { keyName: string; pathname?: string }) {
  const content = await readContent();
  const headersList = await headers();
  const pathname = pathnameProp || headersList.get('x-pathname') || '/';

  const firstSegment = pathname.replace(/^\/+/, '').split('/')[0];
  const pageKey = firstSegment === '' ? 'home' : firstSegment;
  const systemKeys = new Set(['home', 'studio', 'work', 'blog', 'contact']);
  let pageData: any = null;
  if (systemKeys.has(pageKey)) {
    pageData = (content as any)[pageKey as keyof typeof content];
  } else {
    const customPages = (content as any)?.pages?.pages || [];
    pageData = customPages.find((p: any) => (p.slug || p.id) === pageKey) || null;
  }
  if (!pageData) pageData = (content as any).home || { blocks: [] };

  const model = buildNavModel({ nav: content.nav || { logo: keyName }, pages: (content as any).pages, pathname, templateKey: keyName });

  return (
    <div className="min-h-screen bg-white">
      {/* Header basique SSR (pas de spinner) */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center min-w-0">
              <Link href="/" className="flex items-center space-x-3">
                {model.brand.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={model.brand.image} alt="Logo" className="h-8 w-auto object-contain max-w-[180px]" />
                ) : (
                  <span className="text-xl font-bold tracking-tight text-gray-900 truncate">{model.brand.text}</span>
                )}
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              {model.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  target={item.target}
                  className={
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors ' +
                    (item.active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Contenu de page rendu côté serveur (les blocs hydratent côté client) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
          <BlockRenderer blocks={pageData.blocks} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{pageData?.title || 'Page'}</h2>
            <p className="text-gray-600 mb-8">{pageData?.description || "Aucun bloc pour l'instant"}</p>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-gray-400">Ajoute des blocs depuis l’admin pour cette page.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer connecté au contenu (identité, liens, réseaux, légaux) */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Identité + description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="font-semibold text-xl text-gray-900">
                {((content as any).footer?.logoImage) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(content as any).footer.logoImage}
                    alt="Logo"
                    className="h-8 max-w-[200px] object-contain"
                  />
                ) : (
                  (content as any).footer?.logo || (content as any).nav?.logo || keyName
                )}
              </div>
              {((content as any).footer?.description) && (
                <p className="text-sm text-gray-600 max-w-prose">{(content as any).footer.description}</p>
              )}
            </div>

            {/* Liens et Réseaux sociaux */}
            <div className="flex flex-col md:flex-row md:justify-end gap-12">
              {/* Liens */}
              {Array.isArray((content as any).footer?.links) && (content as any).footer.links.length > 0 && (
                <div className="space-y-2 text-left">
                  <ul className="space-y-1">
                    {(content as any).footer.links.map((l: any, idx: number) => (
                      <li key={idx}>
                        <a href={l.url || '#'} className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                          {l.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Réseaux sociaux */}
              {Array.isArray((content as any).footer?.socialLinks) && (content as any).footer.socialLinks.length > 0 && (
                <div className="space-y-2 text-left">
                  <ul className="space-y-1">
                    {(content as any).footer.socialLinks.map((s: any, idx: number) => (
                      <li key={idx}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          {s.platform}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Légaux / liens de bas de page */}
          <div className="border-t pt-6">
            <div className="text-center text-gray-500 text-sm">
              <p>
                {(content as any).footer?.copyright || `© ${new Date().getFullYear()} ${keyName}. Tous droits réservés.`}
              </p>
              {Array.isArray((content as any).footer?.bottomLinks) && (content as any).footer.bottomLinks.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-4 justify-center">
                  {(() => {
                    const footer: any = (content as any).footer || {};
                    const links: string[] = footer.bottomLinks || [];
                    const labelMap: Record<string, string | { title: string; customUrl?: string; target?: string }> = footer.legalPageLabels || {};
                    const pagesCfg: any = (content as any).pages || {};
                    const allPages: Array<{ slug?: string; id?: string; title?: string }> = pagesCfg.pages || [];
                    const defaultPages = [
                      { key: 'home', label: 'Accueil', path: '/' },
                      { key: 'work', label: 'Réalisations', path: '/work' },
                      { key: 'studio', label: 'Studio', path: '/studio' },
                      { key: 'blog', label: 'Journal', path: '/blog' },
                      { key: 'contact', label: 'Contact', path: '/contact' },
                    ];
                    const customPages = allPages.map((p) => ({ key: (p.slug || p.id) as string, label: p.title || 'Page', path: `/${p.slug || p.id}` }));
                    const available = [...defaultPages, ...customPages];
                    return links.map((key) => {
                      const page = available.find((p) => p.key === key);
                      const meta = labelMap[key];
                      let label = page?.label || key;
                      let href = page?.path || '#';
                      let target: '_self' | '_blank' = '_self';
                      if (typeof meta === 'string') label = meta;
                      if (meta && typeof meta === 'object') {
                        label = meta.title || label;
                        href = meta.customUrl || href;
                        target = meta.target === '_blank' ? '_blank' : '_self';
                      }
                      return (
                        <li key={key}>
                          <Link href={href} target={target} className="text-gray-500 hover:text-gray-900 transition-colors">
                            {label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
