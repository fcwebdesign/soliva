"use client";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const Project1 = () => {

  useGSAP(() => {
    // Animation du titre avec SplitText (comme selected work)
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

    // Animation progressive du contenu
    gsap.fromTo(".project-content > *", 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.2,
        delay: 0.5,
        ease: "power2.out" 
      }
    );
  }, {});

  return (
    <>
      <ReactLenis root>
        <div className="project-page">
          <div className="col">
            <h1 className="work-header">Project Alpha</h1>
          </div>
          <div className="col">
            <div className="project-content">
              <div className="project-image">
                <img src="/img1.jpg" alt="Project Alpha" />
              </div>
              
              <div className="project-description">
                <h2>Description</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                
                <h2>Technologies</h2>
                <p>React, Next.js, GSAP, Tailwind CSS</p>
                
                <h2>Year</h2>
                <p>2024</p>
              </div>
              
              <div className="project-navigation">
                <Link href="/work" className="back-link">
                  ← Back to Selected Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default Project1; 