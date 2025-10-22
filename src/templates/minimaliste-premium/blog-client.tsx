"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PreviewBar from "@/components/PreviewBar";

const BlogMinimalisteClient: React.FC = () => {
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
          console.log('🔍 Mode aperçu détecté (blog minimaliste):', previewParam);
          
          // Ajouter la classe CSS pour le décalage
          document.documentElement.classList.add('preview-mode');
          
          // Charger le contenu de prévisualisation
          response = await fetch(`/api/admin/preview/${previewParam}`);
        } else {
          response = await fetch('/api/content');
        }
        
        const data = await response.json();
        console.log('📦 Contenu blog chargé (minimaliste):', data.blog);
        setContent(data);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu blog:', error);
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

  const blogContent = content?.blog || {};
  const articles = blogContent.articles || [];

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
      `}</style>
      
      {/* Header minimaliste */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/8">
        <div className="container h-[72px] flex items-center justify-between">
          <a href="/" className="tracking-tight font-semibold text-lg hover:opacity-80 transition-opacity">
            {content?.nav?.logo || "STUDIO"}
          </a>
          <nav className="hidden md:flex items-center gap-12 text-sm text-black/70">
            <a href="/" className="hover:text-black transition-colors duration-200">Accueil</a>
            <a href="/work" className="hover:text-black transition-colors duration-200">Réalisations</a>
            <a href="/studio" className="hover:text-black transition-colors duration-200">Studio</a>
            <a href="/blog" className="text-black font-medium">Blog</a>
          </nav>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="py-[calc(var(--section)*1.5)]">
        <div className="container">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6 }} 
            className="title text-[clamp(52px,12vw,140px)] leading-[0.92] font-semibold tracking-tight mb-8"
          >
            {blogContent?.hero?.title || 'Blog'}
          </motion.h1>
          {blogContent?.description && (
            <motion.p 
              initial={{ y: 8, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2, duration: 0.6 }} 
              className="max-w-[65ch] text-[16px] md:text-[18px] text-black/70 leading-relaxed"
            >
              {blogContent.description}
            </motion.p>
          )}
        </div>
      </section>

      {/* Liste des articles */}
      {articles.length > 0 ? (
        <section className="py-[calc(var(--section)*1.2)] border-t border-black/6">
          <div className="container">
            <div className="space-y-16">
              {articles.map((article, index) => (
                <motion.article 
                  key={article.slug || index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="border-b border-black/6 pb-16 last:border-b-0"
                >
                  <div className="grid md:grid-cols-12 gap-16 items-start">
                    <div className="md:col-span-4">
                      <h2 className="title text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                        <a href={`/blog/${article.slug}`} className="hover:opacity-80 transition-opacity">
                          {article.title}
                        </a>
                      </h2>
                      {article.publishedAt && (
                        <time className="text-sm text-black/50">
                          {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      )}
                    </div>
                    <div className="md:col-span-8">
                      {article.excerpt && (
                        <p className="text-black/70 leading-relaxed mb-6">
                          {article.excerpt}
                        </p>
                      )}
                      <a 
                        href={`/blog/${article.slug}`}
                        className="link text-sm hover:text-black transition-colors"
                      >
                        Lire l'article →
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-[calc(var(--section)*1.2)] border-t border-black/6">
          <div className="container">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center py-20"
            >
              <h2 className="title text-2xl font-medium tracking-tight mb-4">
                Aucun article pour le moment
              </h2>
              <p className="text-black/60">
                Les articles du blog apparaîtront ici.
              </p>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Footer minimaliste */}
      <footer className="border-t border-black/6 mt-20">
        <div className="container h-[88px] flex items-center justify-between text-sm text-black/60">
          <p className="font-medium">© {new Date().getFullYear()} Studio — Tous droits réservés</p>
          <div className="flex items-center gap-8">
            {content?.footer?.socials?.map((social, index) => (
              <a 
                key={index} 
                href={social.url || "#"} 
                target={social.target || "_blank"}
                className="hover:text-black transition-colors duration-200 font-medium capitalize"
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

export default BlogMinimalisteClient; 