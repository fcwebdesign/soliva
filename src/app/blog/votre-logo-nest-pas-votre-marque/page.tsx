"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleVotreLogoNestPasVotreMarque = (): React.JSX.Element => {
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
            <h1 className="blog-header">Votre logo n'est pas votre marque</h1>
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
                <h2>L'identité visuelle ne suffit pas</h2>
                <p>Changer de logo ne fera pas décoller vos ventes.</p>
                <p>Ajouter un dégradé tendance ou une typo plus "moderne" non plus.</p>
                <p>Un logo est un symbole. Votre marque, c'est tout ce qu'il y a derrière.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <p>Beaucoup d'entreprises pensent "branding" = "design du logo".</p>
                <p>Résultat :</p>
                <ul>
                  <li>Elles dépensent tout le budget sur un relooking visuel</li>
                  <li>Elles négligent le ton, les valeurs, l'histoire</li>
                  <li>Elles finissent avec un beau logo… mais une marque vide</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Un logo, c'est la signature. La marque, c'est la personnalité.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Ce qui construit une vraie marque</h2>
                <ul>
                  <li><strong>Une vision claire</strong> → pourquoi vous existez, où vous allez</li>
                  <li><strong>Des valeurs fortes</strong> → ce que vous défendez</li>
                  <li><strong>Une voix reconnaissable</strong> → ton, vocabulaire, style</li>
                  <li><strong>Une expérience cohérente</strong> → site, réseaux sociaux, service client… tout raconte la même histoire</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>Logo sans marque :</strong></p>
                <p>Une startup change de logo et de charte graphique… mais garde un site générique et un discours flou → aucun impact.</p>
                <p><strong>Marque forte avec logo :</strong></p>
                <p>Une entreprise définit sa mission, son ton, ses valeurs → le logo devient un repère visuel d'une identité déjà claire.</p>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on adore le design, mais on sait que le visuel n'est qu'une partie du branding.</p>
                <p>Un bon logo ne sauvera pas une mauvaise stratégie.</p>
                <p>Une marque forte, c'est un mélange d'histoire, de cohérence et d'émotion… le logo n'en est que la vitrine.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Votre logo, c'est ce que les gens voient.</p>
                <p>Votre marque, c'est ce qu'ils ressentent.</p>
                <p>Ne misez pas tout sur un symbole, construisez l'univers qui le rendra inoubliable.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de bâtir une marque qui dépasse son logo ?</p>
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

export default ArticleVotreLogoNestPasVotreMarque; 