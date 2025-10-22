"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePourquoiCopierBrandingGrandesMarquesErreur = (): React.JSX.Element => {
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
            <h1 className="blog-header">Pourquoi copier le branding des grandes marques est une erreur</h1>
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
                <h2>Ce qui marche pour eux peut vous tuer</h2>
                <p>Apple, Nike, Starbucks… leurs campagnes sont inspirantes, leurs visuels parfaits, leurs slogans mémorables.</p>
                <p>Mais copier leur branding ne fera pas de vous la prochaine success story.</p>
                <p>Pire : ça peut vous rendre invisible.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <p>Les grandes marques jouent avec des règles qui ne sont pas les vôtres :</p>
                <ul>
                  <li><strong>Budget colossal</strong> pour inonder tous les canaux</li>
                  <li><strong>Notoriété installée</strong> → elles peuvent se permettre d'être minimalistes ou cryptiques</li>
                  <li><strong>Public mondial</strong> → elles parlent à tout le monde, donc à personne en particulier… mais ça marche car elles sont déjà connues</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Copier leur style, c'est reproduire une façade… sans la fondation qui la rend efficace.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi ça ne marche pas pour vous</h2>
                <ul>
                  <li><strong>Pas la même audience</strong> → votre marché est souvent plus ciblé.</li>
                  <li><strong>Pas les mêmes objectifs</strong> → vous devez convaincre vite, pas entretenir une image déjà acquise.</li>
                  <li><strong>Pas la même histoire</strong> → votre force, c'est ce qui vous différencie, pas ce qui vous rend identique.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>Copie ratée :</strong> une startup reprend le style minimaliste d'Apple → visuellement impeccable, mais message flou, aucune personnalité.</p>
                <p><strong>Approche gagnante :</strong> s'inspirer de la clarté et de la cohérence d'Apple… tout en créant un ton, un univers et des visuels ancrés dans votre propre ADN.</p>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on observe les grandes marques… mais pour comprendre les mécaniques derrière, pas pour recopier leurs codes.</p>
                <p>L'objectif : adapter ce qui marche à votre réalité, à votre audience et à vos moyens.</p>
                <p>Pas jouer à être Nike avec un budget PME.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>S'inspirer, oui. Copier, non.</p>
                <p>Votre branding doit refléter qui vous êtes, pas qui vous rêvez d'être.</p>
                <p>C'est en cultivant votre différence que vous deviendrez mémorable.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie d'un branding unique, qui ne ressemble à personne ?</p>
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

export default ArticlePourquoiCopierBrandingGrandesMarquesErreur; 