'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useTransitionRouter } from 'next-view-transitions';
import BlockRenderer from '@/blocks/BlockRenderer';
import HeaderPearl from './components/Header';
import FooterPearl from './components/Footer';
import WorkPearl from './components/Work';
import BlogPearl from './components/Blog';
import { useRevealAnimation } from '@/animations/reveal/hooks/useRevealAnimation';
import RevealAnimation from '@/animations/reveal/RevealAnimationOriginal';
import { getTypographyConfig, getTypographyClasses, defaultTypography } from '@/utils/typography';
import '@/animations/reveal/reveal-original.css';

export default function PearlClient() {
  const [content, setContent] = useState<any>(null);
  const pathname = usePathname();
  
  // Récupérer les styles typographiques une seule fois
  const typoConfig = useMemo(() => getTypographyConfig(content || {}), [content]);
  const h1Classes = useMemo(() => getTypographyClasses('h1', typoConfig, defaultTypography.h1), [typoConfig]);
  const h1SingleClasses = useMemo(() => getTypographyClasses('h1Single', typoConfig, defaultTypography.h1Single), [typoConfig]);
  const pClasses = useMemo(() => getTypographyClasses('p', typoConfig, defaultTypography.p), [typoConfig]);
  
  // Calculer la config dynamiquement quand le contenu change
  // Utilise la config du backoffice (metadata.reveal) ou des valeurs par défaut
  const revealConfig = useMemo(() => {
    const revealSettings = content?.metadata?.reveal || {};
    return {
      text: {
        title: content?.nav?.logo || content?.home?.hero?.title || "Pearl",
        subtitle: content?.home?.hero?.subtitle || `Bienvenue sur ${content?.nav?.logo || "Pearl"}`,
        author: "" // Plus d'auteur affiché
      },
      images: revealSettings.images || ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'],
      duration: 4000,
      colors: {
        background: revealSettings.backgroundColor || '#000000',
        text: revealSettings.textColor || '#ffffff',
        progress: revealSettings.progressColor || '#ffffff'
      },
      logoSize: revealSettings.logoSize || 'medium'
    };
  }, [content]);

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
          console.log('📦 [PearlClient] Contenu chargé');
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };
    loadContent();
  }, [pathname]); // Recharger le contenu quand le pathname change

  // Logique de routage (sans hook pour garder l'ordre stable)
  const route = useMemo(() => {
    console.log('🧭 [PearlClient] Calcul de la route, pathname:', pathname);
    if (!content) {
      console.log('🧭 [PearlClient] Pas de contenu, retour home');
      return 'home';
    }
    
    // Récupérer les slugs personnalisés (uniquement pour home, studio, contact)
    const customSlugs = {
      home: content?.home?.customSlug,
      studio: content?.studio?.customSlug,
      contact: content?.contact?.customSlug,
    };
    
    // Vérifier home (avec ou sans slug personnalisé)
    if (pathname === '/') return 'home';
    if (customSlugs.home && pathname === `/${customSlugs.home}`) return 'home';
    
    // Vérifier work (slug fixe /work)
    if (pathname === '/work') return 'work';
    if (pathname.startsWith('/work/')) return 'work-slug';
    
    // Vérifier blog (slug fixe /blog)
    if (pathname === '/blog') return 'blog';
    if (pathname.startsWith('/blog/')) return 'blog-slug';
    
    // Vérifier studio (avec ou sans slug personnalisé)
    if (customSlugs.studio && pathname === `/${customSlugs.studio}`) return 'studio';
    if (pathname === '/studio') return 'studio';
    
    // Vérifier contact (avec ou sans slug personnalisé)
    if (customSlugs.contact && pathname === `/${customSlugs.contact}`) return 'contact';
    if (pathname === '/contact') return 'contact';
    
    return 'custom';
  }, [content, pathname]);

  // Logs pour debug des transitions (AVANT le return conditionnel pour respecter les règles des hooks)
  useEffect(() => {
    console.log('🔄 [PearlClient] Pathname changé:', pathname);
    console.log('🔄 [PearlClient] Route calculée:', route);
    console.log('🔄 [PearlClient] document.startViewTransition disponible:', typeof document !== 'undefined' && 'startViewTransition' in document);
    
    // Vérifier si View Transitions est supporté
    if (typeof document !== 'undefined') {
      console.log('🔄 [PearlClient] View Transitions support:', CSS.supports('view-transition-name', 'test'));
      console.log('🔄 [PearlClient] document.startViewTransition:', typeof (document as any).startViewTransition);
    }
  }, [pathname, route]);

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
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const slug = pathSegments[1] || '';
    individualItem = content?.work?.adminProjects?.find((p: any) => p.slug === slug || p.id === slug) ||
                     content?.work?.projects?.find((p: any) => p.slug === slug || p.id === slug);
    pageData = content?.work;
  } else if (route === 'blog') {
    pageData = content?.blog;
  } else if (route === 'blog-slug') {
    // Pour les articles individuels, trouver l'article spécifique
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const slug = pathSegments[1] || '';
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
              logoImage: content.nav?.logoImage, // Passer l'image du logo si elle existe
              logoSize: revealConfig.logoSize // Passer la taille du logo depuis la config
            }} 
            onComplete={completeReveal}
          />
        )}
      </div>

             {/* Bouton de debug temporaire */}
             {!shouldShowReveal && (
               <button 
                 onClick={resetAnimation}
                 className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg hover:bg-red-600 transition-colors"
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
            fullContent={content}
          />
          <main 
            data-view-transition-name={`main-${route}`}
            className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
              content.metadata?.layout === 'compact' ? 'max-w-7xl' :
              content.metadata?.layout === 'wide' ? 'max-w-custom-1920' :
              'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
            }`}
          >
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
                <div className="text-left py-10">
                  <h1 className={`${h1SingleClasses} mb-4`}>{individualItem.title}</h1>
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
              <div className="space-y-8" data-view-transition-name={`article-${individualItem.slug || individualItem.id}`}>
                <div className="text-left py-10">
                  <h1 data-view-transition-name={`article-title-${individualItem.slug || individualItem.id}`} className={`${h1SingleClasses} mb-4`}>{individualItem.title}</h1>
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
                  <Link 
                    href="/blog"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ← Retour au journal
                  </Link>
                </div>
              </div>
            ) : route === 'work' ? (
              <WorkPearl content={content?.work} fullContent={content} />
            ) : route === 'blog' ? (
              <BlogPearl content={content?.blog} fullContent={content} />
            ) : (
              <>
                {/* Hero - toujours affiché si présent */}
                {(pageData?.hero?.title || pageData?.title || pageData?.hero?.subtitle || pageData?.description) && (
                  <div className="text-left py-10">
                    <h1 className={`${h1Classes} mb-4`}>
                      {pageData?.hero?.title || pageData?.title || 'Page'}
                    </h1>
                    {pageData?.hero?.subtitle || pageData?.description ? (
                      <div
                        className={`mb-8 max-w-2xl ${pClasses}`}
                        dangerouslySetInnerHTML={{ __html: pageData?.hero?.subtitle || pageData?.description }}
                      />
                    ) : null}
                  </div>
                )}
                
                {/* Blocs - affichés s'ils existent */}
                {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 && pageData.blocks.some((block: any) => block.content && block.content.trim() !== '') ? (
                  <BlockRenderer blocks={pageData.blocks} />
                ) : !(pageData?.hero?.title || pageData?.title || pageData?.hero?.subtitle || pageData?.description) ? (
                  <div className="bg-gray-50 rounded-lg p-8">
                    <p className="text-gray-400">Ajoute des blocs depuis l'admin pour cette page.</p>
                  </div>
                ) : null}
              </>
            )}
          </main>
          <FooterPearl footer={content.footer} pages={content.pages} layout={content.metadata?.layout || 'standard'} fullContent={content} />
        </>
      )}
    </div>
  );
}
