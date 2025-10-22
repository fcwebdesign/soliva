"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PreviewBar from "@/components/PreviewBar";

const ContactMinimalisteClient: React.FC = () => {
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
          console.log('🔍 Mode aperçu détecté (contact minimaliste):', previewParam);
          
          // Ajouter la classe CSS pour le décalage
          document.documentElement.classList.add('preview-mode');
          
          // Charger le contenu de prévisualisation
          response = await fetch(`/api/admin/preview/${previewParam}`);
        } else {
          response = await fetch('/api/content');
        }
        
        const data = await response.json();
        console.log('📦 Contenu contact chargé (minimaliste):', data.contact);
        setContent(data);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu contact:', error);
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

  const contactContent = content?.contact || {};

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
            <a href="/contact" className="text-black font-medium">Contact</a>
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
            {contactContent?.title || contactContent?.hero?.title || 'Travaillons ensemble'}
          </motion.h1>
        </div>
      </section>

      {/* Section contact */}
      <section className="py-[calc(var(--section)*1.2)] border-t border-black/6">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2, duration: 0.6 }}
                className="title text-3xl md:text-5xl font-semibold tracking-tight text-black/90 mb-8"
              >
                Parlons projet
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-black/60 text-sm leading-relaxed"
              >
                Prêt à donner vie à votre vision ? Contactez-nous pour discuter de votre projet.
              </motion.p>
            </div>
            <div className="md:col-span-8">
              <div className="space-y-12">
                {/* Email principal */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="border-b border-black/6 pb-8"
                >
                  <h3 className="title text-xl font-medium tracking-tight mb-4">
                    {contactContent?.sections?.collaborations?.title || 'Collaborations'}
                  </h3>
                  <a 
                    href={`mailto:${contactContent?.sections?.collaborations?.email || contactContent?.email || 'hello@studio.fr'}`}
                    className="link text-[18px] text-black/70 hover:text-black transition-colors"
                  >
                    {contactContent?.sections?.collaborations?.email || contactContent?.email || 'hello@studio.fr'}
                  </a>
                </motion.div>

                {/* Autres contacts */}
                {contactContent?.sections?.inquiries && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="border-b border-black/6 pb-8"
                  >
                    <h3 className="title text-xl font-medium tracking-tight mb-4">
                      {contactContent.sections.inquiries.title}
                    </h3>
                    <a 
                      href={`mailto:${contactContent.sections.inquiries.email}`}
                      className="link text-[18px] text-black/70 hover:text-black transition-colors"
                    >
                      {contactContent.sections.inquiries.email}
                    </a>
                  </motion.div>
                )}

                {/* Réseaux sociaux */}
                {contactContent?.socials && contactContent.socials.length > 0 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <h3 className="title text-xl font-medium tracking-tight mb-6">
                      Suivez-nous
                    </h3>
                    <div className="flex items-center gap-8">
                      {contactContent.socials.map((social, index) => (
                        <a 
                          key={index}
                          href="#"
                          className="link text-[16px] text-black/70 hover:text-black transition-colors capitalize"
                        >
                          {social}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
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

export default ContactMinimalisteClient; 