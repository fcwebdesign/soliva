"use client";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import BriefGenerator from "@/components/BriefGenerator";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ContactClient = ({ content }) => {
  useTransition(); // Utilise la configuration de transition

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
        
        <div className="contact">
          <div className="col">
            <h1 className="work-header">{content?.hero?.title || 'Contact Us'}</h1>
          </div>
          <div className="col">
            <div className="contact-copy">
              <h2>{content?.sections?.collaborations?.title || 'Collaborations'}</h2>
              <h2>{content?.sections?.collaborations?.email || 'studio@nuvoro.com'}</h2>
            </div>

            <div className="contact-copy">
              <h2>{content?.sections?.inquiries?.title || 'Inquiries'}</h2>
              <h2>{content?.sections?.inquiries?.email || 'support@nuvoro.com'}</h2>
            </div>

            <div className="socials">
              {(content?.socials || ['Instagram', 'Twitter', 'LinkedIn']).map((social, index) => (
                <p key={index}>{social}</p>
              ))}
            </div>

            <BriefGenerator content={content?.briefGenerator} />
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default ContactClient; 