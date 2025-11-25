"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import { TemplateProvider } from '@/templates/context';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Route dédiée pour la preview dans une iframe
 * Permet un rendu responsive correct sans conflits CSS/JS
 */
export default function PreviewIframePage() {
  const searchParams = useSearchParams();
  const [previewData, setPreviewData] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [highlightBlockId, setHighlightBlockId] = useState<string | null>(null);
  const [paletteCss, setPaletteCss] = useState<string>('');

  // Écouter les messages du parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Sécurité : vérifier l'origine si nécessaire
      // if (event.origin !== window.location.origin) return;

      const { type, payload } = event.data;

      switch (type) {
        case 'UPDATE_PREVIEW':
          setPreviewData(payload.previewData);
          setBlocks(payload.blocks || []);
          setPaletteCss(payload.paletteCss || '');
          // Mettre à jour le highlight si fourni
          if (payload.highlightBlockId) {
            setHighlightBlockId(payload.highlightBlockId);
          }
          break;
        
        case 'HIGHLIGHT_BLOCK':
          setHighlightBlockId(payload.blockId);
          // Auto-remove highlight after animation
          setTimeout(() => setHighlightBlockId(null), 900);
          break;
        
        case 'SCROLL_TO_BLOCK':
          const blockId = payload.blockId;
          const alignToTop = payload.alignToTop || false;
          
          // Fonction de scroll avec retry limité (max 2 tentatives)
          const performScroll = (attempt: number = 0) => {
            const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
            
            if (!element) {
              // Retry si l'élément n'est pas trouvé (max 2 tentatives)
              if (attempt < 2) {
                requestAnimationFrame(() => {
                  setTimeout(() => performScroll(attempt + 1), 100);
                });
              } else {
                console.warn('[Iframe] Bloc non trouvé après 2 tentatives:', blockId);
              }
              return;
            }
            
            // Récupérer le scroll-margin-top
            const scrollMarginTop = parseInt(window.getComputedStyle(element).scrollMarginTop) || 96;
            
            // Calcul d'offset explicite avec getBoundingClientRect + pageYOffset
            const elementRect = element.getBoundingClientRect();
            const viewportTop = window.pageYOffset || document.documentElement.scrollTop;
            const elementTop = elementRect.top + viewportTop;
            
            let target: number;
            
            if (alignToTop) {
              // Mode aligné en haut : élément en haut avec scroll-margin-top
              target = elementTop - scrollMarginTop;
            } else {
              // Mode centré : centrer l'élément dans le viewport, en tenant compte du scroll-margin-top
              const elementHeight = elementRect.height;
              const viewportHeight = window.innerHeight;
              const elementCenter = elementTop + (elementHeight / 2);
              const viewportCenter = viewportTop + (viewportHeight / 2);
              
              // Calculer la position pour centrer, en soustrayant le scroll-margin-top
              target = elementCenter - (viewportHeight / 2) - scrollMarginTop;
            }
            
            // Clamper le target dans les limites du scroll
            const scrollHeight = document.documentElement.scrollHeight;
            const innerHeight = window.innerHeight;
            target = Math.max(0, Math.min(target, scrollHeight - innerHeight));
            
            // Un seul scroll smooth avec support du fallback
            try {
              window.scrollTo({ 
                top: target, 
                behavior: 'smooth' 
              });
            } catch (e) {
              // Fallback si smooth n'est pas supporté
              window.scrollTo(0, target);
            }
            
            // Highlight visuel (immédiat, pas besoin d'attendre la fin du scroll)
            element.classList.add('ring', 'ring-blue-200');
            setTimeout(() => {
              element.classList.remove('ring', 'ring-blue-200');
            }, 900);
            
            // Vérification optionnelle après 150-200ms pour corriger une seule fois si nécessaire
            setTimeout(() => {
              // Redéfinir les variables dans le scope du setTimeout
              const currentViewportHeight = window.innerHeight;
              const currentScrollHeight = document.documentElement.scrollHeight;
              const currentInnerHeight = window.innerHeight;
              
              const rect = element.getBoundingClientRect();
              const isVisible = rect.top >= 0 && rect.bottom <= currentViewportHeight;
              
              // Si le bloc n'est pas visible, faire une correction unique
              if (!isVisible) {
                const currentViewportTop = window.pageYOffset || document.documentElement.scrollTop;
                const currentElementTop = rect.top + currentViewportTop;
                
                let correctionTarget: number;
                if (alignToTop) {
                  correctionTarget = currentElementTop - scrollMarginTop;
                } else {
                  const elementHeight = rect.height;
                  const elementCenter = currentElementTop + (elementHeight / 2);
                  correctionTarget = elementCenter - (currentViewportHeight / 2) - scrollMarginTop;
                }
                
                correctionTarget = Math.max(0, Math.min(correctionTarget, currentScrollHeight - currentInnerHeight));
                
                // Une seule correction avec animation
                try {
                  window.scrollTo({ 
                    top: correctionTarget, 
                    behavior: 'smooth' 
                  });
                } catch (e) {
                  // Fallback si smooth n'est pas supporté
                  window.scrollTo(0, correctionTarget);
                }
              }
            }, 200);
          };
          
          // Démarrer le scroll après requestAnimationFrame
          requestAnimationFrame(() => {
            performScroll(0);
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Demander les données initiales au parent
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Charger les données initiales depuis les query params (fallback)
  useEffect(() => {
    const pageKey = searchParams.get('page') || 'studio';
    
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/admin/content', { cache: 'no-store' });
        if (!res.ok) return;
        
        const data = await res.json();
        let pageData = null;
        
        if (['home', 'contact', 'studio', 'work', 'blog'].includes(pageKey)) {
          pageData = (data as any)[pageKey];
        } else if (data.pages?.pages) {
          pageData = data.pages.pages.find((p: any) => 
            p.slug === pageKey || p.id === pageKey
          );
        }

        if (pageData) {
          const templateKey = (data as any)._template || 'soliva';
          const pageBlocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
          const pageWithMeta = { 
            ...pageData, 
            _template: templateKey, 
            blocks: pageBlocks, 
            metadata: data.metadata 
          };
          
          setPreviewData(pageWithMeta);
          setBlocks(pageBlocks);
        }
      } catch (error) {
        console.error('Erreur chargement initial:', error);
      }
    };

    loadInitialData();
  }, [searchParams]);

  // Gérer les clics sur les blocs pour sélection
  useEffect(() => {
    const handleBlockClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Chercher l'élément parent avec data-block-id
      let blockElement = target.closest('[data-block-id]') as HTMLElement;
      
      if (blockElement) {
        const blockId = blockElement.getAttribute('data-block-id');
        if (blockId) {
          // Envoyer le message au parent pour sélectionner le bloc
          window.parent.postMessage({
            type: 'BLOCK_CLICKED',
            payload: { blockId }
          }, '*');
          
          // Highlight visuel local
          setHighlightBlockId(blockId);
          setTimeout(() => setHighlightBlockId(null), 900);
        }
      }
    };

    document.addEventListener('click', handleBlockClick);
    return () => document.removeEventListener('click', handleBlockClick);
  }, []);

  // Mettre à jour le highlight quand on reçoit un message HIGHLIGHT_BLOCK
  useEffect(() => {
    if (highlightBlockId) {
      // Le highlight est déjà géré dans le switch case
    }
  }, [highlightBlockId]);

  const templateKey = previewData?._template || 'soliva';
  const visibleBlocks = blocks.filter(b => !b.hidden);

  // Désactiver ScrollTrigger dans l'iframe pour éviter les saccades
  useEffect(() => {
    // Désactiver ScrollTrigger par défaut dans l'iframe
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.config({ autoRefreshEvents: 'none' });
    }
    
    return () => {
      // Réactiver si nécessaire à la destruction
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
      }
    };
  }, []);

  // Un seul refresh ScrollTrigger après le rendu des blocs
  useEffect(() => {
    if (visibleBlocks.length === 0 || !previewData) return;
    
    // Un seul refresh après un délai pour laisser le DOM se stabiliser
    const timeoutId = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
        ScrollTrigger.refresh();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [visibleBlocks.length, previewData]);

  return (
    <TemplateProvider value={{ key: templateKey }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { ${paletteCss} }
        html {
          scroll-behavior: smooth;
        }
        html, body {
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
        body {
          margin: 0;
          padding: 0;
        }
      ` }} />
      <div className="min-h-screen bg-white">
        {visibleBlocks.length > 0 && previewData ? (
          <div className={`${templateKey === 'pearl' ? '' : 'site'}`}>
            <BlockRenderer
              blocks={visibleBlocks as any}
              content={previewData}
              withDebugIds
              highlightBlockId={highlightBlockId || undefined}
              disableScrollAnimations={true}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-gray-500">
              <p>Chargement de la preview...</p>
            </div>
          </div>
        )}
      </div>
    </TemplateProvider>
  );
}

