"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleReseauxSociauxNeSontPasStrategie = () => {
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
            <h1 className="blog-header">Les réseaux sociaux ne sont pas une stratégie</h1>
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
                <h2>Ce sont des canaux, pas un plan de bataille</h2>
                <p>"On est sur Instagram, Facebook et LinkedIn, donc on a une stratégie."</p>
                <p>Non.</p>
                <p>Être présent sur les réseaux sociaux, c'est comme avoir des panneaux publicitaires : ils ne servent à rien si vous ne savez pas quoi dire et à qui.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Confusion entre outil et stratégie</strong> → publier régulièrement n'est pas une stratégie, c'est une action.</li>
                  <li><strong>Absence de direction</strong> → sans objectif clair, vous mesurez juste des likes, pas des résultats.</li>
                  <li><strong>Dépendance aux algorithmes</strong> → si votre "stratégie" repose sur un canal qui change ses règles, vous êtes vulnérable.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Les réseaux sociaux amplifient votre message… à condition que vous ayez un message.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Ce qu'est une vraie stratégie</h2>
                <ul>
                  <li><strong>Objectifs clairs</strong> → notoriété, génération de leads, ventes…</li>
                  <li><strong>Cibles définies</strong> → qui voulez-vous toucher ?</li>
                  <li><strong>Messages forts</strong> → que voulez-vous leur dire et pourquoi ?</li>
                  <li><strong>Plan de diffusion</strong> → où, quand et comment diffuser ce message.</li>
                </ul>
                <p>Les réseaux sociaux arrivent à la fin de ce processus, pas au début.</p>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Mauvaise approche :</strong></p>
                <p>Poster des photos de produits sur Instagram en espérant "gagner en visibilité"</p>
                <p><strong>✅ Bonne approche :</strong></p>
                <p>Définir un objectif (ex : augmenter les ventes en ligne de 20%), cibler un segment précis, créer du contenu adapté à ce segment… puis utiliser Instagram comme un des canaux de diffusion.</p>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on voit les réseaux sociaux comme des haut-parleurs, pas comme la chanson elle-même.</p>
                <p>La musique, c'est votre stratégie. Sans elle, vous ne diffusez que du bruit.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Les réseaux sociaux ne remplacent pas une stratégie.</p>
                <p>Ils la servent.</p>
                <p>Mettez en place un plan clair, puis laissez vos canaux faire leur travail.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de construire une stratégie qui ne dépend pas des humeurs de l'algorithme ?</p>
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

export default ArticleReseauxSociauxNeSontPasStrategie; 