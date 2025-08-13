"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const Blog = () => {
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

  const handleArticleClick = (path) => (e) => {
    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition(path);
    } else {
      router.push(path, {
        onTransitionReady: () => triggerPageTransition(path),
      });
    }
  };

  useGSAP(() => {
    const isSafari = () => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("safari") && !ua.includes("chrome");
    };
  
    if (isSafari()) {
      gsap.fromTo(
        ".blog-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.1,
          ease: "power4.out",
        }
      );
      return;
    }
  
    const splitText = SplitText.create(".blog-header", {
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
  }, []);

  const articles = [
    {
      id: "ecommerce-retour-relationnel",
      title: "E-commerce : le retour du relationnel"
    },
    {
      id: "sobriete-design-moins-plein-vue",
      title: "La sobriété design : l'art de faire mieux avec moins"
    },
    {
      id: "sortir-dependance-plateformes-audience-ne-vous-appartient-pas",
      title: "Sortir de la dépendance aux plateformes : votre audience ne vous appartient pas"
    },
    {
      id: "sites-vitrine-oublies-5-secondes",
      title: "Pourquoi 80 % des sites vitrine sont oubliés 5 secondes après leur visite"
    },
    {
      id: "slider-accueil-ne-sert-rien",
      title: "Votre slider d'accueil ne sert à rien"
    },
    {
      id: "site-lent-site-mort",
      title: "Un site lent est un site mort"
    },
    {
      id: "pourquoi-boutique-en-ligne-ne-vend-pas",
      title: "Pourquoi votre boutique en ligne ne vend pas"
    },
    {
      id: "mythe-theme-shopify-parfait",
      title: "Le mythe du thème Shopify parfait"
    },
    {
      id: "marques-misent-moins-mais-mieux",
      title: "Les marques qui misent sur moins mais mieux"
    },
    {
      id: "personnalisation-donnees-proprietaires-tendance-montante",
      title: "La personnalisation et les données propriétaires : la tendance montante"
    },
    {
      id: "si-ia-tuait-creativite-avant-sauver",
      title: "Et si l'IA tuait la créativité… avant de la sauver ?"
    },
    {
      id: "arretez-illustrer-posts-linkedin-images-sans-sens",
      title: "Arrêtez d'illustrer vos posts LinkedIn avec des images qui n'ont aucun sens"
    },
    {
      id: "prompts-parfaits-nexistent-pas",
      title: "Les prompts parfaits n'existent pas"
    },
    {
      id: "obsession-outils-probleme-pas-logiciel",
      title: "L'obsession des outils : pourquoi le problème n'est pas votre logiciel"
    },
    {
      id: "futur-branding-humain-augmente-remplace",
      title: "Le futur du branding : humain, augmenté ou remplacé ?"
    },
    {
      id: "faux-outils-ia-juste-scripts",
      title: "Les faux outils 'IA' qui sont juste des scripts"
    },
    {
      id: "reseaux-sociaux-ne-sont-pas-strategie",
      title: "Les réseaux sociaux ne sont pas une stratégie"
    },
    {
      id: "pourquoi-90-contenus-ia-se-ressemblent",
      title: "Pourquoi 90 % des contenus IA se ressemblent"
    },
    {
      id: "pourquoi-copier-branding-grandes-marques-erreur",
      title: "Pourquoi copier le branding des grandes marques est une erreur"
    },
    {
      id: "votre-logo-nest-pas-votre-marque",
      title: "Votre logo n'est pas votre marque"
    },
    {
      id: "ia-promesses-marketing-realite-technique",
      title: "IA : entre promesses marketing et réalité technique"
    },
    {
      id: "no-code-puissant-pas-magique",
      title: "No-code : puissant, mais pas magique"
    },
    {
      id: "ia-strategie-marque-arretez-copier-commencez-creer",
      title: "IA et stratégie de marque : arrêtez de copier, commencez à créer"
    },
    {
      id: "piege-tout-pour-algorithme",
      title: "Le piège du 'tout pour l'algorithme'"
    },
    {
      id: "arretez-vouloir-etre-partout",
      title: "Arrêtez de vouloir être partout"
    },
    {
      id: "tendances-graphiques-2025",
      title: "Les tendances graphiques… pourquoi il faut parfois les ignorer"
    },
    {
      id: "personnalisation-amazon-toutes-marques",
      title: "La personnalisation à la Amazon arrive pour toutes les marques"
    }
    // Ajoutez d'autres articles ici
  ];

  return (
    <>
      <ReactLenis root>
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        <div className="blog">
          <div className="col">
            <h1 className="blog-header">Journal</h1>
            <div className="blog-description">
              <p>Réflexions, analyses et insights sur le design, la technologie et la stratégie digitale.</p>
            </div>
          </div>
          <div className="col">
            <div className="blog-articles">
              {articles.map((article, index) => (
                <div key={article.id}>
                  <h2 className="article-title">
                    <a href={`/blog/${article.id}`} onClick={handleArticleClick(`/blog/${article.id}`)}>{article.title}</a>
                  </h2>
                  {index < articles.length - 1 && <hr className="article-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default Blog; 