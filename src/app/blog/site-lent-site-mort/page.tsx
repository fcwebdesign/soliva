"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleSiteLentSiteMort = (): React.JSX.Element => {
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
            <h1 className="blog-header">Un site lent est un site mort</h1>
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
                <h2>Pourquoi la vitesse tue (ou booste) vos ventes</h2>
                <p>3 secondes.</p>
                <p>C'est le temps que vous avez avant que votre visiteur s'en aille.</p>
                <p>Sur mobile, c'est encore pire : plus de 50 % quittent avant la fin du chargement si c'est trop long.</p>
                <p>Un site lent, c'est comme une boutique avec la porte fermée : personne ne reste devant.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>La patience des internautes est quasi nulle</strong> → tout est instantané aujourd'hui.</li>
                  <li><strong>Google vous pénalise</strong> → vitesse = SEO.</li>
                  <li><strong>Votre taux de conversion chute</strong> → chaque seconde de trop = clients perdus.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Un site lent ne tue pas seulement votre trafic.</p>
                  <p>Il tue aussi vos ventes.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> une boutique en ligne avec des images HD non optimisées, un thème lourd et 6 scripts inutiles → temps de chargement de 7,8 secondes → taux de conversion : 0,9 %.</p>
                <p><strong>✅ Après :</strong> compression des images, suppression des scripts inutiles, hébergement optimisé → temps de chargement : 1,9 seconde → taux de conversion : 2,8 %.</p>
              </div>

              <div className="blog-section">
                <h2>Les 5 leviers pour accélérer votre site</h2>
                <ul>
                  <li><strong>Optimiser les images</strong> → WebP, compression intelligente.</li>
                  <li><strong>Nettoyer le code</strong> → supprimer scripts et plugins inutiles.</li>
                  <li><strong>Hébergement performant</strong> → pas le moins cher, le plus rapide.</li>
                  <li><strong>CDN</strong> → servir le contenu depuis le serveur le plus proche du visiteur.</li>
                  <li><strong>Lazy loading</strong> → charger seulement ce qui est visible à l'écran.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Un site rapide, c'est plus qu'un confort :</p>
                <ul>
                  <li>C'est un boost SEO</li>
                  <li>C'est un boost de conversion</li>
                  <li>C'est un boost de satisfaction client</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Vous voulez vendre plus ?</p>
                <p>Commencez par accélérer.</p>
              </div>

              <div className="blog-cta">
                <p>✨ On audite et on optimise la vitesse de votre site</p>
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

export default ArticleSiteLentSiteMort; 