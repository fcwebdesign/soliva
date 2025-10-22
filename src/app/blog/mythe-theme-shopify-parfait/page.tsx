"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleMytheThemeShopifyParfait = (): React.JSX.Element => {
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
            <h1 className="blog-header">Le mythe du thème Shopify parfait</h1>
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
                <h2>Pourquoi la conversion se joue ailleurs</h2>
                <p>Vous pensez qu'il vous faut le thème Shopify ultime pour vendre ?</p>
                <p>Celui avec les animations fluides, les typos premium et le design qui ferait pâlir Apple ?</p>
                <p>Mauvaise nouvelle : ce n'est pas lui qui fera exploser vos ventes.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Obsession du visuel</strong> → on passe des semaines à chercher le "plus beau" thème.</li>
                  <li><strong>Négligence du parcours client</strong> → tunnel d'achat long, infos mal placées.</li>
                  <li><strong>Erreur de focus</strong> → croire que le design pur est la clé, alors que la conversion est un mélange de facteurs.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Un beau site qui ne vend pas reste… un beau site qui ne vend pas.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Où se joue vraiment la conversion</h2>
                <ul>
                  <li><strong>La vitesse de chargement</strong> → chaque seconde perdue = clients qui partent.</li>
                  <li><strong>La clarté des offres</strong> → comprendre vite = acheter vite.</li>
                  <li><strong>La preuve sociale</strong> → avis clients, témoignages, photos réelles.</li>
                  <li><strong>Le tunnel d'achat</strong> → moins de clics, plus de ventes.</li>
                  <li><strong>L'UX mobile</strong> → l'essentiel de vos visiteurs achètent depuis leur téléphone.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> un e-commerçant investit 400 € dans un thème premium ultra-personnalisé, mais son checkout demande 5 clics pour payer → taux de conversion à 0,8 %.</p>
                <p><strong>✅ Après :</strong> même thème, mais optimisation du tunnel d'achat en 2 étapes, ajout de boutons "Acheter maintenant" et simplification des fiches produits → taux de conversion à 2,4 %.</p>
              </div>

              <div className="blog-section">
                <h2>Comment faire mieux</h2>
                <ul>
                  <li><strong>Choisir un thème fiable et rapide</strong>, pas forcément le plus beau.</li>
                  <li><strong>Optimiser les parcours clients</strong> avant de penser au design.</li>
                  <li><strong>Mesurer et tester</strong> → A/B test sur pages clés.</li>
                  <li><strong>Se concentrer sur le mobile</strong> → c'est là que ça se joue.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Un bon thème, c'est un outil.</p>
                <p>Une bonne stratégie, c'est un moteur.</p>
                <p>L'un sans l'autre, ça ne sert à rien.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Arrêtez de chercher le thème parfait.</p>
                <p>Cherchez le parcours client parfait.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie d'optimiser votre Shopify pour qu'il vende plus ?</p>
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

export default ArticleMytheThemeShopifyParfait; 