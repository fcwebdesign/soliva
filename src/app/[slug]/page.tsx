"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGSAP } from "@gsap/react";
import BlockRenderer from '../../components/BlockRenderer';
import PageHeader from '../../components/PageHeader';
import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function Page() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Fonction pour extraire le titre du contenu
  const getContentTitle = (pageData) => {
    if (!pageData) return '';
    
    // Priorité 1: Utiliser le titre du bloc Hero (pour les pages custom, contact, studio)
    if (pageData.hero?.title && pageData.hero.title.trim()) {
      return pageData.hero.title;
    }
    
    // Priorité 2: Utiliser le titre de la page
    if (pageData.title && pageData.title.trim()) {
      return pageData.title;
    }
    
    // Priorité 3: Chercher dans les blocs scalables
    if (pageData.blocks && pageData.blocks.length > 0) {
      for (const block of pageData.blocks) {
        if (block.type === 'h1' && block.content) {
          return block.content;
        }
        if (block.type === 'h2' && block.content) {
          return block.content;
        }
      }
    }
    
    // Priorité 4: Chercher dans le contenu HTML
    if (pageData.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pageData.content;
      
      // Chercher le premier H1 ou H2
      const h1 = tempDiv.querySelector('h1');
      if (h1 && h1.textContent.trim()) {
        return h1.textContent.trim();
      }
      
      const h2 = tempDiv.querySelector('h2');
      if (h2 && h2.textContent.trim()) {
        return h2.textContent.trim();
      }
    }
    
    // Fallback: titre par défaut
    return 'Page sans titre';
  };

  // Animation GSAP avec SplitText
  useGSAP(() => {
    const isSafari = () => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("safari") && !ua.includes("chrome");
    };

    if (isSafari()) {
      // ✅ Alternative simple pour Safari (pas de SplitText)
      gsap.fromTo(
        "h1",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.1,
          ease: "power4.out",
        }
      );
      
      // Animation de la description
      gsap.fromTo(
        ".contact-description",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
        }
      );
      
      return;
    }

    // ✅ Chrome / Firefox : SplitText + animation mot par mot (comme les autres pages)
    const splitText = SplitText.create("h1", {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    gsap.set(splitText.words, { y: "110%" });

    // Délai ajusté selon le mode de transition (comme les autres pages)
    const delay = 1.75; // Délai par défaut

    gsap.to(splitText.words, {
      y: "0%",
      duration: 1.5,
      stagger: 0.25,
      delay: delay,
      ease: "power4.out",
    });
    
    // Animation de la description après le titre (comme les autres pages)
    gsap.fromTo(
      ".contact-description",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: delay + 0.5,
        ease: "power3.out",
      }
    );
  }, { dependencies: [pageData] });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    
    if (previewParam) {
      setIsPreviewMode(true);
      setPreviewId(previewParam);
      console.log('🔍 Mode aperçu détecté:', previewParam);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [previewId]);

  const fetchContent = async () => {
    try {
      console.log('🔍 Recherche de la page:', slug);
      
      // ✅ OPTIMISATION : Utiliser l'API metadata au lieu de /api/content (41 MB)
      const response = await fetch('/api/content/metadata');
      const data = await response.json();
      
      console.log('📄 Contenu reçu:', data);
      console.log('📄 Pages disponibles:', data.pages?.pages);
      
      const foundPage = data.pages?.pages?.find((p: any) => 
        p.slug === slug || p.id === slug
      );
      
      console.log('🔍 Page trouvée:', foundPage);
      console.log('🔍 Titre de la page:', foundPage?.title);
      console.log('🔍 Slug de la page:', foundPage?.slug);
      console.log('🔍 ID de la page:', foundPage?.id);
      
      setPageData(foundPage);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!pageData) {
    return (
      <div>
        <h1>Page non trouvée</h1>
        <p>Slug recherché: {slug}</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .page-custom {
          min-height: 100vh;
          transition: all 0.3s ease;
        }
        
        .page-custom[data-theme="light"] {
          background-color: var(--bg, #ffffff);
          color: var(--fg, #000000);
        }
        
        .page-custom[data-theme="dark"] {
          background-color: var(--bg, #000000);
          color: var(--fg, #ffffff);
        }
        
        .page-header {
          transition: all 0.3s ease;
        }
        
        .page-title {
          transition: all 0.3s ease;
        }
        
        .page-description {
          transition: all 0.3s ease;
        }
        
        .page-content {
          transition: all 0.3s ease;
        }
        
        /* Forcer les couleurs pour les services en thème sombre */
        [data-theme="dark"] .service-offering-block h3 {
          color: #ffffff !important;
        }
        
        [data-theme="dark"] .service-offering-block p {
          color: #cccccc !important;
        }
        
        [data-theme="dark"] .service-offerings-section h2 {
          color: #ffffff !important;
        }
        
        /* Désactiver l'animation d'opacité pour les pages personnalisées */
        .page-custom .service-offering-block {
          opacity: 1 !important;
          transform: none !important;
        }
      `}</style>
      
      <div className="page-custom">
        <main className="flex-1">
          {/* Layout conditionnel selon le choix de l'admin */}
          {pageData.layout === 'two-columns' ? (
            /* Layout deux colonnes (comme les autres pages) */
            <div className="project-page">
              <div className="col">
                <PageHeader
                  title={getContentTitle(pageData)}
                  description={pageData.description}
                  titleClassName="work-header"
                  sticky={true}
                  stickyTop="top-32"
                />
              </div>
              <div className="col">
                <div className="project-content mt-3">
                  {/* Priorité 1: Utiliser les blocs scalables s'ils existent */}
                  {pageData.blocks && pageData.blocks.length > 0 ? (
                    <div className="project-blocks">
                      <BlockRenderer blocks={pageData.blocks} />
                    </div>
                  ) : (
                    /* Priorité 2: Essayer de convertir le content HTML en blocs scalables */
                    <div className="project-description">
                      {pageData.content ? (
                        <div 
                          className="prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: pageData.content }} />
                      ) : (
                        <div className="text-center">
                          <p>Cette page est en cours de rédaction...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Layout une colonne (layout simple) */
            <>
              <header className="page-header py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h1 className="page-title text-4xl font-bold mb-4">
                      {getContentTitle(pageData)}
                    </h1>
                    {pageData.description && (
                      <p className="page-description text-xl max-w-3xl mx-auto">
                        {pageData.description}
                      </p>
                    )}
                  </div>
                </div>
              </header>

              <div className="page-content">
                {/* Priorité 1: Utiliser les blocs scalables s'ils existent */}
                {pageData.blocks && pageData.blocks.length > 0 ? (
                  <BlockRenderer blocks={pageData.blocks} />
                ) : (
                  /* Priorité 2: Essayer de convertir le content HTML en blocs scalables */
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {pageData.content ? (
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: pageData.content }} />
                    ) : (
                      <div className="text-center">
                        <p>Cette page est en cours de rédaction...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
} 