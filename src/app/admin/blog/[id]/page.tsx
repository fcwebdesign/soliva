"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import HeaderAdmin from '../../components/HeaderAdmin';
import BlockEditor from '../../components/BlockEditor';
import type { Content } from '@/types/content';
import slugify from 'slugify';

const PAGES = [
  { id: 'home', label: 'Accueil', path: '/', icon: '🏠' },
  { id: 'studio', label: 'Studio', path: '/studio', icon: '🎨' },
  { id: 'contact', label: 'Contact', path: '/contact', icon: '📧' },
  { id: 'work', label: 'Portfolio', path: '/work', icon: '💼' },
  { id: 'blog', label: 'Blog', path: '/blog', icon: '📝' },
];

const SETTINGS = [
  { id: 'nav', label: 'Navigation', path: null, icon: '🧭' },
  { id: 'metadata', label: 'Métadonnées', path: null, icon: '⚙️' },
  { id: 'backup', label: 'Sauvegarde', path: null, icon: '💾' },
];

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
      
      // 3. Créer l'article avec le contenu généré
      const previewArticle = {
        ...article,
        content: previewContent
      };
      
      // 4. Récupérer le contenu complet pour mettre à jour la section blog
      const contentResponse = await fetch('/api/content');
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
      
      // 7. Ouvrir l'URL spéciale d'aperçu
      window.open(`/blog/${article.slug || article.id}?preview=${previewId}`, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu article:', err);
      alert('Erreur lors de la création de l\'aperçu');
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

  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[256px_1fr]">
      {/* Sidebar gauche */}
      <Sidebar 
        currentPage="blog"
      />

      {/* Zone principale */}
      <div className="flex flex-col">
        {/* Header avec SaveBar sticky */}
        <HeaderAdmin
          title={article.title || 'Nouvel article'}
          backButton={{
            text: '← Retour au blog',
            onClick: () => router.push('/admin?page=blog')
          }}
          actions={{
            hasUnsavedChanges,
            saveStatus,
            onPreview: hasUnsavedChanges ? handlePreview : () => window.open(`/blog/${article.slug || article.id}`, '_blank'),
            onSaveDraft: () => handleSaveWithStatus('draft'),
            onPublish: () => handleSaveWithStatus('published'),
            previewDisabled: saveStatus === 'saving',
            saveDisabled: saveStatus === 'saving',
            publishDisabled: saveStatus === 'saving',
            previewTitle: hasUnsavedChanges ? "Aperçu avec les modifications non sauvegardées" : "Voir l'article publié",
            draftTitle: article.status === 'published' ? "Repasser l'article en brouillon" : "Enregistrer comme brouillon"
          }}
        />

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
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

            {/* Informations de statut */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                  </span>
                </div>
                {article.publishedAt && (
                  <div className="text-sm text-gray-500">
                    Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
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
          </div>
        </main>
      </div>
    </div>
  );
} 