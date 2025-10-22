"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleSiIATuaitCreativiteAvantSauver = (): React.JSX.Element => {
  const router = useTransitionRouter();
  useTransition();

  const isSafari = (): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  };

  const isBasicTransition = (): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("firefox") || isSafari();
  };

  function triggerPageTransition(path: string): void {
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

    document.documentElement.animate(
      [
        {
          clipPath: "circle(0% at 50% 50%)"
        },
        {
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

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition("/blog");
    } else {
      router.push("/blog", {
        onTransitionReady: () => triggerPageTransition("/blog"),
      });
    }
  };

  useGSAP(() => {
    const splitText = SplitText.create("h1", {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    gsap.set(splitText.words, { y: "110%" });

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
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        <div className="blog-article-page">
          <div className="col">
            <h1 className="blog-header">Et si l'IA tuait la créativité… avant de la sauver ?</h1>
            <div className="blog-meta">
              <div className="blog-date">
                <h3>Date</h3>
                <p>2024</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="blog-content">
              <div className="blog-section">
                <h2>Le risque d'un monde où tout se ressemble</h2>
                <p>L'IA nous aide à créer plus vite que jamais : textes, visuels, vidéos, musiques…</p>
                <p>Mais à force d'utiliser les mêmes outils, nourris des mêmes bases de données, on voit fleurir les mêmes images, les mêmes styles, les mêmes phrases.</p>
                <p>Le danger ?</p>
                <p>Un web saturé de contenus propres, corrects… et totalement interchangeables.</p>
                <p>Avant de libérer la créativité, l'IA pourrait bien commencer par l'uniformiser.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Sources communes</strong> → ChatGPT, Midjourney, DALL·E… s'appuient sur les mêmes références.</li>
                  <li><strong>Prompts recyclés</strong> → les "recettes" virales se diffusent… et produisent les mêmes résultats.</li>
                  <li><strong>Production de masse</strong> → plus de volume, moins d'originalité.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Le risque : un monde créatif qui tourne en rond, sans surprise.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi c'est un cycle</h2>
                <p><strong>Phase 1 – Standardisation :</strong> tout le monde utilise les mêmes outils et les mêmes styles.</p>
                <p><strong>Phase 2 – Saturation :</strong> l'audience se lasse des formats clonés.</p>
                <p><strong>Phase 3 – Réinvention :</strong> ceux qui mélangent IA + vision humaine reprennent l'avantage.</p>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Mauvais usage :</strong> taper "affiche minimaliste" dans Midjourney → obtenir un fond beige, une police sans-serif et trois formes géométriques aléatoires. C'est beau… mais c'est le même style que sur 90 % des moodboards Pinterest.</p>
                <p><strong>✅ Bon usage :</strong> partir de cette base, puis injecter vos codes graphiques, vos couleurs, et un élément narratif qui raconte votre marque. Là, ça devient unique.</p>
              </div>

              <div className="blog-section">
                <h2>Comment éviter l'effet "photocopie"</h2>
                <ul>
                  <li><strong>Injecter votre ADN</strong> → ton, références, style graphique, storytelling.</li>
                  <li><strong>Aller au-delà du prompt</strong> → utiliser l'IA comme point de départ, pas comme produit final.</li>
                  <li><strong>Nourrir l'IA avec vos propres données</strong> → contenus passés, archives, créations originales.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on voit l'IA comme un multiplicateur de créativité si on l'utilise en conscience.</p>
                <p>L'IA en pilote automatique produit de l'uniforme.</p>
                <p>L'IA pilotée par une vision produit de l'unique.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Oui, l'IA peut tuer la créativité… si on la laisse tout faire.</p>
                <p>Mais utilisée avec intention, elle peut aussi la sauver en nous libérant du temps pour explorer, tester, oser.</p>
                <p>La différence, ce n'est pas l'outil. C'est l'humain derrière.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de créer avec l'IA sans perdre votre originalité ?</p>
                <a href="/contact" className="cta-link">Parlons-en →</a>
              </div>

              <div className="blog-navigation">
                <a href="/blog" onClick={handleBackClick} className="back-link">
                  ← Retour au Journal
                </a>
              </div>
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default ArticleSiIATuaitCreativiteAvantSauver; 