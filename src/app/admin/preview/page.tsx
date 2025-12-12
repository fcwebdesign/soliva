"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { TemplateProvider } from '@/templates/context';
import SommairePanel from '@/components/admin/SommairePanel';
import { renderAutoBlockEditor } from '../components/AutoBlockIntegration';
import { createAutoBlockInstance } from '@/blocks/auto-declared/registry';
import BlockSelectorSheet from '@/components/admin/BlockSelectorSheet';
import { toast } from 'sonner';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { resolvePalette } from '@/utils/palette';
import { varsFromPalette } from '@/utils/palette-css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const runtime = "nodejs";

// Page dédiée type Shopify : éditeur à gauche, preview à droite
export default function AdminPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Par défaut on cible studio (contient des blocs) pour éviter une preview vide
  const pageKey = searchParams.get('page') || 'studio';
  const projectParam = searchParams.get('project');
  const [adminContent, setAdminContent] = useState<any>(null);

  // Refs pour scroller vers un bloc dans l'éditeur et la preview
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // État local pour la preview
  const [previewData, setPreviewData] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [initialPageData, setInitialPageData] = useState<any>(null);
  const [projectId, setProjectId] = useState<string | null>(projectParam);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageOptions, setPageOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [projectOptions, setProjectOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoverBlockId, setHoverBlockId] = useState<string | null>(null);
  const [hiddenBlockIds, setHiddenBlockIds] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<boolean>(false);
  const [inspectorBlockId, setInspectorBlockId] = useState<string | null>(null);
  const [inspectorColumn, setInspectorColumn] = useState<
    | 'leftColumn'
    | 'rightColumn'
    | 'middleColumn'
    | 'column1'
    | 'column2'
    | 'column3'
    | 'column4'
    | null
  >(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isBlockSheetOpen, setIsBlockSheetOpen] = useState(false);
  const templateKey = previewData?._template || initialPageData?._template || adminContent?._template || 'soliva';

  // Synchroniser l'état projet avec l'URL
  useEffect(() => {
    setProjectId(projectParam);
  }, [projectParam]);

  // Assurer les blocs hero en première position (et unique)
  const normalizeHeroFloating = (list: any[]) => {
    const heroTypes = ['hero-floating-gallery', 'mouse-image-gallery', 'hero-simple'];
    const heroes = list.filter((b) => heroTypes.includes(b.type));
    if (heroes.length === 0) return { blocks: list, moved: false };

    const primary = heroes[0];
    const others = list.filter((b) => b !== primary && !heroTypes.includes(b.type));
    const normalized = [primary, ...others];
    const moved = normalized[0] !== list[0] || heroes.length > 1 || normalized.length !== list.length;
    return { blocks: normalized, moved };
  };

  // Réinitialiser la sélection/inspecteur quand on change de page
  useEffect(() => {
    setSelectedBlockId(null);
    setInspectorMode(false);
    setInspectorBlockId(null);
    setInspectorColumn(null);
    setHoverBlockId(null);
  }, [pageKey]);

  // Écouter l'événement pour ouvrir le Sheet de sélection de blocs
  useEffect(() => {
    const handleOpenSheet = () => {
      console.log('📥 Événement reçu: open-inspector-add-block');
      setIsBlockSheetOpen(true);
      console.log('✅ Sheet de sélection de blocs ouvert');
    };
    
    console.log('👂 Écouteur d\'événement installé');
    window.addEventListener('open-inspector-add-block', handleOpenSheet);
    return () => {
      window.removeEventListener('open-inspector-add-block', handleOpenSheet);
    };
  }, []);

  // Palette dynamique uniquement pour la preview (isole les couleurs du template actif)
  const paletteCss = useMemo(() => {
    // Utiliser les métadonnées complètes si disponibles pour récupérer la palette
    const paletteSource = (() => {
      if (previewData && (previewData as any).metadata) return previewData;
      if (adminContent && (adminContent as any).metadata) {
        // Fusionner la page preview avec les métadonnées complètes pour les variables de palette
        return { ...(previewData || {}), ...(initialPageData || {}), metadata: adminContent.metadata };
      }
      if (initialPageData && (initialPageData as any).metadata) return initialPageData;
      return adminContent || {};
    })();

    const palette = resolvePaletteFromContent(paletteSource || {});
    const resolved = resolvePalette(palette);
    const vars = varsFromPalette(resolved);
    return Object.entries(vars)
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ');
  }, [previewData, initialPageData, adminContent]);

  // Appliquer la visibilité sur les blocs racine et leurs colonnes
  const applyVisibility = (inputBlocks: any[], hidden: Set<string>) =>
    inputBlocks
      .filter((b) => !hidden.has(String(b.id)))
      .map((b) => {
        const data = b.data || b;

        // Gérer les layouts multi-colonnes pour masquer aussi les enfants cachés
        const columnKeys =
          b.type === 'two-columns'
            ? (['leftColumn', 'rightColumn'] as const)
            : b.type === 'three-columns'
            ? (['leftColumn', 'middleColumn', 'rightColumn'] as const)
            : b.type === 'four-columns'
            ? (['column1', 'column2', 'column3', 'column4'] as const)
            : null;

        if (!columnKeys) return b;

        const filteredData = { ...data };
        columnKeys.forEach((key) => {
          const items = data[key] || [];
          filteredData[key] = items.filter((item: any) => !hidden.has(String(item?.id)));
        });

        return {
          ...b,
          data: filteredData,
        };
      });

  const visibleBlocks = applyVisibility(blocks, hiddenBlockIds);

  // Écouter les messages de l'iframe et envoyer les données
  useEffect(() => {
    const sendDataToIframe = () => {
      if (previewIframeRef.current?.contentWindow && previewData && blocks.length > 0) {
        previewIframeRef.current.contentWindow.postMessage({
          type: 'UPDATE_PREVIEW',
          payload: {
            previewData,
            blocks: visibleBlocks, // Envoyer les blocs visibles (déjà filtrés)
            paletteCss,
            highlightBlockId: selectedBlockId || hoverBlockId || null,
            hiddenBlockIds: Array.from(hiddenBlockIds) // Envoyer les IDs des blocs masqués
          }
        }, '*');
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'IFRAME_READY') {
        // L'iframe est prête, envoyer les données initiales
        sendDataToIframe();
      } else if (event.data.type === 'BLOCK_CLICKED') {
        // Un bloc a été cliqué dans l'iframe, sélectionner dans le parent
        const blockId = event.data.payload.blockId;
        setSelectedBlockId(blockId);
        setInspectorMode(true);
        setInspectorBlockId(blockId);
        
        // Envoyer le highlight à l'iframe
        if (previewIframeRef.current?.contentWindow) {
          previewIframeRef.current.contentWindow.postMessage({
            type: 'HIGHLIGHT_BLOCK',
            payload: { blockId }
          }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Envoyer les données quand elles changent
    sendDataToIframe();

    return () => window.removeEventListener('message', handleMessage);
  }, [previewData, visibleBlocks, paletteCss, selectedBlockId, hoverBlockId, hiddenBlockIds]);

  // Configurer ScrollTrigger pour utiliser le panneau de preview comme scroller
  useEffect(() => {
    const scroller = previewPaneRef.current;
    if (!scroller) return;
    try {
      const previousDefaults = (ScrollTrigger as any).defaults ? (ScrollTrigger as any).defaults() : {};
      (ScrollTrigger as any).defaults({ scroller });
      ScrollTrigger.refresh();
      return () => {
        (ScrollTrigger as any).defaults(previousDefaults || {});
        ScrollTrigger.refresh();
      };
    } catch (e) {
      // Silent fallback
      return;
    }
  }, [previewPaneRef.current, blocks.length]);

  // Callback pour mettre à jour la preview
  const handleUpdate = (data: any) => {
    const merged = adminContent?.metadata ? { ...data, metadata: adminContent.metadata } : data;
    setPreviewData(merged);
    const incomingBlocks = Array.isArray((data as any)?.blocks) ? (data as any).blocks : [];
    const normalized = normalizeHeroFloating(incomingBlocks);
    if (incomingBlocks.length > 0) {
      setBlocks(normalized.blocks);
      if (!selectedBlockId && normalized.blocks.length > 0) {
        setSelectedBlockId(normalized.blocks[0].id);
      }
      // Propager les blocs normalisés dans la preview pour rester synchro
      setPreviewData((prev) => prev ? { ...prev, blocks: normalized.blocks } : prev);
    }
  };

  // Fonction pour ajouter un nouveau bloc
  const handleAddBlock = (blockType: string) => {
    try {
      const heroTypes = ['hero-floating-gallery', 'mouse-image-gallery', 'hero-simple'];
      if (heroTypes.includes(blockType) && blocks.some((b) => heroTypes.includes(b.type))) {
        toast.info('Bloc Hero déjà présent', {
          description: 'Un bloc Hero est déjà présent en première position.'
        });
        setIsBlockSheetOpen(false);
        return;
      }

      const newBlock = createAutoBlockInstance(blockType);
      
      // Vérifier si on est dans une colonne
      // 1. Via inspectorColumn (déjà mis à jour quand on sélectionne une colonne)
      // 2. Via selectedBlockId/inspectorBlockId au format blockId:leftColumn ou blockId:rightColumn
      let targetColumn: any = inspectorColumn;
      let parentLayoutBlockId: string | null = null;
      
      if (!targetColumn) {
        const currentSelection = selectedBlockId || inspectorBlockId;
        const columnMatch = currentSelection?.match(
          /^(.+):(leftColumn|rightColumn|middleColumn|column1|column2|column3|column4)$/
        );
        if (columnMatch) {
          [, parentLayoutBlockId, targetColumn] = columnMatch;
        }
      } else {
        // Si inspectorColumn est défini, utiliser inspectorBlockId comme blockId
        parentLayoutBlockId = inspectorBlockId || null;
      }
      
      if (targetColumn && parentLayoutBlockId) {
        // Ajouter le bloc dans une colonne d'un layout multi-colonnes
        const column = targetColumn;
        const layoutBlockIndex = blocks.findIndex(b => b.id === parentLayoutBlockId);
        if (layoutBlockIndex === -1) {
          toast.error('Erreur', { description: 'Bloc multi-colonnes introuvable' });
          return;
        }
        
        const layoutBlock = blocks[layoutBlockIndex];
        const blockData = layoutBlock.data || layoutBlock;
        const columnBlocks = blockData[column] || [];
        
        // Ajouter le nouveau bloc à la colonne
        const updatedColumnBlocks = [...columnBlocks, newBlock];
        const updatedBlockData = {
          ...blockData,
          [column]: updatedColumnBlocks
        };
        
        // Mettre à jour le bloc two-columns
        const updatedBlocks = [...blocks];
        updatedBlocks[layoutBlockIndex] = {
          ...layoutBlock,
          data: updatedBlockData
        };
        
        const normalizedNewBlocks = normalizeBlocks(updatedBlocks);
        setBlocks(normalizedNewBlocks);
        setPreviewData((prev) => prev ? { ...prev, blocks: normalizedNewBlocks } : prev);
        
        // Sélectionner et ouvrir l'inspecteur pour le nouveau bloc dans la colonne
        const finalBlockId = newBlock.id;
        setSelectedBlockId(finalBlockId);
        setInspectorMode(true);
        setInspectorBlockId(finalBlockId);
        setInspectorColumn(column);
        
        toast.success('Bloc ajouté', {
          description: `Le bloc "${blockType}" a été ajouté à la colonne ${column}`
        });
      } else {
        // Ajouter le bloc à la racine (comportement normal)
        const newBlocks = [...blocks, newBlock];
        const normalizedHero = normalizeHeroFloating(newBlocks);
        const normalizedNewBlocks = normalizeBlocks(normalizedHero.blocks);
        const finalBlockId = newBlock.id;
        
        setBlocks(normalizedNewBlocks);
        setPreviewData((prev) => prev ? { ...prev, blocks: normalizedNewBlocks } : prev);
        
        // Sélectionner et ouvrir l'inspecteur pour le nouveau bloc (utiliser l'ID normalisé)
        setSelectedBlockId(finalBlockId);
        setInspectorMode(true);
        setInspectorBlockId(finalBlockId);
        setInspectorColumn(null);
        
        // Scroller vers le nouveau bloc après un court délai
        setTimeout(() => {
          scrollToBlock(finalBlockId);
        }, 100);
        
        toast.success('Bloc ajouté', {
          description: `Le bloc "${blockType}" a été ajouté à la page`
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création du bloc:', error);
      toast.error('Erreur', {
        description: 'Impossible de créer le bloc. Veuillez réessayer.'
      });
    }
  };

  // Charger la page ciblée via l’API admin pour pré-remplir l’éditeur
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/content', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setAdminContent(data);

        // Options projets (adminProjects sinon fallback projects)
        const adminProjects = data?.work?.adminProjects || [];
        const simpleProjects = (!adminProjects.length && data?.work?.projects) ? data.work.projects : [];
        const projectSource = adminProjects.length ? adminProjects : simpleProjects;
        // S'assurer que tous les projets ont un id (créer si manquant)
        const projectsWithIds = projectSource.map((p: any, idx: number) => {
          if (!p.id) {
            // Créer un id basé sur le slug ou un index
            p.id = p.slug || `project-${idx}`;
          }
          return p;
        });
        const projectOpts: Array<{ value: string; label: string }> = projectsWithIds.map((p: any) => ({
          value: p.id, // TOUJOURS utiliser l'id pour la synchronisation
          label: p.title || p.slug || p.id || 'Projet sans titre'
        }));
        setProjectOptions(projectOpts);

        // Trouver la page demandée (ou un projet si projectId est défini)
        let pageData = null;
        let selectedProject = null;

        if (projectId) {
          // Chercher d'abord par id (priorité), puis par slug (fallback)
          selectedProject = adminProjects.find((p: any) => {
            // S'assurer que le projet a un id
            if (!p.id) p.id = p.slug || `project-${adminProjects.indexOf(p)}`;
            return p.id === projectId;
          });
          if (!selectedProject && simpleProjects.length) {
            selectedProject = simpleProjects.find((p: any, idx: number) => {
              // S'assurer que le projet a un id
              if (!p.id) p.id = p.slug || `project-${idx}`;
              return p.id === projectId;
            });
          }
          // Fallback : chercher par slug si pas trouvé par id
          if (!selectedProject) {
            selectedProject = adminProjects.find((p: any) => p.slug === projectId);
            if (!selectedProject && simpleProjects.length) {
              selectedProject = simpleProjects.find((p: any) => p.slug === projectId);
            }
          }
          if (!selectedProject) {
            throw new Error(`Projet "${projectId}" introuvable`);
          }
          // S'assurer que le projet sélectionné a un id
          if (!selectedProject.id) {
            selectedProject.id = selectedProject.slug || projectId;
          }
          pageData = selectedProject;
        } else {
          if (['home', 'contact', 'studio', 'work', 'blog'].includes(pageKey)) {
            pageData = (data as any)[pageKey];
          } else if (data.pages?.pages) {
            // Chercher dans les pages custom par slug, id ou titre
            pageData = data.pages.pages.find((p: any) => 
              p.slug === pageKey || 
              p.id === pageKey || 
              p.title?.toLowerCase() === pageKey.toLowerCase()
            );
          }
        }

        if (!pageData) {
          console.warn('[Preview] Pages disponibles:', data.pages?.pages?.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title })));
          throw new Error(projectId ? `Projet "${projectId}" introuvable` : `Page "${pageKey}" introuvable`);
        }

        const nextTemplate = (data as any)._template || 'soliva';
        const pageBlocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
        const withFallbackBlocks = (() => {
          if (projectId && pageBlocks.length === 0) {
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
        
        const normalizedBlocks = normalizeBlocks(withFallbackBlocks);
        
        // Restaurer l'état hiddenBlockIds à partir de la propriété hidden des blocs
        const restoredHiddenIds = new Set<string>();
        normalizedBlocks.forEach((block: any) => {
          if (block.hidden) {
            restoredHiddenIds.add(block.id);
          }
          // Pour les blocs two-columns, vérifier aussi les sous-blocs
          if (block.type === 'two-columns') {
            const data = block.data || block;
            ['leftColumn', 'rightColumn'].forEach((colKey: 'leftColumn' | 'rightColumn') => {
              const items = data[colKey] || [];
              items.forEach((item: any) => {
                if (item?.hidden) {
                  restoredHiddenIds.add(item.id);
                }
              });
            });
          }
        });
        setHiddenBlockIds(restoredHiddenIds);
        
        const pageWithMeta = { ...pageData, _template: nextTemplate, blocks: normalizedBlocks, metadata: data.metadata };
        setInitialPageData(pageWithMeta);
        setPreviewData(pageWithMeta);
        setBlocks(normalizedBlocks);
        
        // Envoyer les données à l'iframe si elle est prête
        if (previewIframeRef.current?.contentWindow) {
          const visibleBlocksAtInit = applyVisibility(normalizedBlocks, restoredHiddenIds);
          previewIframeRef.current.contentWindow.postMessage({
            type: 'UPDATE_PREVIEW',
            payload: {
              previewData: pageWithMeta,
              blocks: visibleBlocksAtInit,
              paletteCss: paletteCss,
              hiddenBlockIds: Array.from(restoredHiddenIds)
            }
          }, '*');
        }
        console.log('[Preview] Page chargée', pageKey, { 
          template: nextTemplate, 
          blocks: pageBlocks.length,
          pageData: { id: pageData.id, slug: pageData.slug, title: pageData.title }
        });

        // Options de pages pour le sélecteur
        const opts: Array<{ value: string; label: string }> = [
          { value: 'home', label: 'Home' },
          { value: 'studio', label: 'Studio' },
          { value: 'contact', label: 'Contact' },
          { value: 'work', label: 'Work' },
          { value: 'blog', label: 'Blog' },
        ];
        if (data?.pages?.pages && Array.isArray(data.pages.pages)) {
          data.pages.pages.forEach((p: any) => {
            if (p?.id || p?.slug) {
              // Utiliser le slug en priorité, sinon l'id
              const value = p.slug || p.id;
              const label = p.title || p.slug || p.id;
              opts.push({ value, label });
            }
          });
        }
        console.log('[Preview] Pages disponibles dans le sélecteur:', opts);
        setPageOptions(opts);
      } catch (e: any) {
        setError(e.message || 'Erreur chargement');
        console.error('[Preview] Erreur chargement', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageKey, projectId]);

  const handlePageChange = (nextPage: string) => {
    // Fermer l'inspecteur et nettoyer la sélection avant navigation
    setInspectorMode(false);
    setInspectorBlockId(null);
    setInspectorColumn(null);
    setSelectedBlockId(null);
    setHoverBlockId(null);
    setProjectId(null);
    router.push(`/admin/preview?page=${nextPage}`);
  };

  const handleProjectChange = (nextProject: string) => {
    // Fermer l'inspecteur et nettoyer la sélection avant navigation
    setInspectorMode(false);
    setInspectorBlockId(null);
    setInspectorColumn(null);
    setSelectedBlockId(null);
    setHoverBlockId(null);

    if (!nextProject) {
      setProjectId(null);
      router.push(`/admin/preview?page=${pageKey}`);
    } else {
      setProjectId(nextProject);
      // URL propre : seulement le projet, sans le paramètre page
      router.push(`/admin/preview?project=${encodeURIComponent(nextProject)}`);
    }
  };

  const scrollToBlock = (blockId: string, alignToTop: boolean = false) => {
    setSelectedBlockId(blockId);

    const highlight = (container: HTMLElement | null, containerName: string) => {
      if (!container) return;
      
      // Pour previewPane, chercher dans .blocks-container qui est dans le DOM
      let searchContainer = container;
      if (containerName === 'previewPane') {
        const blocksContainer = container.querySelector('.blocks-container');
        if (blocksContainer) {
          searchContainer = blocksContainer as HTMLElement;
        }
      }
      
      const selector = `[data-block-id="${blockId}"]`;
      const el = searchContainer.querySelector<HTMLElement>(selector);
      if (!el) return;
      
      // Pour previewPane, utiliser le container parent qui a overflow-y-auto
      const scrollContainer = containerName === 'previewPane' ? container : container;
      
      if (alignToTop && containerName === 'previewPane') {
        // Pour alignToTop (clic direct), utiliser un scroll manuel direct
        const containerRect = scrollContainer.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const elementTopInContainer = elRect.top - containerRect.top + scrollContainer.scrollTop;
        const targetScrollTop = elementTopInContainer - 20; // 20px d'offset depuis le haut
        scrollContainer.scrollTo({ 
          top: Math.max(0, Math.min(targetScrollTop, scrollContainer.scrollHeight - scrollContainer.clientHeight)), 
          behavior: 'smooth' 
        });
      } else {
        // Pour le scroll centré (sommaire), utiliser scrollIntoView
        el.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'nearest',
          // @ts-ignore - scrollMode est une option expérimentale mais utile
          scrollMode: 'if-needed'
        });
        
        // Vérifier après un délai si le scroll a fonctionné et corriger si nécessaire
        setTimeout(() => {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const isVisible = elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom;
          
          // Si l'élément n'est pas visible, essayer un scroll manuel
          if (!isVisible && containerName === 'previewPane') {
            const elementTopInContainer = elRect.top - containerRect.top + scrollContainer.scrollTop;
            const elementCenter = elementTopInContainer + (elRect.height / 2);
            const viewportCenter = scrollContainer.scrollTop + (scrollContainer.clientHeight / 2);
            const scrollDelta = elementCenter - viewportCenter;
            const targetScrollTop = scrollContainer.scrollTop + scrollDelta;
            scrollContainer.scrollTo({ 
              top: Math.max(0, Math.min(targetScrollTop, scrollContainer.scrollHeight - scrollContainer.clientHeight)), 
              behavior: 'smooth' 
            });
          }
        }, 400);
      }
      el.classList.add('ring', 'ring-blue-200');
      setTimeout(() => el.classList.remove('ring', 'ring-blue-200'), 900);
    };

    // Highlight dans l'éditeur (toujours direct)
    highlight(editorPaneRef.current, 'editorPane');
    
    // Pour la preview iframe, envoyer un seul message (scroll + highlight ensemble)
    if (previewIframeRef.current?.contentWindow) {
      previewIframeRef.current.contentWindow.postMessage({
        type: 'SCROLL_TO_BLOCK',
        payload: { blockId, alignToTop }
      }, '*');
    } else {
      // Fallback : highlight direct si pas d'iframe
      highlight(previewPaneRef.current, 'previewPane');
    }
  };

  const toggleVisibility = (blockId: string) => {
    setHiddenBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      // Mettre à jour le flag hidden dans les blocs (niveau racine)
      const updatedBlocks = blocks.map((b) => b.id === blockId ? { ...b, hidden: next.has(blockId) } : b);
      setBlocks(updatedBlocks);
      setPreviewData((prev) => prev ? { ...prev, blocks: updatedBlocks } : prev);

      // Envoyer immédiatement la mise à jour à l'iframe
      if (previewIframeRef.current?.contentWindow && previewData) {
        const updatedVisibleBlocks = applyVisibility(updatedBlocks, next);
        previewIframeRef.current.contentWindow.postMessage({
          type: 'UPDATE_PREVIEW',
          payload: {
            previewData: { ...previewData, blocks: updatedBlocks },
            blocks: updatedVisibleBlocks,
            paletteCss,
            highlightBlockId: selectedBlockId || hoverBlockId || null,
            hiddenBlockIds: Array.from(next)
          }
        }, '*');
      }
      return next;
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    // Retirer le bloc de la liste
    const updatedBlocks = blocks.filter(b => b.id !== blockId);
    setBlocks(updatedBlocks);
    
    // Retirer aussi des blocs masqués si présent
    setHiddenBlockIds((prev) => {
      const next = new Set(prev);
      next.delete(blockId);
      return next;
    });
    
    // Mettre à jour previewData
    setPreviewData((prev) => prev ? { ...prev, blocks: updatedBlocks } : prev);
    
    // Envoyer la mise à jour à l'iframe
    if (previewIframeRef.current?.contentWindow && previewData) {
      const visibleBlocksAfterDelete = applyVisibility(updatedBlocks, hiddenBlockIds);
      previewIframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_PREVIEW',
        payload: {
          previewData: { ...previewData, blocks: updatedBlocks },
          blocks: visibleBlocksAfterDelete,
          paletteCss,
          highlightBlockId: null,
          hiddenBlockIds: Array.from(hiddenBlockIds)
        }
      }, '*');
    }
    
    // Si le bloc supprimé était sélectionné, fermer l'inspecteur
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setInspectorMode(false);
      setInspectorBlockId(null);
    }
    
    toast.success('Bloc supprimé');
  };

  // Gérer les clics sur les blocs dans la preview pour ouvrir l'inspecteur
  useEffect(() => {
    const handleBlockClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const blockElement = target.closest('[data-block-id]') as HTMLElement;
      if (!blockElement) return;

      const blockId = blockElement.getAttribute('data-block-id');
      if (!blockId) return;

      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
        return;
      }

      setSelectedBlockId(blockId);
      setInspectorMode(true);
      setInspectorBlockId(blockId);
      
      // Scroller pour arriver en haut du bloc en utilisant scrollToBlock
      // Utiliser requestAnimationFrame pour s'assurer que l'inspecteur est ouvert
      requestAnimationFrame(() => {
        scrollToBlock(blockId, true); // true = aligner en haut
      });
    };

    const previewContainer = previewPaneRef.current;
    if (!previewContainer) return;
    previewContainer.addEventListener('click', handleBlockClick);
    return () => {
      previewContainer.removeEventListener('click', handleBlockClick);
    };
  }, []);

  // Drag & drop outline uniquement (réorganisation locale)
  const reorderBlocks = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const current = [...blocks];
    const fromIndex = current.findIndex((b) => b.id === fromId);
    const toIndex = current.findIndex((b) => b.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const normalized = normalizeHeroFloating(current);
    setBlocks(normalized.blocks);
    setPreviewData((prev) => prev ? { ...prev, blocks: normalized.blocks } : prev);
    if (normalized.moved) {
      toast.info('Bloc Hero déplacé', {
        description: 'Le Hero Floating Gallery reste en première position.'
      });
    }
    setSelectedBlockId(fromId);
  };

  // Fonction de sauvegarde
  const handleSave = async () => {
    if (!adminContent || !previewData) {
      toast.error('Données non disponibles pour la sauvegarde');
      return;
    }

    try {
      setSaveStatus('saving');
      
      // Créer une copie du contenu admin
      const newContent = { ...adminContent };
      
      // Sauvegarder TOUS les blocs avec leur état hidden (ne pas filtrer)
      const persistedBlocks = blocks.map(block => {
        const isHidden = hiddenBlockIds.has(block.id);
        // Ajouter la propriété hidden au bloc
        if (block.type === 'two-columns') {
          // Pour les blocs two-columns, gérer aussi les sous-blocs dans les colonnes
          const data = block.data || block;
          const processColumn = (colKey: 'leftColumn' | 'rightColumn') => {
            const items = data[colKey] || [];
            return items.map((item: any) => {
              const itemIsHidden = hiddenBlockIds.has(item?.id);
              return { ...item, hidden: itemIsHidden };
            });
          };
          return {
            ...block,
            hidden: isHidden,
            data: {
              ...data,
              leftColumn: processColumn('leftColumn'),
              rightColumn: processColumn('rightColumn'),
            }
          };
        }
        return { ...block, hidden: isHidden };
      });

      // Générer le HTML à partir des blocs basiques uniquement (pour compatibilité)
      // Les blocs auto-déclarés n'ont pas besoin de HTML car ils sont rendus directement
      // Filtrer les blocs masqués pour le HTML (seulement pour l'affichage, pas pour la sauvegarde)
      const visibleBlocksForHTML = persistedBlocks.filter(block => !block.hidden);
      const htmlContent = visibleBlocksForHTML.map(block => {
        // Seulement pour les blocs basiques qui nécessitent du HTML
        switch (block.type) {
          case 'h2':
            return block.content ? `<h2>${block.content}</h2>` : '';
          case 'h3':
            return block.content ? `<h3>${block.content}</h3>` : '';
          case 'content':
            return block.content || '';
          case 'image':
            // Gérer l'ancien format (image) et le nouveau (images)
            if (block.images && Array.isArray(block.images)) {
              return block.images.map((img: any) => 
                img.src ? `<img src="${img.src}" alt="${img.alt || ''}" />` : ''
              ).filter((html: string) => html).join('\n');
            }
            return block.image?.src ? `<img src="${block.image.src}" alt="${block.image.alt || ''}" />` : '';
          case 'cta':
            return (block.ctaText || block.ctaLink) ? 
              `<div class="cta-block"><p>${block.ctaText || ''}</p><a href="${block.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
          default:
            // Pour les blocs auto-déclarés, on ne génère pas de HTML
            return '';
        }
      }).filter(html => html && typeof html === 'string' && html.trim() !== '').join('\n');
      
      // Mettre à jour la page ou le projet dans le contenu
      if (projectId) {
        const work = newContent.work || {};
        const adminProjects = work.adminProjects || [];
        const simpleProjects = (!adminProjects.length && work.projects) ? work.projects : [];

        if (adminProjects.length) {
          // Chercher par id en priorité
          let projIndex = adminProjects.findIndex((p: any) => {
            if (!p.id) p.id = p.slug || `project-${adminProjects.indexOf(p)}`;
            return p.id === projectId;
          });
          // Fallback : chercher par slug
          if (projIndex === -1) {
            projIndex = adminProjects.findIndex((p: any) => p.slug === projectId);
          }
          if (projIndex !== -1) {
            const target = adminProjects[projIndex];
            // S'assurer que le projet a un id avant sauvegarde
            if (!target.id) target.id = target.slug || projectId;
            adminProjects[projIndex] = {
              ...target,
              blocks: persistedBlocks,
              content: htmlContent || target.content
            };
            newContent.work = { ...work, adminProjects };
          } else {
            throw new Error(`Projet "${projectId}" introuvable pour la sauvegarde`);
          }
        } else if (simpleProjects.length) {
          // Chercher par id en priorité
          let projIndex = simpleProjects.findIndex((p: any, idx: number) => {
            if (!p.id) p.id = p.slug || `project-${idx}`;
            return p.id === projectId;
          });
          // Fallback : chercher par slug
          if (projIndex === -1) {
            projIndex = simpleProjects.findIndex((p: any) => p.slug === projectId);
          }
          if (projIndex !== -1) {
            const target = simpleProjects[projIndex];
            // S'assurer que le projet a un id avant sauvegarde
            if (!target.id) target.id = target.slug || projectId;
            simpleProjects[projIndex] = {
              ...target,
              blocks: persistedBlocks,
              content: htmlContent || target.content
            };
            newContent.work = { ...work, projects: simpleProjects };
          } else {
            throw new Error(`Projet "${projectId}" introuvable pour la sauvegarde`);
          }
        } else {
          throw new Error('Aucun projet disponible pour la sauvegarde');
        }
      } else if (['home', 'contact', 'studio', 'work', 'blog'].includes(pageKey)) {
        newContent[pageKey] = {
          ...newContent[pageKey],
          blocks: persistedBlocks,
          content: htmlContent || newContent[pageKey].content, // Garder l'ancien content si pas de HTML généré
        };
      } else if (newContent.pages?.pages) {
        // Pour les pages custom
        const pageIndex = newContent.pages.pages.findIndex((p: any) => 
          p.slug === pageKey || p.id === pageKey || p.title?.toLowerCase() === pageKey.toLowerCase()
        );
        if (pageIndex !== -1) {
          newContent.pages.pages[pageIndex] = {
            ...newContent.pages.pages[pageIndex],
            blocks: persistedBlocks,
            content: htmlContent || newContent.pages.pages[pageIndex].content, // Garder l'ancien content si pas de HTML généré
          };
        }
      }
      
      // Sauvegarder via l'API
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
      }

      setSaveStatus('success');
      
      // Mettre à jour le contenu local
      setAdminContent(newContent);
      
      // Notifier les autres composants (admin du projet individuel, etc.) de la mise à jour
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('content-updated', {
            detail: {
              projectId,
              pageKey,
              work: newContent.work
            }
          }));
          // Déclencher un changement de storage pour forcer le rechargement
          localStorage.setItem('content-updated', String(Date.now()));
        }
      } catch {
        // ignore
      }
      
      toast.success('Page sauvegardée avec succès', {
        description: projectId
          ? `Les modifications du projet "${projectId}" ont été enregistrées`
          : `Les modifications de "${pageKey}" ont été enregistrées`
      });
      
      // Réinitialiser le statut après 2 secondes
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setSaveStatus('error');
      toast.error('Erreur lors de la sauvegarde', {
        description: err instanceof Error ? err.message : 'Une erreur inconnue est survenue'
      });
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <TemplateProvider value={{ key: templateKey }}>
    <div className="flex flex-col h-screen w-full bg-gray-50" data-template={templateKey}>
      <style>{`.preview-pane { ${paletteCss} }`}</style>
      {/* Toolbar simple */}
      <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour admin
          </Button>
          <div className="text-sm text-gray-600">Prévisualisation live (beta)</div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Page</span>
            <select
              className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 bg-white"
              value={pageKey}
              onChange={(e) => handlePageChange(e.target.value)}
            >
              {pageOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {projectOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Projet</span>
              <select
                className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 bg-white"
                value={projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
              >
                <option value="">Page Work (aucun projet ciblé)</option>
                {projectOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <span>Template</span>
            <span className="px-2 py-1 text-sm rounded border border-gray-200 bg-gray-50">{templateKey || 'soliva'}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Auto-live depuis l'éditeur
          </div>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || !previewData || !adminContent}
            className={`text-sm px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              saveStatus === 'saving' || !previewData || !adminContent
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="h-4 w-4" />
            {saveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className="w-[420px] min-w-[360px] max-w-[520px] border-r border-gray-200 bg-white flex flex-col relative"
          ref={editorPaneRef}
        >
          {error ? (
            <div className="p-6 text-sm text-red-600">Erreur: {error}</div>
          ) : loading ? (
            <div className="p-6 text-sm text-gray-500">Chargement...</div>
          ) : (
            <>
              {/* Sidebar header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-xs uppercase tracking-wide text-gray-500">Plan</div>
                <div className="text-sm text-gray-800 font-semibold">
                  Page: <span className="text-gray-600">{pageKey}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Template: <strong>{templateKey}</strong>
                </div>
              </div>

              {/* Outline stylé façon sidebar */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50/60">
                  <div className="px-3 py-2 border-b border-gray-200 text-[12px] font-semibold text-gray-700 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Sections ({blocks.length})
                  </div>
                  <div className="p-2">
                    <SommairePanel
                      className="border-0 bg-transparent"
                      blocks={blocks}
                      selectedBlockId={selectedBlockId || undefined}
                      onAddBlock={handleAddBlock}
                      onSelectBlock={(id) => {
                        let targetId = id;
                        let targetColumn:
                          | 'leftColumn'
                          | 'rightColumn'
                          | 'middleColumn'
                          | 'column1'
                          | 'column2'
                          | 'column3'
                          | 'column4'
                          | null = null;
                        if (id.includes(':')) {
                          const [base, colKey] = id.split(':');
                          targetId = base;
                          if (
                            colKey === 'leftColumn' ||
                            colKey === 'rightColumn' ||
                            colKey === 'middleColumn' ||
                            colKey === 'column1' ||
                            colKey === 'column2' ||
                            colKey === 'column3' ||
                            colKey === 'column4'
                          ) {
                            targetColumn = colKey;
                          }
                        }
                        
                        // Mettre à jour selectedBlockId pour conserver le contexte de colonne
                        setSelectedBlockId(id); // Garder le format blockId:column pour le contexte
                        
                        // Ouvrir l'inspecteur et scroller en même temps
                        setInspectorMode(true);
                        setInspectorBlockId(targetId);
                        setInspectorColumn(targetColumn);
                        
                        // Scroller immédiatement (en même temps que l'ouverture du panneau)
                        requestAnimationFrame(() => {
                          scrollToBlock(targetId);
                        });
                      }}
                      onDeleteBlock={handleDeleteBlock}
                      onDuplicateBlock={() => {}}
                      onReorderBlocks={(newBlocks) => {
                        setBlocks(normalizeBlocks(newBlocks));
                        setPreviewData((prev) => prev ? { ...prev, blocks: normalizeBlocks(newBlocks) } : prev);
                      }}
                      hiddenBlockIds={hiddenBlockIds}
                      renderAction={(section) => {
                        if (section.type === 'column') return null;
                        const blockIsHidden = hiddenBlockIds.has(section.id);
                        return (
                          <>
                            <button
                              type="button"
                              aria-label={blockIsHidden ? 'Afficher' : 'Masquer'}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                toggleVisibility(section.id); 
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all flex-shrink-0"
                              title={blockIsHidden ? "Afficher" : "Masquer"}
                            >
                              {blockIsHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              aria-label="Supprimer"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeleteBlock(section.id); 
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-all flex-shrink-0"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Panneau d'édition qui passe au-dessus du plan */}
          <div
            className={`visual-editor-inspector absolute inset-0 z-20 bg-white border-l border-gray-200 flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${
              inspectorMode ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ pointerEvents: inspectorMode ? 'auto' : 'none' }}
            onTransitionEnd={() => {
              if (!inspectorMode) {
                // Libérer l'ID après l'anim de sortie pour éviter le flash
                setInspectorBlockId(null);
              }
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <button
                  className="text-sm text-gray-700 hover:text-gray-900 mr-3"
                  onClick={() => { setInspectorMode(false); setInspectorBlockId(null); setInspectorColumn(null); }}
                  aria-label="Retour au plan"
                >
                  ← Retour
                </button>
                <span className="text-sm font-semibold text-gray-900">
                  {inspectorBlockId ? `Édition : ${inspectorBlockId}` : 'Ajouter un bloc'}
                </span>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-gray-800"
                onClick={() => { setInspectorMode(false); setInspectorBlockId(null); }}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!inspectorBlockId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <p className="text-sm text-gray-500 mb-4">
                    Sélectionnez un bloc dans le plan pour l'éditer
                  </p>
                  <p className="text-xs text-gray-400">
                    Ou cliquez sur le bouton "+" pour ajouter un nouveau bloc
                  </p>
                </div>
              ) : (() => {
                console.log('🔍 Recherche du bloc:', inspectorBlockId);
                console.log('📦 Blocs disponibles (racine):', blocks.map(b => ({ id: b.id, type: b.type })));
                
                // Chercher d'abord dans les blocs racine
                let block = blocks.find(b => b.id === inspectorBlockId);
                let blockParent: any = null;
                let blockColumn:
                  | 'leftColumn'
                  | 'rightColumn'
                  | 'middleColumn'
                  | 'column1'
                  | 'column2'
                  | 'column3'
                  | 'column4'
                  | null = null;
                let blockIndex: number = -1;
                
                // Si pas trouvé, chercher dans les colonnes des blocs multi-colonnes
                if (!block) {
                  console.log('🔍 Bloc non trouvé dans racine, recherche dans colonnes...');
                  for (const parentBlock of blocks) {
                    if (!['two-columns', 'two-columns-13', 'three-columns', 'four-columns'].includes(parentBlock.type)) {
                      continue;
                    }

                    const blockData = parentBlock.data || parentBlock;
                    const columnKeys =
                      parentBlock.type === 'two-columns' || parentBlock.type === 'two-columns-13'
                        ? ['leftColumn', 'rightColumn']
                        : parentBlock.type === 'three-columns'
                        ? ['leftColumn', 'middleColumn', 'rightColumn']
                        : ['column1', 'column2', 'column3', 'column4'];

                    columnKeys.forEach((colKey) => {
                      const columnBlocks = blockData[colKey] || parentBlock[colKey] || [];
                      console.log(`📋 Bloc ${parentBlock.type} ${parentBlock.id} — ${colKey}:`, columnBlocks);

                      const foundIndex = columnBlocks.findIndex((b: any, idx: number) => {
                        if (!b) return false;
                        const blockId = b.id || b.data?.id || (typeof b === 'string' ? b : null);
                        const stableId = `${parentBlock.id}-${colKey}-${idx}`;
                        const matches =
                          blockId === inspectorBlockId ||
                          String(blockId) === String(inspectorBlockId) ||
                          stableId === inspectorBlockId ||
                          String(stableId) === String(inspectorBlockId);
                        if (matches) {
                          console.log(`✅ Trouvé dans ${colKey}:`, { blockId, stableId, index: idx, block: b });
                        }
                        return matches;
                      });

                      if (foundIndex !== -1 && !block) {
                        block = columnBlocks[foundIndex];
                        blockParent = parentBlock;
                        blockColumn = colKey as any;
                        blockIndex = foundIndex;
                        console.log(`✅ Bloc trouvé dans ${colKey} à l'index`, foundIndex);
                      }
                    });

                    if (block) break;
                  }
                }
                
                if (!block) {
                  // Debug: afficher les IDs disponibles
                  console.log('🔍 Bloc introuvable:', inspectorBlockId);
                  console.log('📦 Blocs racine:', blocks.map(b => b.id));
                  console.log('📋 Blocs dans colonnes:', blocks
                    .filter(b => ['two-columns', 'two-columns-13', 'three-columns', 'four-columns'].includes(b.type))
                    .map(b => {
                      const data = b.data || b;
                      return {
                        parentId: b.id,
                        leftColumn: (data.leftColumn || []).map((bl: any) => bl?.id || bl?.data?.id),
                        middleColumn: (data.middleColumn || []).map((bl: any) => bl?.id || bl?.data?.id),
                        rightColumn: (data.rightColumn || []).map((bl: any) => bl?.id || bl?.data?.id),
                        column1: (data.column1 || []).map((bl: any) => bl?.id || bl?.data?.id),
                        column2: (data.column2 || []).map((bl: any) => bl?.id || bl?.data?.id),
                        column3: (data.column3 || []).map((bl: any) => bl?.id || bl?.data?.id),
                        column4: (data.column4 || []).map((bl: any) => bl?.id || bl?.data?.id)
                      };
                    }));
                  
                  return (
                    <div className="text-sm text-gray-500">
                      Bloc introuvable: {inspectorBlockId}
                    </div>
                  );
                }
                
                // Déterminer quelle colonne ouvrir pour l'éditeur compact
                let initialOpenColumn: any = null;
                if ((blockParent?.type === 'two-columns' || blockParent?.type === 'two-columns-13') && blockColumn) {
                  initialOpenColumn = blockColumn === 'leftColumn' ? 'left' : 'right';
                } else if (blockParent?.type === 'three-columns' && blockColumn) {
                  initialOpenColumn = blockColumn === 'leftColumn' ? 'left' : blockColumn === 'middleColumn' ? 'middle' : 'right';
                } else if (blockParent?.type === 'four-columns' && blockColumn) {
                  initialOpenColumn = blockColumn; // column1..column4
                } else if ((block.type === 'two-columns' || block.type === 'two-columns-13') && inspectorColumn) {
                  initialOpenColumn = inspectorColumn === 'leftColumn' ? 'left' : 'right';
                }
                
                // Extraire les données du bloc (peut être dans block.data ou directement dans block)
                const blockData = block.data && typeof block.data === 'object' && Object.keys(block.data).length > 0
                  ? block.data
                  : (() => {
                      // Structure plate : extraire toutes les propriétés sauf id, type
                      const { id, type, ...rest } = block;
                      return rest;
                    })();
                
                // Créer un bloc complet avec id et type pour renderAutoBlockEditor
                const fullBlock = {
                  id: block.id || inspectorBlockId,
                  type: block.type,
                  ...blockData
                };
                
                return (
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Type: <span className="font-mono">{block.type}</span>
                      {blockParent && (
                        <span className="ml-2 text-gray-400">
                          (dans {blockColumn === 'leftColumn' ? 'colonne gauche' : 'colonne droite'})
                        </span>
                      )}
                    </div>
                    {renderAutoBlockEditor(fullBlock, (updatedBlock) => {
                      // S'assurer que l'ID est toujours préservé
                      const blockIdToPreserve = block.id || inspectorBlockId;
                      const updatedBlockWithId = {
                        ...updatedBlock,
                        id: updatedBlock.id || blockIdToPreserve,
                        type: updatedBlock.type || block.type
                      };
                      
                      if (blockParent && blockColumn !== null && blockIndex !== -1) {
                        // Mettre à jour le bloc dans la colonne du parent
                        const newBlocks = blocks.map(b => {
                          if (b.id === blockParent.id) {
                            const updatedParent = { ...b };
                            const columnData = updatedParent[blockColumn!] || updatedParent.data?.[blockColumn!] || [];
                            const newColumnData = [...columnData];
                            newColumnData[blockIndex] = updatedBlockWithId;
                            
                            if (updatedParent.data) {
                              updatedParent.data[blockColumn!] = newColumnData;
                            } else {
                              updatedParent[blockColumn!] = newColumnData;
                            }
                            return updatedParent;
                          }
                          return b;
                        });
                        setBlocks(newBlocks);
                        setPreviewData((prev) => prev ? { ...prev, blocks: newBlocks } : prev);
                      } else {
                        // Mettre à jour le bloc dans la liste racine
                        const newBlocks = blocks.map(b => 
                          b.id === blockIdToPreserve ? updatedBlockWithId : b
                        );
                        setBlocks(newBlocks);
                        setPreviewData((prev) => prev ? { ...prev, blocks: newBlocks } : prev);
                      }
                    }, { 
                      compact: true,
                      context: previewData, // Passer le contexte pour l'IA
                      initialOpenColumn: initialOpenColumn,
                      initialOpenBlockId: blockParent && blockColumn ? inspectorBlockId : null
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Sheet de sélection de blocs (composant réutilisable) */}
        <BlockSelectorSheet
          open={isBlockSheetOpen}
          onOpenChange={setIsBlockSheetOpen}
          onSelectBlock={handleAddBlock}
        />

        <div className="flex-1 flex flex-col relative">
          {/* Header de la preview */}
          <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-600">Preview</span>
              <span className="text-xs text-gray-500">{blocks.length} bloc{blocks.length > 1 ? 's' : ''}</span>
            </div>
          
          {/* Iframe pour la preview isolée (responsive correct) */}
          <iframe
            ref={previewIframeRef}
            src={`/admin/preview/iframe?page=${pageKey}${projectId ? `&project=${encodeURIComponent(projectId)}` : ''}`}
            className="flex-1 w-full border-0"
            style={{ minHeight: '600px' }}
            title="Preview"
          />
          
          {/* Fallback si iframe non supportée */}
          <div
            className="flex-1 overflow-y-auto px-6 py-6 preview-pane hidden"
            ref={previewPaneRef}
            style={{ display: 'none' }}
          >
            <div className="max-w-6xl mx-auto space-y-3">
              {visibleBlocks.length > 0 && previewData ? (
                <div className={`${templateKey === 'pearl' ? '' : 'site'} p-4`}>
                    <BlockRenderer
                      blocks={visibleBlocks as any}
                      content={previewData}
                      withDebugIds
                      highlightBlockId={(hoverBlockId || selectedBlockId) || undefined}
                    />
                  </div>
              ) : (
                <div className="p-4">
                  <div className="text-sm text-gray-500 text-center py-16 space-y-2">
                    <div>{loading ? 'Chargement...' : error ? `Erreur: ${error}` : 'Ajoute un bloc dans la colonne de gauche pour prévisualiser.'}</div>
                    <div className="text-xs">Page: {pageKey} · Template: {templateKey}</div>
                    <div className="text-xs">Blocs visibles: {visibleBlocks.length} / {blocks.length}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </TemplateProvider>
  );
}
  // Normaliser les IDs (blocs racine et enfants de two-columns)
  const normalizeBlocks = (inputBlocks: any[]): any[] => {
    return inputBlocks.map((blk, idx) => {
      const baseId =
        blk.id && String(blk.id).trim() !== ''
          ? String(blk.id)
          : `${blk.type || 'block'}-${idx}`;

      const normalizeColumn = (items: any[], colKey: string) =>
        (items || []).map((item: any, itemIdx: number) => {
          const itemId =
            item?.id && String(item.id).trim() !== ''
              ? String(item.id)
              : `${baseId}-${colKey}-${itemIdx}-${item?.type || 'item'}`;
          return { ...item, id: itemId };
        });

      if (blk.type === 'two-columns') {
        const data = blk.data || blk;

        const leftColumn = normalizeColumn(data.leftColumn || blk.leftColumn || [], 'leftColumn');
        const rightColumn = normalizeColumn(data.rightColumn || blk.rightColumn || [], 'rightColumn');

        return {
          ...blk,
          id: baseId,
          data: {
            ...data,
            leftColumn,
            rightColumn,
          },
        };
      }

      if (blk.type === 'three-columns') {
        const data = blk.data || blk;

        const leftColumn = normalizeColumn(data.leftColumn || blk.leftColumn || [], 'leftColumn');
        const middleColumn = normalizeColumn(data.middleColumn || blk.middleColumn || [], 'middleColumn');
        const rightColumn = normalizeColumn(data.rightColumn || blk.rightColumn || [], 'rightColumn');

        return {
          ...blk,
          id: baseId,
          data: {
            ...data,
            leftColumn,
            middleColumn,
            rightColumn,
          },
        };
      }

      if (blk.type === 'four-columns') {
        const data = blk.data || blk;

        const column1 = normalizeColumn(data.column1 || blk.column1 || [], 'column1');
        const column2 = normalizeColumn(data.column2 || blk.column2 || [], 'column2');
        const column3 = normalizeColumn(data.column3 || blk.column3 || [], 'column3');
        const column4 = normalizeColumn(data.column4 || blk.column4 || [], 'column4');

        return {
          ...blk,
          id: baseId,
          data: {
            ...data,
            column1,
            column2,
            column3,
            column4,
          },
        };
      }

      return { ...blk, id: baseId };
    });
  };
