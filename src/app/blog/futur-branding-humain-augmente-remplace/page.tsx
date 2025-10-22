"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleFuturBrandingHumainAugmenteRemplace = (): React.JSX.Element => {
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
            <h1 className="blog-header">Le futur du branding : humain, augmenté ou remplacé ?</h1>
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
                <h2>Quand l'IA s'invite dans l'identité des marques</h2>
                <p>Création de logos en quelques secondes, chartes graphiques générées automatiquement, slogans écrits par un chatbot…</p>
                <p>L'IA entre dans le branding à vitesse grand V.</p>
                <p>La question n'est plus "si" elle va impacter votre marque, mais comment :</p>
                <ul>
                  <li>Va-t-elle remplacer le travail humain ?</li>
                  <li>Va-t-elle l'augmenter ?</li>
                  <li>Ou restera-t-elle un simple outil ?</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Scénario 1 : Branding remplacé par l'IA</h2>
                <p>Certaines plateformes promettent déjà des identités "complètes" générées en quelques clics :</p>
                <p>Logo, palette, typographies, ton de marque… tout est livré clé en main.</p>
                <p>Pratique, rapide, pas cher.</p>
                <p>Mais… générique.</p>
                <div className="blog-example">
                  <p>💡 Risque : des marques qui se ressemblent toutes, sans âme ni différenciation.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Scénario 2 : Branding augmenté par l'IA</h2>
                <p>C'est là que ça devient intéressant :</p>
                <ul>
                  <li>L'IA génère des pistes visuelles, des variantes, des idées de storytelling.</li>
                  <li>L'humain garde le contrôle pour filtrer, affiner et injecter de la personnalité.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Avantage : gain de temps + créativité décuplée, tout en restant unique.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Scénario 3 : Branding 100 % humain</h2>
                <p>Toujours possible… mais plus rare.</p>
                <p>Réservé aux marques qui veulent un travail artisanal, ultra-personnalisé, sans intervention technologique.</p>
                <div className="blog-example">
                  <p>💡 Limite : plus long, plus cher, et risque de se faire dépasser sur la rapidité.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Notre vision</h2>
                <p>Au studio, on croit à un branding augmenté :</p>
                <ul>
                  <li>L'IA pour explorer vite et large</li>
                  <li>L'humain pour choisir, interpréter, raconter</li>
                </ul>
                <p>C'est le mix qui permet d'allier impact visuel et profondeur stratégique.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Le futur du branding ne sera pas 100 % humain, ni 100 % machine.</p>
                <p>Il sera hybride.</p>
                <p>Et les marques qui sauront exploiter ce duo auront une longueur d'avance.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie d'un branding qui marie créativité humaine et puissance de l'IA ?</p>
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

export default ArticleFuturBrandingHumainAugmenteRemplace; 