"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleIAPromessesMarketingRealiteTechnique = () => {
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
            <h1 className="blog-header">IA : Entre Promesses Marketing et Réalité Technique</h1>
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
                <h2>Ce que tout le monde vend… et ce que ça vaut vraiment</h2>
                <p>Ces dernières années, tout le monde s'est mis à "faire de l'IA".</p>
                <ul>
                  <li>Une app qui répond à vos questions ? IA.</li>
                  <li>Un outil qui écrit trois phrases ? IA.</li>
                  <li>Un logiciel qui trie des données ? IA.</li>
                </ul>
                <p>Résultat : on mélange tout.</p>
                <p>Et on oublie qu'il existe un monde entre un chatbot qui génère du texte et un modèle prédictif qui prend de vraies décisions.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <p>Le marketing adore le mot "IA". Il claque, il rassure, il vend.</p>
                <p>Mais dans 80 % des cas, ce que l'on appelle "IA" est en réalité un modèle pré-entraîné appliqué bêtement à une tâche simple… ou même juste un script bien codé.</p>
                <p><strong>Par exemple :</strong></p>
                <ul>
                  <li><strong>Un chatbot type GPT</strong> → excellent pour générer ou reformuler du texte, mais il ne "sait" pas ce qu'il dit.</li>
                  <li><strong>Un modèle de régression</strong> → il ne "comprend" pas, il calcule la probabilité d'un résultat à partir de données passées.</li>
                  <li><strong>Un algorithme de recommandation</strong> → ça n'a rien de magique, c'est une suite de statistiques optimisées.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>La vraie puissance de l'IA</h2>
                <p>L'IA devient réellement intéressante quand elle est :</p>
                <ul>
                  <li><strong>Spécialisée</strong> → entraînée sur un domaine précis (finance, santé, design…).</li>
                  <li><strong>Intégrée dans un système</strong> → elle ne se contente pas de "répondre", elle déclenche des actions (achat, ajustement, adaptation en temps réel).</li>
                  <li><strong>Capable d'apprendre en continu</strong> → mise à jour avec de nouvelles données pour améliorer ses décisions.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Exemple concret :</p>
                  <p>Un chatbot peut vous donner la météo.</p>
                  <p>Un modèle prédictif bien entraîné peut anticiper un pic de chaleur et ajuster automatiquement la climatisation d'un bâtiment avant même que vous n'ayez chaud.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi cette confusion ?</h2>
                <ul>
                  <li><strong>Effet de mode</strong> → coller "IA" sur un produit attire les investisseurs et les clients.</li>
                  <li><strong>Manque de pédagogie</strong> → peu d'explications simples sur ce qui différencie les approches.</li>
                  <li><strong>Résultats visuels</strong> → un texte bien écrit ou une image réaliste donne l'impression d'intelligence… même s'il n'y a aucune décision stratégique derrière.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on aime l'IA… mais pas le mythe autour d'elle.</p>
                <p>Nous intégrons des outils intelligents quand ils apportent une vraie valeur :</p>
                <ul>
                  <li>Accélérer la production de contenu</li>
                  <li>Améliorer la pertinence d'une campagne</li>
                  <li>Aider à prendre de meilleures décisions marketing</li>
                </ul>
                <p>Pas pour "faire joli" sur une plaquette.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>L'IA, ce n'est pas un bouton magique.</p>
                <p>Un chatbot n'est pas un oracle, et un modèle statistique ne deviendra pas visionnaire.</p>
                <p>La vraie question à se poser :</p>
                <p>Cet outil prend-il de meilleures décisions grâce à des données et un apprentissage intelligent… ou se contente-t-il de simuler l'intelligence ?</p>
              </div>

              <div className="blog-cta">
                <p>✨ Vous voulez intégrer l'IA dans votre stratégie sans tomber dans le piège du marketing creux ?</p>
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

export default ArticleIAPromessesMarketingRealiteTechnique; 