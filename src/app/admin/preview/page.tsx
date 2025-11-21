"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlockEditor from '../components/BlockEditor';
import BlockRenderer from '@/blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { TemplateProvider } from '@/templates/context';

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

  // Ref pour scroller vers un bloc dans l’éditeur
  const editorPaneRef = useRef<HTMLDivElement>(null);

  // État local pour la preview (sera alimenté via les callbacks de BlockEditor)
  const [previewData, setPreviewData] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [initialPageData, setInitialPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageOptions, setPageOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hiddenBlockIds, setHiddenBlockIds] = useState<Set<string>>(new Set());

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
          pageData = data.pages.pages.find((p: any) => p.slug === pageKey || p.id === pageKey);
        }

        if (!pageData) {
          throw new Error(`Page "${pageKey}" introuvable`);
        }

        const nextTemplate = forcedTemplate || (data as any)._template || 'soliva';
        setInitialPageData({ ...pageData, _template: nextTemplate });
        setPreviewData({ ...pageData, _template: nextTemplate });
        setBlocks(Array.isArray(pageData.blocks) ? pageData.blocks : []);
        console.log('[Preview] Page chargée', pageKey, { template: nextTemplate, blocks: pageData.blocks?.length || 0 });

        // Options de pages pour le sélecteur
        const opts: Array<{ value: string; label: string }> = [
          { value: 'home', label: 'Home' },
          { value: 'studio', label: 'Studio' },
          { value: 'contact', label: 'Contact' },
          { value: 'work', label: 'Work' },
          { value: 'blog', label: 'Blog' },
        ];
        if (data?.pages?.pages) {
          data.pages.pages.forEach((p: any) => {
            if (p?.id) opts.push({ value: p.slug || p.id, label: p.title || p.id });
          });
        }
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
    const pane = editorPaneRef.current;
    if (!pane) return;
    const el = pane.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
    if (!el) return;
    const y = el.offsetTop - 60;
    pane.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    el.classList.add('ring', 'ring-blue-200');
    setTimeout(() => el.classList.remove('ring', 'ring-blue-200'), 800);
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
        <div className="w-[420px] min-w-[360px] max-w-[520px] border-r border-gray-200 overflow-y-auto bg-white" ref={editorPaneRef}>
          {error ? (
            <div className="p-6 text-sm text-red-600">Erreur: {error}</div>
          ) : loading ? (
            <div className="p-6 text-sm text-gray-500">Chargement...</div>
          ) : (
            <>
              <div className="p-4 text-xs text-gray-500">
                Page: <strong>{pageKey}</strong> · Template: <strong>{forcedTemplate || (initialPageData?._template || 'soliva')}</strong>
              </div>

              {/* Outline simple des blocs */}
              <div className="px-4 pb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">Plan</div>
                <div className="space-y-2">
                  {blocks.length === 0 && (
                    <div className="text-xs text-gray-500">Aucun bloc pour l’instant.</div>
                  )}
                  {blocks.map((b, idx) => (
                    <button
                      key={b.id || idx}
                      onClick={() => scrollToBlock(b.id)}
                      className={`w-full text-left text-xs border rounded px-3 py-2 transition-colors ${
                        selectedBlockId === b.id
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{b.type}</span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span>#{idx + 1}</span>
                          <span
                            onClick={(e) => { e.stopPropagation(); toggleVisibility(b.id); }}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            title={hiddenBlockIds.has(b.id) ? 'Afficher' : 'Masquer'}
                          >
                            {hiddenBlockIds.has(b.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            <BlockEditor
              pageData={initialPageData}
              pageKey={pageKey}
              onUpdate={handleUpdate}
            />
            </>
          )}
        </div>

        <div className="flex-1 bg-slate-100 overflow-y-auto px-6 py-6">
          <div className="max-w-6xl mx-auto space-y-3">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>Preview</span>
              <span className="text-xs text-gray-500">{blocks.length} bloc{blocks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 min-h-[240px]">
              {visibleBlocks.length > 0 && previewData ? (
                <>
                  <div className="site">
                    <BlockRenderer blocks={visibleBlocks as any} content={previewData} />
                  </div>
                  <div className="mt-4 rounded bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600">
                    <div className="font-semibold mb-1">Debug preview</div>
                    <div>Page: {pageKey}</div>
                    <div>Template: {forcedTemplate || (initialPageData?._template || 'soliva')}</div>
                    <div>Blocs: {visibleBlocks.length} / {blocks.length}</div>
                    <div>Types: {visibleBlocks.map(b => b.type).join(', ')}</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 text-center py-16 space-y-2">
                  <div>{loading ? 'Chargement...' : error ? `Erreur: ${error}` : 'Ajoute un bloc dans la colonne de gauche pour prévisualiser.'}</div>
                  <div className="text-xs">Page: {pageKey} · Template: {forcedTemplate || (initialPageData?._template || 'soliva')}</div>
                  <div className="text-xs">Blocs visibles: {visibleBlocks.length} / {blocks.length}</div>
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
