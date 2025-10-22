"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePromptsParfaitsNexistentPas = (): React.JSX.Element => {
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
            <h1 className="blog-header">Les prompts parfaits n'existent pas</h1>
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
                <h2>Et c'est une bonne nouvelle</h2>
                <p>Vous avez sûrement vu passer ces promesses :</p>
                <ul>
                  <li>"Le prompt qui va transformer votre business"</li>
                  <li>"5 phrases magiques pour dompter ChatGPT"</li>
                  <li>"Le secret que les pros de l'IA ne veulent pas que vous sachiez"</li>
                </ul>
                <p>Stop.</p>
                <p>Il n'y a pas de formule magique.</p>
                <p>Et c'est tant mieux, parce que ça veut dire que la valeur ne viendra pas de la phrase, mais de votre façon de penser.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Le culte du copier-coller</strong> → On prend un prompt trouvé en ligne, on le balance à l'IA… et on s'étonne d'avoir la même réponse que tout le monde.</li>
                  <li><strong>L'illusion de la maîtrise</strong> → Croire qu'une phrase suffit à "contrôler" un modèle complexe.</li>
                  <li><strong>La fuite en avant</strong> → Passer plus de temps à chercher "le bon prompt" qu'à travailler sur le fond.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Le prompt n'est pas le produit fini. C'est juste le point de départ.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi c'est une bonne nouvelle</h2>
                <ul>
                  <li>Pas besoin de mémoriser 50 phrases toutes faites.</li>
                  <li>Pas besoin de courir après "le dernier prompt viral".</li>
                  <li>Votre avantage ne vient pas d'un secret… mais de votre capacité à réfléchir, à cadrer et à exploiter la réponse.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p>Deux personnes utilisent le même prompt :</p>
                <p>"Rédige un email de prospection pour un photographe"</p>
                <p><strong>Personne A :</strong> copie-colle la réponse, l'envoie telle quelle → générique, sans impact.</p>
                <p><strong>Personne B :</strong> relit, adapte au style de sa marque, ajoute une offre unique → résultat engageant, qui convertit.</p>
                <p>Même prompt. Deux résultats. Une seule vraie différence : l'humain derrière.</p>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on n'accumule pas des "prompts secrets".</p>
                <p>On travaille sur la stratégie, le ton, le contexte, et on utilise l'IA comme un outil créatif… pas comme une machine à formules toutes faites.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Le "prompt parfait" est un mythe marketing.</p>
                <p>La vraie puissance, c'est votre capacité à orienter l'IA et à transformer ce qu'elle produit en quelque chose de vraiment à vous.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de faire travailler l'IA pour votre marque… pas l'inverse ?</p>
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

export default ArticlePromptsParfaitsNexistentPas; 