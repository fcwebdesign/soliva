"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePersonnalisationDonneesProprietairesTendanceMontante = (): React.JSX.Element => {
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
            <h1 className="blog-header">La personnalisation et les données propriétaires : la tendance montante</h1>
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
                <h2>L'ère du sur-mesure digital</h2>
                <p>Les internautes en ont marre du contenu générique.</p>
                <p>Ils veulent des expériences qui leur parlent vraiment : messages adaptés à leurs besoins, offres qui arrivent au bon moment, recommandations qui semblent écrites juste pour eux.</p>
                <p>La clé ? La personnalisation.</p>
                <p>Et pour y arriver : vos données propriétaires.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Tout le monde a accès aux mêmes outils</strong> → l'IA grand public produit les mêmes idées pour tout le monde.</li>
                  <li><strong>Les marques utilisent les mêmes bases</strong> → zéro différenciation.</li>
                  <li><strong>Manque de données uniques</strong> → impossible de personnaliser vraiment sans infos précises sur votre audience.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Sans données propriétaires, votre personnalisation n'est qu'un habillage.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi les données propriétaires sont essentielles</h2>
                <ul>
                  <li><strong>Elles vous appartiennent</strong> → vous n'êtes pas dépendant d'une plateforme tierce.</li>
                  <li><strong>Elles reflètent votre audience réelle</strong> → pas une moyenne globale.</li>
                  <li><strong>Elles nourrissent vos outils</strong> → une IA entraînée sur vos données parle avec votre ton et vos valeurs.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p>Un e-commerce entraîne son moteur de recommandations avec :</p>
                <ul>
                  <li>L'historique d'achat de ses clients</li>
                  <li>Les produits consultés mais non achetés</li>
                  <li>Les interactions avec ses emails</li>
                </ul>
                <p><strong>Résultat :</strong></p>
                <ul>
                  <li>Offres ciblées</li>
                  <li>Panier moyen qui augmente</li>
                  <li>Clients qui reviennent</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Comment se lancer</h2>
                <ul>
                  <li><strong>Collecter vos données</strong> → inscriptions, historiques, retours clients.</li>
                  <li><strong>Les centraliser</strong> → CRM ou outil de data management.</li>
                  <li><strong>Les exploiter intelligemment</strong> → emails personnalisés, contenus dynamiques, offres sur mesure.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on pense que la prochaine vraie différenciation ne viendra pas du plus beau site ou du plus gros budget pub…</p>
                <p>Elle viendra de la capacité à exploiter ses propres données pour créer des expériences uniques.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>La personnalisation, c'est ce qui transforme un client en fan.</p>
                <p>Et vos données propriétaires sont la matière première pour y arriver.</p>
                <p>Plus tôt vous les collectez et les exploitez, plus vite vous prenez de l'avance.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de rendre vos expériences digitales vraiment uniques ?</p>
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

export default ArticlePersonnalisationDonneesProprietairesTendanceMontante; 