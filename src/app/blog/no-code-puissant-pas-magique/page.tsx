"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleNoCodePuissantPasMagique = (): React.JSX.Element => {
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
            <h1 className="blog-header">No-code : puissant, mais pas magique</h1>
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
                <h2>Ce qu'il peut vraiment faire… et ce qu'il ne fera jamais</h2>
                <p>Le no-code a explosé.</p>
                <p>Créer une app en quelques heures, lancer un site en une journée, automatiser ses tâches sans écrire une ligne… ça fait rêver.</p>
                <p>Sauf que derrière les promesses, il y a la réalité : le no-code n'est pas une baguette magique. Et croire le contraire, c'est prendre le risque de lancer un projet qui s'écroule à la première mise à jour.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <p>Le discours autour du no-code est souvent trop beau pour être vrai :</p>
                <ul>
                  <li><strong>"Pas besoin de développeur"</strong> → Oui, mais jusqu'à un certain point.</li>
                  <li><strong>"Vous pouvez tout faire"</strong> → Non, certaines fonctionnalités sont limitées ou impossibles sans code.</li>
                  <li><strong>"C'est moins cher"</strong> → Parfois, mais pas toujours, surtout à long terme.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Beaucoup de projets échouent non pas à cause de l'outil, mais parce que la stratégie derrière est absente.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Ce que le no-code fait très bien</h2>
                <ul>
                  <li><strong>Prototyper rapidement</strong> → tester une idée avant d'investir lourdement.</li>
                  <li><strong>Automatiser des process simples</strong> → formulaires, envois d'emails, mise à jour de bases de données.</li>
                  <li><strong>Créer un MVP (produit minimum viable)</strong> pour lever des fonds ou convaincre des partenaires.</li>
                  <li><strong>Donner de l'autonomie</strong> à une équipe non technique.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Ses vraies limites</h2>
                <ul>
                  <li><strong>Complexité avancée</strong> → dès qu'il faut des calculs spécifiques ou des logiques complexes, le code revient sur la table.</li>
                  <li><strong>Performance</strong> → un projet no-code mal optimisé peut vite devenir lent.</li>
                  <li><strong>Coûts cachés</strong> → abonnement mensuel, limitations des plans gratuits, modules payants.</li>
                  <li><strong>Dépendance à la plateforme</strong> → si l'outil ferme, évolue ou change ses prix, votre business peut en pâtir.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on adore le no-code… quand il est utilisé intelligemment.</p>
                <p>On s'en sert pour aller vite là où c'est pertinent, mais on sait aussi quand basculer vers du sur-mesure pour éviter les blocages.</p>
                <p>Le no-code est un accélérateur, pas une fin en soi.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Le no-code peut être un levier incroyable pour tester, automatiser et créer vite.</p>
                <p>Mais il ne remplacera jamais une vraie réflexion stratégique et un développement sur mesure là où c'est nécessaire.</p>
                <p>La vraie question n'est pas "Est-ce que je peux tout faire en no-code ?"</p>
                <p>C'est plutôt "Est-ce que le no-code est le bon outil pour mon objectif ?"</p>
              </div>

              <div className="blog-cta">
                <p>✨ Vous voulez savoir si votre projet est faisable en no-code… ou s'il vaut mieux coder ?</p>
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

export default ArticleNoCodePuissantPasMagique; 