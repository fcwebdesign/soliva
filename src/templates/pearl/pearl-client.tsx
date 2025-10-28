'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import HeaderPearl from './components/Header';
import FooterPearl from './components/Footer';
import WorkPearl from './components/Work';
import BlogPearl from './components/Blog';

export default function PearlClient() {
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

  // Logique de routage (sans hook pour garder l'ordre stable)
  const route = (() => {
    if (pathname === '/') return 'home';
    if (pathname === '/work') return 'work';
    if (pathname.startsWith('/work/')) return 'work-slug';
    if (pathname === '/blog') return 'blog';
    if (pathname.startsWith('/blog/')) return 'blog-slug';
    if (pathname === '/studio') return 'studio';
    if (pathname === '/contact') return 'contact';
    return 'custom';
  })();

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  // Résolution de la page courante
  let pageData: any = null;
  let individualItem: any = null; // Pour les articles/projets individuels
  
  if (route === 'home') {
    pageData = content?.home;
  } else if (route === 'work') {
    pageData = content?.work;
  } else if (route === 'work-slug') {
    // Pour les pages de projet individuelles, trouver le projet spécifique
    const slug = pathname?.split('/')[2] || '';
    individualItem = content?.work?.adminProjects?.find((p: any) => p.slug === slug || p.id === slug) ||
                     content?.work?.projects?.find((p: any) => p.slug === slug || p.id === slug);
    pageData = content?.work;
  } else if (route === 'blog') {
    pageData = content?.blog;
  } else if (route === 'blog-slug') {
    // Pour les articles individuels, trouver l'article spécifique
    const slug = pathname?.split('/')[2] || '';
    individualItem = content?.blog?.articles?.find((a: any) => a.slug === slug || a.id === slug);
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
      <HeaderPearl 
        nav={content.nav || { logo: 'pearl' }} 
        pages={content.pages} 
        variant={content.nav?.headerVariant || 'classic'}
        layout={content.metadata?.layout || 'standard'}
      />
      <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
        content.metadata?.layout === 'compact' ? 'max-w-7xl' :
        content.metadata?.layout === 'wide' ? 'max-w-custom-1920' :
        'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
      }`}>
        {route === 'work-slug' && individualItem ? (
          // Page de projet individuel
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{individualItem.title}</h1>
              {individualItem.category && (
                <p className="text-lg text-gray-600 mb-4">Catégorie: {individualItem.category}</p>
              )}
            </div>
            
            {individualItem.image && (
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <img
                  src={individualItem.image}
                  alt={individualItem.title || 'Image du projet'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {individualItem.blocks && individualItem.blocks.length > 0 ? (
              <BlockRenderer blocks={individualItem.blocks} />
            ) : individualItem.content || individualItem.description ? (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: individualItem.content || individualItem.description }} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Ce projet n'a pas encore de contenu.</p>
              </div>
            )}
            
            <div className="text-center">
              <a href="/work" className="text-blue-600 hover:text-blue-800">
                ← Retour aux réalisations
              </a>
            </div>
          </div>
        ) : route === 'blog-slug' && individualItem ? (
          // Page d'article individuel
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{individualItem.title}</h1>
              {individualItem.publishedAt && (
                <p className="text-lg text-gray-600 mb-4">
                  Publié le {new Date(individualItem.publishedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            
            {individualItem.blocks && individualItem.blocks.length > 0 ? (
              <BlockRenderer blocks={individualItem.blocks} />
            ) : individualItem.content ? (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: individualItem.content }} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Cet article n'a pas encore de contenu.</p>
              </div>
            )}
            
            <div className="text-center">
              <a href="/blog" className="text-blue-600 hover:text-blue-800">
                ← Retour au journal
              </a>
            </div>
          </div>
        ) : Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
          <BlockRenderer blocks={pageData.blocks} />
        ) : route === 'work' ? (
          <WorkPearl content={content?.work} />
        ) : route === 'blog' ? (
          <BlogPearl content={content?.blog} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {pageData?.hero?.title || pageData?.title || 'Page'}
            </h2>
            <p className="text-gray-600 mb-8">
              {pageData?.hero?.subtitle || pageData?.description || "Aucun bloc pour l'instant"}
            </p>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-gray-400">Ajoute des blocs depuis l'admin pour cette page.</p>
            </div>
          </div>
        )}
      </main>
      <FooterPearl footer={content.footer} pages={content.pages} layout={content.metadata?.layout || 'standard'} />
    </div>
  );
}