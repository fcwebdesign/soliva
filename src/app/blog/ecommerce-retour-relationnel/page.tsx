"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ArticleEcommerceRetourRelationnel = (): React.JSX.Element => {
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
            <h1 className="blog-header">E-commerce : le retour du relationnel</h1>
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
                <h2>Pourquoi l'humain est votre meilleur levier de conversion</h2>
                <p>Pendant des années, l'e-commerce a été obsédé par l'optimisation :</p>
                <ul>
                  <li>Funnels ultra-courts</li>
                  <li>Automatisations à tous les niveaux</li>
                  <li>Personnalisation basée sur les données</li>
                </ul>
                <p>Résultat : les sites sont plus performants… mais aussi plus froids.</p>
                <p>Et dans un marché saturé, ce qui manque le plus, c'est l'humain.</p>
              </div>

              <div className="blog-section">
                <h2>Pourquoi la relation client revient sur le devant de la scène</h2>
                <ul>
                  <li><strong>Tout le monde peut copier vos prix et vos produits</strong></li>
                  <li><strong>Personne ne peut copier la relation que vous créez</strong></li>
                  <li><strong>La fidélité ne s'achète pas, elle se cultive</strong></li>
                  <li><strong>Les communautés convertissent mieux que n'importe quelle pub</strong></li>
                </ul>
                <div className="blog-example">
                  <p>💡 Dans un monde de "tunnels de vente", la relation devient votre différenciateur.</p>
                </div>
              </div>

              <div className="blog-section">
                <h2>Exemple concret</h2>
                <p><strong>❌ Avant :</strong> un site de cosmétiques avec un tunnel optimisé au millimètre, mais aucune interaction après l'achat → 80 % des clients ne reviennent pas.</p>
                <p><strong>✅ Après :</strong> création d'un groupe privé de clients, envoi d'e-mails personnalisés post-achat, partage de coulisses et invitation à co-créer les prochains produits → taux de réachat x2.</p>
              </div>

              <div className="blog-section">
                <h2>Comment réintroduire l'humain dans l'e-commerce</h2>
                <ul>
                  <li><strong>Répondre vite et bien</strong> → un service client réactif = confiance immédiate.</li>
                  <li><strong>Créer un espace de communauté</strong> → Facebook, Discord, ou même un forum privé.</li>
                  <li><strong>Partager les coulisses</strong> → montrer qui vous êtes, pas seulement ce que vous vendez.</li>
                  <li><strong>Impliquer vos clients</strong> → sondages, votes, co-création de produits.</li>
                  <li><strong>Personnaliser vraiment</strong> → pas juste le prénom dans l'email, mais du contenu et des offres pertinentes.</li>
                </ul>
              </div>

              <div className="blog-section">
                <h2>Notre position</h2>
                <p>Chez Soliva, on pense que l'e-commerce n'est pas un sprint, mais une relation longue.</p>
                <p>Un client satisfait achète.</p>
                <p>Un client attaché à votre marque… vous recommande, défend votre image et revient, encore et encore.</p>
              </div>

              <div className="blog-section">
                <h2>Conclusion</h2>
                <p>Les outils automatisent, mais l'humain fidélise.</p>
                <p>Réintroduire du relationnel, ce n'est pas un "bonus" : c'est un avantage concurrentiel durable.</p>
              </div>

              <div className="blog-cta">
                <p>✨ On vous aide à concevoir un e-commerce qui vend et qui crée du lien</p>
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

export default ArticleEcommerceRetourRelationnel; 