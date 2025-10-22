"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleMarquesMisentMoinsMaisMieux = (): React.JSX.Element => {
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
            <h1 className="blog-header">Les marques qui misent sur moins mais mieux</h1>
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
                <h2>La fatigue des contenus "fast-food"</h2>
                <p>Scroll infini.</p>
                <p>Posts qui se ressemblent.</p>
                <p>Vidéos qui durent 15 secondes et s'oublient en 5.</p>
                <p>Le web est saturé de contenus "fast-food" : faciles à produire, faciles à consommer… et faciles à oublier.</p>
                <p>Face à cette overdose, certaines marques prennent le contrepied : elles publient moins, mais mieux.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Course au volume</strong> → publier tous les jours pour "nourrir l'algorithme".</li>
                  <li><strong>Qualité sacrifiée</strong> → recyclage de contenus moyens juste pour rester visibles.</li>
                  <li><strong>Fatigue des audiences</strong> → trop d'info, pas assez de valeur.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Quand tout le monde parle, plus personne n'écoute.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi miser sur moins mais mieux</h2>
                <ul>
                  <li><strong>Plus d'impact</strong> → un contenu travaillé se partage et se retient plus longtemps.</li>
                  <li><strong>Plus de cohérence</strong> → chaque prise de parole reflète vraiment l'identité de la marque.</li>
                  <li><strong>Plus de confiance</strong> → votre audience sait que chaque publication vaut la peine d'être lue ou vue.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Fast-food content :</strong> une marque de cosmétique poste chaque jour une photo produit avec un texte générique → aucune réaction.</p>
                <p><strong>✅ Moins mais mieux :</strong> 2 posts par semaine avec des conseils d'experts, des avant/après clients et des coulisses de fabrication → engagement qui double, ventes qui suivent.</p>
              </div>

              <div className="blog-section">
                <h2>Comment passer à cette approche</h2>
                <ul>
                  <li><strong>Revoir la fréquence</strong> → publier selon votre capacité à produire de la qualité.</li>
                  <li><strong>Travailler le fond</strong> → apporter une vraie valeur (info, émotion, inspiration).</li>
                  <li><strong>Soigner la forme</strong> → visuels, ton, cohérence globale.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on préfère voir une marque publier 4 contenus mémorables par mois… qu'un post par jour oublié en une heure.</p>
                <p>La visibilité ne sert à rien sans impact.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Le contenu "fast-food" gave les algorithmes mais affame les marques.</p>
                <p>Miser sur moins mais mieux, c'est choisir la pertinence plutôt que le bruit.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de créer moins… mais mieux ?</p>
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

export default ArticleMarquesMisentMoinsMaisMieux; 