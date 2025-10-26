'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import HeaderCreativeflow from './components/Header';
import FooterCreativeflow from './components/Footer';

export default function CreativeflowClient() {
  const [content, setContent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<string>('');
  const pathname = usePathname();

  console.log('🎬 CreativeflowClient - Rendu pour pathname:', pathname);

  // Charger le contenu une seule fois au montage
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
          console.log('✅ Contenu chargé');
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };
    loadContent();
  }, []); // Charger une seule fois

  // Mettre à jour la page courante quand le pathname change
  useEffect(() => {
    console.log('🔄 Pathname changé:', pathname);
    setCurrentPage(pathname);
  }, [pathname]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Logique de routage simple et directe
  let pageData: any = null;
  if (currentPage === '/') {
    pageData = content?.home;
  } else if (currentPage === '/work') {
    pageData = content?.work;
  } else if (currentPage === '/blog') {
    pageData = content?.blog;
  } else if (currentPage === '/studio') {
    pageData = content?.studio;
  } else if (currentPage === '/contact') {
    pageData = content?.contact;
  } else {
    pageData = content?.home;
  }

  console.log('📄 CreativeflowClient - currentPage:', currentPage, 'pageData:', pageData?.title);

  return (
    <div className="min-h-screen bg-white" key={currentPage}>
      <HeaderCreativeflow nav={content.nav || { logo: 'creativeflow' }} pages={content.pages} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
          <BlockRenderer blocks={pageData.blocks} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{pageData?.title || 'Page'}</h2>
            <p className="text-gray-600 mb-8">{pageData?.description || "Aucun bloc pour l'instant"}</p>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-gray-400">Ajoute des blocs depuis l'admin pour cette page.</p>
            </div>
          </div>
        )}
      </main>
      <FooterCreativeflow footer={content.footer} pages={content.pages} />
    </div>
  );
}