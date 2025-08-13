"use client";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";


gsap.registerPlugin(SplitText);

const Studio = () => {
  useTransition(); // Utilise la configuration de transition

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
      return;
    }
  
    // ✅ Chrome / Firefox : SplitText + animation mot par mot (comme selected work)
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
  }, []);
  

  return (
    <>
      <ReactLenis root>
        {/* Div revealer seulement en mode curtain */}
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        <div className="studio">
          <div className="col">
            <h1 className="studio-header">Le studio</h1>
          </div>
          <div className="col">
            <h2>
              At Nuvoro, we believe creativity isn't just a skill, a mindset.
              Born from a passion for bold ideas and beautifully crafted
              storytelling, we're a collective of designers, strategists, and
              dreamers who thrive at the intersection of art and innovation.
              Today, we collaborate with visionary clients around the world to
              shape identities,
            </h2>

            <div className="about-img">
              <img
                src="/studio.jpg"
                alt="Team at work in Nuvoro's creative space"
              />
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default Studio;
