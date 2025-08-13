"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleSortirDependancePlateformesAudienceNeVousAppartientPas = () => {
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
            <h1 className="blog-header">Sortir de la dépendance aux plateformes : votre audience ne vous appartient pas</h1>
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
                <h2>Pourquoi miser sur votre propre écosystème est plus sûr (et plus rentable) à long terme</h2>
                <p>Aujourd'hui, beaucoup de marques mettent tous leurs œufs dans le même panier : Instagram, TikTok, LinkedIn…</p>
                <p>Résultat : elles existent tant que l'algorithme veut bien les montrer.</p>
                <p>Le jour où la portée s'effondre, c'est le silence radio.</p>
              </div>

              <div className="blog-section">
                <h2>Le vrai problème</h2>
                <ul>
                  <li><strong>Les règles changent sans prévenir</strong> → un changement d'algorithme, et votre reach chute de 80 %.</li>
                  <li><strong>Vous louez votre audience</strong> → vos abonnés sont en réalité la base de données d'Instagram, pas la vôtre.</li>
                  <li><strong>Aucune garantie de visibilité</strong> → même avec 50 000 abonnés, moins de 10 % voient vos posts.</li>
                  <li><strong>Risque de coupure brutale</strong> → bannissement, bug, piratage… et tout disparaît.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Construire uniquement sur les réseaux sociaux, c'est bâtir sur un terrain qui ne vous appartient pas.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> une marque de vêtements avec 80 % de ses ventes générées via Instagram.</p>
                <p>Un changement dans l'algorithme réduit son reach organique. En deux mois, ses ventes chutent de 40 %.</p>
                <p><strong>✅ Après :</strong> la même marque lance une newsletter hebdo, optimise son site pour le référencement, et crée une communauté privée pour ses clients fidèles.</p>
                <p>Même si Instagram baisse en performance, elle garde le contact et continue de vendre.</p>
              </div>

              <div className="blog-section">
                <h2>Construire son propre écosystème</h2>
                <ul>
                  <li><strong>Un site web solide et optimisé</strong> → votre base centrale.</li>
                  <li><strong>Une newsletter régulière</strong> → lien direct avec votre audience.</li>
                  <li><strong>Une communauté privée</strong> → groupe Facebook, Discord, forum… mais gérée par vous.</li>
                  <li><strong>Des contenus SEO durables</strong> → articles, ressources, guides.</li>
                  <li><strong>Un CRM propre</strong> → pour exploiter vos données et segmenter vos messages.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Chez Soliva, on aime utiliser les réseaux… mais pas en dépendre.</p>
                <p>Notre stratégie :</p>
                <ul>
                  <li>Attirer via Instagram, TikTok, LinkedIn</li>
                  <li>Convertir vers un espace qui vous appartient</li>
                  <li>Cultiver la relation sans être à la merci d'un algorithme</li>
                </ul>
                <p>Parce qu'un like ne vaut rien… mais un contact direct vaut de l'or.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Les réseaux sociaux sont un excellent tremplin.</p>
                <p>Mais à long terme, ceux qui gagnent sont ceux qui possèdent leur terrain de jeu.</p>
                <p>Commencez aujourd'hui à bâtir votre écosystème, avant que les règles changent.</p>
              </div>

              <div className="blog-cta">
                <p>✨ On vous aide à construire une présence digitale qui vous appartient</p>
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

export default ArticleSortirDependancePlateformesAudienceNeVousAppartientPas; 