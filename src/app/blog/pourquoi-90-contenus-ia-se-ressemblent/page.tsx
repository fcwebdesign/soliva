"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePourquoi90ContenusIASeRessemblent = (): React.JSX.Element => {
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
            <h1 className="blog-header">Pourquoi 90 % des contenus IA se ressemblent</h1>
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
                <h2>Et comment éviter de tomber dans le piège</h2>
                <p>Parcourez LinkedIn, Instagram ou même Google…</p>
                <p>Les posts générés par IA finissent tous par se ressembler :</p>
                <ul>
                  <li>Mêmes tournures</li>
                  <li>Mêmes visuels "trop parfaits"</li>
                  <li>Mêmes idées recyclées</li>
                </ul>
                <p>L'IA n'est pas le problème.</p>
                <p>Le problème, c'est comment on l'utilise.</p>
              </div>

              <div className="blog-section">
                <h2>Le problème</h2>
                <ul>
                  <li><strong>Les mêmes outils</strong> → ChatGPT, Midjourney, DALL·E… nourris par les mêmes données.</li>
                  <li><strong>Les mêmes prompts</strong> → copiés depuis des tutos ou des threads Twitter.</li>
                  <li><strong>Pas de personnalisation</strong> → on laisse l'IA répondre par défaut, sans lui donner notre ton, notre contexte, notre vision.</li>
                </ul>
                <div className="blog-example">
                  <p>💡 Résultat : un contenu "propre" mais totalement interchangeable.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Pourquoi ça tue l'impact</h2>
                <ul>
                  <li>Votre marque se dilue dans un flot de messages identiques</li>
                  <li>Vous perdez votre personnalité</li>
                  <li>Vous ne créez pas d'émotion ni de surprise</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Comment éviter ça</h2>
                <ul>
                  <li><strong>Partir de votre identité</strong> → ton, vocabulaire, valeurs, style visuel.</li>
                  <li><strong>Personnaliser l'IA</strong> → entraînez-la avec vos contenus existants.</li>
                  <li><strong>Donner du contexte riche</strong> → au lieu de "fais-moi un post sur X", précisez la cible, l'angle, le format, la finalité.</li>
                  <li><strong>Mixer humain + IA</strong> → l'IA propose, vous affûtez.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Mauvais prompt :</strong></p>
                <p>"Rédige un post LinkedIn sur les avantages du télétravail"</p>
                <p><strong>✅ Bon prompt :</strong></p>
                <p>"Rédige un post LinkedIn sur les avantages du télétravail pour les PME, en utilisant un ton clair et cash, avec un exemple concret, en visant les dirigeants pressés et en évitant les clichés habituels."</p>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on ne se contente pas de demander à l'IA "fais-moi un post".</p>
                <p>On l'oriente avec des données, un style et une stratégie clairs pour qu'elle serve la marque, pas juste la productivité.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>L'IA peut produire vite, mais elle ne vous rendra jamais unique si vous l'utilisez comme tout le monde.</p>
                <p>La différence ne vient pas de l'outil… mais de comment vous l'alimentez.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie d'utiliser l'IA pour créer du contenu vraiment distinctif ?</p>
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

export default ArticlePourquoi90ContenusIASeRessemblent; 