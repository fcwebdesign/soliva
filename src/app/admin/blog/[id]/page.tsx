"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPageLayout from '../../components/AdminPageLayout';
import BlockEditor from '../../components/BlockEditor';
import SeoBlock from '@/components/admin/SeoBlock';
import SchemaScript from '@/components/SchemaScript';
import { generateAllSchemas } from '@/lib/schema';
import type { Content } from '@/types/content';
import slugify from 'slugify';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../components/StatusBadge';
import { Eye, Save, Send, ArrowLeft } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content?: string;
  slug?: string;
  status?: 'draft' | 'published';
  publishedAt?: string;
  excerpt?: string;
  blocks?: any[];
  hasCustomSlug?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    schemas?: any[];
    suggestedInternalLinks?: Array<{
      url: string;
      label: string;
      reason: string;
    }>;
  };
}

export default function BlogArticleEdit() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  
  const [content, setContent] = useState<Content | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger le contenu et trouver l'article
  useEffect(() => {
    fetchContent();
  }, []);

  // Réinitialiser hasUnsavedChanges seulement au chargement initial
  useEffect(() => {
    if (article && !loading) {
      console.log('🔄 Réinitialisation hasUnsavedChanges au chargement initial:', {
        articleId: article.id,
        articleTitle: article.title,
        loading,
        hasUnsavedChanges: false
      });
      setHasUnsavedChanges(false);
    }
  }, [loading]); // ← Supprimer 'article' des dépendances pour éviter les réinitialisations

  // Debug: Afficher l'état de hasUnsavedChanges
  useEffect(() => {
    console.log('🔍 État hasUnsavedChanges:', {
      hasUnsavedChanges,
      articleId: article?.id,
      loading
    });
  }, [hasUnsavedChanges, article, loading]);


  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setContent(data);
      
      // Trouver l'article par ID
      const foundArticle = data.blog?.articles?.find((a: Article) => a.id === articleId);
      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        // Créer un nouvel article si pas trouvé
        const newArticle = {
          id: articleId === 'new' ? `article-${Date.now()}` : articleId,
          title: 'Nouvel article',
          content: '',
          status: 'draft' as const
        };
        setArticle(newArticle);
        
        // Ajouter l'article au contenu s'il n'existe pas
        const newContent = { ...data };
        if (!newContent.blog) newContent.blog = { hero: { title: '', subtitle: '' }, description: '', articles: [] };
        if (!newContent.blog.articles) newContent.blog.articles = [];
        
        newContent.blog.articles.push(newArticle);
        
        setContent(newContent);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = (updates: Partial<Article>) => {
    if (!article) return;
    
    console.log('📝 updateArticle appelé:', {
      updates,
      currentHasUnsavedChanges: hasUnsavedChanges,
      willSetTo: true
    });
    
    // Auto-génération du slug en temps réel si le titre change
    if (updates.title && !article.hasCustomSlug) {
      const autoSlug = slugify(updates.title, {
        lower: true,           // Tout en minuscules
        strict: true,          // Supprime les caractères spéciaux
        locale: 'fr'           // Gestion des accents français
      });
      
      updates.slug = autoSlug;
      updates.id = autoSlug;   // Mettre à jour l'ID aussi
    }
    
    // Si on modifie manuellement le slug, marquer comme personnalisé
    if (updates.slug && updates.slug !== article.slug) {
      updates.hasCustomSlug = true;
    }
    const updatedArticle = { ...article, ...updates } as Article;
    setArticle(updatedArticle);
    setHasUnsavedChanges(true);
  };

  const handleSaveWithStatus = async (status: 'draft' | 'published') => {
    if (!article || !content) return;
    
    // Mettre à jour le statut et la date de publication si nécessaire
    const updatedArticle = {
      ...article,
      status,
      ...(status === 'published' && article.status !== 'published' && {
        publishedAt: new Date().toISOString()
      })
    };
    
    // Mettre à jour l'état local avant la sauvegarde
    setArticle(updatedArticle);
    
    // Utiliser la logique de sauvegarde existante
    await handleSaveInternal(updatedArticle);
  };

  const handleSave = () => handleSaveWithStatus(article?.status || 'draft');

  // Écouter les messages de l'aperçu
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'SAVE_FROM_PREVIEW') {
        console.log('📢 Demande de sauvegarde depuis l\'aperçu');
        console.log('📊 État de l\'article avant sauvegarde:', {
          hasArticle: !!article,
          hasBlocks: !!article?.blocks,
          blocksCount: article?.blocks?.length || 0,
          hasContent: !!article?.content,
          contentLength: article?.content?.length || 0
        });
        // Sauvegarder automatiquement l'article actuel
        await handleSaveWithStatus('published');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [article]);


  const handlePreview = async () => {
    if (!article) return;
    
    try {
      // 1. Créer une révision temporaire avec les modifications actuelles
      const previewId = `preview-${Date.now()}`;
      console.log('📝 Création aperçu article:', {
        articleId: article.id,
        slug: article.slug,
        hasUnsavedChanges,
        blocksCount: article.blocks?.length || 0,
        blocks: article.blocks?.map(b => ({ type: b.type, content: b.content?.substring(0, 50) })),
        articleContent: article.content?.substring(0, 100)
      });
      
      // 2. Générer le HTML à partir des blocs pour l'aperçu
      let previewContent = article.content || '';
      
      if (article.blocks && Array.isArray(article.blocks) && article.blocks.length > 0) {
        previewContent = article.blocks.map(block => {
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
        previewContent = `<p>Contenu de l'article en cours de rédaction...</p>`;
      }
      
      // 3. Créer l'article avec le contenu généré (assurer un slug/id stable)
      const fallbackSlug = slugify(article.title || (article.slug || article.id || ''), {
        lower: true,
        strict: true,
        locale: 'fr'
      });
      const computedSlug = article.slug || article.id || fallbackSlug || `article-${Date.now()}`;
      const previewArticle = {
        ...article,
        id: article.id || computedSlug,
        slug: computedSlug,
        content: previewContent
      } as Article;
      
      // 4. Récupérer le contenu complet pour mettre à jour la section blog
      // Utiliser /api/content/metadata pour les métadonnées
      const contentResponse = await fetch('/api/content/metadata');
      const fullContent = await contentResponse.json();
      
      // 5. Mettre à jour l'article dans la liste des articles
      console.log('🔍 Recherche de l\'article dans la liste:', {
        articleId: article.id,
        articleSlug: article.slug,
        existingArticles: fullContent.blog.articles.map((a: any) => ({ id: a.id, slug: a.slug, title: a.title }))
      });
      
      const updatedArticles = fullContent.blog.articles.map((a: any) => 
        (a.id === article.id || a.slug === article.slug) ? previewArticle : a
      );

      // Si l'article n'existe pas encore dans le contenu (brouillon non sauvegardé), l'ajouter
      const existsInList = fullContent.blog.articles.some((a: any) => (a.id === article.id || a.slug === article.slug));
      if (!existsInList) {
        updatedArticles.push(previewArticle);
        console.log('➕ Article draft ajouté à la prévisualisation (non présent dans le contenu publié):', {
          id: previewArticle.id,
          slug: previewArticle.slug,
          title: previewArticle.title
        });
      }
      
      console.log('✅ Article mis à jour dans l\'aperçu:', {
        updatedArticlesCount: updatedArticles.length,
        previewArticle: {
          title: previewArticle.title,
          slug: previewArticle.slug,
          hasContent: !!previewArticle.content,
          contentLength: previewArticle.content?.length || 0
        }
      });
      
      const previewContentData = {
        ...fullContent,
        blog: {
          ...fullContent.blog,
          articles: updatedArticles
        },
        _isPreview: true,
        _previewId: previewId,
        _originalPage: 'blog'
      };
      
      // 6. Sauvegarder la révision temporaire
      const response = await fetch('/api/admin/preview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previewId,
          content: previewContentData,
          page: 'blog'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'aperçu');
      }
      
      // 7. Ouvrir l'URL spéciale d'aperçu (utiliser le slug calculé pour correspondre au contenu preview)
      window.open(`/blog/${previewArticle.slug || previewArticle.id}?preview=${previewId}`, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu article:', err);
      toast.error('Erreur lors de la création de l\'aperçu');
    }
  };

  const handleSaveInternal = async (articleToSave: Article = article!) => {
    if (!articleToSave || !content) return;
    
    try {
      setSaveStatus('saving');
      
      // Forcer la génération du HTML à partir des blocs s'ils existent
      let finalContent = articleToSave.content || '';
      
      if (articleToSave.blocks && Array.isArray(articleToSave.blocks) && articleToSave.blocks.length > 0) {
        console.log('🔄 Génération du HTML à partir des blocs pour sauvegarde');
        finalContent = articleToSave.blocks.map(block => {
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
      
      // Nettoyer le contenu de l'article avant sauvegarde
      const cleanArticleContent = (content: string) => {
        if (!content) return '';
        
        // Supprimer les anciens blocs invalides du contenu HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Supprimer les éléments qui correspondent aux anciens blocs
        const invalidElements = tempDiv.querySelectorAll('[data-block-type="list"], [data-block-type="quote"]');
        invalidElements.forEach(el => el.remove());
        
        return tempDiv.innerHTML;
      };
      
      // Nettoyer le contenu de l'article
      const cleanedArticle = {
        ...articleToSave,
        content: cleanArticleContent(finalContent)
      };
      
      console.log('💾 Article à sauvegarder:', {
        id: cleanedArticle.id,
        title: cleanedArticle.title,
        status: cleanedArticle.status,
        publishedAt: cleanedArticle.publishedAt,
        contentLength: cleanedArticle.content?.length || 0,
        contentPreview: cleanedArticle.content?.substring(0, 100),
        hasBlocks: !!cleanedArticle.blocks,
        blocksCount: cleanedArticle.blocks?.length || 0
      });
      
      // Mettre à jour l'article dans le contenu
      const newContent = { ...content };
      const articleIndex = newContent.blog.articles.findIndex((a: Article) => a.id === articleId);
      
      console.log('💾 Sauvegarde article:', { articleId, cleanedArticle, articleIndex });
      console.log('💾 Contenu avant sauvegarde:', JSON.stringify(newContent.blog.articles, null, 2));
      
      if (articleIndex >= 0) {
        newContent.blog.articles[articleIndex] = cleanedArticle;
      } else {
        newContent.blog.articles.push(cleanedArticle);
      }
      
      console.log('💾 Contenu après sauvegarde:', JSON.stringify(newContent.blog.articles, null, 2));
      
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
      setArticle(cleanedArticle);
      setHasUnsavedChanges(false);
      setSaveStatus('success');
      
      // Réinitialiser le statut de sauvegarde après un délai
      setTimeout(() => {
        setSaveStatus('idle');
      }, 1000);
    } catch (err) {
      console.error('Erreur:', err);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Article non trouvé</h1>
          <button 
            onClick={() => router.push('/admin/blog')}
            className="text-blue-600 hover:text-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  // Générer le schéma JSON-LD
  const schemaJson = article ? generateAllSchemas({
    title: article.title || '',
    excerpt: article.excerpt,
    content: Array.isArray(article.blocks) 
      ? article.blocks.map(block => block.content || '').join(' ')
      : article.content || '',
    publishedAt: article.publishedAt,
    updatedAt: article.publishedAt,
    slug: article.slug || article.id || '',
    schemas: article.seo?.schemas
  }) : '';

  // Actions pour le header
  const headerActions = (
    <>
      <Button
        onClick={() => router.push('/admin?page=blog')}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au blog
      </Button>
      
      <StatusBadge status={article.status === 'published' ? 'published' : 'draft'} />
      
      {hasUnsavedChanges && (
        <StatusBadge status="pending" />
      )}
      
      <Button
        onClick={hasUnsavedChanges ? handlePreview : () => window.open(`/blog/${article.slug || article.id}`, '_blank')}
        variant="outline"
        size="sm"
        disabled={saveStatus === 'saving'}
        title={hasUnsavedChanges ? "Aperçu avec les modifications non sauvegardées" : "Voir l'article publié"}
      >
        <Eye className="w-4 h-4 mr-1" />
        Aperçu
      </Button>
      
      <Button
        onClick={() => handleSaveWithStatus('draft')}
        variant="secondary"
        size="sm"
        disabled={saveStatus === 'saving'}
        title={article.status === 'published' ? "Repasser l'article en brouillon" : "Enregistrer comme brouillon"}
      >
        <Save className="w-4 h-4 mr-1" />
        {saveStatus === 'saving' ? 'Sauvegarde...' : 'Brouillon'}
      </Button>
      
      <Button
        onClick={() => handleSaveWithStatus('published')}
        variant="default"
        size="sm"
        disabled={saveStatus === 'saving'}
      >
        <Send className="w-4 h-4 mr-1" />
        {article.status === 'published' ? 'Mettre à jour' : 'Publier'}
      </Button>
    </>
  );

  return (
    <>
      {/* Injection du schéma JSON-LD */}
      {schemaJson && <SchemaScript schema={schemaJson} />}
      
      <AdminPageLayout
        title={article.title || 'Nouvel article'}
        description={article.publishedAt ? `Publié le ${new Date(article.publishedAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}` : 'Article en cours de création'}
        currentPage="blog"
        loading={loading}
        actions={headerActions}
      >
        <div className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'article
              </label>
              <input
                type="text"
                value={article.title || ''}
                onChange={(e) => updateArticle({ title: e.target.value })}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Titre de l'article..."
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Slug (URL)
                </label>
                {article.hasCustomSlug && (
                  <button
                    onClick={() => {
                      const autoSlug = slugify(article.title || '', {
                        lower: true,
                        strict: true,
                        locale: 'fr'
                      });
                      updateArticle({ 
                        slug: autoSlug,
                        id: autoSlug,
                        hasCustomSlug: false
                      });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                    title="Réinitialiser le slug automatiquement à partir du titre"
                  >
                    🔄 Réinitialiser automatiquement
                  </button>
                )}
              </div>
              <input
                type="text"
                value={article.slug || article.id || ''}
                onChange={(e) => {
                  const newSlug = e.target.value;
                  updateArticle({ 
                    slug: newSlug,
                    id: newSlug // Mettre à jour l'ID avec le slug
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="slug-de-larticle"
              />
              {!article.hasCustomSlug && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Le slug se génère automatiquement à partir du titre
                </p>
              )}
            </div>


            {/* Éditeur de blocs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'article
              </label>
              <BlockEditor
                pageData={article}
                pageKey="article"
                onUpdate={(updates) => updateArticle(updates)}
              />
            </div>

            {/* Extrait */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extrait (résumé)
              </label>
              <textarea
                value={article.excerpt || ''}
                onChange={(e) => updateArticle({ excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Résumé de l'article..."
              />
            </div>

            {/* Bloc SEO intégré */}
            <SeoBlock
              content={{
                id: article.id,
                type: 'article',
                title: article.title || '',
                slug: article.slug || article.id || '',
                contentHtml: Array.isArray(article.blocks) ? article.blocks : (article.content || ''),
                excerpt: article.excerpt,
                category: '',
                tags: [],
                publishedAt: article.publishedAt,
                updatedAt: article.publishedAt,
                seo: {}
              }}
              seoFields={article.seo || {}}
              onSeoChange={(seo) => {
                console.log('SEO mis à jour:', seo);
                // Sauvegarder les champs SEO dans l'article
                updateArticle({ seo });
              }}
            />
        </div>
      </AdminPageLayout>
    </>
  );
} 
