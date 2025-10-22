"use client";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";
import Head from "next/head";

gsap.registerPlugin(SplitText);

const ArticleArretezIllustrerPostsLinkedinImagesSansSens = (): React.JSX.Element => {
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
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(150% at 50% 50%)" },
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

    const delay = TRANSITION_CONFIG.mode === "circle" ? 1.15 : 1.75;

    gsap.to(splitText.words, {
      y: "0%",
      duration: 1.5,
      stagger: 0.25,
      delay,
      ease: "power4.out",
    });
  }, {});

  const siteName = "Soliva";
  const articleUrl = "https://votredomaine.com/blog/illustrer-posts-linkedin-images";
  const cover = "https://votredomaine.com/images/blog/illustrer-posts-linkedin-cover.jpg";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Posts LinkedIn : comment choisir des images efficaces",
    alternativeHeadline:
      "Arrêtez d’illustrer vos posts LinkedIn avec des images qui n’ont aucun sens",
    description:
      "Guide complet pour sélectionner des visuels percutants (y compris IA) sur LinkedIn : erreurs à éviter, bonnes pratiques, exemples concrets et checklist.",
    image: [cover],
    author: { "@type": "Organization", name: siteName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: "https://votredomaine.com/logo.png" },
    },
    datePublished: "2024-11-15",
    dateModified: "2024-11-15",
    mainEntityOfPage: articleUrl,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Faut-il toujours ajouter une image à un post LinkedIn ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Non. Selon l’objectif, un post texte ou un carrousel peut mieux performer. L’essentiel est la cohérence message/visuel.",
        },
      },
      {
        "@type": "Question",
        name: "Les images IA fonctionnent-elles sur LinkedIn ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Oui si elles sont pertinentes, contextualisées et cohérentes avec votre marque. Les visuels “waouh” hors sujet sont contre-productifs.",
        },
      },
      {
        "@type": "Question",
        name: "Quel format d’image privilégier sur LinkedIn ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Le 1200×627 px fonctionne bien pour un post simple. Pour le carré, 1200×1200. Pensez au texte alternatif pour l’accessibilité.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Posts LinkedIn : comment choisir des images efficaces</title>
        <meta
          name="description"
          content="Évitez les images hors sujet sur LinkedIn. Guide complet : bonnes pratiques, exemples, IA et checklist pour des visuels percutants et crédibles."
        />
        <link rel="canonical" href={articleUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Posts LinkedIn : comment choisir des images efficaces" />
        <meta
          property="og:description"
          content="Pourquoi un visuel mal choisi nuit à vos posts LinkedIn et comment créer des images (même IA) qui servent vraiment votre message."
        />
        <meta property="og:image" content={cover} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content={siteName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Posts LinkedIn : comment choisir des images efficaces" />
        <meta
          name="twitter:description"
          content="Erreurs à éviter, bonnes pratiques et exemples concrets pour illustrer vos posts LinkedIn avec pertinence."
        />
        <meta name="twitter:image" content={cover} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <ReactLenis root>
        {TRANSITION_CONFIG.mode === "curtain" && <div className="revealer" />}

        <div className="blog-article-page">
          <div className="col">
            <h1 className="blog-header">
              Arrêtez d’illustrer vos posts LinkedIn avec des images qui n’ont aucun sens
            </h1>
            <div className="blog-meta" aria-label="métadonnées article">
              <div className="blog-date">
                <h3>Date</h3>
                <p>2024</p>
              </div>
            </div>
          </div>

          <div className="col">
            <article className="blog-content" itemScope itemType="https://schema.org/Article">
              <section className="blog-section">
                <h2>Pourquoi un visuel bien choisi change tout</h2>
                <p>
                  Sur LinkedIn, la bataille se joue en une fraction de seconde. Votre visuel est
                  souvent la première chose que l’utilisateur voit, avant même votre accroche. Un
                  bon visuel attire, retient et prépare le lecteur à votre message. Un mauvais
                  visuel… et votre post disparaît dans le flux.
                </p>
                <p>
                  Beaucoup d’entreprises publient des images qui « font joli » mais n’ont aucun
                  rapport concret avec le sujet : cybersécurité illustrée par un cadenas en forme de
                  cerveau, management accompagné d’un astronaute… C’est original, mais ça ne sert
                  pas votre propos.
                </p>
              </section>

              <section className="blog-section">
                <h2>Pourquoi éviter les images “cool mais hors sujet”</h2>
                <h3>1) Perte de crédibilité</h3>
                <p>
                  Un visuel déconnecté du contenu donne l’impression que vous publiez pour publier.
                  La crédibilité s’érode, surtout sur un réseau professionnel.
                </p>
                <h3>2) Message brouillé</h3>
                <p>
                  Le cerveau associe instinctivement l’image au texte. Si l’un contredit l’autre,
                  vous créez de la confusion et perdez l’attention.
                </p>
                <h3>3) Engagement de moindre qualité</h3>
                <p>
                  Les likes “waouh” ne valent rien si le message n’est pas compris ni mémorisé. Un
                  visuel pertinent génère des commentaires utiles et des clics qualifiés.
                </p>
              </section>

              <section className="blog-section">
                <h2>L’IA : formidable outil… ou générateur de confusion ?</h2>
                <p>
                  Des outils comme <strong>Midjourney</strong>, <strong>DALL·E</strong> ou{" "}
                  <strong>Stable Diffusion</strong> permettent de produire des visuels inédits en
                  quelques secondes. Le piège ? La facilité. On choisit la première image “waouh”
                  sans se demander si elle colle vraiment au propos.
                </p>
                <ul>
                  <li>Manque de contexte : image belle mais abstraite.</li>
                  <li>Incohérences visuelles : éléments qui contredisent le message.</li>
                  <li>Valeur ajoutée nulle : le visuel pourrait illustrer n’importe quel post.</li>
                </ul>
                <p>
                  <strong>Astuce prompt IA :</strong> précisez le{" "}
                  <em>contexte, l’émotion, l’angle, l’élément-clé</em> et le lien direct avec votre
                  sujet. Exemple : “Illustration sobre, style éditorial, bureau minimaliste vu de
                  face, écran affichant ‘Réunion annulée’, lumière douce, couleurs de marque
                  (bleu #123456 / gris #EFEFEF)”.
                </p>
              </section>

              <section className="blog-section">
                <h2>Comment choisir un bon visuel LinkedIn</h2>
                <h3>1) Relier l’image au message</h3>
                <p>
                  Posez-vous cette question : “Sans lire le texte, l’image raconte-t-elle déjà une
                  partie de l’histoire ?”. Si non, changez.
                </p>
                <h3>2) Cohérence avec votre branding</h3>
                <p>
                  Palette, style, typographies : des repères visuels constants renforcent la
                  reconnaissance et la confiance.
                </p>
                <h3>3) Privilégier l’authentique</h3>
                <p>
                  Photos réelles (équipe, produit, coulisses) &gt; banques d’images génériques. Et
                  si vous utilisez du stock, retouchez-le pour l’aligner à vos codes.
                </p>
                <h3>4) Oser la simplicité</h3>
                <p>
                  Une image claire, lisible et sans surcharge est souvent plus mémorable qu’un
                  montage complexe.
                </p>
              </section>

              <section className="blog-section">
                <h2>Exemples concrets</h2>
                <h3>❌ Mauvais choix</h3>
                <p>
                  Post : “Comment réduire les réunions inutiles” → image IA d’un robot en armure
                  avec un sabre laser. Amusant, mais hors sujet.
                </p>
                <h3>✅ Bon choix</h3>
                <p>
                  Même sujet → photo/illustration d’un bureau minimaliste, chaise vide, écran
                  “Réunion annulée” : message clair, lien immédiat avec le propos.
                </p>
                <div className="blog-example">
                  <p>
                    💡 <em>Pro-tip :</em> créez 3 variantes (photo, illustration, flat design) puis
                    testez celle qui génère les commentaires les plus pertinents.
                  </p>
                </div>
              </section>

              <section className="blog-section">
                <h2>Bonnes pratiques techniques (rapides)</h2>
                <ul>
                  <li>Format recommandé : 1200×627 (paysage) ou 1200×1200 (carré).</li>
                  <li>Compression : WebP/JPEG optimisé pour éviter l’effet flou.</li>
                  <li>Texte alternatif : décrivez l’idée, pas seulement la scène.</li>
                  <li>Lisibilité mobile : évitez le texte minuscule intégré à l’image.</li>
                </ul>
              </section>

              <section className="blog-section">
                <h2>Checklist express avant de publier</h2>
                <ul>
                  <li>L’image raconte-t-elle la même histoire que le texte ?</li>
                  <li>Est-elle cohérente avec ma charte ?</li>
                  <li>Est-ce compréhensible en 1 seconde sur mobile ?</li>
                  <li>Ajouté un alt text utile ?</li>
                  <li>Ai-je une variante à tester si l’engagement est faible ?</li>
                </ul>
              </section>

              <section className="blog-section">
                <h2>FAQ – Images et posts LinkedIn</h2>
                <h3>Faut-il toujours ajouter une image à un post ?</h3>
                <p>
                  Non. Selon l’objectif, un texte fort ou un carrousel peut mieux fonctionner. Le
                  visuel n’est pas une obligation, c’est un levier.
                </p>
                <h3>Les images IA marchent-elles mieux ?</h3>
                <p>
                  Elles marchent si elles sont <strong>pertinentes</strong> et{" "}
                  <strong>contextualisées</strong>. L’effet “waouh” seul ne convertit pas.
                </p>
                <h3>Puis-je utiliser des banques d’images ?</h3>
                <p>
                  Oui, mais personnalisez-les (couleurs, cadrage, overlay de marque) pour éviter
                  l’effet “déjà vu”.
                </p>
              </section>

              <section className="blog-section">
                <h2>Notre position</h2>
                <p>
                  Chez <a href="/services">Soliva</a>, on adore l’IA créative…{" "}
                  <strong>quand elle sert le message</strong>. Chaque visuel doit prolonger votre
                  idée, pas la parasiter. On conçoit des systèmes visuels qui rendent vos posts
                  immédiatement reconnaissables et utiles à votre audience.
                </p>
              </section>

              <section className="blog-section">
                <h2>Conclusion</h2>
                <p>
                  Un visuel hors sujet, c’est comme un titre trompeur : ça attire, puis ça déçoit.
                  Et la déception, sur LinkedIn, mène à l’oubli.
                </p>
                <p>
                  Mieux vaut une image simple et pertinente qu’un visuel spectaculaire mais
                  déconnecté. Si vous ne devez retenir qu’une règle : <strong>image et texte doivent
                  raconter la même histoire</strong>.
                </p>
              </section>

              <nav className="blog-cta" aria-label="appel à l’action">
                <p>
                  ✨ Envie de visuels LinkedIn qui marquent les esprits (même avec l’IA) ?
                  <br />
                  <a href="/contact" className="cta-link">Parlons-en →</a>
                </p>
              </nav>

              <nav className="blog-navigation" aria-label="navigation article">
                <a href="/blog" onClick={handleBackClick} className="back-link">
                  ← Retour au Journal
                </a>
                <div className="related-links">
                  <a href="/blog/ia-strategie-de-marque" className="related-link">
                    IA & stratégie de marque : arrêtez de copier, commencez à créer
                  </a>
                  <a href="/blog/tout-pour-algorithme" className="related-link">
                    Le piège du “tout pour l’algorithme”
                  </a>
                </div>
              </nav>
            </article>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default ArticleArretezIllustrerPostsLinkedinImagesSansSens;
