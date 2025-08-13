"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleFauxOutilsIAJusteScripts = () => {
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
            <h1 className="blog-header">Les faux outils "IA" qui sont juste des scripts</h1>
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
                <h2>Gros nettoyage marketing</h2>
                <p>Aujourd'hui, tout est "boosté à l'IA" :</p>
                <ul>
                  <li>Une extension Chrome qui reformule un texte ? "IA".</li>
                  <li>Un outil qui génère une facture PDF ? "IA".</li>
                  <li>Un chatbot qui suit un scénario figé ? "IA".</li>
                </ul>
                <p>Sauf que dans 80 % des cas… il n'y a pas la moindre intelligence artificielle derrière.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Marketing abusif</strong> → coller "IA" sur un produit fait vendre.</li>
                  <li><strong>Confusion totale</strong> → le public croit acheter de l'IA alors qu'il s'agit d'un simple automatisme.</li>
                  <li><strong>Perte de confiance</strong> → quand les gens réalisent qu'ils ont été bernés, ils doutent des vrais outils.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Un script ≠ une IA. L'un exécute une suite d'instructions, l'autre apprend et s'adapte.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Différence entre script et IA</h2>
                <p><strong>Script :</strong> suit un chemin prédéfini, ne change pas sauf si un humain le modifie.</p>
                <p><strong>IA :</strong> analyse des données, tire des conclusions, adapte ses réponses et évolue avec de nouvelles informations.</p>
                <p><strong>Exemple concret :</strong></p>
                <p><strong>Script :</strong> un chatbot qui répond "bonjour" si vous dites "bonjour".</p>
                <p><strong>IA :</strong> un assistant qui comprend votre intention, peut répondre à une question imprévue et améliorer ses réponses avec le temps.</p>
              </div>

              <div className="blog-section">
                <h2>Pourquoi c'est important de faire le tri</h2>
                <ul>
                  <li><strong>Pour choisir les bons outils</strong> : un simple script peut suffire si la tâche est répétitive et figée.</li>
                  <li><strong>Pour investir au bon endroit</strong> : payer "de l'IA" quand il n'y en a pas, c'est jeter de l'argent par la fenêtre.</li>
                  <li><strong>Pour garder votre crédibilité</strong> : ne pas promettre une IA quand vous proposez juste une automatisation.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on ne vend pas du rêve :</p>
                <ul>
                  <li>Si c'est un script, on le dit.</li>
                  <li>Si c'est de l'IA, on explique comment elle apprend et ce qu'elle peut vraiment faire.</li>
                </ul>
                <p>Et surtout, on choisit la solution la plus adaptée, pas celle qui fait le plus joli sur une plaquette.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Tout ce qui brille n'est pas de l'IA.</p>
                <p>La différence entre un script et une vraie IA, c'est la capacité à comprendre, apprendre et s'adapter.</p>
                <p>Le reste… c'est juste du code qui tourne.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de savoir si votre projet a besoin d'IA ou juste d'une bonne automatisation ?</p>
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

export default ArticleFauxOutilsIAJusteScripts; 