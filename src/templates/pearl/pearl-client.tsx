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
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography, applyTypographyFonts } from '@/utils/typography';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { resolvePalette } from '@/utils/palette';
import '@/animations/reveal/reveal-original.css';
import './pearl.css';

export default function PearlClient() {
  const [metadata, setMetadata] = useState<any>(null); // Métadonnées uniquement (< 100 Ko)
  const [fullContent, setFullContent] = useState<any>(null); // Contenu complet (chargé uniquement si nécessaire)
  const pathname = usePathname();
  
  // Utiliser metadata comme source principale, fullContent comme complément
  const content = useMemo(() => {
    if (!metadata) return null;
    // Fusionner metadata avec fullContent si disponible
    if (fullContent) {
      return {
        ...metadata,
        // Remplacer les articles/projets par les versions complètes si disponibles
        blog: {
          ...metadata.blog,
          articles: fullContent.blog?.articles || metadata.blog?.articles
        },
        work: {
          ...metadata.work,
          // Préserver toutes les propriétés de metadata.work (columns, filters, etc.)
          ...(fullContent.work && {
            adminProjects: fullContent.work?.adminProjects || metadata.work?.adminProjects,
            projects: fullContent.work?.projects || metadata.work?.projects
          })
        }
      };
    }
    return metadata;
  }, [metadata, fullContent]);
  
  // Récupérer les styles typographiques - mémoriser uniquement sur les changements de typography dans metadata
  const typoConfig = useMemo(() => getTypographyConfig(content || {}), [content?.metadata?.typography]);
  const h1Classes = useMemo(() => getTypographyClasses('h1', typoConfig, defaultTypography.h1), [typoConfig]);
  const h1SingleClasses = useMemo(() => getTypographyClasses('h1Single', typoConfig, defaultTypography.h1Single), [typoConfig]);
  const pClasses = useMemo(() => getTypographyClasses('p', typoConfig, defaultTypography.p), [typoConfig]);
  
  // Récupérer les couleurs personnalisées (hex) si elles existent
  const h1CustomColor = useMemo(() => getCustomColor('h1', typoConfig), [typoConfig]);
  const h1SingleCustomColor = useMemo(() => getCustomColor('h1Single', typoConfig), [typoConfig]);
  const pCustomColor = useMemo(() => getCustomColor('p', typoConfig), [typoConfig]);

  // Appliquer les polices globales dès que la typo change
  useEffect(() => {
    applyTypographyFonts(typoConfig);
  }, [typoConfig]);
  
  // Calculer la config dynamiquement - mémoriser uniquement sur les changements de reveal
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
  }, [content?.metadata?.reveal, content?.nav?.logo, content?.home?.hero]);

  const { shouldShowReveal, isRevealComplete, completeReveal, config } = useRevealAnimation(revealConfig);

  // Détecter si la palette est dark et appliquer data-theme sur html (comme dans l'iframe)
  // MAIS NE PAS APPLIQUER DANS L'ADMIN
  useEffect(() => {
    if (typeof window === 'undefined' || !content) return;
    
    // Ne pas appliquer le thème dans l'admin
    if (document.body.classList.contains('admin-page') || document.documentElement.hasAttribute('data-admin')) {
      return;
    }
    
    const detectTheme = () => {
      try {
        if (content?.metadata) {
          const palette = resolvePaletteFromContent(content);
          const resolved = resolvePalette(palette);
          const theme = resolved.isDark ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Pearl] Thème détecté depuis metadata:', theme, { isDark: resolved.isDark, background: palette.background });
          }
          return;
        }
        
        // Sinon, utiliser la variable CSS --background du DOM
        const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
        if (bgColor) {
          const palette = {
            background: bgColor,
            primary: '#000000',
            secondary: '#000000',
            accent: '#000000',
            text: '#000000',
            textSecondary: '#000000',
            border: '#000000'
          };
          const resolved = resolvePalette(palette);
          const theme = resolved.isDark ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Pearl] Thème détecté depuis CSS:', theme, { isDark: resolved.isDark, background: bgColor });
          }
        }
      } catch (e) {
        console.warn('[Pearl] Erreur détection thème:', e);
      }
    };
    
    detectTheme();
  }, [content]);

  // Fonction pour réinitialiser l'animation (utile pour tester)
  const resetAnimation = () => {
    sessionStorage.removeItem('pearl-reveal-seen');
    window.location.reload();
  };

  // Phase 1 : Charger les métadonnées (léger, < 100 Ko)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/api/content/metadata?t=${Date.now()}`, {
          cache: 'no-store', // Pas de cache pour éviter les problèmes de colonnes
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
          console.log('✅ Métadonnées chargées');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur chargement métadonnées:', error);
        }
        // Fallback : charger l'ancienne API si la nouvelle échoue
        try {
          const fallbackResponse = await fetch('/api/content', { cache: 'no-store' });
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setMetadata(fallbackData);
            setFullContent(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
        }
      }
    };
    
    loadMetadata();
    
    // Écouter les événements de mise à jour du contenu (depuis l'admin)
    const handleContentUpdate = () => {
      // Recharger les métadonnées
      loadMetadata();
      // Réinitialiser le contenu complet pour forcer le rechargement
      setFullContent(null);
    };
    
    window.addEventListener('content-updated', handleContentUpdate);
    
    // Écouter aussi les changements de localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'content-updated' || e.key?.includes('updated')) {
        loadMetadata();
        setFullContent(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Phase 2 : Charger le contenu complet uniquement pour les pages individuelles
  useEffect(() => {
    if (!metadata) return;
    
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const route = pathSegments[0] || 'home';
    const slug = pathSegments[1];
    
    // Réinitialiser fullContent si on n'est plus sur une page individuelle
    if (route !== 'blog' && route !== 'work') {
      setFullContent(null);
      return;
    }
    
    // Charger le contenu complet uniquement pour les pages individuelles
    if (route === 'blog' && slug) {
      // Page d'article individuel
      const loadArticle = async () => {
        try {
          const response = await fetch(`/api/content/article/${slug}`, {
            cache: 'force-cache',
            headers: {
              'Cache-Control': 'public, max-age=300'
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Mettre à jour uniquement les articles dans le contenu
            setFullContent({
              blog: {
                ...metadata.blog,
                articles: metadata.blog?.articles?.map((a: any) => 
                  (a.slug === slug || a.id === slug) ? data.article : a
                ) || [data.article]
              }
            });
          }
        } catch (error) {
          console.error('Erreur chargement article:', error);
        }
      };
      loadArticle();
    } else if (route === 'work' && slug) {
      // Page de projet individuel
      const loadProject = async () => {
        try {
          const response = await fetch(`/api/content/project/${slug}`, {
            cache: 'force-cache',
            headers: {
              'Cache-Control': 'public, max-age=300'
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Mettre à jour uniquement les projets dans le contenu
            setFullContent({
              work: {
                ...metadata.work,
                adminProjects: metadata.work?.adminProjects?.map((p: any) =>
                  (p.slug === slug || p.id === slug) ? data.project : p
                ) || [data.project],
                projects: metadata.work?.projects?.map((p: any) =>
                  (p.slug === slug || p.id === slug) ? data.project : p
                ) || [data.project]
              }
            });
          }
        } catch (error) {
          console.error('Erreur chargement projet:', error);
        }
      };
      loadProject();
    } else {
      // Sur les listes (blog ou work sans slug), réinitialiser fullContent
      setFullContent(null);
    }
  }, [metadata, pathname]);

  // Logique de routage (sans hook pour garder l'ordre stable)
  const route = useMemo(() => {
    if (!content) {
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

  // Supprimé les logs de debug qui ralentissent tout

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
    // Chercher d'abord dans fullContent (contenu complet), puis dans metadata (métadonnées)
    const workContent = fullContent?.work || content?.work;
    individualItem = workContent?.adminProjects?.find((p: any) => p.slug === slug || p.id === slug) ||
                     workContent?.projects?.find((p: any) => p.slug === slug || p.id === slug);
    pageData = content?.work;
  } else if (route === 'blog') {
    pageData = content?.blog;
  } else if (route === 'blog-slug') {
    // Pour les articles individuels, trouver l'article spécifique
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const slug = pathSegments[1] || '';
    // Chercher d'abord dans fullContent (contenu complet), puis dans metadata (métadonnées)
    const blogContent = fullContent?.blog || content?.blog;
    individualItem = blogContent?.articles?.find((a: any) => a.slug === slug || a.id === slug);
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
    <div className="min-h-screen bg-background">
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
              }
              return variant;
            })()}
            layout={content.metadata?.layout || 'standard'}
            fullContent={content}
          />
          <main 
            data-view-transition-name={`main-${route}`}
            className={`mx-auto px-4 sm:px-6 lg:px-8 ${
              // Retirer py-8 si le premier bloc est hero-floating-gallery, mouse-image-gallery, hero-simple ou fullscreen-carousel avec fullscreen
              (() => {
                const blocks = pageData?.blocks || [];
                const firstVisibleBlock = blocks.find((b: any) => !b.hidden);
                const isFullscreenCarousel = firstVisibleBlock?.type === 'fullscreen-carousel' && firstVisibleBlock?.data?.fullscreen;
                return firstVisibleBlock?.type === 'hero-floating-gallery' || 
                       firstVisibleBlock?.type === 'mouse-image-gallery' || 
                       firstVisibleBlock?.type === 'hero-simple' ||
                       isFullscreenCarousel ? '' : 'py-8';
              })()
            } ${
              content.metadata?.layout === 'compact' ? 'max-w-7xl' :
              content.metadata?.layout === 'wide' ? 'max-w-custom-1920' :
              'max-w-screen-2xl' // standard par défaut (1536px, proche de 1440px)
            }`}
          >
            {route === 'home' ? (
              Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
                <BlockRenderer blocks={pageData.blocks} content={fullContent || metadata} />
              ) : (
                <div className="text-center py-12">
                  {pageData?.hero?.subtitle || pageData?.description ? (
                    <div
                      className="text-muted-foreground mb-8 max-w-2xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: pageData?.hero?.subtitle || pageData?.description }}
                    />
                  ) : (
                    <p className="text-muted-foreground">Aucun contenu pour l'instant</p>
                  )}
                </div>
              )
            ) : route === 'work-slug' && individualItem ? (
              // Page de projet individuel
              <div className="space-y-8">
                <div className="text-left py-10">
                  <h1 
                    className={`${h1SingleClasses} mb-4`}
                    style={h1SingleCustomColor ? { color: h1SingleCustomColor } : undefined}
                  >
                    {individualItem.title}
                  </h1>
                  {individualItem.category && (
                    <p className="text-lg text-muted-foreground mb-4">Catégorie: {individualItem.category}</p>
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
                    <p className="text-muted-foreground">Ce projet n'a pas encore de contenu.</p>
                  </div>
                )}
                
                <div className="text-center">
                  <Link href="/work" className="text-accent hover:text-accent/80">
                    ← Retour aux réalisations
                  </Link>
                </div>
              </div>
            ) : route === 'blog-slug' && individualItem ? (
              // Page d'article individuel
              <div className="space-y-8" data-view-transition-name={`article-${individualItem.slug || individualItem.id}`}>
                <div className="text-left py-10">
                  <h1 
                    data-view-transition-name={`article-title-${individualItem.slug || individualItem.id}`}
                    className={`${h1SingleClasses} mb-4`}
                    style={h1SingleCustomColor ? { color: h1SingleCustomColor } : undefined}
                  >
                    {individualItem.title}
                  </h1>
                  {individualItem.publishedAt && (
                    <p className="text-lg text-muted-foreground mb-4">
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
                    <p className="text-muted-foreground">Cet article n'a pas encore de contenu.</p>
                  </div>
                )}
                
                <div className="text-center">
                  <Link 
                    href="/blog"
                    className="text-accent hover:text-accent/80"
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
                {/* Blocs - affichés s'ils existent */}
                {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
                  <BlockRenderer blocks={pageData.blocks} content={fullContent || metadata} />
                ) : (
                  <div className="bg-muted rounded-lg p-8">
                    <p className="text-muted-foreground">Ajoute des blocs depuis l'admin pour cette page.</p>
                  </div>
                )}
              </>
            )}
          </main>
          <FooterPearl footer={content.footer} pages={content.pages} layout={content.metadata?.layout || 'standard'} fullContent={content} />
        </>
      )}
    </div>
  );
}
