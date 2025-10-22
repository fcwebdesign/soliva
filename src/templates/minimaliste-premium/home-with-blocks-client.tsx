"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PreviewBar from "@/components/PreviewBar";
import BlockRenderer from "@/blocks/BlockRenderer";

const HomeWithBlocksClient: React.FC = () => {
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
          console.log('🔍 Mode aperçu détecté (home avec blocs):', previewParam);
          
          // Ajouter la classe CSS pour le décalage
          document.documentElement.classList.add('preview-mode');
          
          // Charger le contenu de prévisualisation
          response = await fetch(`/api/admin/preview/${previewParam}`);
        } else {
          response = await fetch('/api/content');
        }
        
        const data = await response.json();
        console.log('📦 Contenu home chargé (avec blocs):', data.home);
        setContent(data);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu home:', error);
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

  const homeContent = content?.home || {};

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
      
      {/* Hero section avec image optionnelle */}
      <section className="py-[calc(var(--section)*1.2)]">
        {content?.featured?.image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={content.featured.image} 
              alt={content.featured.alt || "Image de fond"} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        <div className="container relative z-10">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6 }} 
            className={`title text-[clamp(48px,10vw,120px)] leading-[0.95] font-semibold tracking-tight ${content?.featured?.image ? 'text-white' : ''}`}
          >
            {homeContent?.hero?.title || 'Design minimal. Impact maximal.'}
          </motion.h1>
          {homeContent?.hero?.subtitle && (
            <motion.p 
              initial={{ y: 8, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2, duration: 0.6 }} 
              className={`mt-6 max-w-[56ch] text-[15px] md:text-base ${content?.featured?.image ? 'text-white/90' : 'text-black/65'}`}
            >
              {homeContent.hero.subtitle}
            </motion.p>
          )}
          <div className="mt-10 flex items-center gap-6 text-sm">
            <a href="#work" className={`link ${content?.featured?.image ? 'text-white' : ''}`}>Voir les projets</a>
            <a href="#contact" className={`link ${content?.featured?.image ? 'text-white' : ''}`}>Parler d'un projet</a>
          </div>
        </div>
      </section>

      {/* Blocs personnalisés */}
      {homeContent?.blocks && homeContent.blocks.length > 0 && (
        <section className="py-[var(--section)] border-t border-black/5">
          <div className="container">
            <BlockRenderer blocks={homeContent.blocks} />
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

export default HomeWithBlocksClient; 