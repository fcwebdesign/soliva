"use client";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function HomeClient({ content }) {
  useTransition(); // Utilise la configuration de transition

  useGSAP(() => {
    // Animation des caractères du h1
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
    
  }, {});
  

  return (
    <>
      {/* Div revealer seulement en mode curtain */}
      {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}

      <div className="home">
        <div className="home-mask">
          <div className="header">
            <div className="container baseline absolute w-screen flex justify-end">
              <h2 className="studio-header tracking-widest leading-snug">
                {(content?.hero?.subtitle || 'creative studio.\ndigital & brand strategy.').split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < (content?.hero?.subtitle || 'creative studio.\ndigital & brand strategy.').split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h2>
            </div>

            <div className="h1-wrapper">
              <h1 className="styled-word">{content?.hero?.title || 'soliva'}</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 