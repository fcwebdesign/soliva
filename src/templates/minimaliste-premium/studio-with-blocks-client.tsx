"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PreviewBar from "@/components/PreviewBar";
import BlockRenderer from "@/blocks/BlockRenderer";
import FormattedText from "@/components/FormattedText";

const StudioWithBlocksClient: React.FC = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Vérifier si on est en mode aperçu via l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const previewParam = urlParams.get('preview');
        
        let response;
        if (previewParam) {
          setIsPreviewMode(true);
          setPreviewId(previewParam);
          console.log('🔍 Mode aperçu détecté (studio avec blocs):', previewParam);
          
          // Ajouter la classe CSS pour le décalage
          document.documentElement.classList.add('preview-mode');
          
          // Charger le contenu de prévisualisation
          response = await fetch(`/api/admin/preview/${previewParam}`);
        } else {
          response = await fetch('/api/content');
        }
        
        const data = await response.json();
        console.log('📦 Contenu studio chargé (avec blocs):', data.studio);
        setContent(data);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu studio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    
    // Cleanup function pour supprimer la classe
    return () => {
      document.documentElement.classList.remove('preview-mode');
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  const studioContent = content?.studio || {};

  return (
    <div className="font-sans bg-white text-gray-900">
      {isPreviewMode && <PreviewBar />}
      <style jsx global>{`
        :root {
          --bg: 255 255 255;
          --fg: 17 17 17;
          --muted: 106 106 106;
          --max: 1200px;
          --section: 160px;
        }
        html, body { 
          background: rgb(var(--bg)); 
          color: rgb(var(--fg)); 
        }
        * { 
          border-radius: 0; 
          box-shadow: none; 
        }
        .container { 
          width: 100%; 
          max-width: var(--max); 
          margin: 0 auto; 
          padding: 0 20px; 
        }
        .title { 
          font-family: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; 
        }
        .body { 
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; 
        }
        .link { 
          text-decoration: underline; 
          text-underline-offset: 3px; 
          text-decoration-thickness: 1px; 
        }
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
        }
      `}</style>
      
      {/* Header minimaliste */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/10">
        <div className="container h-[68px] flex items-center justify-between">
          <a href="/" className="tracking-tight font-semibold">{content?.nav?.logo || "STUDIO"}</a>
          <nav className="hidden md:flex items-center gap-10 text-sm text-black/70">
            <a href="/" className="hover:text-black transition-colors">Accueil</a>
            <a href="/work" className="hover:text-black transition-colors">Réalisations</a>
            <a href="/studio" className="hover:text-black transition-colors">Studio</a>
            <a href="/contact" className="hover:text-black transition-colors">Contact</a>
          </nav>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="py-[calc(var(--section)*1.2)]">
        <div className="container">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6 }} 
            className="title text-[clamp(48px,10vw,120px)] leading-[0.95] font-semibold tracking-tight"
          >
            {studioContent?.hero?.title || 'Le studio'}
          </motion.h1>
          {studioContent?.description && (
            <motion.div 
              initial={{ y: 8, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2, duration: 0.6 }} 
              className="mt-6 max-w-[56ch] text-[15px] md:text-base text-black/65"
            >
              <FormattedText>{studioContent.description}</FormattedText>
            </motion.div>
          )}
        </div>
      </section>

      {/* Image optionnelle - même style que Featured */}
      {studioContent?.content?.image?.src && (
        <section aria-label="Featured" className="border-y border-black/5">
          <div className="container py-10 md:py-14">
            <div className="aspect-[21/9] w-full overflow-hidden">
              <img 
                src={studioContent.content.image.src} 
                alt={studioContent.content.image.alt || "Image studio"} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </section>
      )}

      {/* Blocs personnalisés */}
      {studioContent?.blocks && studioContent.blocks.length > 0 && (
        <section className="py-[var(--section)] border-t border-black/5">
          <div className="container">
            <BlockRenderer blocks={studioContent.blocks} />
          </div>
        </section>
      )}
      
      {/* Footer minimaliste */}
      <footer className="border-t border-black/5">
        <div className="container h-[80px] flex items-center justify-between text-sm text-black/60">
          <p>© {new Date().getFullYear()} Studio — Tous droits réservés</p>
          <div className="flex items-center gap-6">
            {content?.footer?.socialLinks?.map((social, index) => (
              <a 
                key={index} 
                href={social.url || "#"} 
                target={social.target || "_blank"}
                className="hover:text-black transition-colors capitalize"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudioWithBlocksClient; 