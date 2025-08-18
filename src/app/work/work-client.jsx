"use client";
import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import FormattedText from "@/components/FormattedText";
import PreviewBar from "@/components/PreviewBar";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const WorkClient = ({ content }) => {
  const router = useTransitionRouter();
  useTransition(); // Utilise la configuration de transition

  // Vérifier si on est en mode aperçu (Draft Mode de Next.js)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Vérifier le Draft Mode via un cookie ou une classe CSS
    const isDraftMode = document.documentElement.classList.contains('preview-mode') ||
                       document.cookie.includes('__prerender_bypass') ||
                       window.location.search.includes('preview=true');
    setIsPreviewMode(isDraftMode);
  }, []);

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
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="work">
          <div className="col">
            <div className="work-header-section sticky top-32">
              <h1 className="work-header">{content?.hero?.title || 'selected work'}</h1>
              
              <div className="work-filters">
                {(content?.filters || ['All', 'Strategy', 'Brand', 'Digital', 'IA']).map((filter, index) => (
                  <button key={index} className={`filter-btn ${index === 0 ? 'active' : ''}`}>
                    {filter}
                  </button>
                ))}
              </div>
              
              <div className="work-description">
                <FormattedText>
                  {content?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
                </FormattedText>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="projects">
              {(content?.projects || []).map((project, index) => (
                <div key={index} className="project">
                  <div className="project-layout">
                    <div onClick={handleProjectClick(`/work/${project.slug}`)} style={{ cursor: 'pointer' }}>
                      <img src={project.image} alt={project.alt} />
                    </div>
                    <div>
                      <h3>{project.title}</h3>
                      <p className="project-description">
                        <FormattedText>{project.description}</FormattedText>
                      </p>
                      <span className="project-category">{project.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default WorkClient; 