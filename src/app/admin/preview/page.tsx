"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlockEditor from '../components/BlockEditor';
import BlockRenderer from '@/blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
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

  // Placeholder: on s'appuie sur BlockEditor pour la colonne gauche
  // et on passera le state aux props de PreviewPanel via lifting d’état.
  // En attendant, on se contente d’un layout deux colonnes avec le BlockRenderer.

  // État local pour la preview (sera alimenté via les callbacks de BlockEditor)
  const [previewData, setPreviewData] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [initialPageData, setInitialPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Callback depuis BlockEditor
  const handleUpdate = (data: any) => {
    setPreviewData(data);
    if (Array.isArray((data as any)?.blocks)) {
      setBlocks((data as any).blocks);
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
      } catch (e: any) {
        setError(e.message || 'Erreur chargement');
        console.error('[Preview] Erreur chargement', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageKey]);

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
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="h-4 w-4" /> Auto-live depuis l’éditeur
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[420px] min-w-[360px] max-w-[520px] border-r border-gray-200 overflow-y-auto bg-white">
          {error ? (
            <div className="p-6 text-sm text-red-600">Erreur: {error}</div>
          ) : loading ? (
            <div className="p-6 text-sm text-gray-500">Chargement...</div>
          ) : (
            <>
              <div className="p-4 text-xs text-gray-500">
                Page: <strong>{pageKey}</strong> · Template: <strong>{forcedTemplate || (initialPageData?._template || 'soliva')}</strong>
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
              {blocks.length > 0 && previewData ? (
                <>
                  <div className="site">
                    <BlockRenderer blocks={blocks as any} content={previewData} />
                  </div>
                  <div className="mt-4 rounded bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600">
                    <div className="font-semibold mb-1">Debug preview</div>
                    <div>Page: {pageKey}</div>
                    <div>Template: {forcedTemplate || (initialPageData?._template || 'soliva')}</div>
                    <div>Blocs: {blocks.length}</div>
                    <div>Types: {blocks.map(b => b.type).join(', ')}</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 text-center py-16 space-y-2">
                  <div>{loading ? 'Chargement...' : error ? `Erreur: ${error}` : 'Ajoute un bloc dans la colonne de gauche pour prévisualiser.'}</div>
                  <div className="text-xs">Page: {pageKey} · Template: {forcedTemplate || (initialPageData?._template || 'soliva')}</div>
                  <div className="text-xs">Blocs: {blocks.length}</div>
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
