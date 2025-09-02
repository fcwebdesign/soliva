"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlockRenderer from '@/components/BlockRenderer';

export default function Page() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

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
      
      const response = await fetch('/api/content');
      const data = await response.json();
      
      console.log('📄 Contenu reçu:', data);
      console.log('📄 Pages disponibles:', data.pages?.pages);
      
      const foundPage = data.pages?.pages?.find((p: any) => 
        p.slug === slug || p.id === slug
      );
      
      console.log('🔍 Page trouvée:', foundPage);
      
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
          <header className="page-header py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="page-title text-4xl font-bold mb-4">
                  {pageData.title}
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
        </main>
      </div>
    </>
  );
} 