"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleIAStrategieMarque = () => {
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
            <h1 className="blog-header">IA et stratégie de marque : arrêtez de copier, commencez à créer</h1>
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
                <h2>Pourquoi votre identité vaut mieux qu'un copier-coller</h2>
                <p>L'IA générative, c'est pratique.</p>
                <p>En quelques clics, on a un post Instagram, un slogan, une image "stylée".</p>
                <p>Mais si vous utilisez les mêmes outils, avec les mêmes prompts, que tout le monde… vous obtenez exactement le même résultat que vos concurrents.</p>
                <p>Une marque, ça se construit. Pas en copiant ce qui existe déjà, mais en créant ce que personne n'a encore vu.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li>Les IA grand public (ChatGPT, Midjourney, DALL·E…) se nourrissent des mêmes bases de données.</li>
                  <li>Les "prompts miracles" trouvés en ligne produisent toujours les mêmes formats.</li>
                  <li>Le contenu qui en sort est correct… mais interchangeable.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Résultat : vous ne vous distinguez plus. Votre communication se fond dans la masse.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>La vraie valeur pour une marque</h2>
                <p>Une stratégie de marque solide, ce n'est pas juste "produire du contenu" :</p>
                <ul>
                  <li><strong>Exprimer votre personnalité</strong> → ton, valeurs, style visuel.</li>
                  <li><strong>Créer de l'émotion</strong> → ce qui touche votre audience au-delà du message.</li>
                  <li><strong>Raconter une histoire</strong> → pas juste répondre à une requête.</li>
                </ul>
                <p>L'IA ne peut pas inventer votre identité.</p>
                <p>Elle peut seulement l'amplifier… si vous l'avez définie clairement.</p>
              </div>

              <div className="blog-section">
                <h2>Bien utiliser l'IA pour ne pas perdre votre identité</h2>
                <ul>
                  <li><strong>Entraînez-la avec vos propres contenus</strong> → textes, images, slogans.</li>
                  <li><strong>Mélangez intuition humaine et génération IA</strong> → l'IA vous donne des pistes, vous gardez la touche finale.</li>
                  <li><strong>Soyez spécifique</strong> → plus vos prompts sont liés à votre univers, moins vos résultats ressembleront aux autres.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on ne balance pas trois prompts et basta.</p>
                <p>On part de votre ADN, on définit un cadre créatif clair, et on utilise l'IA comme un amplificateur, pas un remplaçant.</p>
                <p>C'est la seule manière d'obtenir un contenu qui vous ressemble… et que personne ne peut copier.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Utiliser l'IA comme tout le monde, c'est produire du contenu moyen qui disparaît dans la foule.</p>
                <p>Utiliser l'IA pour amplifier une vision de marque unique, c'est créer des campagnes mémorables.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de créer avec l'IA sans perdre votre ADN ?</p>
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

export default ArticleIAStrategieMarque; 