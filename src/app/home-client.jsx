"use client";
import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import PreviewBar from "@/components/PreviewBar";
import BlockRenderer from "@/components/BlockRenderer";

import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function HomeClient({ content }) {
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
      console.log('🔍 Mode aperçu détecté:', previewParam);
      
      // Ajouter la classe CSS pour le décalage
      document.documentElement.classList.add('preview-mode');
      
      // Charger le contenu de prévisualisation
      fetch(`/api/admin/preview/${previewParam}`)
        .then(response => response.json())
        .then(data => {
          console.log('✅ Contenu de prévisualisation chargé');
          setPreviewContent(data.home || content);
        })
        .catch(error => {
          console.error('Erreur chargement prévisualisation:', error);
          setPreviewContent(content);
        });
    }
    
    // Cleanup function pour supprimer la classe
    return () => {
      document.documentElement.classList.remove('preview-mode');
    };
  }, [content]);

  useGSAP(() => {
    // Animation des caractères du h1 (toujours active)
    const splitTitle = SplitText.create("h1", {
      type: "chars",
      charsClass: "letter",
      mask: "chars",
    });
  
    gsap.set(splitTitle.chars, { y: "110%" });
  
    gsap.to(splitTitle.chars, {
      y: "0%",
      duration: 1.5,
      stagger: 0.1,
      delay: 1.25,
      ease: "power4.out",
    });
  
    // Animation des mots du h2 (baseline)
    const splitBaseline = SplitText.create(".baseline", {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });
  
    gsap.set(splitBaseline.words, { y: "110%" });
  
    gsap.to(splitBaseline.words, {
      y: "0%",
      duration: 1,
      stagger: 0.10,
      delay: 1.75,
      ease: "power4.out",
    });
  }, []);
  

  // Debug: afficher les données reçues
  console.log('🏠 HomeClient - Données reçues:', {
    content: content,
    previewContent: previewContent,
    hasBlocks: previewContent?.blocks && previewContent.blocks.length > 0,
    blocksCount: previewContent?.blocks?.length || 0
  });

  return (
    <>
      {/* Div revealer seulement en mode curtain */}
      {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}

      {/* Bandeau d'aperçu */}
      {isPreviewMode && <PreviewBar />}

      <div className="home">
        {/* Section Hero - toujours affichée */}
        <div className="home-mask">
          <div className="header">
            <div className="container baseline absolute w-screen flex justify-end">
              <h2 className="studio-header tracking-widest leading-snug">
                {(previewContent?.hero?.subtitle || 'creative studio.\ndigital & brand strategy.').split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < (previewContent?.hero?.subtitle || 'creative studio.\ndigital & brand strategy.').split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h2>
            </div>

            <div className="h1-wrapper">
              <h1 className="styled-word">{previewContent?.hero?.title || 'soliva'}</h1>
            </div>
          </div>
        </div>

        {/* Section Blocs - affichée si des blocs existent */}
        {(previewContent?.blocks && previewContent.blocks.length > 0) && (
          <div className="home-content">
            <BlockRenderer blocks={previewContent.blocks} />
          </div>
        )}
      </div>
    </>
  );
} 