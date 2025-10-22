"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePiegeToutPourAlgorithme = (): React.JSX.Element => {
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
            <h1 className="blog-header">Le piège du "tout pour l'algorithme"</h1>
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
                <h2>Pourquoi suivre uniquement les métriques tue la créativité</h2>
                <p>Sur les réseaux, on vous le répète :</p>
                <ul>
                  <li>"Poste à telle heure"</li>
                  <li>"Utilise ces hashtags"</li>
                  <li>"Fais des vidéos de 15 secondes"</li>
                </ul>
                <p>Résultat : tout le monde suit les mêmes recettes… et les contenus finissent par se ressembler.</p>
                <p>À force de vouloir plaire à l'algorithme, on oublie l'essentiel : plaire aux humains.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <p>Les métriques sont utiles… mais elles peuvent devenir un piège :</p>
                <ul>
                  <li><strong>On joue pour les chiffres, pas pour l'impact</strong> → viser 1 000 likes plutôt que 10 clients réels.</li>
                  <li><strong>On reproduit ce qui marche… pour les autres</strong> → au lieu d'innover, on copie.</li>
                  <li><strong>On perd l'ADN de la marque</strong> → le ton, la personnalité et l'histoire passent au second plan.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 L'algorithme récompense ce qui se répète. Votre audience, elle, s'attache à ce qui surprend.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>Tout pour l'algorithme :</strong></p>
                <p>Une marque de café poste uniquement des vidéos "latte art" parce que ça cartonne sur TikTok… mais ne parle jamais de son savoir-faire, de ses producteurs, ni de son engagement.</p>
                <p><strong>Tout pour l'audience :</strong></p>
                <p>La même marque alterne entre vidéos engageantes et contenus qui racontent son histoire, ses valeurs, ses nouveautés. Les vues sont moins constantes… mais les clients sont plus fidèles.</p>
              </div>

              <div className="blog-section">
                <h2>Comment sortir du piège</h2>
                <ul>
                  <li><strong>Définir ses objectifs réels</strong> → notoriété, ventes, communauté engagée ?</li>
                  <li><strong>Mesurer autre chose que les vues</strong> → interactions qualifiées, conversions, messages reçus.</li>
                  <li><strong>Créer pour les gens, pas pour la machine</strong> → garder un ton humain, raconter des histoires, oser le hors-format.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on utilise les métriques pour guider, pas pour dicter.</p>
                <p>Un bon contenu, c'est un équilibre entre ce que l'algorithme aime et ce que votre audience attend de vous.</p>
                <p>La croissance à long terme ne vient pas de contenus copiés… mais d'une identité forte.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>L'algorithme est un outil, pas un patron.</p>
                <p>Suivre aveuglément ses règles, c'est risquer de perdre ce qui vous rend unique.</p>
                <p>Mieux vaut avoir 5 000 vues qui créent un lien… que 500 000 vues qui n'apportent rien.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de bâtir une stratégie qui plaît à votre audience (et pas seulement à l'algorithme) ?</p>
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

export default ArticlePiegeToutPourAlgorithme; 