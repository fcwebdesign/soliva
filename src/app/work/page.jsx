"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const Work = () => {
  const router = useTransitionRouter();
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

  // Même logique que le Nav pour l'animation du cercle
  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  };

  const isBasicTransition = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("firefox") || isSafari();
  };

  function triggerPageTransition(path) {
    if (isBasicTransition()) {
      const curtain = document.getElementById("curtain");
      if (!curtain) return;

      curtain.style.transform = "translateY(0%)";

      const delay = isSafari() ? 1000 : 600;

      setTimeout(() => {
        router.push(path);
      }, delay);

      return;
    }

    // Chrome → animation native via clipPath avec cercle
    document.documentElement.animate(
      [
        {
          // Étape 1 : cercle très petit au centre
          clipPath: "circle(0% at 50% 50%)"
        },
        {
          // Étape 2 : cercle qui s'agrandit pour couvrir tout l'écran
          clipPath: "circle(150% at 50% 50%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.9, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const handleProjectClick = (path) => (e) => {
    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition(path);
    } else {
      router.push(path, {
        onTransitionReady: () => triggerPageTransition(path),
      });
    }
  };

  return (
    <>
      <ReactLenis root>
        {/* Div revealer seulement en mode curtain */}
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        <div className="work">
          <div className="col">
            <h1 className="work-header">selected work</h1>
          </div>
          <div className="col">
            <div className="projects">
              <div className="project">
                <h3>Project Alpha</h3>
                <div onClick={handleProjectClick("/work/project-1")} style={{ cursor: 'pointer' }}>
                  <img src="/img1.jpg" alt="Project Alpha" />
                </div>
              </div>
              
              <div className="project">
                <h3>Project Beta</h3>
                <div onClick={handleProjectClick("/work/project-2")} style={{ cursor: 'pointer' }}>
                  <img src="/img2.jpg" alt="Project Beta" />
                </div>
              </div>
              
              <div className="project">
                <h3>Project Gamma</h3>
                <div onClick={handleProjectClick("/work/project-3")} style={{ cursor: 'pointer' }}>
                  <img src="/img3.jpg" alt="Project Gamma" />
                </div>
              </div>
              
              <div className="project">
                <h3>Project Delta</h3>
                <div onClick={handleProjectClick("/work/project-4")} style={{ cursor: 'pointer' }}>
                  <img src="/img4.jpg" alt="Project Delta" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default Work;
