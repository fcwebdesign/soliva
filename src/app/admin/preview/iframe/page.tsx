"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import { TemplateProvider } from '@/templates/context';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { resolvePalette } from '@/utils/palette';

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
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Iframe] message reçu', { type, payload });
      }

      switch (type) {
        case 'UPDATE_PREVIEW':
          setPreviewData(payload.previewData);
          // Reset previewIndex à 0 pour les scroll-slider afin d'ouvrir sur le premier slide
          setBlocks((prev) =>
            (payload.blocks || []).map((b: any) => {
              if (b.type !== 'scroll-slider') return b;

              const prevBlock = prev.find((p) => p.id === b.id);
              const prevVersion = prevBlock?.previewVersion || prevBlock?.data?.previewVersion || 0;

              const baseData = b.data || {};
              const incomingVersion = b.previewVersion || baseData.previewVersion || 0;
              const slidesFromBlock = baseData.slides ?? b.slides;
              const showIndicators =
                typeof baseData.showIndicators === 'boolean'
                  ? baseData.showIndicators
                  : typeof b.showIndicators === 'boolean'
                  ? b.showIndicators
                  : true;
              const showProgressBar =
                typeof baseData.showProgressBar === 'boolean'
                  ? baseData.showProgressBar
                  : typeof b.showProgressBar === 'boolean'
                  ? b.showProgressBar
                  : true;
              const showText =
                typeof baseData.showText === 'boolean'
                  ? baseData.showText
                  : typeof b.showText === 'boolean'
                  ? b.showText
                  : true;

              const shouldKeepPrev = prevBlock && prevVersion > incomingVersion;
              const incomingPreviewIndex =
                typeof b.previewIndex === 'number'
                  ? b.previewIndex
                  : typeof baseData.previewIndex === 'number'
                  ? baseData.previewIndex
                  : 0;
              const nextPreviewIndex = shouldKeepPrev
                ? prevBlock?.previewIndex ?? prevBlock?.data?.previewIndex ?? incomingPreviewIndex
                : incomingPreviewIndex;

              const nextVersion = Math.max(incomingVersion, prevVersion);

              if (process.env.NODE_ENV !== 'production') {
                console.log('[Iframe][UPDATE_PREVIEW][scroll-slider]', {
                  blockId: b.id,
                  slides: slidesFromBlock?.length || 0,
                  incomingPreviewIndex,
                  prevPreviewIndex: prevBlock?.previewIndex ?? prevBlock?.data?.previewIndex,
                  chosenPreviewIndex: nextPreviewIndex,
                  incomingVersion,
                  prevVersion,
                  chosenVersion: nextVersion,
                  keptPrev: shouldKeepPrev,
                });
              }

              return {
                ...b,
                // Conserver aussi les slides à la racine pour compat
                slides: slidesFromBlock,
                previewIndex: nextPreviewIndex,
                previewVersion: nextVersion,
                showIndicators,
                showProgressBar,
                showText,
                data: {
                  ...baseData,
                  slides: slidesFromBlock,
                  previewIndex: nextPreviewIndex,
                  previewVersion: nextVersion,
                  showIndicators,
                  showProgressBar,
                  showText,
                },
              };
            })
          );
          setPaletteCss(payload.paletteCss || '');
          // Mettre à jour le highlight si fourni
          if (payload.highlightBlockId) {
            setHighlightBlockId(payload.highlightBlockId);
          }
          break;
        
        case 'SCROLL_SLIDER_PREVIEW':
          // Mettre à jour le previewIndex du bloc ciblé, appliquer les slides si fournis, puis refresh ScrollTrigger
          setBlocks((prev) =>
            prev.map((b) => {
              const sameBlock =
                b.id === payload.blockId ||
                (b as any)?.data?.id === payload.blockId;
              if (!sameBlock) return b;

              const nextSlides = payload.slides || b.data?.slides || b.slides;

              const flagIndicators =
                typeof (b.data as any)?.showIndicators === 'boolean'
                  ? (b.data as any).showIndicators
                  : typeof b.showIndicators === 'boolean'
                  ? b.showIndicators
                  : true;
              const flagProgress =
                typeof (b.data as any)?.showProgressBar === 'boolean'
                  ? (b.data as any).showProgressBar
                  : typeof b.showProgressBar === 'boolean'
                  ? b.showProgressBar
                  : true;
              const flagText =
                typeof (b.data as any)?.showText === 'boolean'
                  ? (b.data as any).showText
                  : typeof b.showText === 'boolean'
                  ? b.showText
                  : true;

              const nextVersion = payload.previewVersion || Date.now();

              return {
                ...b,
                previewIndex: payload.previewIndex,
                previewVersion: nextVersion,
                data: {
                  ...(b.data || {}),
                  slides: nextSlides,
                  previewIndex: payload.previewIndex,
                  previewVersion: nextVersion,
                  showIndicators: flagIndicators,
                  showProgressBar: flagProgress,
                  showText: flagText,
                },
                // Garder aussi les slides à la racine pour compat
                slides: nextSlides,
                showIndicators: flagIndicators,
                showProgressBar: flagProgress,
                showText: flagText,
              };
            })
          );
          if (process.env.NODE_ENV !== 'production') {
            console.log('[Iframe][SCROLL_SLIDER_PREVIEW]', {
              blockId: payload.blockId,
              previewIndex: payload.previewIndex,
              previewVersion: payload.previewVersion,
              hasSlides: !!payload.slides,
              slidesLength: payload.slides?.length,
            });
          }
          if (process.env.NODE_ENV !== 'production') {
            console.log('[Iframe] SCROLL_SLIDER_PREVIEW appliqué', { blockId: payload.blockId, previewIndex: payload.previewIndex });
          }
          requestAnimationFrame(() => {
            try {
              if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
                ScrollTrigger.refresh();
              }
            } catch (_) {
              // ignore
            }
          });
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
    const projectKey = searchParams.get('project');
    
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/admin/content', { cache: 'no-store' });
        if (!res.ok) return;
        
        const data = await res.json();
        let pageData = null;
        
        // Support projet ciblé
        if (projectKey) {
          const adminProjects = data?.work?.adminProjects || [];
          const simpleProjects = (!adminProjects.length && data?.work?.projects) ? data.work.projects : [];
          pageData =
            adminProjects.find((p: any) => p.id === projectKey || p.slug === projectKey) ||
            simpleProjects.find((p: any, idx: number) => p.id === projectKey || p.slug === projectKey || `project-${idx}` === projectKey);
        } else if (['home', 'contact', 'studio', 'work', 'blog'].includes(pageKey)) {
          pageData = (data as any)[pageKey];
        } else if (data.pages?.pages) {
          pageData = data.pages.pages.find((p: any) => 
            p.slug === pageKey || p.id === pageKey
          );
        }

        if (pageData) {
          const templateKey = (data as any)._template || 'soliva';
          const pageBlocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
          const withFallbackBlocks = (() => {
            if (projectKey && pageBlocks.length === 0) {
              const title = pageData.title || pageData.slug || 'Projet';
              const desc = (pageData as any).description || (pageData as any).excerpt || pageData.content || '';
              return [{
                id: 'block-1',
                type: 'page-intro',
                data: {
                  title,
                  description: desc,
                  layout: 'default',
                  descriptionSize: 'small',
                  parallax: false,
                  parallaxSpeed: 0.25,
                },
                theme: 'auto'
              }];
            }
            return pageBlocks;
          })();
          const pageWithMeta = { 
            ...pageData, 
            _template: templateKey, 
            blocks: withFallbackBlocks, 
            metadata: data.metadata 
          };
          
          setPreviewData(pageWithMeta);
          setBlocks(withFallbackBlocks);
          
          // Détecter le thème immédiatement après le chargement
          try {
            const palette = resolvePaletteFromContent(pageWithMeta);
            const resolved = resolvePalette(palette);
            const theme = resolved.isDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      } catch (error) {
        console.error('Erreur chargement initial:', error);
      }
    };

    loadInitialData();
  }, [searchParams]);

  // Gérer les clics sur les blocs pour sélection et scroll
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
          
          // Scroller vers le haut du bloc
          requestAnimationFrame(() => {
            setTimeout(() => {
              const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
              if (element) {
                const scrollMarginTop = parseInt(window.getComputedStyle(element).scrollMarginTop) || 96;
                const elementRect = element.getBoundingClientRect();
                const viewportTop = window.pageYOffset || document.documentElement.scrollTop;
                const elementTop = elementRect.top + viewportTop;
                const target = Math.max(0, elementTop - scrollMarginTop);
                
                try {
                  window.scrollTo({ 
                    top: target, 
                    behavior: 'smooth' 
                  });
                } catch (e) {
                  window.scrollTo(0, target);
                }
              }
            }, 50);
          });
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

  // Détecter si la palette est dark et appliquer data-theme sur html
  useEffect(() => {
    const detectTheme = () => {
      try {
        // Essayer d'abord avec previewData
        if (previewData?.metadata) {
          const palette = resolvePaletteFromContent(previewData);
          const resolved = resolvePalette(palette);
          const theme = resolved.isDark ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Iframe] Thème détecté depuis previewData:', theme, { isDark: resolved.isDark, background: palette.background });
          }
          return;
        }
        
        // Sinon, utiliser la variable CSS --background du DOM
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
        if (bgColor) {
          // Créer une palette minimale pour calculer isDark
          const palette = {
            background: bgColor,
            primary: '#000000',
            secondary: '#000000',
            accent: '#000000',
            text: '#000000',
            textSecondary: '#000000',
            border: '#000000'
          };
          const resolved = resolvePalette(palette);
          const theme = resolved.isDark ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Iframe] Thème détecté depuis CSS:', theme, { isDark: resolved.isDark, background: bgColor });
          }
        }
      } catch (e) {
        console.warn('[Iframe] Erreur détection thème:', e);
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };
    
    // Détecter immédiatement et après un court délai pour laisser le CSS se charger
    detectTheme();
    const timeoutId = setTimeout(detectTheme, 100);
    
    return () => clearTimeout(timeoutId);
  }, [previewData, paletteCss]);

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
      <style id="iframe-preview-styles" dangerouslySetInnerHTML={{ __html: `
        :root { ${paletteCss} }
        html {
          scroll-behavior: smooth;
        }
        html, body {
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          background-color: var(--background, #ffffff);
        }
        body {
          margin: 0;
          padding: 0;
        }
        /* Styles pour les logos clients - version simplifiée */
        .logo-item {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
          border-radius: 0.5rem;
          background-color: var(--card, #ffffff);
        }
        .logo-item img {
          transition: all 0.3s ease;
          max-width: 65%;
          height: auto;
        }
        /* Par défaut : logos en noir (pour fond clair) */
        .logos-section .logo-item img {
          filter: grayscale(100%) brightness(0) contrast(1) !important;
        }
        /* Si le fond est sombre, logos inversés en blanc */
        .logos-section[data-theme="dark"] .logo-item img,
        .logos-section[data-block-theme="dark"] .logo-item img,
        [data-theme="dark"] .logos-section .logo-item img,
        [data-block-theme="dark"] .logos-section .logo-item img,
        html[data-theme="dark"] .logos-section .logo-item img,
        .dark .logos-section .logo-item img,
        .site [data-theme="dark"] .logos-section .logo-item img {
          filter: grayscale(100%) brightness(0) contrast(0) invert(1) !important;
        }
      ` }} />
      <div className="min-h-screen">
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
