"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticlePersonnalisation = () => {
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
            <h1 className="blog-header">La personnalisation à la Amazon arrive pour toutes les marques</h1>
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
                <h2>Ce que font les géants… bientôt à la portée de tous</h2>
                <p>Amazon vous montre les produits que vous voulez avant même de les chercher.</p>
                <p>Netflix vous recommande la série parfaite pour votre soirée.</p>
                <p>Spotify vous prépare une playlist qui colle à votre humeur.</p>
                <p>Pendant longtemps, ce niveau de personnalisation était réservé aux géants du web.</p>
                <p>Mais la donne change : les outils pour le faire arrivent enfin à la portée de toutes les marques, petites ou grandes.</p>
              </div>

              <div className="blog-section">
                <h2>Pourquoi c'est un tournant</h2>
                <p><strong>Hier :</strong> il fallait une équipe data, des développeurs spécialisés et un budget colossal.</p>
                <p><strong>Aujourd'hui :</strong> des solutions accessibles permettent d'adapter un site, un email ou une pub à chaque personne sans infrastructure lourde.</p>
                <p><strong>Demain :</strong> ce niveau de personnalisation sera attendu par vos clients… même pour un petit e-commerce ou un site vitrine.</p>
              </div>

              <div className="blog-section">
                <h2>Ce que ça change</h2>
                <ul>
                  <li><strong>Pertinence maximale</strong> → chaque visiteur voit ce qui l'intéresse vraiment.</li>
                  <li><strong>Expérience unique</strong> → moins de contenu générique, plus de "c'est fait pour moi".</li>
                  <li><strong>Meilleures conversions</strong> → on parle aux besoins réels, pas à une moyenne.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p>Un site de vêtements :</p>
                <ul>
                  <li><strong>Nouveau visiteur</strong> → met en avant les best-sellers et promos actuelles.</li>
                  <li><strong>Client régulier</strong> → montre les nouveautés dans sa taille et son style favori.</li>
                  <li><strong>VIP</strong> → propose un accès anticipé à la prochaine collection.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Pourquoi il faut s'y mettre maintenant</h2>
                <ul>
                  <li>Les outils sont là (et abordables).</li>
                  <li>Les utilisateurs y sont habitués grâce aux géants → ils s'attendent au même confort partout.</li>
                  <li>Ceux qui l'adoptent tôt se démarqueront immédiatement.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Au studio, on voit la personnalisation comme la prochaine norme.</p>
                <p>Pas un gadget, mais un levier stratégique pour créer des liens plus forts avec vos clients et augmenter vos résultats.</p>
                <p>Le design attire, la personnalisation retient.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Ce que font Amazon, Netflix ou Spotify n'est plus réservé aux multinationales.</p>
                <p>Aujourd'hui, même une petite marque peut offrir une expérience sur-mesure à chaque visiteur.</p>
                <p>Et demain, ce sera tout simplement… la norme.</p>
              </div>

              <div className="blog-cta">
                <p>✨ Envie de rendre votre communication aussi personnelle qu'un service VIP ?</p>
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

export default ArticlePersonnalisation; 