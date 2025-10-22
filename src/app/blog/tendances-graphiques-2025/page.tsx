"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleTendancesGraphiques = (): React.JSX.Element => {
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
            <h1 className="blog-header">Les tendances graphiques… pourquoi il faut parfois les ignorer</h1>
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
                <h2>Suivre la mode ou marquer les esprits ?</h2>
                <p>Chaque année, les "tendances graphiques" font leur grand retour :</p>
                <ul>
                  <li>Typographies XXL</li>
                  <li>Dégradés flashy</li>
                  <li>Effets 3D ultra-réalistes</li>
                  <li>Layouts asymétriques</li>
                </ul>
                <p>Les designers s'emballent, les marques veulent "être dans le coup"… et quelques mois plus tard, tout le monde a la même identité visuelle.</p>
                <p>Résultat : au lieu de se démarquer, on se noie dans un océan de clones.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Tendance ≠ identité</strong> → Copier un style à la mode ne dit rien sur qui vous êtes.</li>
                  <li><strong>Durée de vie courte</strong> → Ce qui est "fresh" en janvier peut déjà être ringard en décembre.</li>
                  <li><strong>Uniformisation</strong> → Plus une tendance prend de place, plus vos visuels ressemblent à ceux de vos concurrents.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Les tendances sont des outils… pas des costumes à enfiler sans réfléchir.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Quand les suivre… et quand les ignorer</h2>
                <p><strong>À suivre</strong> → si elles renforcent votre identité existante et parlent à votre audience.</p>
                <p><strong>À ignorer</strong> → si elles vous éloignent de vos valeurs ou brouillent votre message.</p>
                <p><strong>Exemple :</strong></p>
                <p>Une marque minimaliste adopte soudain des couleurs néon "parce que c'est la mode" → incohérence totale.</p>
                <p>À l'inverse, intégrer subtilement un dégradé moderne dans un univers graphique déjà vibrant → cohérent.</p>
              </div>

              <div className="blog-section">
                <h2>Comment se démarquer</h2>
                <ul>
                  <li><strong>Partir de votre ADN</strong> → valeurs, personnalité, ton visuel.</li>
                  <li><strong>Utiliser la tendance comme inspiration</strong>, pas comme modèle.</li>
                  <li><strong>Créer vos propres codes</strong> → couleurs, typographies, compositions reconnaissables au premier coup d'œil.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on ne court pas après les tendances : on les filtre.</p>
                <p>Si elles servent le message, on les intègre.</p>
                <p>Si elles font juste "joli" mais brouillent l'histoire, on passe notre tour.</p>
                <p>Notre but : créer des visuels qui vieillissent bien et restent reconnaissables, même dans 5 ans.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Suivre les tendances aveuglément, c'est être à la mode aujourd'hui… et invisible demain.</p>
                <p>Se démarquer, c'est savoir quand dire oui et quand dire non.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie d'un univers graphique qui traverse les modes ?</p>
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

export default ArticleTendancesGraphiques; 