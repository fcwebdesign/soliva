"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleSliderAccueilNeSertRien = (): React.JSX.Element => {
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
            <h1 className="blog-header">Votre slider d'accueil ne sert à rien</h1>
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
                <h2>Et voici pourquoi (et quoi mettre à la place pour vendre plus)</h2>
                <p>Sur un site e-commerce, chaque seconde d'attention compte.</p>
                <p>Et pourtant, beaucoup gaspillent cette attention avec… un slider qui change d'image avant que l'utilisateur ait compris la première.</p>
                <p>Résultat : message perdu, clic perdu, vente perdue.</p>
              </div>

              <div className="blog-section">
                <h2>Pourquoi le slider vous coûte des ventes</h2>
                <ul>
                  <li><strong>Il disperse le focus</strong> → votre client ne sait pas quoi regarder, donc il ne clique nulle part.</li>
                  <li><strong>Il casse le parcours d'achat</strong> → au lieu d'avancer vers le produit ou l'offre phare, l'utilisateur reste dans le flou.</li>
                  <li><strong>Il ralentit la page</strong> → et un site lent, c'est un client qui part.</li>
                  <li><strong>Sur mobile, c'est pire</strong> → visuels coupés, textes illisibles, frustration maximale.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Un slider ne vend pas : il distrait.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> une boutique en ligne avec un slider automatique qui présente cinq offres. L'utilisateur commence à lire la première… et hop, elle disparaît. Pas le temps de cliquer.</p>
                <p><strong>✅ Après :</strong> une image unique, forte, avec l'offre qui génère le plus de marge, un bouton "Voir le produit" et un chemin clair vers l'achat. L'utilisateur comprend où aller et achète.</p>
              </div>

              <div className="blog-section">
                <h2>Alternatives qui vendent vraiment</h2>
                <ul>
                  <li><strong>Mettre le produit ou service phare</strong> en avant</li>
                  <li><strong>Une offre unique et claire</strong></li>
                  <li><strong>Une vidéo courte</strong> qui montre l'usage</li>
                  <li><strong>Une promo limitée</strong> dans le temps avec CTA direct</li>
                  <li><strong>Un témoignage client fort</strong> au-dessus de la ligne de flottaison</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Chez Soliva, on ne conçoit pas une page d'accueil pour "faire joli".</p>
                <p>On la pense comme un vendeur en ligne :</p>
                <ul>
                  <li>qui sait quoi dire en premier,</li>
                  <li>qui guide le client vers l'action la plus rentable,</li>
                  <li>et qui ne le distrait pas avec 5 messages à la fois.</li>
                </ul>
                <p>C'est pour ça qu'on ne met jamais de slider.</p>
                <p>Parce qu'un slider ne vend pas… mais une offre claire, oui.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Un slider, c'est comme un vendeur qui parle de tout sauf du produit que le client veut acheter.</p>
                <p>Remplacez-le par un visuel unique et une offre claire… et vos ventes vous diront merci.</p>
              </div>

              <div className="blog-cta">
                <p>✨ On repense votre page d'accueil pour booster vos conversions</p>
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

export default ArticleSliderAccueilNeSertRien; 