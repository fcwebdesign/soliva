"use client";
import React, { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import PreviewBar from "@/components/PreviewBar";
import UniversalBlockRenderer from "@/components/UniversalBlockRenderer";
import MinimalisteHome from "@/components/MinimalisteHome";
import { useTemplate } from '@/templates/context';
import { convertTemplateToBlocks } from '@/lib/template-to-blocks';

import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

interface UniversalClientProps {
  content: any;
  template?: string;
}

const UniversalClient: React.FC<UniversalClientProps> = ({ content, template = 'default' }) => {
  useTransition(); // Utilise la configuration de transition
  const { key: activeTemplate } = useTemplate();

  // Vérifier si on est en mode aperçu via l'URL
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<any>(content);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    
    if (previewParam) {
      setIsPreviewMode(true);
      setPreviewId(previewParam);
      console.log('🔍 Mode aperçu détecté (universel):', previewParam);
      
      // Ajouter la classe CSS pour le décalage
      document.documentElement.classList.add('preview-mode');
      
      // Charger le contenu de prévisualisation
      fetch(`/api/admin/preview/${previewParam}`)
        .then((response: Response) => response.json())
        .then((data: any) => {
          console.log('✅ Contenu de prévisualisation chargé (universel)');
          // Utiliser toutes les données, pas seulement data.home
          setPreviewContent(data || content);
        })
        .catch((error: Error) => {
          console.error('Erreur chargement prévisualisation:', error);
          setPreviewContent(content);
        });
    }
    
    // Cleanup function pour supprimer la classe
    return () => {
      document.documentElement.classList.remove('preview-mode');
    };
  }, [content]);

  // Déterminer le template à utiliser
  const currentTemplate = activeTemplate || template;

  useGSAP(() => {
    // Animation des caractères du h1 (seulement si pas de blocs ET pas template minimaliste)
    if (!previewContent?.blocks || previewContent.blocks.length === 0) {
      // Ne pas animer si c'est le template minimaliste
      if (currentTemplate === 'minimaliste-premium') return;
      
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
    }
  }, [currentTemplate]);

  // Convertir le contenu en blocs selon le template
  const blocks: any[] = previewContent?.blocks || convertTemplateToBlocks(previewContent, currentTemplate);

  return (
    <>
      {/* Div revealer seulement en mode curtain */}
      {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}

      {/* Bandeau d'aperçu */}
      {isPreviewMode && <PreviewBar />}

      <div className={`home template-${currentTemplate}`}>
        {/* Utiliser le template minimaliste pour la page d'accueil */}
        {currentTemplate === 'minimaliste-premium' ? (
          <MinimalisteHome 
            content={previewContent?.home || previewContent} 
            workProjects={previewContent?.work?.adminProjects || []} 
          />
        ) : (
          /* Utiliser les blocs convertis ou existants pour les autres templates */
          blocks && blocks.length > 0 ? (
            <UniversalBlockRenderer 
              blocks={blocks} 
              template={currentTemplate}
            />
          ) : (
            // Page d'accueil avec données simples - utiliser les données de home
            <div className="home-mask">
              <div className="header">
                <div className="container baseline absolute w-screen flex justify-end">
                  <h2 className="studio-header tracking-widest leading-snug">
                    {(previewContent?.home?.hero?.subtitle || previewContent?.subtitle || 'creative studio.\ndigital & brand strategy.').split('\n').map((line: string, index: number) => (
                      <span key={index}>
                        {line}
                        {index < (previewContent?.home?.hero?.subtitle || previewContent?.subtitle || 'creative studio.\ndigital & brand strategy.').split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </h2>
                </div>

                <div className="h1-wrapper">
                  <h1 className="styled-word">{previewContent?.home?.hero?.title || previewContent?.title || 'soliva'}</h1>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default UniversalClient; 