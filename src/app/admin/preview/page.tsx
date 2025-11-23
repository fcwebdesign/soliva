"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlockEditor from '../components/BlockEditor';
import BlockRenderer from '@/blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Eye, EyeOff, Save } from 'lucide-react';
import { TemplateProvider } from '@/templates/context';
import SommairePanel from '@/components/admin/SommairePanel';
import { renderAutoBlockEditor } from '../components/AutoBlockIntegration';
import { toast } from 'sonner';

export const runtime = "nodejs";

// Page dédiée type Shopify : éditeur à gauche, preview à droite
export default function AdminPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Par défaut on cible studio (contient des blocs) pour éviter une preview vide
  const pageKey = searchParams.get('page') || 'studio';
  const forcedTemplate = searchParams.get('template') || null;
  const [adminContent, setAdminContent] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(forcedTemplate || '');

  // Refs pour scroller vers un bloc dans l’éditeur et la preview
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);

  // État local pour la preview (sera alimenté via les callbacks de BlockEditor)
  const [previewData, setPreviewData] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [initialPageData, setInitialPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageOptions, setPageOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoverBlockId, setHoverBlockId] = useState<string | null>(null);
  const [hiddenBlockIds, setHiddenBlockIds] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<boolean>(false);
  const [inspectorBlockId, setInspectorBlockId] = useState<string | null>(null);
  const [inspectorColumn, setInspectorColumn] = useState<'leftColumn' | 'rightColumn' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Callback depuis BlockEditor
  const handleUpdate = (data: any) => {
    setPreviewData(data);
    if (Array.isArray((data as any)?.blocks)) {
      setBlocks((data as any).blocks);
      if (!selectedBlockId && (data as any).blocks.length > 0) {
        setSelectedBlockId((data as any).blocks[0].id);
      }
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

        // Trouver la page demandée
        let pageData = null;
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

        if (!pageData) {
          console.warn('[Preview] Pages disponibles:', data.pages?.pages?.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title })));
          throw new Error(`Page "${pageKey}" introuvable`);
        }

        const nextTemplate = forcedTemplate || (data as any)._template || 'soliva';
        const pageBlocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
        
        // Normaliser les IDs des blocs s'ils n'en ont pas
        const normalizedBlocks = pageBlocks.map((b: any) => {
          if (!b.id || b.id.trim() === '') {
            return { ...b, id: `${b.type || 'block'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
          }
          return b;
        });
        
        setInitialPageData({ ...pageData, _template: nextTemplate, blocks: normalizedBlocks });
        setPreviewData({ ...pageData, _template: nextTemplate, blocks: normalizedBlocks });
        setBlocks(normalizedBlocks);
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
  }, [pageKey, forcedTemplate]);

  const templateOptions = [
    { value: '', label: 'Default (soliva)' },
    { value: 'pearl', label: 'Pearl' },
  ];

  const handlePageChange = (nextPage: string) => {
    const tpl = forcedTemplate || selectedTemplate;
    const query = tpl ? `?page=${nextPage}&template=${tpl}` : `?page=${nextPage}`;
    router.push(`/admin/preview${query}`);
  };

  const handleTemplateChange = (nextTpl: string) => {
    setSelectedTemplate(nextTpl);
    const query = nextTpl ? `?page=${pageKey}&template=${nextTpl}` : `?page=${pageKey}`;
    router.push(`/admin/preview${query}`);
  };

  const scrollToBlock = (blockId: string) => {
    setSelectedBlockId(blockId);

    const highlight = (container: HTMLElement | null) => {
      if (!container) return;
      const el = container.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
      if (!el) return;
      // Scroll doux vers l’élément
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const y = el.offsetTop - 80;
        container.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
      el.classList.add('ring', 'ring-blue-200');
      setTimeout(() => el.classList.remove('ring', 'ring-blue-200'), 900);
    };

    highlight(editorPaneRef.current);
    highlight(previewPaneRef.current);
  };

  const toggleVisibility = (blockId: string) => {
    setHiddenBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  const visibleBlocks = blocks.filter((b) => !hiddenBlockIds.has(b.id));

  // Gérer les clics sur les blocs dans la preview pour ouvrir l'inspecteur
  useEffect(() => {
    const handleBlockClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Chercher l'élément parent avec data-block-id
      const blockElement = target.closest('[data-block-id]') as HTMLElement;
      if (!blockElement) return;
      
      const blockId = blockElement.getAttribute('data-block-id');
      if (!blockId) return;
      
      // Empêcher le comportement par défaut si on clique sur un lien ou un bouton
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
        return;
      }
      
      // Ouvrir l'inspecteur avec ce bloc
      setSelectedBlockId(blockId);
      setInspectorMode(true);
      setInspectorBlockId(blockId);
      setInspectorColumn(null);
      
      // Scroll vers le bloc dans la preview
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    const previewContainer = previewPaneRef.current;
    if (previewContainer) {
      previewContainer.addEventListener('click', handleBlockClick);
      return () => {
        previewContainer.removeEventListener('click', handleBlockClick);
      };
    }
  }, [blocks]);

  // Drag & drop outline uniquement (réorganisation locale)
  const reorderBlocks = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const current = [...blocks];
    const fromIndex = current.findIndex((b) => b.id === fromId);
    const toIndex = current.findIndex((b) => b.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setBlocks(current);
    setPreviewData((prev) => prev ? { ...prev, blocks: current } : prev);
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
      
      // Générer le HTML à partir des blocs basiques uniquement (pour compatibilité)
      // Les blocs auto-déclarés n'ont pas besoin de HTML car ils sont rendus directement
      const htmlContent = blocks.map(block => {
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
      
      // Mettre à jour la page dans le contenu
      if (['home', 'contact', 'studio', 'work', 'blog'].includes(pageKey)) {
        newContent[pageKey] = {
          ...newContent[pageKey],
          blocks: blocks,
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
            blocks: blocks,
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
      
      toast.success('Page sauvegardée avec succès', {
        description: `Les modifications de "${pageKey}" ont été enregistrées`
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
    <TemplateProvider value={{ key: forcedTemplate || (initialPageData?._template || 'soliva') }}>
    <div className="flex flex-col h-screen w-full bg-gray-50" data-template={forcedTemplate || initialPageData?._template || 'soliva'}>
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
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Template</span>
            <select
              className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 bg-white"
              value={forcedTemplate || selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {templateOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
                  Template: <strong>{forcedTemplate || (initialPageData?._template || 'soliva')}</strong>
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
                      onSelectBlock={(id) => {
                        // Détecter si c'est une colonne (format: blockId:columnKey)
                        if (id.includes(':') && id.split(':').length === 2) {
                          const [blockId, columnKey] = id.split(':');
                          scrollToBlock(blockId);
                          setInspectorMode(true);
                          setInspectorBlockId(blockId);
                          setInspectorColumn(columnKey as 'leftColumn' | 'rightColumn');
                        } else {
                          scrollToBlock(id);
                          setInspectorMode(true);
                          setInspectorBlockId(id);
                          setInspectorColumn(null);
                        }
                      }}
                      onDeleteBlock={() => {}}
                      onDuplicateBlock={() => {}}
                      onReorderBlocks={(newBlocks) => {
                        setBlocks(newBlocks);
                        setPreviewData((prev) => prev ? { ...prev, blocks: newBlocks } : prev);
                      }}
                      renderAction={(section) => {
                        const isHidden = hiddenBlockIds.has(section.id);
                        return (
                          <button
                            type="button"
                            aria-label={isHidden ? 'Afficher' : 'Masquer'}
                            onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Éditeur des blocs (visuel) */}
                {!inspectorMode && (
                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="px-3 py-2 border-b border-gray-200 text-[12px] font-semibold text-gray-700">
                      Éditeur de contenu
                    </div>
                    <div className="p-3">
                      <BlockEditor
                        pageData={initialPageData}
                        pageKey={pageKey}
                        onUpdate={handleUpdate}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Panneau d'édition qui passe au-dessus du plan */}
          <div
            className={`visual-editor-inspector absolute inset-0 z-20 bg-white border-l border-gray-200 flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${
              inspectorMode && inspectorBlockId ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ pointerEvents: inspectorMode && inspectorBlockId ? 'auto' : 'none' }}
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
                  {inspectorBlockId ? `Édition : ${inspectorBlockId}` : 'Édition'}
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
              {inspectorBlockId && (() => {
                console.log('🔍 Recherche du bloc:', inspectorBlockId);
                console.log('📦 Blocs disponibles (racine):', blocks.map(b => ({ id: b.id, type: b.type })));
                
                // Chercher d'abord dans les blocs racine
                let block = blocks.find(b => b.id === inspectorBlockId);
                let blockParent: any = null;
                let blockColumn: 'leftColumn' | 'rightColumn' | null = null;
                let blockIndex: number = -1;
                
                // Si pas trouvé, chercher dans les colonnes des blocs two-columns
                if (!block) {
                  console.log('🔍 Bloc non trouvé dans racine, recherche dans colonnes...');
                  for (const parentBlock of blocks) {
                    if (parentBlock.type === 'two-columns') {
                      // Essayer différents formats de données
                      const blockData = parentBlock.data || parentBlock;
                      const leftColumn = blockData.leftColumn || parentBlock.leftColumn || [];
                      const rightColumn = blockData.rightColumn || parentBlock.rightColumn || [];
                      
                      console.log(`📋 Bloc two-columns ${parentBlock.id}:`, {
                        leftColumn: leftColumn.map((b: any, idx: number) => {
                          const blockId = b?.id || b?.data?.id || `no-id-${idx}`;
                          console.log(`  📦 Colonne gauche [${idx}]:`, { 
                            id: blockId, 
                            type: b?.type,
                            fullBlock: b 
                          });
                          return { id: blockId, type: b?.type };
                        }),
                        rightColumn: rightColumn.map((b: any, idx: number) => {
                          const blockId = b?.id || b?.data?.id || `no-id-${idx}`;
                          console.log(`  📦 Colonne droite [${idx}]:`, { 
                            id: blockId, 
                            type: b?.type,
                            fullBlock: b 
                          });
                          return { id: blockId, type: b?.type };
                        })
                      });
                      
                      // Rechercher dans la colonne gauche
                      const leftIndex = leftColumn.findIndex((b: any, idx: number) => {
                        if (!b) return false;
                        // Essayer différents formats d'ID
                        const blockId = b.id || b.data?.id || (typeof b === 'string' ? b : null);
                        // ID stable basé sur la position (même format que dans analyzeBlockStructure)
                        const stableId = `${parentBlock.id}-leftColumn-${idx}`;
                        const matches = blockId === inspectorBlockId || 
                                       String(blockId) === String(inspectorBlockId) ||
                                       stableId === inspectorBlockId ||
                                       String(stableId) === String(inspectorBlockId);
                        if (matches) {
                          console.log('✅ Trouvé dans colonne gauche:', { blockId, stableId, index: idx, block: b });
                        }
                        return matches;
                      });
                      
                      // Rechercher dans la colonne droite
                      const rightIndex = rightColumn.findIndex((b: any, idx: number) => {
                        if (!b) return false;
                        // Essayer différents formats d'ID
                        const blockId = b.id || b.data?.id || (typeof b === 'string' ? b : null);
                        // ID stable basé sur la position (même format que dans analyzeBlockStructure)
                        const stableId = `${parentBlock.id}-rightColumn-${idx}`;
                        const matches = blockId === inspectorBlockId || 
                                       String(blockId) === String(inspectorBlockId) ||
                                       stableId === inspectorBlockId ||
                                       String(stableId) === String(inspectorBlockId);
                        if (matches) {
                          console.log('✅ Trouvé dans colonne droite:', { blockId, stableId, index: idx, block: b });
                        }
                        return matches;
                      });
                      
                      if (leftIndex !== -1) {
                        block = leftColumn[leftIndex];
                        blockParent = parentBlock;
                        blockColumn = 'leftColumn';
                        blockIndex = leftIndex;
                        console.log('✅ Bloc trouvé dans colonne gauche à l\'index', leftIndex);
                        break;
                      } else if (rightIndex !== -1) {
                        block = rightColumn[rightIndex];
                        blockParent = parentBlock;
                        blockColumn = 'rightColumn';
                        blockIndex = rightIndex;
                        console.log('✅ Bloc trouvé dans colonne droite à l\'index', rightIndex);
                        break;
                      }
                    }
                  }
                }
                
                if (!block) {
                  // Debug: afficher les IDs disponibles
                  console.log('🔍 Bloc introuvable:', inspectorBlockId);
                  console.log('📦 Blocs racine:', blocks.map(b => b.id));
                  console.log('📋 Blocs dans colonnes:', blocks
                    .filter(b => b.type === 'two-columns')
                    .map(b => {
                      const data = b.data || b;
                      return {
                        parentId: b.id,
                        leftColumn: (data.leftColumn || []).map((bl: any) => bl?.id || bl?.data?.id),
                        rightColumn: (data.rightColumn || []).map((bl: any) => bl?.id || bl?.data?.id)
                      };
                    }));
                  
                  return (
                    <div className="text-sm text-gray-500">
                      Bloc introuvable: {inspectorBlockId}
                    </div>
                  );
                }
                
                // Déterminer quelle colonne ouvrir pour two-columns
                let initialOpenColumn: 'leftColumn' | 'rightColumn' | null = null;
                if (blockParent?.type === 'two-columns' && blockColumn) {
                  initialOpenColumn = blockColumn;
                } else if (block.type === 'two-columns' && inspectorColumn) {
                  initialOpenColumn = inspectorColumn;
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
                      initialOpenColumn: initialOpenColumn ? (initialOpenColumn === 'leftColumn' ? 'left' : 'right') : null,
                      initialOpenBlockId: blockParent && blockColumn ? inspectorBlockId : null
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 overflow-y-auto px-6 py-6" ref={previewPaneRef}>
          <div className="max-w-6xl mx-auto space-y-3">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>Preview</span>
              <span className="text-xs text-gray-500">{blocks.length} bloc{blocks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[240px] overflow-hidden">
              {visibleBlocks.length > 0 && previewData ? (
                <div className="site p-4">
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
                    <div className="text-xs">Page: {pageKey} · Template: {forcedTemplate || (initialPageData?._template || 'soliva')}</div>
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
