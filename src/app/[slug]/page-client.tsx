"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGSAP } from "@gsap/react";
import BlockRenderer from '@/blocks/BlockRenderer';
import PageHeader from '../../components/PageHeader';
import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function PageClient() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const getContentTitle = (pageData: any) => {
    if (!pageData) return '';
    if (pageData.hero?.title && pageData.hero.title.trim()) return pageData.hero.title;
    if (pageData.title && pageData.title.trim()) return pageData.title;
    if (pageData.blocks && pageData.blocks.length > 0) {
      for (const block of pageData.blocks) {
        if (block.type === 'h1' && block.content) return block.content;
        if (block.type === 'h2' && block.content) return block.content;
      }
    }
    if (pageData.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pageData.content;
      const h1 = tempDiv.querySelector('h1');
      if (h1 && h1.textContent.trim()) return h1.textContent.trim();
      const h2 = tempDiv.querySelector('h2');
      if (h2 && h2.textContent.trim()) return h2.textContent.trim();
    }
    return 'Page sans titre';
  };

  useGSAP(() => {
    const isSafari = () => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("safari") && !ua.includes("chrome");
    };
    if (isSafari()) {
      gsap.fromTo("h1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.1, ease: "power4.out" });
      gsap.fromTo(".contact-description", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" });
      return;
    }
    const splitText = SplitText.create("h1", { type: "words", wordsClass: "word", mask: "words" });
    gsap.set(splitText.words, { y: "110%" });
    const delay = 1.75;
    gsap.to(splitText.words, { y: "0%", duration: 1.5, stagger: 0.25, delay, ease: "power4.out" });
    gsap.fromTo(".contact-description", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: delay + 0.5, ease: "power3.out" });
  }, { dependencies: [pageData] });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    if (previewParam) {
      setIsPreviewMode(true);
      setPreviewId(previewParam);
      console.log('🔍 Mode aperçu détecté:', previewParam);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [previewId]);

  const fetchContent = async () => {
    try {
      // Utiliser /api/content/metadata au lieu de /api/content (plus léger)
      const response = await fetch('/api/content/metadata');
      const data = await response.json();
      const foundPage = data.pages?.pages?.find((p: any) => p.slug === slug || p.id === slug);
      setPageData(foundPage);
    } catch (err) {
      console.error('Erreur:', err);
    } finally { setLoading(false); }
  };

  if (loading) return <div>Chargement...</div>;
  if (!pageData) return <div>Page non trouvée</div>;

  return (
    <div className="page-custom">
      <main className="flex-1">
        {pageData.layout === 'two-columns' ? (
          <div className="project-page">
            <div className="col">
              <PageHeader title={getContentTitle(pageData)} description={pageData.description} titleClassName="work-header" sticky={true} stickyTop="top-32" />
            </div>
            <div className="col">
              <div className="project-content">
                {pageData.blocks && pageData.blocks.length > 0 ? (
                  <BlockRenderer blocks={pageData.blocks} />
                ) : (
                  <div className="project-description">
                    <p>Cette page n'a pas encore de contenu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="project-page">
            <div className="col">
              <PageHeader title={getContentTitle(pageData)} description={pageData.description} titleClassName="work-header" sticky={true} stickyTop="top-32" />
            </div>
            <div className="col">
              <div className="project-content">
                {pageData.blocks && pageData.blocks.length > 0 ? (
                  <BlockRenderer blocks={pageData.blocks} />
                ) : pageData.content ? (
                  <div className="project-description">
                    <h2>Description</h2>
                    <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                  </div>
                ) : (
                  <div className="project-description">
                    <p>Cette page n'a pas encore de contenu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

