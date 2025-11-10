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
      reveal: null,
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
      typography: { label: 'Typographie', path: null, icon: '🔤' },
      colors: { label: 'Palette de Couleurs', path: null, icon: '🎨' },
      reveal: { label: 'Preloader / Reveal', path: null, icon: '✨' },
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

  // Écouter les changements de navigation/footer pour activer la barre de sauvegarde
  useEffect(() => {
    const markDirty = () => {
      setHasUnsavedChanges(true);
      setSaveStatus('idle');
    };
    window.addEventListener('navigation-changed', markDirty as any);
    window.addEventListener('footer-changed', markDirty as any);
    return () => {
      window.removeEventListener('navigation-changed', markDirty as any);
      window.removeEventListener('footer-changed', markDirty as any);
    };
  }, []);

  // Initialiser la page depuis l'URL (une seule fois)
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl && ['home', 'studio', 'contact', 'work', 'blog', 'nav', 'metadata', 'typography', 'colors', 'reveal', 'templates', 'footer', 'backup'].includes(pageFromUrl)) {
      setCurrentPage(pageFromUrl);
    } else {
      const defaultPage = sessionStorage.getItem('adminDefaultPage');
      if (defaultPage) {
        setCurrentPage(defaultPage);
        sessionStorage.removeItem('adminDefaultPage');
      }
    }
  }, []);

  // Gérer les changements d'URL (TEMPORAIREMENT DÉSACTIVÉ - cause des conflits)
  /*
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    const allowed = ['home', 'studio', 'contact', 'work', 'blog', 'nav', 'metadata', 'reveal', 'templates', 'footer', 'backup'];

    console.log('🌐 [URL] useEffect déclenché - pageFromUrl:', pageFromUrl, 'currentPage:', currentPage);

    const handleNavigationChange = async () => {
      console.log('🌐 [URL] handleNavigationChange appelé');
      
      if (!pageFromUrl || !allowed.includes(pageFromUrl)) {
        console.log('🌐 [URL] Page non autorisée ou vide:', pageFromUrl);
        return;
      }

      // Éviter les conflits avec handlePageChange - ne traiter que les changements d'URL externes
      if (pageFromUrl === currentPage) {
        console.log('🌐 [URL] Même page, pas de changement:', pageFromUrl);
        return;
      }
      
      console.log('🌐 [URL] Changement d\'URL externe détecté:', pageFromUrl);

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

      console.log('🌐 [URL] Mise à jour currentPage vers:', pageFromUrl);
      setCurrentPage(pageFromUrl);
      // Réinitialiser l'état des modifications lors du changement de page
      setHasUnsavedChanges(false);
      setSaveStatus('idle');

      // Navigation spéciale pour la page IA
      if (pageFromUrl === 'ai') {
        console.log('🌐 [URL] Redirection vers IA');
        router.replace('/admin/ai');
      } else {
        console.log('🌐 [URL] Redirection vers:', `/admin?page=${pageFromUrl}`);
        router.replace(`/admin?page=${pageFromUrl}`);
      }
      
      console.log('✅ [URL] Navigation terminée');
    };

    handleNavigationChange();
  }, [searchParams, currentPage, hasUnsavedChanges, originalContent]);
  */

  // Fonction pour changer de page avec confirmation si modifications non sauvegardées
  const handlePageChange = async (newPage: string) => {
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
    let controller: AbortController | null = null;
    let timeout: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      // Utiliser un timeout pour éviter un chargement infini si l'API ne répond pas
      controller = new AbortController();
      timeout = setTimeout(() => {
        if (controller && !controller.signal.aborted) {
          controller.abort();
        }
      }, 10000); // 10s
      
      const response = await fetch('/api/admin/content', { 
        cache: 'no-store', 
        signal: controller.signal 
      });
      
      // Nettoyer le timeout si la requête réussit
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
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
      // Nettoyer le timeout en cas d'erreur
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      // Ignorer les erreurs d'abort si elles sont attendues (timeout ou navigation)
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Ne pas afficher d'erreur si c'est un timeout normal ou une navigation
        if (process.env.NODE_ENV === 'development') {
          console.warn('Requête annulée (timeout ou navigation)');
        }
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur chargement contenu:', err);
      }
      
      const message = err instanceof Error 
        ? err.message 
        : 'Une erreur est survenue';
      setError(message);
    } finally {
      // Nettoyage final
      if (timeout) {
        clearTimeout(timeout);
      }
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
      // Construire une copie à sauvegarder et injecter les données live de nav/footer
      let contentToSave: any = { ...content };
      if (currentPage === 'nav' && typeof window !== 'undefined' && typeof (window as any).getCurrentHeaderData === 'function') {
        const hd = (window as any).getCurrentHeaderData();
        if (hd) {
          contentToSave = {
            ...contentToSave,
            nav: {
              logo: hd.logo,
              logoImage: hd.logoImage,
              location: hd.location,
              items: hd.pages,
              pageLabels: hd.pageLabels,
            },
          };
        }
      }
      if (currentPage === 'footer' && typeof window !== 'undefined' && typeof (window as any).getCurrentFooterData === 'function') {
        const fd = (window as any).getCurrentFooterData();
        if (fd) {
          contentToSave = {
            ...contentToSave,
            footer: {
              logo: fd.logo,
              logoImage: fd.logoImage,
              description: fd.description,
              links: fd.links,
              socialLinks: fd.socialLinks,
              copyright: fd.copyright,
              bottomLinks: fd.bottomLinks,
              legalPageLabels: fd.legalPageLabels,
            },
          };
        }
      }

      // Si on est sur la page metadata, propager la variante de header vers nav avant de sauvegarder
      if (currentPage === 'metadata') {
        const variant = (content as any)?.metadata?.nav?.headerVariant;
        if (variant) {
          contentToSave = {
            ...contentToSave,
            nav: {
              ...contentToSave.nav,
              headerVariant: variant,
            },
          };
        }
      }
      
      // Nettoyer le contenu pour éviter les références circulaires
      const cleanedContent = cleanContent(contentToSave);
      
      let controller: AbortController | null = null;
      let response: Response;
      
      try {
        // Créer un AbortController pour pouvoir annuler si nécessaire
        controller = new AbortController();
        
        response = await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: cleanedContent, status }),
          signal: controller.signal
        });

        if (!response.ok) {
          // Récupérer le message d'erreur du serveur si disponible
          let errorMessage = 'Erreur lors de la sauvegarde';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // Si la réponse n'est pas du JSON, utiliser le status
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
      } catch (err) {
        // Ignorer les erreurs d'abort (navigation ou annulation)
        if (err instanceof DOMException && err.name === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Sauvegarde annulée');
          }
          return;
        }
        throw err;
      }

      setSaveStatus('success');
      setHasUnsavedChanges(false);
      setOriginalContent(cleanedContent);
      setContent(cleanedContent);
      setPageStatus(status);
      
      // Notifier le front pour mise à jour live (Nav/Footer/Pages/Typography)
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('content-updated', {
            detail: {
              nav: contentToSave.nav,
              footer: contentToSave.footer,
              pages: contentToSave.pages,
              metadata: contentToSave.metadata, // Inclure metadata pour typography
            }
          }));
          // Déclencher un changement de storage pour forcer le rechargement
          localStorage.setItem('content-updated', String(Date.now()));
          // Déclencher un changement de storage pour les wrappers qui l'utilisent
          if (currentPage === 'footer') {
            localStorage.setItem('footer-updated', String(Date.now()));
          }
        }
      } catch {
        // ignore
      }
      
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
      if (content._template === 'starter') {
        previewUrl = `/?template=starter&preview=${previewId}`;
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
    } else if (pageKey === 'reveal') {
      // Pour reveal, on met à jour metadata.reveal
      if (!newContent.metadata) newContent.metadata = { title: '', description: '' };
      const metadata = newContent.metadata as any;
      metadata.reveal = { ...metadata.reveal, ...updates };
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
    // Fonction récursive pour nettoyer l'objet et supprimer les références circulaires
    const seen = new WeakSet();
    
    const clean = (obj: any): any => {
      // Gérer les valeurs primitives
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== 'object') return obj;
      
      // Détecter les références circulaires
      if (seen.has(obj)) {
        return undefined; // Supprimer les références circulaires
      }
      
      // Gérer les tableaux
      if (Array.isArray(obj)) {
        seen.add(obj);
        const cleaned = obj.map(item => clean(item)).filter(item => item !== undefined);
        seen.delete(obj);
        return cleaned;
      }
      
      // Gérer les objets
      seen.add(obj);
      const cleaned: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Ignorer les propriétés temporaires spécifiques
        if (['_isPreview', '_previewId', '_originalPage', '_status'].includes(key)) {
          continue;
        }
        
        // Ignorer les fonctions
        if (typeof value === 'function') {
          continue;
        }
        
        // Ignorer les symboles
        if (typeof value === 'symbol') {
          continue;
        }
        
        // Nettoyer récursivement
        const cleanedValue = clean(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      
      seen.delete(obj);
      return cleaned;
    };
    
    return clean(data) as Content;
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
  // Pour reveal, les données sont dans metadata.reveal
  const currentPageData = currentPage === 'reveal' 
    ? (content?.metadata as any)?.reveal 
    : content?.[currentPage as keyof Content];

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
