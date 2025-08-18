"use client";
import { useState, useEffect } from 'react';
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import PreviewBar from "@/components/PreviewBar";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const BlogClient = ({ content: initialContent }) => {
  const [content, setContent] = useState(initialContent);

  // Vérifier si on est en mode aperçu (Draft Mode de Next.js)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Vérifier le Draft Mode via un cookie ou une classe CSS
    const isDraftMode = document.documentElement.classList.contains('preview-mode') ||
                       document.cookie.includes('__prerender_bypass') ||
                       window.location.search.includes('preview=true');
    setIsPreviewMode(isDraftMode);
  }, []);

  // Recharger le contenu périodiquement pour les mises à jour
  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        const response = await fetch('/api/content', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const data = await response.json();
        setContent(data.blog);
      } catch (err) {
        console.error('Erreur lors du rechargement:', err);
      }
    };

    // Recharger toutes les 30 secondes
    const interval = setInterval(fetchLatestContent, 30000);
    
    return () => clearInterval(interval);
  }, []);
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

  return (
    <>
      <ReactLenis root>
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="blog">
          <div className="col">
            <h1 className="blog-header">{content?.hero?.title || 'Journal'}</h1>
            <div className="blog-description">
              <p>{content?.description || "Réflexions, analyses et insights sur le design, la technologie et la stratégie digitale."}</p>
            </div>
          </div>
          <div className="col">
            <div className="blog-articles">
              {(content?.articles || [])
                .filter(article => article.status === 'published' || !article.status)
                .map((article, index, filteredArray) => (
                <div key={article.id}>
                  <h2 className="article-title">
                    <a href={`/blog/${article.slug || article.id}`} onClick={handleArticleClick(`/blog/${article.slug || article.id}`)}>{article.title}</a>
                  </h2>
                  {index < filteredArray.length - 1 && <hr className="article-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default BlogClient; 