"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePourquoiBoutiqueEnLigneNeVendPas = () => {
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
            <h1 className="blog-header">Pourquoi votre boutique en ligne ne vend pas</h1>
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
                <h2>Et ce n'est pas à cause du design</h2>
                <p>Vous avez un site e-commerce propre, beau, moderne.</p>
                <p>Mais les ventes stagnent.</p>
                <p>Et là, vous vous dites : "C'est sûrement le design…"</p>
                <p>Non. Dans 90 % des cas, ce n'est pas ça.</p>
              </div>

              <div className="blog-section">
                <h2>Le vrai problème</h2>
                <ul>
                  <li><strong>Pas de trafic qualifié</strong> → même un site parfait ne vend rien si personne ne le visite.</li>
                  <li><strong>Offre floue</strong> → si on ne comprend pas vite ce que vous vendez, on part.</li>
                  <li><strong>Manque de confiance</strong> → pas d'avis clients, pas de réassurance, pas de contact clair.</li>
                  <li><strong>Tunnel d'achat pénible</strong> → trop d'étapes, trop de frictions.</li>
                  <li><strong>Pas d'urgence</strong> → rien qui pousse à acheter maintenant.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Le design séduit.</p>
                  <p>Mais c'est le marketing, la clarté et l'expérience d'achat qui vendent.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> un site de vêtements avec un design premium, mais sans avis, sans promotions et avec un checkout en 5 étapes → panier moyen à 30 €, taux de conversion à 0,7 %.</p>
                <p><strong>✅ Après :</strong> même design, mais ajout d'avis clients, d'offres limitées, d'upsell au checkout et simplification du paiement → panier moyen à 45 €, taux de conversion à 2,1 %.</p>
              </div>

              <div className="blog-section">
                <h2>Les vraies priorités avant le design</h2>
                <ul>
                  <li><strong>Attirer le bon trafic</strong> (SEO, Ads ciblées, influence)</li>
                  <li><strong>Clarifier l'offre</strong> (titre, visuels, bénéfices)</li>
                  <li><strong>Rassurer</strong> (avis, garanties, SAV visible)</li>
                  <li><strong>Optimiser le tunnel d'achat</strong> (moins d'étapes, plus de fluidité)</li>
                  <li><strong>Créer de l'urgence</strong> (offres limitées, stock bas, bonus temporaires)</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Un beau site sans stratégie, c'est comme une vitrine magnifique dans une rue vide.</p>
                <p>Il faut d'abord amener les bonnes personnes devant, puis leur donner envie d'entrer… et d'acheter.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Ce n'est pas le design qui tue vos ventes.</p>
                <p>C'est l'absence de stratégie derrière.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de faire passer votre e-commerce de "beau" à "rentable" ?</p>
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

export default ArticlePourquoiBoutiqueEnLigneNeVendPas; 