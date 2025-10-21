"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import PreviewBar from '@/components/PreviewBar';
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";
import BlockRenderer from '@/components/BlockRenderer';
import FormattedText from '@/components/FormattedText';
import PageHeader from '@/components/PageHeader';
import { generateAllSchemas, generateBreadcrumbSchema } from '@/lib/schema';
import BaseSchemas from '@/components/BaseSchemas';

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
    return undefined;
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
  }, [previewId]); // Recharger quand previewId change

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
          console.log('📖 Contenu de prévisualisation reçu:', {
            hasBlog: !!previewContent.blog,
            hasArticles: !!previewContent.blog?.articles,
            articlesCount: previewContent.blog?.articles?.length || 0,
            articles: previewContent.blog?.articles?.map(a => ({ title: a.title, slug: a.slug }))
          });
          
          const foundArticle = previewContent.blog?.articles?.find((a) => 
            a.slug === slug || a.id === slug
          );
          
          if (foundArticle) {
            console.log('✅ Article de prévisualisation chargé:', {
              title: foundArticle.title,
              slug: foundArticle.slug,
              hasContent: !!foundArticle.content,
              contentLength: foundArticle.content?.length || 0,
              contentPreview: foundArticle.content?.substring(0, 100)
            });
            setArticle(foundArticle);
            setLoading(false);
            return;
          } else {
            console.warn('⚠️ Article non trouvé dans la prévisualisation:', slug);
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

  // Breadcrumbs JSON-LD pour le SEO
  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Blog", url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3006"}/blog` },
    { name: article.title, url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3006"}/blog/${article.slug}` }
  ]);

  // Générer les schémas SEO
  const articleContent = article.blocks && article.blocks.length > 0 
    ? article.blocks.map(block => block.content || '').join(' ')
    : article.content || '';
    
  const schemasJson = generateAllSchemas({
    title: article.title || '',
    excerpt: article.excerpt,
    content: articleContent,
    publishedAt: article.publishedAt,
    updatedAt: article.publishedAt,
    slug: article.slug || article.id || '',
    schemas: article.seo?.schemas
  });

  return (
    <>
      {/* Schémas de base (Organization + WebSite) */}
      <BaseSchemas />
      
      <ReactLenis root>
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="blog-article-page">
          <div className="col">
            <PageHeader
              title={article.title}
              description={`Publié en ${formattedDate}`}
              titleClassName="blog-header"
              sticky={true}
              stickyTop="top-32"
            />
          </div>
          <div className="col">
            <div className="blog-content">
              {/* Priorité 1: Utiliser les blocs scalables s'ils existent */}
              {article.blocks && article.blocks.length > 0 ? (
                <BlockRenderer blocks={article.blocks} />
              ) : article.content ? (
                /* Priorité 2: Fallback vers le content HTML si pas de blocs */
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
        
        {/* Breadcrumbs JSON-LD pour le SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
        />
        
        {/* Schémas SEO (Article, FAQ, HowTo) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemasJson }}
        />
      </ReactLenis>
    </>
  );
} 