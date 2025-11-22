"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlockEditor from '../components/BlockEditor';
import BlockRenderer from '@/blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { TemplateProvider } from '@/templates/context';
import SommairePanel from '@/components/admin/SommairePanel';
import { renderAutoBlockEditor } from '../components/AutoBlockIntegration';

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
        setInitialPageData({ ...pageData, _template: nextTemplate, blocks: pageBlocks });
        setPreviewData({ ...pageData, _template: nextTemplate, blocks: pageBlocks });
        setBlocks(pageBlocks);
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
            <RefreshCw className="h-4 w-4" /> Auto-live depuis l’éditeur
          </div>
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
                        scrollToBlock(id);
                        setInspectorMode(true);
                        setInspectorBlockId(id);
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
                  onClick={() => { setInspectorMode(false); setInspectorBlockId(null); }}
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
                const block = blocks.find(b => b.id === inspectorBlockId);
                if (!block) {
                  return (
                    <div className="text-sm text-gray-500">
                      Bloc introuvable
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Type: <span className="font-mono">{block.type}</span>
                    </div>
                    {renderAutoBlockEditor(block, (updatedBlock) => {
                      // Mettre à jour le bloc dans la liste
                      const newBlocks = blocks.map(b => 
                        b.id === inspectorBlockId ? updatedBlock : b
                      );
                      setBlocks(newBlocks);
                      setPreviewData((prev) => prev ? { ...prev, blocks: newBlocks } : prev);
                    }, { compact: true })}
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
