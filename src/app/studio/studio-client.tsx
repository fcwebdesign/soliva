"use client";
import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import FormattedText from "@/components/FormattedText";
import PreviewBar from "@/components/PreviewBar";
import BlockRenderer from "@/components/BlockRenderer";
import PageHeader from "@/components/PageHeader";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

interface StudioClientProps {
  content: any;
}

const StudioClient: React.FC<StudioClientProps> = ({ content: initialContent }) => {
  useTransition(); // Utilise la configuration de transition

  // Vérifier si on est en mode aperçu via l'URL
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<any>(initialContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Vérifier si on est en mode aperçu via l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const previewParam = urlParams.get('preview');
        
        if (previewParam) {
          setIsPreviewMode(true);
          setPreviewId(previewParam);
          console.log('🔍 Mode aperçu détecté (studio):', previewParam);
          
          // Ajouter la classe CSS pour le décalage
          document.documentElement.classList.add('preview-mode');
          
          // Charger le contenu de prévisualisation
          const response = await fetch(`/api/admin/preview/${previewParam}`);
          const data = await response.json();
          console.log('✅ Contenu de prévisualisation chargé (studio)');
          setPreviewContent(data.studio || initialContent);
        } else {
          // En mode normal, utiliser le contenu studio passé en props
          setPreviewContent(initialContent);
        }
      } catch (error) {
        console.error('Erreur chargement contenu studio:', error);
        setPreviewContent(initialContent);
      }
    };

    fetchContent();
    
    // Cleanup function pour supprimer la classe
    return () => {
      document.documentElement.classList.remove('preview-mode');
    };
  }, [initialContent]);

  useGSAP(() => {
    const isSafari = () => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("safari") && !ua.includes("chrome");
    };
  
    if (isSafari()) {
      // ✅ Alternative simple pour Safari (pas de SplitText)
      gsap.fromTo(
        ".studio-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.1,
          ease: "power4.out",
        }
      );
      
      // Animation du sous-titre
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
  
    // ✅ Chrome / Firefox : SplitText + animation mot par mot
    const splitText = SplitText.create(".studio-header", {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });
  
    gsap.set(splitText.words, { y: "110%" });
  
    // Délai ajusté selon le mode de transition
    const delay = TRANSITION_CONFIG.mode === 'circle' ? 1.15 : 1.75;

    gsap.to(splitText.words, {
      y: "0%",
      duration: 1.5,
      stagger: 0.25,
      delay: delay,
      ease: "power4.out",
    });
    
    // Animation du sous-titre après le titre
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
  }, []);
  

  return (
    <>
      <ReactLenis root>
        {/* Div revealer seulement en mode curtain */}
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="studio">
          <div className="col">
            <div className="work-header-section sticky top-32">
              <PageHeader
                title={previewContent?.hero?.title || 'Le studio'}
                description={previewContent?.description || previewContent?.content?.description}
                titleClassName="studio-header"
              />
              

            </div>
          </div>
          <div className="col">
            {/* Blocs dynamiques dans la colonne de droite */}
            {previewContent?.blocks && previewContent.blocks.length > 0 && (
              <div className="studio-blocks">
                <BlockRenderer blocks={previewContent.blocks} />
              </div>
            )}
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default StudioClient; 