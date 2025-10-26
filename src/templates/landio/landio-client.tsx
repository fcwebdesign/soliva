'use client';
import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import HeaderLandio from './components/Header';
import FooterLandio from './components/Footer';

export default function LandioClient() {
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

  // Logique de routage améliorée
  const route = useMemo(() => {
    if (pathname === '/') return 'home';
    if (pathname === '/work') return 'work';
    if (pathname.startsWith('/work/')) return 'work-slug';
    if (pathname === '/blog') return 'blog';
    if (pathname.startsWith('/blog/')) return 'blog-slug';
    if (pathname === '/studio') return 'studio';
    if (pathname === '/contact') return 'contact';
    return 'custom';
  }, [pathname]);

  // Résolution de la page courante
  let pageData: any = null;
  if (route === 'home') {
    pageData = content?.home;
  } else if (route === 'work') {
    pageData = content?.work;
  } else if (route === 'work-slug') {
    // Pour les pages de projet individuelles, utiliser le contenu work
    pageData = content?.work;
  } else if (route === 'blog') {
    pageData = content?.blog;
  } else if (route === 'blog-slug') {
    // Pour les articles individuels, utiliser le contenu blog
    pageData = content?.blog;
  } else if (route === 'studio') {
    pageData = content?.studio;
  } else if (route === 'contact') {
    pageData = content?.contact;
  } else {
    // Page personnalisée
    const firstSegment = pathname?.split('/')[1] || '';
    const customPages = content?.pages?.pages || [];
    pageData = customPages.find((p: any) => (p.slug || p.id) === firstSegment) || null;
  }
  
  if (!pageData) pageData = content?.home || { blocks: [] };

  return (
    <div className="min-h-screen bg-white">
      <HeaderLandio nav={content.nav || { logo: 'landio' }} pages={content.pages} />
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
      <FooterLandio footer={content.footer} pages={content.pages} />
    </div>
  );
}