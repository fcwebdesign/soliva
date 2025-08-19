"use client";
import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import BriefGenerator from "@/components/BriefGenerator";
import PreviewBar from "@/components/PreviewBar";
import FormattedText from "@/components/FormattedText";
import PageHeader from "@/components/PageHeader";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ContactClient = ({ content }) => {
  useTransition(); // Utilise la configuration de transition

  // Vérifier si on est en mode aperçu via l'URL
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [previewContent, setPreviewContent] = useState(content);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    
    if (previewParam) {
      setIsPreviewMode(true);
      setPreviewId(previewParam);
      console.log('🔍 Mode aperçu détecté (contact):', previewParam);
      
      // Ajouter la classe CSS pour le décalage
      document.documentElement.classList.add('preview-mode');
      
      // Charger le contenu de prévisualisation
      fetch(`/api/admin/preview/${previewParam}`)
        .then(response => response.json())
        .then(data => {
          console.log('✅ Contenu de prévisualisation chargé (contact)');
          setPreviewContent(data.contact || content);
        })
        .catch(error => {
          console.error('Erreur chargement prévisualisation (contact):', error);
          setPreviewContent(content);
        });
    }
    
    // Cleanup function pour supprimer la classe
    return () => {
      document.documentElement.classList.remove('preview-mode');
    };
  }, [content]);

  useGSAP(() => {
    const splitText = SplitText.create("h1", {
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
  }, {});

  return (
    <>
      <ReactLenis root>
        {/* Div revealer seulement en mode curtain */}
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="contact">
          <div className="col">
            <PageHeader
              title={previewContent?.hero?.title || 'Contact Us'}
              description={previewContent?.description}
              titleClassName="work-header"
            />
          </div>
          <div className="col">
            <div className="contact-copy">
              <h2>{previewContent?.sections?.collaborations?.title || 'Collaborations'}</h2>
              <h2>{previewContent?.sections?.collaborations?.email || 'studio@nuvoro.com'}</h2>
            </div>

            <div className="contact-copy">
              <h2>{previewContent?.sections?.inquiries?.title || 'Inquiries'}</h2>
              <h2>{previewContent?.sections?.inquiries?.email || 'support@nuvoro.com'}</h2>
            </div>

            <div className="socials">
              {(previewContent?.socials || ['Instagram', 'Twitter', 'LinkedIn']).map((social, index) => (
                <p key={index}>{social}</p>
              ))}
            </div>

            <BriefGenerator content={previewContent?.briefGenerator} />
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default ContactClient; 