'use client';
import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';
import BlockRenderer from '@/blocks/BlockRenderer';
import HeaderPearl from './components/Header';
import FooterPearl from './components/Footer';
import WorkPearl from './components/Work';
import BlogPearl from './components/Blog';
import { useRevealAnimation } from '@/animations/reveal/hooks/useRevealAnimation';
import RevealAnimation from '@/animations/reveal/RevealAnimationOriginal';
import '@/animations/reveal/reveal-original.css';

export default function PearlClient() {
  const [content, setContent] = useState<any>(null);
  const pathname = usePathname();
  
  // Calculer la config dynamiquement quand le contenu change
  // Utilise l'identité (nav.logo) comme titre, et le sous-titre du hero ou une valeur par défaut
  const revealConfig = useMemo(() => ({
    text: {
      title: content?.nav?.logo || content?.home?.hero?.title || "Pearl",
      subtitle: content?.home?.hero?.subtitle || `Bienvenue sur ${content?.nav?.logo || "Pearl"}`,
      author: "" // Plus d'auteur affiché
    },
    images: ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'],
    duration: 4000,
    colors: {
      background: '#000000',
      text: '#ffffff',
      progress: '#ffffff'
    }
  }), [content]);

  const { shouldShowReveal, isRevealComplete, completeReveal, config } = useRevealAnimation(revealConfig);


  // Fonction pour réinitialiser l'animation (utile pour tester)
  const resetAnimation = () => {
    sessionStorage.removeItem('pearl-reveal-seen');
    window.location.reload();
  };

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
      {/* Overlay noir pour l'animation */}
      <div 
        id="reveal-overlay"
        className={`fixed inset-0 z-[9998] ${
          shouldShowReveal && content ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ 
          backgroundColor: config.colors.background,
          clipPath: shouldShowReveal ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          willChange: 'clip-path',
        }}
      >
        {shouldShowReveal && content && (content.nav?.logo || content.nav?.logoImage) && (
          <RevealAnimation 
            config={{
              ...config,
              text: {
                title: content.nav.logo || config.text.title,
                subtitle: content.nav.logo || config.text.subtitle, // Respecter la casse du backend
                author: config.text.author
              },
              logoImage: content.nav?.logoImage // Passer l'image du logo si elle existe
            }} 
            onComplete={completeReveal}
          />
        )}
      </div>

             {/* Bouton de debug temporaire */}
             {!shouldShowReveal && (
               <button 
                 onClick={resetAnimation}
                 className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded"
               >
                 Reset Animation
               </button>
             )}

             {/* Contenu principal: toujours rendu (le reveal est une surcouche) */}
             {/* Le header doit être rendu même pendant l'animation pour permettre la transition */}
             {content && (
               <>
                 <HeaderPearl
            nav={content.nav || { logo: 'pearl' }} 
            pages={content.pages} 
            variant={(() => {
              const variant = content.nav?.headerVariant || 'classic';
              if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
                console.log('🟢 [PearlClient] Header variant utilisé (FRONT):', variant);
              }
              return variant;
            })()}
            layout={content.metadata?.layout || 'standard'}
          />
          <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
            content.metadata?.layout === 'compact' ? 'max-w-7xl' :
            content.metadata?.layout === 'wide' ? 'max-w-custom-1920' :
            'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
          }`}>
            {route === 'home' ? (
              Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
                <BlockRenderer blocks={pageData.blocks} />
              ) : (
                <div className="text-center py-12">
                  {pageData?.hero?.subtitle || pageData?.description ? (
                    <div
                      className="text-gray-600 mb-8 max-w-2xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: pageData?.hero?.subtitle || pageData?.description }}
                    />
                  ) : (
                    <p className="text-gray-400">Aucun contenu pour l'instant</p>
                  )}
                </div>
              )
            ) : route === 'work-slug' && individualItem ? (
              // Page de projet individuel
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{individualItem.title}</h1>
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
                  <Link href="/work" className="text-blue-600 hover:text-blue-800">
                    ← Retour aux réalisations
                  </Link>
                </div>
              </div>
            ) : route === 'blog-slug' && individualItem ? (
              // Page d'article individuel
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{individualItem.title}</h1>
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
                  <Link href="/blog" className="text-blue-600 hover:text-blue-800">
                    ← Retour au journal
                  </Link>
                </div>
              </div>
            ) : Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 && pageData.blocks.some((block: any) => block.content && block.content.trim() !== '') ? (
              <BlockRenderer blocks={pageData.blocks} />
            ) : route === 'work' ? (
              <WorkPearl content={content?.work} />
            ) : route === 'blog' ? (
              <BlogPearl content={content?.blog} />
            ) : (
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {pageData?.hero?.title || pageData?.title || 'Page'}
                </h1>
                {pageData?.hero?.subtitle || pageData?.description ? (
                  <div
                    className="text-gray-600 mb-8 max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: pageData?.hero?.subtitle || pageData?.description }}
                  />
                ) : (
                  <p className="text-gray-400">Aucun contenu pour l'instant</p>
                )}
                <div className="bg-gray-50 rounded-lg p-8">
                  <p className="text-gray-400">Ajoute des blocs depuis l'admin pour cette page.</p>
                </div>
              </div>
            )}
          </main>
          <FooterPearl footer={content.footer} pages={content.pages} layout={content.metadata?.layout || 'standard'} />
        </>
      )}
    </div>
  );
}
