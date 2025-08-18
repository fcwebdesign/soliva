"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import FormattedText from '@/components/FormattedText';
import PreviewBar from '@/components/PreviewBar';
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

export default function BlogArticle() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useTransitionRouter();
  
    const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si on est en mode aperçu via l'URL
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    
    if (previewParam) {
      setIsPreviewMode(true);
      setPreviewId(previewParam);
      console.log('🔍 Mode aperçu détecté:', previewParam);
    }
  }, []);

  // Décaler tout le site en mode aperçu (comme WordPress)
  useEffect(() => {
    if (isPreviewMode) {
      document.documentElement.classList.add('preview-mode');
      return () => {
        document.documentElement.classList.remove('preview-mode');
      };
    }
  }, [isPreviewMode]);

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
    if (!article) return;

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
  }, [article]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Si on est en mode aperçu, charger la révision temporaire
      if (isPreviewMode && previewId) {
        console.log('📖 Chargement de la révision temporaire:', previewId);
        
        const response = await fetch(`/api/admin/preview/${previewId}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const previewContent = await response.json();
          const foundArticle = previewContent.blog?.articles?.find((a) => 
            a.slug === slug || a.id === slug
          );
          
          if (foundArticle) {
            console.log('✅ Article de prévisualisation chargé');
            setArticle(foundArticle);
            setLoading(false);
            return;
          }
        } else {
          console.warn('⚠️ Révision temporaire non trouvée, chargement normal');
        }
      }
      
      // Sinon, charger normalement depuis l'API
      const response = await fetch('/api/content', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await response.json();
      
      const foundArticle = data.blog?.articles?.find((a) => 
        a.slug === slug || a.id === slug
      );
      
      setArticle(foundArticle);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!article) {
    return <div>Article non trouvé</div>;
  }

  // Vérifier si l'article est publié ou si on est en mode aperçu
  if (!isPreviewMode && article.status && article.status !== 'published') {
    return <div>Cet article n'est pas encore publié</div>;
  }

  // Générer une date
  const articleDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
  const formattedDate = articleDate.getFullYear().toString();

  return (
    <>
      <ReactLenis root>
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="blog-article-page">
          <div className="col">
            <h1 className="blog-header">{article.title}</h1>
            <div className="blog-meta">
              <div className="blog-date">
                <h3>Date</h3>
                <p>{formattedDate}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="blog-content">
              {article.content ? (
                <div className="blog-section">
                  <FormattedText>{article.content}</FormattedText>
                </div>
              ) : (
                <div className="blog-section">
                  <p>Cet article n'a pas encore de contenu.</p>
                </div>
              )}

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
} 