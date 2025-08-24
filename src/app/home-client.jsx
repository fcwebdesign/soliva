"use client";
import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import PreviewBar from "@/components/PreviewBar";
import BlockRenderer from "@/components/BlockRenderer";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

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
    // Enregistrer le temps de chargement de la page
    window.pageLoadTime = Date.now();
    
    // Animation des caractères du h1 (toujours active)
    const splitTitle = SplitText.create("h1", {
      type: "chars",
      charsClass: "letter",
      mask: "chars",
    });
  
    // Appliquer le style du cercle à la lettre "o" 
    splitTitle.chars.forEach((char, index) => {
      if (char.textContent === 'o') {
        gsap.set(char, {
          width: "0.75em",
          height: "0.75em",
          backgroundColor: "var(--fg)",
          borderRadius: "50%",
          color: "transparent",
          fontSize: "30vw",
          lineHeight: 0,
          verticalAlign: "middle",
          transform: "translateY(0.1em)"
        });
      }
    });
  
    gsap.set(splitTitle.chars, { y: "110%" });
  
    gsap.to(splitTitle.chars, {
      y: "0%",
      duration: 1.5,
      stagger: 0.1,
      delay: 1.25,
      ease: "power4.out",
    });


  
    // Animation des mots du h2 (baseline) - animation d'arrivée normale
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

    // Effet de pin pour la section hero
    if (previewContent?.blocks && previewContent.blocks.length > 0) {
      ScrollTrigger.create({
        trigger: ".home-mask",
        start: "top top",
        end: "bottom top",
        pin: true,
        pinSpacing: true, // Garder l'espace pour que les blocs arrivent en dessous
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Animation du rideau : les 3 premières lettres partent à gauche, les 3 dernières à droite
          const allLetters = document.querySelectorAll(".home .header h1 .letter");
          allLetters.forEach((letter, index) => {
            if (index < 3) { // s, o, l
              gsap.set(letter, {
                x: -progress * 100 + "%",
                opacity: 1 - (progress * 0.3),
                scale: 1 - (progress * 0.1)
              });
            } else { // i, v, a
              gsap.set(letter, {
                x: progress * 100 + "%",
                opacity: 1 - (progress * 0.3),
                scale: 1 - (progress * 0.1)
              });
            }
          });
          
          // Animation du sous-titre - disparaît avec effet SplitText pendant le scroll
          // Seulement après 3 secondes pour laisser l'animation d'arrivée se terminer
          const timeSinceStart = Date.now() - window.pageLoadTime;
          if (timeSinceStart > 3000) {
            splitBaseline.words.forEach((word, index) => {
              gsap.set(word, {
                y: progress * 110 + "%" // Chaque mot descend progressivement
              });
            });
          }
        },
        onLeave: () => {
          // Changer le thème vers le noir quand on sort de la zone de pin
          document.documentElement.setAttribute('data-theme', 'dark');
        },
        onEnterBack: () => {
          // Remettre le thème clair quand on revient dans la zone de pin
          document.documentElement.setAttribute('data-theme', 'light');
        }
      });
    }

    // Animation des blocs de service avec IntersectionObserver
    if (previewContent?.blocks && previewContent.blocks.length > 0) {
      const blocks = document.querySelectorAll('.service-offering-block');
      const observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target); // Pour ne l'animer qu'une fois
            }
          });
        },
        { threshold: 0.15 }
      );
      blocks.forEach(block => observer.observe(block));
      
      // Cleanup function
      return () => observer.disconnect();
    }

  }, [previewContent?.blocks]);
  

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
            <div className="baseline absolute w-screen flex justify-end">
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