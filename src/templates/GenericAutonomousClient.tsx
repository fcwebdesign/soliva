"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import { buildNavModel } from '@/utils/navModel';

export default function GenericAutonomousClient({ keyName }: { keyName: string }) {
  const [content, setContent] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };
    loadContent();
  }, [pathname]); // Recharger le contenu quand le pathname change

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const firstSegment = (pathname || '/').split('?')[0].split('#')[0].replace(/^\/+/, '').split('/')[0];
  const pageKey = firstSegment === '' ? 'home' : firstSegment;
  const systemKeys = new Set(['home','studio','work','blog','contact']);
  let pageData: any = null;
  if (systemKeys.has(pageKey)) {
    pageData = (content as any)[pageKey];
  } else {
    const customPages = (content as any)?.pages?.pages || [];
    pageData = customPages.find((p: any) => (p.slug || p.id) === pageKey) || null;
  }
  if (!pageData) pageData = (content as any).home || { blocks: [] };

  const headerModel = buildNavModel({ nav: content.nav || { logo: keyName }, pages: content.pages, pathname });

  return (
    <div className="min-h-screen bg-white">
      {/* Basic Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center min-w-0">
              <a href="/" className="flex items-center space-x-3">
                {headerModel.brand.image ? (
                  <img src={headerModel.brand.image} alt="Logo" className="h-8 w-auto object-contain max-w-[180px]" />
                ) : (
                  <span className="text-xl font-bold tracking-tight text-gray-900 truncate">{headerModel.brand.text}</span>
                )}
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              {headerModel.items.map((item) => (
                <a key={item.key} href={item.href} target={item.target}
                   className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Page content */}
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

      {/* Basic Footer connected to admin footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>{(content.footer?.copyright) || `© ${new Date().getFullYear()} ${keyName}. Tous droits réservés.`}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

