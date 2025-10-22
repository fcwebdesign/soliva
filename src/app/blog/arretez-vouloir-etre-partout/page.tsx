"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleArretezVouloirEtrePartout = (): React.JSX.Element => {
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
            <h1 className="blog-header">Arrêtez de vouloir être partout</h1>
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
                <h2>Se concentrer sur les bons canaux au lieu de se disperser</h2>
                <p>Instagram, LinkedIn, TikTok, YouTube, Pinterest…</p>
                <p>Chaque semaine, un "expert" vous dit : "Si vous n'êtes pas sur [nouveau réseau], vous êtes déjà en retard".</p>
                <p>Résultat : vous vous éparpillez, vous perdez du temps, et votre communication devient fade partout plutôt qu'impactante quelque part.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Quantité vs pertinence</strong> → être présent sur 5 canaux ne sert à rien si votre audience n'en utilise qu'un ou deux.</li>
                  <li><strong>Manque de cohérence</strong> → en voulant tout faire, on finit par recycler du contenu mal adapté.</li>
                  <li><strong>Énergie diluée</strong> → vos efforts se dispersent, vos résultats aussi.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Plus de présence ne veut pas dire plus d'impact.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Être partout :</strong> une marque de déco poste la même image sur Instagram, LinkedIn et TikTok… sans engagement réel sur aucun des trois.</p>
                <p><strong>✅ Être là où ça compte :</strong> la même marque investit vraiment sur Instagram (visuel, stories, reels) et Pinterest (inspirations, tableaux) → trafic et ventes directes.</p>
              </div>

              <div className="blog-section">
                <h2>Comment choisir les bons canaux</h2>
                <ul>
                  <li><strong>Observer votre audience</strong> → Où passe-t-elle le plus de temps ? Où interagit-elle avec des marques comme la vôtre ?</li>
                  <li><strong>Analyser vos forces</strong> → Vous êtes à l'aise en vidéo ? en écrit ? en visuel ?</li>
                  <li><strong>Tester et mesurer</strong> → Essayer un canal pendant 2-3 mois, puis décider de le garder ou non.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on préfère une présence forte sur 1 ou 2 canaux qui comptent vraiment, plutôt qu'une présence fantôme partout.</p>
                <p>Parce qu'une stratégie, ce n'est pas "cochez toutes les cases" → c'est choisir ses batailles pour gagner.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Être partout, c'est souvent être invisible.</p>
                <p>Mieux vaut concentrer votre énergie là où votre audience vous voit, vous écoute, et agit.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Vous voulez identifier les canaux qui comptent vraiment pour votre marque ?</p>
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

export default ArticleArretezVouloirEtrePartout; 