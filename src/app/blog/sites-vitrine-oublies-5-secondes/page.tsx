"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleSitesVitrineOublies5Secondes = (): React.JSX.Element => {
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
            <h1 className="blog-header">Pourquoi 80 % des sites vitrine sont oubliés 5 secondes après leur visite</h1>
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
                <h2>Et comment faire pour que le vôtre reste en tête</h2>
                <p>Soyons honnêtes : la majorité des sites vitrines se ressemblent.</p>
                <p>Une belle image, un slogan générique, trois blocs "Nos services" et un formulaire de contact.</p>
                <p>Résultat : aucune empreinte mémorable, et l'utilisateur passe au suivant.</p>
              </div>

              <div className="blog-section">
                <h2>Pourquoi ça ne marque pas</h2>
                <ul>
                  <li><strong>Message trop vague</strong> → "Bienvenue sur notre site" n'a jamais donné envie de cliquer.</li>
                  <li><strong>Aucune différenciation</strong> → même ton, même structure, mêmes visuels que le concurrent.</li>
                  <li><strong>Pas d'histoire</strong> → un site sans narration est juste… une brochure en ligne.</li>
                  <li><strong>Zéro point d'ancrage émotionnel</strong> → rien qui donne envie de revenir ou d'en parler.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 La première impression se joue en quelques secondes.</p>
                  <p>Si vous ne captez pas l'attention immédiatement, vous êtes oublié.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> une agence de services B2B avec un site qui aligne des phrases creuses ("Nous sommes à votre écoute", "Votre satisfaction est notre priorité").</p>
                <p>Résultat : l'utilisateur ferme l'onglet et ne se souvient même plus du nom de la société.</p>
                <p><strong>✅ Après :</strong> une page d'accueil qui annonce clairement une promesse forte ("Nous transformons vos visiteurs en clients en 30 jours"), avec un visuel original et un ton qui tranche.</p>
                <p>Résultat : l'utilisateur sait qui vous êtes, ce que vous faites et pourquoi ça vaut la peine de vous contacter.</p>
              </div>

              <div className="blog-section">
                <h2>Comment sortir du lot</h2>
                <ul>
                  <li><strong>Un message clair et audacieux</strong> dès l'arrivée.</li>
                  <li><strong>Un visuel unique</strong> qui illustre votre promesse (et pas une banque d'images générique).</li>
                  <li><strong>Une histoire</strong> qui montre le "pourquoi" derrière votre activité.</li>
                  <li><strong>Des preuves concrètes</strong> (résultats, témoignages, études de cas).</li>
                  <li><strong>Une identité visuelle différenciante</strong> qui reste en mémoire.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Chez Soliva, on ne fait pas des sites "jolis".</p>
                <p>On crée des sites qui marquent, parce qu'ils sont pensés pour :</p>
                <ul>
                  <li>Attirer l'attention</li>
                  <li>Rester en mémoire</li>
                  <li>Et pousser à l'action</li>
                </ul>
                <p>Un site vitrine ne sert à rien s'il ne fait pas de vous le choix évident dans l'esprit de vos prospects.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Ne laissez pas votre site être un onglet qu'on ferme et qu'on oublie.</p>
                <p>Faites-en une vitrine qui reste dans la tête… et dans les favoris.</p>
              </div>

              <div className="blog-cta">
                <p>✨ On conçoit des sites qui ne s'oublient pas</p>
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

export default ArticleSitesVitrineOublies5Secondes; 