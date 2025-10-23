import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { Content } from '@/types/content';

export const useAdminPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirmDialog();
  
  // State pour le modal de génération d'articles
  const [showArticleGenerator, setShowArticleGenerator] = useState(false);
  
  // Fonction helper pour obtenir le chemin d'une page
  const getPagePath = (pageId: string) => {
    const pageConfigs = {
      home: '/',
      studio: '/studio',
      contact: '/contact',
      work: '/work',
      blog: '/blog',
      nav: null,
      metadata: null,
      templates: null,
      footer: null,
      backup: null
    };
    return pageConfigs[pageId as keyof typeof pageConfigs] || '/';
  };
  
  const getPageConfig = (pageId: string) => {
    const pageConfigs = {
      home: { label: 'Accueil', path: '/', icon: '🏠' },
      studio: { label: 'Studio', path: '/studio', icon: '🎨' },
      contact: { label: 'Contact', path: '/contact', icon: '📧' },
      work: { label: 'Portfolio', path: '/work', icon: '💼' },
      blog: { label: 'Blog', path: '/blog', icon: '📝' },
      nav: { label: 'Navigation', path: null, icon: '🧭' },
      metadata: { label: 'Métadonnées', path: null, icon: '⚙️' },
      templates: { label: 'Templates', path: null, icon: '🎨' },
      footer: { label: 'Footer', path: null, icon: '🦶' },
      backup: { label: 'Sauvegarde', path: null, icon: '💾' }
    };
    return pageConfigs[pageId as keyof typeof pageConfigs];
  };
  
  const [content, setContent] = useState<Content | null>(null);
  const [originalContent, setOriginalContent] = useState<Content | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published');
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [headerManagerRef, setHeaderManagerRef] = useState(null);

  // Charger le contenu initial
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

  // Initialiser la page depuis l'URL (une seule fois)
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl && ['home', 'studio', 'contact', 'work', 'blog', 'nav', 'metadata', 'templates', 'footer', 'backup'].includes(pageFromUrl)) {
      setCurrentPage(pageFromUrl);
    } else {
      const defaultPage = sessionStorage.getItem('adminDefaultPage');
      if (defaultPage) {
        setCurrentPage(defaultPage);
        sessionStorage.removeItem('adminDefaultPage');
      }
    }
  }, []);

  // Gérer les changements d'URL
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    
    const handleNavigationChange = async () => {
      if (pageFromUrl !== currentPage && ['home', 'studio', 'contact', 'work', 'blog', 'nav', 'metadata', 'templates', 'footer', 'backup'].includes(pageFromUrl)) {
        if (hasUnsavedChanges) {
          const confirmLeave = await confirm({
            title: 'Modifications non enregistrées',
            description: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page sans enregistrer ?',
            confirmText: 'Quitter sans enregistrer',
            cancelText: 'Rester sur la page',
            variant: 'destructive'
          });
          
          if (!confirmLeave) {
            window.history.pushState(null, '', `/admin?page=${currentPage}`);
            return;
          }
          
          setHasUnsavedChanges(false);
          setSaveStatus('idle');
          if (originalContent) {
            setContent(originalContent);
          }
        }
        
        setCurrentPage(pageFromUrl);
        // Réinitialiser l'état des modifications lors du changement de page
        setHasUnsavedChanges(false);
        setSaveStatus('idle');
      }
    };
    
    handleNavigationChange();
  }, [searchParams]);

  // Fonction pour changer de page avec confirmation si modifications non sauvegardées
  const handlePageChange = async (newPage: string) => {
    // Vérifier si on change vraiment de page
    if (newPage === currentPage) {
      return;
    }

    if (hasUnsavedChanges) {
      // Utilisation de window.confirm (fonctionne toujours)
      const confirmLeave = window.confirm('Modifications non enregistrées\n\nVous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page sans enregistrer ?');
      
      if (!confirmLeave) {
        return;
      }
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
      
      if (originalContent) {
        setContent(originalContent);
      }
    }
    
    setCurrentPage(newPage);
    
    // Navigation spéciale pour la page IA
    if (newPage === 'ai') {
      router.replace('/admin/ai');
    } else {
      router.replace(`/admin?page=${newPage}`);
    }
    
    // Réinitialiser l'état des modifications lors du changement de page
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      const cleanData = cleanContent(data);
      
      setContent(cleanData);
      setOriginalContent(cleanData);
      setPageStatus('published');
      setHasUnsavedChanges(false);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWithStatus = async (status: 'draft' | 'published') => {
    if (!content) {
      console.error('❌ Aucun contenu à sauvegarder');
      return;
    }

    try {
      setSaveStatus('saving');
      setIsJustSaved(true);
      
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, status })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setSaveStatus('success');
      setHasUnsavedChanges(false);
      setOriginalContent(content);
      setPageStatus(status);
      
      setTimeout(() => {
        setSaveStatus('idle');
        setIsJustSaved(false);
      }, 2000);

    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setSaveStatus('error');
      setIsJustSaved(false);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreview = async () => {
    if (!content) return;
    
    try {
      const previewId = `preview-${Date.now()}`;
      
      const previewContent = {
        ...content,
        _isPreview: true,
        _previewId: previewId,
        _originalPage: currentPage,
        _status: pageStatus
      };
      
      const response = await fetch('/api/admin/preview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previewId,
          content: previewContent,
          page: currentPage
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'aperçu');
      }
      
      const previewPath = getPagePath(currentPage);
      let previewUrl = `${previewPath}?preview=${previewId}`;
      if (content._template === 'minimaliste-premium') {
        previewUrl = `/?template=minimaliste-premium&preview=${previewId}`;
      }
      
      window.open(previewUrl, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu:', err);
      toast.error('Erreur lors de la création de l\'aperçu');
    }
  };

  const updateContent = (pageKey: string, updates: any) => {
    if (!content) {
      return;
    }
    
    // Vérifier si on est en train de changer de page
    if (pageKey !== currentPage) {
      return;
    }
    
    
    if (isJustSaved) {
      return;
    }
    
    if (isPageLoading) {
      return;
    }
    
    const newContent = { ...content };
    
    if (pageKey === 'nav') {
      newContent.nav = { ...newContent.nav, ...updates };
    } else if (pageKey === 'metadata') {
      newContent.metadata = { ...newContent.metadata, ...updates };
    } else if (pageKey === 'footer') {
      newContent.footer = { ...newContent.footer, ...updates };
    } else {
      const currentPageData = newContent[pageKey as keyof Content];
      if (currentPageData && typeof currentPageData === 'object') {
        newContent[pageKey as keyof Content] = { ...currentPageData, ...updates };
      } else {
        newContent[pageKey as keyof Content] = updates;
      }
    }
    
    setContent(newContent);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const cleanContent = (data: any): Content => {
    const cleaned = { ...data };
    
    // Supprimer les propriétés temporaires
    delete cleaned._isPreview;
    delete cleaned._previewId;
    delete cleaned._originalPage;
    delete cleaned._status;
    
    return cleaned;
  };

  // Gestion des messages depuis l'aperçu
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'SAVE_FROM_PREVIEW') {
        console.log('📢 Demande de sauvegarde depuis l\'aperçu');
        console.log('📊 État de la page avant sauvegarde:', {
          currentPage,
          hasContent: !!content,
          hasUnsavedChanges
        });
        await handleSaveWithStatus('published');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, currentPage, hasUnsavedChanges]);

  const currentPageConfig = getPageConfig(currentPage);
  const currentPageData = content?.[currentPage as keyof Content];

  // Fonction pour gérer la génération d'articles
  const onArticleGenerated = async (article: any) => {
    console.log('📝 onArticleGenerated appelé avec:', article);
    console.log('📝 Contenu actuel:', content?.blog?.articles?.length || 0, 'articles');
    
    if (!content) {
      console.log('❌ Pas de contenu disponible');
      return;
    }
    
    // Ajouter l'article au contenu
    const updatedContent = {
      ...content,
      blog: {
        ...content.blog,
        articles: [
          ...(content.blog?.articles || []),
          article
        ]
      }
    };
    
    console.log('📝 Nouveau contenu:', updatedContent.blog?.articles?.length || 0, 'articles');
    console.log('📝 Dernier article ajouté:', updatedContent.blog?.articles?.[updatedContent.blog?.articles?.length - 1]);
    
    // Mettre à jour le contenu
    setContent(updatedContent);
    setOriginalContent(updatedContent);
    setHasUnsavedChanges(true);
    
    // Afficher un message de succès
    console.log('✅ Article ajouté au blog:', article.title);
    
    // Sauvegarder automatiquement l'article
    try {
      console.log('💾 Sauvegarde automatique de l\'article...');
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
      });
      
      if (response.ok) {
        console.log('✅ Article sauvegardé avec succès');
        setHasUnsavedChanges(false);
        setOriginalContent(updatedContent);
      } else {
        console.log('❌ Erreur lors de la sauvegarde automatique');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde automatique:', error);
    }
    
    setShowArticleGenerator(false);
  };

  return {
    // State
    content,
    setContent,
    originalContent,
    setOriginalContent,
    currentPage,
    setCurrentPage,
    isPreviewMode,
    setIsPreviewMode,
    loading,
    setLoading,
    error,
    setError,
    saveStatus,
    setSaveStatus,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    pageStatus,
    setPageStatus,
    isJustSaved,
    setIsJustSaved,
    isPageLoading,
    setIsPageLoading,
    headerManagerRef,
    setHeaderManagerRef,
    showArticleGenerator,
    setShowArticleGenerator,
    
    // Data
    currentPageConfig,
    currentPageData,
    
    // Functions
    getPagePath,
    getPageConfig,
    handlePageChange,
    fetchContent,
    handleSaveWithStatus,
    handlePreview,
    updateContent,
    cleanContent,
    onArticleGenerated,
  };
};
