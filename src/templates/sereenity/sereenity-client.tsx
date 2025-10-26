'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import HeaderSereenity from './components/Header';
import FooterSereenity from './components/Footer';

export default function SereenityClient() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  return (
    <div className="min-h-screen bg-white">
      <HeaderSereenity nav={content.nav || { logo: 'sereenity' }} pages={content.pages} />
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
      <FooterSereenity footer={content.footer} pages={content.pages} />
    </div>
  );
}