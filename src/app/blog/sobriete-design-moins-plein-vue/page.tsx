"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleSobrieteDesignMoinsPleinVue = (): React.JSX.Element => {
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
            <h1 className="blog-header">La sobriété design : l'art de faire mieux avec moins</h1>
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
                <h2>Pourquoi la simplicité devient un avantage concurrentiel sur le web</h2>
                <p>Pendant des années, la tendance web a été à la surenchère : animations partout, couleurs qui explosent, effets au scroll à chaque section.</p>
                <p>Résultat : des sites qui impressionnent… mais qui fatiguent l'utilisateur.</p>
                <p>Aujourd'hui, la donne change : la sobriété design devient une arme business.</p>
              </div>

              <div className="blog-section">
                <h2>Pourquoi la simplicité gagne du terrain</h2>
                <ul>
                  <li><strong>La vitesse avant tout</strong> → un site léger se charge plus vite, et Google adore ça.</li>
                  <li><strong>Moins de distractions</strong> → plus de clarté dans le message = plus de conversions.</li>
                  <li><strong>Accessibilité</strong> → des interfaces épurées sont plus inclusives.</li>
                  <li><strong>Crédibilité</strong> → un design sobre inspire confiance, surtout sur des marchés saturés.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Ce n'est pas "faire moins", c'est faire mieux avec moins.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> un site e-commerce avec carrousel, vidéos autoplay, effets 3D.</p>
                <p>Résultat : 5 secondes de chargement, 60 % de taux de rebond.</p>
                <p><strong>✅ Après :</strong> un design simple, une image forte, un message clair et un call-to-action unique.</p>
                <p>Résultat : -40 % de rebond, +25 % de ventes.</p>
              </div>

              <div className="blog-section">
                <h2>Comment appliquer la sobriété design</h2>
                <ul>
                  <li><strong>Hiérarchiser l'info</strong> → un message clair par page.</li>
                  <li><strong>Alléger le visuel</strong> → réduire les animations et les médias lourds.</li>
                  <li><strong>Optimiser la typographie</strong> → lisible, contrastée, sobre.</li>
                  <li><strong>Limiter la palette</strong> → quelques couleurs fortes suffisent.</li>
                  <li><strong>Mettre en avant l'essentiel</strong> → produit, service, promesse.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Chez Soliva, on ne confond pas sobriété et ennui.</p>
                <p>Un site sobre peut être impactant, marquant et beau… à condition qu'il serve un objectif clair.</p>
                <p>La simplicité, c'est la meilleure façon de laisser le message briller.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Les sites qui gagnent aujourd'hui ne sont pas les plus chargés, mais ceux qui vont droit au but.</p>
                <p>Moins d'effets, plus de sens : c'est ça, la vraie modernité.</p>
              </div>

              <div className="blog-cta">
                <p>✨ On conçoit des sites rapides, clairs et efficaces</p>
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

export default ArticleSobrieteDesignMoinsPleinVue; 