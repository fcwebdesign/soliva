"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import HeaderAdmin from '../../components/HeaderAdmin';
import BlockEditor from '../../components/BlockEditor';
import type { Content } from '@/types/content';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  content?: string;
  slug?: string;
  status?: 'draft' | 'published';
  publishedAt?: string;
  description?: string;
  blocks?: any[];
  layout?: 'single-column' | 'two-columns';
  hero?: {
    title: string;
    description: string;
  };
}

export default function PageEdit() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  
  const [content, setContent] = useState<Content | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger le contenu et trouver la page
  useEffect(() => {
    fetchContent();
  }, []);

  // Ajouter la classe admin-page au body
  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setContent(data);
      
      // Trouver la page par ID
      const foundPage = (data as any).pages?.pages?.find((p: Page) => p.id === pageId);
      if (foundPage) {
        setPage(foundPage);
      } else if (pageId === 'new') {
        // Créer une nouvelle page (ne pas l'ajouter au contenu tout de suite)
        const newPage = {
          id: 'nouvelle-page',
          title: 'Nouvelle page',
          content: '',
          slug: 'nouvelle-page',
          status: 'draft' as const,
          description: '',
          blocks: [
            {
              id: `page-intro-${Date.now()}`,
              type: 'page-intro',
              title: 'Nouvelle page', // Pré-remplir avec le titre de la page
              description: 'Description of the page', // Description par défaut
              layout: 'default'
            }
          ]
        };
        setPage(newPage);
      } else {
        // Page non trouvée
        router.push('/admin/pages');
        return;
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePage = (updates: Partial<Page>) => {
    if (!page) return;
    const updatedPage = { ...page, ...updates } as Page;
    
    // Si le slug change, mettre à jour l'ID aussi (comme dans le blog)
    if (updates.slug && updates.slug !== page.slug) {
      updatedPage.id = updates.slug;
    }
    
    setPage(updatedPage);
    setHasUnsavedChanges(true);
  };

  const handleSaveWithStatus = async (status: 'draft' | 'published') => {
    if (!page || !content) return;
    
    // Mettre à jour le statut et la date de publication si nécessaire
    const updatedPage = {
      ...page,
      status,
      ...(status === 'published' && page.status !== 'published' && {
        publishedAt: new Date().toISOString()
      })
    };
    
    // Mettre à jour l'état local avant la sauvegarde
    setPage(updatedPage);
    
    // Utiliser la logique de sauvegarde existante
    await handleSaveInternal(updatedPage);
  };

  const handleSave = () => handleSaveWithStatus(page?.status || 'draft');

  const handleSaveInternal = async (pageToSave: Page = page!) => {
    if (!pageToSave || !content) return;
    
    try {
      setSaveStatus('saving');
      
      // Forcer la génération du HTML à partir des blocs s'ils existent
      let finalContent = pageToSave.content || '';
      
      if (pageToSave.blocks && Array.isArray(pageToSave.blocks) && pageToSave.blocks.length > 0) {
        console.log('🔄 Génération du HTML à partir des blocs pour sauvegarde');
        finalContent = pageToSave.blocks.map(block => {
          switch (block.type) {
            case 'h2':
              return block.content ? `<h2>${block.content}</h2>` : '';
            case 'h3':
              return block.content ? `<h3>${block.content}</h3>` : '';
            case 'content':
              return block.content || '';
            case 'image':
              return block.image?.src ? `<img src="${block.image.src}" alt="${block.image.alt || ''}" />` : '';
            case 'cta':
              return (block.ctaText || block.ctaLink) ? 
                `<div class="cta-block"><p>${block.ctaText || ''}</p><a href="${block.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
            default:
              return '';
          }
        }).filter(html => html.trim() !== '').join('\n');
      }
      
      // Nettoyer le contenu de la page avant sauvegarde
      const cleanPageContent = (content: string) => {
        if (!content) return '';
        
        // Supprimer les anciens blocs invalides du contenu HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Supprimer les éléments qui correspondent aux anciens blocs
        const invalidElements = tempDiv.querySelectorAll('[data-block-type="list"], [data-block-type="quote"]');
        invalidElements.forEach(el => el.remove());
        
        return tempDiv.innerHTML;
      };
      
      // Nettoyer le contenu de la page
      const cleanedPage = {
        ...pageToSave,
        content: cleanPageContent(finalContent)
      };
      
      console.log('💾 Page à sauvegarder:', {
        id: cleanedPage.id,
        title: cleanedPage.title,
        status: cleanedPage.status,
        publishedAt: cleanedPage.publishedAt,
        contentLength: cleanedPage.content?.length || 0,
        contentPreview: cleanedPage.content?.substring(0, 100),
        hasBlocks: !!cleanedPage.blocks,
        blocksCount: cleanedPage.blocks?.length || 0
      });
      
      // Mettre à jour la page dans le contenu
      const newContent = { ...content };
      
      // Initialiser la structure pages si elle n'existe pas
      if (!(newContent as any).pages) (newContent as any).pages = { pages: [] };
      if (!(newContent as any).pages.pages) (newContent as any).pages.pages = [];
      
      const pageIndex = (newContent as any).pages.pages.findIndex((p: Page) => p.id === pageId);
      
      console.log('💾 Sauvegarde page:', { pageId, cleanedPage, pageIndex });
      console.log('💾 Contenu avant sauvegarde:', JSON.stringify((newContent as any).pages.pages, null, 2));
      
      if (pageIndex >= 0) {
        // Mettre à jour la page existante
        (newContent as any).pages.pages[pageIndex] = cleanedPage;
      } else {
        // Ajouter une nouvelle page
        (newContent as any).pages.pages.push(cleanedPage);
      }
      
      console.log('💾 Contenu après sauvegarde:', JSON.stringify((newContent as any).pages.pages, null, 2));
      
      // Sauvegarder
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
      }
      
      setContent(newContent);
      setPage(cleanedPage);
      setHasUnsavedChanges(false);
      setSaveStatus('success');
      
      // Rediriger vers la liste des pages après sauvegarde
      setTimeout(() => {
        router.push('/admin/pages');
      }, 1000);
    } catch (err) {
      console.error('Erreur:', err);
      setSaveStatus('error');
    }
  };

  const handlePreview = async () => {
    if (!page) return;
    
    try {
      // 1. Créer une révision temporaire avec les modifications actuelles
      const previewId = `preview-${Date.now()}`;
      console.log('📝 Création aperçu page:', {
        pageId: page.id,
        slug: page.slug,
        hasUnsavedChanges,
        blocksCount: page.blocks?.length || 0,
        blocks: page.blocks?.map(b => ({ type: b.type, content: b.content?.substring(0, 50) })),
        pageContent: page.content?.substring(0, 100)
      });
      
      // 2. Générer le HTML à partir des blocs pour l'aperçu
      let previewContent = page.content || '';
      
      if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
        previewContent = page.blocks.map(block => {
          switch (block.type) {
            case 'h2':
              return block.content ? `<h2>${block.content}</h2>` : '';
            case 'h3':
              return block.content ? `<h3>${block.content}</h3>` : '';
            case 'content':
              return block.content || '';
            case 'image':
              return block.image?.src ? `<img src="${block.image.src}" alt="${block.image.alt || ''}" />` : '';
            case 'cta':
              return (block.ctaText || block.ctaLink) ? 
                `<div class="cta-block"><p>${block.ctaText || ''}</p><a href="${block.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
            default:
              return '';
          }
        }).filter(html => html.trim() !== '').join('\n');
      }
      
      if (!previewContent || previewContent.trim() === '') {
        previewContent = `<p>Contenu de la page en cours de rédaction...</p>`;
      }
      
      // 3. Créer la page avec le contenu généré
      const previewPage = {
        ...page,
        content: previewContent
      };
      
      // 4. Récupérer le contenu complet pour mettre à jour la section pages
      const contentResponse = await fetch('/api/content');
      const fullContent = await contentResponse.json();
      
      // 5. Mettre à jour la page dans la liste des pages
      console.log('🔍 Recherche de la page dans la liste:', {
        pageId: page.id,
        pageSlug: page.slug,
        existingPages: fullContent.pages?.pages?.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title })) || []
      });
      
      const updatedPages = fullContent.pages?.pages?.map((p: any) => 
        (p.id === page.id || p.slug === page.slug) ? previewPage : p
      ) || [];
      
      console.log('✅ Page mise à jour dans l\'aperçu:', {
        updatedPagesCount: updatedPages.length,
        previewPage: {
          title: previewPage.title,
          slug: previewPage.slug,
          hasContent: !!previewPage.content,
          contentLength: previewPage.content?.length || 0
        }
      });
      
      const previewContentData = {
        ...fullContent,
        pages: {
          ...fullContent.pages,
          pages: updatedPages
        },
        _isPreview: true,
        _previewId: previewId,
        _originalPage: 'pages'
      };
      
      // 6. Sauvegarder la révision temporaire
      const response = await fetch('/api/admin/preview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previewId,
          content: previewContentData,
          page: 'pages'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'aperçu');
      }
      
      // 7. Ouvrir l'URL spéciale d'aperçu
      window.open(`/pages/${page.slug || page.id}?preview=${previewId}`, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu page:', err);
      toast.error('Erreur lors de la création de l\'aperçu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Page non trouvée</h1>
          <button 
            onClick={() => router.push('/admin/pages')}
            className="text-blue-600 hover:text-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[256px_1fr]">
      {/* Sidebar gauche */}
      <Sidebar 
        currentPage={pageId === 'new' ? 'pages' : (page?.id || pageId)}
      />

      {/* Zone principale */}
      <div className="flex flex-col">
        {/* Header avec SaveBar sticky */}
        <HeaderAdmin
          title={pageId === 'new' ? 'Nouvelle page' : page.title}
          backButton={{
            text: '← Retour aux pages',
            onClick: () => router.push('/admin/pages')
          }}
          actions={{
            hasUnsavedChanges,
            saveStatus,
            onPreview: handlePreview,
            onSaveDraft: () => handleSaveWithStatus('draft'),
            onPublish: () => handleSaveWithStatus('published'),
            previewDisabled: saveStatus === 'saving',
            saveDisabled: !hasUnsavedChanges || saveStatus === 'saving',
            publishDisabled: !hasUnsavedChanges || saveStatus === 'saving',
            previewTitle: 'Aperçu de la page',
            draftTitle: 'Enregistrer comme brouillon'
          }}
        />

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal de la page
              </label>
              <input
                type="text"
                value={page.title || ''}
                onChange={(e) => updatePage({ title: e.target.value })}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Titre principal de la page..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Ce titre sera affiché en grand sur la page
              </p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={page.slug || ''}
                onChange={(e) => updatePage({ slug: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="url-de-la-page"
              />
              <p className="text-sm text-gray-500 mt-1">
                L'URL sera : /{page.slug || 'url-de-la-page'}
              </p>
            </div>

            {/* Layout de la page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout de la page
              </label>
              <select
                value={page.layout || 'single-column'}
                onChange={(e) => updatePage({ layout: e.target.value as 'single-column' | 'two-columns' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="single-column">Une colonne (layout simple)</option>
                <option value="two-columns">Deux colonnes (avec sidebar sticky)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {page.layout === 'two-columns' 
                  ? 'La page aura une colonne gauche sticky et une colonne droite pour le contenu'
                  : 'La page aura un layout simple en une seule colonne'
                }
              </p>
            </div>

            {/* Éditeur de blocs avec IA intégrée */}
            <BlockEditor
              pageData={page}
              pageKey="custom"
              onUpdate={updatePage}
            />
          </div>
        </main>
      </div>
    </div>
  );
} 
