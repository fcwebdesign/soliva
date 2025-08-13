"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleObsessionOutilsProblemePasLogiciel = () => {
  const router = useTransitionRouter();
  useTransition();

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

  const handleBackClick = (e) => {
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
            <h1 className="blog-header">L'obsession des outils : pourquoi le problème n'est pas votre logiciel</h1>
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
                <h2>La stratégie avant la boîte à outils</h2>
                <p>"On a besoin du bon outil."</p>
                <p>C'est souvent la première phrase qu'on entend.</p>
                <p>CRM, outil d'emailing, IA, no-code…</p>
                <p>Et si ce n'était pas l'outil qui manquait, mais la stratégie pour s'en servir ?</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Confusion entre moyen et objectif</strong> → changer de logiciel ne résout pas un problème mal défini.</li>
                  <li><strong>Paralysie par choix</strong> → passer des semaines à comparer les options au lieu d'agir.</li>
                  <li><strong>Suréquipement</strong> → accumuler des outils qu'on n'utilise qu'à 10 % de leur potentiel.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Un mauvais outil bien utilisé fera toujours mieux qu'un excellent outil sans plan.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Ce qui compte vraiment</h2>
                <ul>
                  <li><strong>Des objectifs clairs</strong> → que voulez-vous atteindre et mesurer ?</li>
                  <li><strong>Un process solide</strong> → quelles étapes, quelles responsabilités ?</li>
                  <li><strong>Des compétences</strong> → qui sait utiliser quoi et comment ?</li>
                </ul>
                <p>Une fois tout ça défini… le choix de l'outil devient beaucoup plus simple.</p>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Mauvaise approche :</strong></p>
                <p>Acheter un logiciel CRM dernier cri sans avoir défini comment gérer les prospects.</p>
                <p><strong>✅ Bonne approche :</strong></p>
                <p>Structurer le parcours client, former l'équipe, puis choisir l'outil qui colle au besoin.</p>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on ne commence pas par "quel outil choisir ?"</p>
                <p>On commence par :</p>
                <ul>
                  <li>Quel est le problème à résoudre ?</li>
                  <li>Quels sont les objectifs ?</li>
                  <li>Quel process doit être mis en place ?</li>
                </ul>
                <p>Ensuite seulement, on sélectionne l'outil le plus simple et efficace possible.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Les outils sont des leviers, pas des solutions miracles.</p>
                <p>Sans stratégie, ils sont juste des abonnements qui s'accumulent sur votre relevé bancaire.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie d'aligner vos outils sur une vraie stratégie ?</p>
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

export default ArticleObsessionOutilsProblemePasLogiciel; 