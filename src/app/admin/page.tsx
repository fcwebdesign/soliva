"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import BlockEditor from './components/BlockEditor';
import type { Content } from '@/types/content';

const PAGES = [
  { id: 'home', label: 'Accueil', path: '/', icon: '🏠' },
  { id: 'contact', label: 'Contact', path: '/contact', icon: '📧' },
  { id: 'studio', label: 'Studio', path: '/studio', icon: '🎨' },
  { id: 'work', label: 'Work', path: '/work', icon: '💼' },
  { id: 'blog', label: 'Blog', path: '/blog', icon: '📝' },
  { id: 'nav', label: 'Navigation', path: null, icon: '🧭' },
  { id: 'metadata', label: 'Métadonnées', path: null, icon: '⚙️' },
  { id: 'backup', label: 'Sauvegarde', path: null, icon: '💾' },
];

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [content, setContent] = useState<Content | null>(null);
  const [originalContent, setOriginalContent] = useState<Content | null>(null); // Contenu original pour comparaison
  const [currentPage, setCurrentPage] = useState('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published'); // Nouveau état pour le statut de la page
  const [isJustSaved, setIsJustSaved] = useState(false); // Flag pour éviter les modifications juste après sauvegarde
  const [isPageLoading, setIsPageLoading] = useState(false); // Flag pour éviter les modifications pendant le chargement

  // Charger le contenu initial
  useEffect(() => {
    fetchContent();
  }, []);

  // Initialiser la page depuis l'URL (une seule fois)
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl && PAGES.find(p => p.id === pageFromUrl)) {
      setCurrentPage(pageFromUrl);
    } else {
      // Vérifier s'il y a une page par défaut à afficher
      const defaultPage = sessionStorage.getItem('adminDefaultPage');
      if (defaultPage) {
        setCurrentPage(defaultPage);
        sessionStorage.removeItem('adminDefaultPage');
        router.replace(`/admin?page=${defaultPage}`);
      } else {
        // Page par défaut
        router.replace('/admin?page=home');
      }
    }
  }, []); // Pas de dépendances - s'exécute une seule fois

  // Confirmation avant de quitter si modifications non enregistrées
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Raccourci clavier Cmd/Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debug: surveiller les changements de hasUnsavedChanges
  useEffect(() => {
    console.log('🔍 hasUnsavedChanges changed:', hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  // Écouter les messages de publication depuis l'aperçu
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine pour la sécurité
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'PREVIEW_PUBLISHED') {
        console.log('📢 Publication reçue depuis l\'aperçu:', event.data.message);
        
        // Réinitialiser l'état des modifications
        setHasUnsavedChanges(false);
        setSaveStatus('success');
        
        // Recharger le contenu pour synchroniser
        fetchContent();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Gérer les changements de page avec confirmation
  useEffect(() => {
    console.log('📄 Page changed to:', currentPage);
    setSaveStatus('idle');
    
    // Bloquer les modifications pendant 2 secondes après changement de page
    setIsPageLoading(true);
    setTimeout(() => {
      setIsPageLoading(false);
      console.log('🟢 Page chargée, modifications autorisées');
    }, 2000);
  }, [currentPage]);

  // Détecter les changements d'URL (boutons précédent/suivant du navigateur)
  useEffect(() => {
    const pageFromUrl = searchParams.get('page') || 'home';
    if (pageFromUrl !== currentPage && PAGES.find(p => p.id === pageFromUrl)) {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'Vous avez des modifications non enregistrées.\n\nÊtes-vous sûr de vouloir quitter cette page sans enregistrer ?'
        );
        
        if (!confirmLeave) {
          // Restaurer l'URL précédente sans déclencher de re-render
          window.history.pushState(null, '', `/admin?page=${currentPage}`);
          return;
        }
        
        // L'utilisateur confirme, on supprime les modifications
        setHasUnsavedChanges(false);
        setSaveStatus('idle');
        if (originalContent) {
          setContent(originalContent);
        }
      }
      
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]); // Seulement searchParams comme dépendance

  // Fonction pour changer de page avec confirmation si modifications non sauvegardées
  const handlePageChange = (newPage: string) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'Vous avez des modifications non enregistrées.\n\nÊtes-vous sûr de vouloir quitter cette page sans enregistrer ?'
      );
      
      if (!confirmLeave) {
        return; // L'utilisateur annule, on reste sur la page
      }
      
      // L'utilisateur confirme, on supprime les modifications
      console.log('🗑️ Modifications supprimées par l\'utilisateur');
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
      
      // Recharger le contenu original pour annuler les modifications
      if (originalContent) {
        setContent(originalContent);
        console.log('🔄 Contenu restauré à l\'état original');
      }
    }
    
    // Changer de page et mettre à jour l'URL
    setCurrentPage(newPage);
    router.replace(`/admin?page=${newPage}`);
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      
      // Nettoyer le contenu des propriétés temporaires
      const cleanData = cleanContent(data);
      
      setContent(cleanData);
      setOriginalContent(cleanData); // Sauvegarder le contenu original pour comparaison
      
      // Définir le statut de la page (pour simplifier, on considère toutes les pages comme publiées par défaut)
      setPageStatus('published');
      
      // S'assurer que l'état des modifications non sauvegardées est réinitialisé
      setHasUnsavedChanges(false);
      console.log('✅ Contenu chargé et original sauvegardé');
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWithStatus = async (status: 'draft' | 'published') => {
    if (!content) return;
    
    try {
      console.log('💾 Début de la sauvegarde avec statut:', status);
      setSaveStatus('saving');
      setPageStatus(status);
      
      // Créer une copie du contenu sans les propriétés temporaires
      const contentToSave = cleanContent(content);
      
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToSave
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', response.status, response.statusText, errorData);
        throw new Error(`Erreur lors de la sauvegarde: ${response.status} ${response.statusText}${errorData.details ? ` - ${errorData.details}` : ''}`);
      }

      console.log('✅ Sauvegarde réussie');
      setSaveStatus('success');
      
      // Mettre à jour le contenu original avec le contenu sauvegardé
      const cleanedContent = cleanContent(content);
      setOriginalContent(cleanedContent);
      setContent(cleanedContent); // S'assurer que le contenu est aussi nettoyé
      
      // Réinitialiser complètement l'état
      setHasUnsavedChanges(false);
      setIsJustSaved(true);
      console.log('🔄 État réinitialisé après sauvegarde');
      
      // Réinitialiser le statut après 3 secondes et permettre les modifications
      setTimeout(() => {
        setSaveStatus('idle');
        setIsJustSaved(false);
      }, 3000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSave = () => handleSaveWithStatus(pageStatus);

  // Écouter les messages de l'aperçu
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'SAVE_FROM_PREVIEW') {
        console.log('📢 Demande de sauvegarde depuis l\'aperçu');
        console.log('📊 État de la page avant sauvegarde:', {
          currentPage,
          hasContent: !!content,
          hasUnsavedChanges
        });
        // Sauvegarder automatiquement la page actuelle
        await handleSaveWithStatus('published');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, currentPage, hasUnsavedChanges]);

  const handlePreview = async () => {
    if (!content) return;
    
    try {
      // 1. Créer une révision temporaire avec les modifications actuelles
      const previewId = `preview-${Date.now()}`;
      console.log('📝 Création aperçu avec contenu:', {
        currentPage,
        hasUnsavedChanges,
        contentKeys: Object.keys(content),
        currentPageContent: content[currentPage as keyof typeof content],
        fullContent: JSON.stringify(content).substring(0, 500) + '...'
      });
      
      const previewContent = {
        ...content, // Utiliser le contenu avec les modifications
        _isPreview: true,
        _previewId: previewId,
        _originalPage: currentPage,
        _status: pageStatus // Ajouter le statut actuel de la page
      };
      
      // 2. Sauvegarder la révision temporaire
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
      
      // 3. Ouvrir l'URL spéciale d'aperçu
      const previewPath = PAGES.find(p => p.id === currentPage)?.path || '/';
      window.open(`${previewPath}?preview=${previewId}`, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu:', err);
      alert('Erreur lors de la création de l\'aperçu');
    }
  };

  const updateContent = (pageKey: string, updates: any) => {
    if (!content) {
      console.log('⚠️ updateContent appelé sans contenu');
      return;
    }
    
    console.log(`📝 updateContent appelé:`, { 
      pageKey, 
      updates: JSON.stringify(updates).substring(0, 100),
      currentHasUnsavedChanges: hasUnsavedChanges,
      isJustSaved,
      isPageLoading,
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
    });
    
    // Ignorer les modifications juste après une sauvegarde
    if (isJustSaved) {
      console.log('⏳ Modification ignorée - vient de sauvegarder');
      return;
    }
    
    // Ignorer les modifications pendant le chargement de la page
    if (isPageLoading) {
      console.log('⏳ Modification ignorée - page en cours de chargement');
      return;
    }
    
    const newContent = { ...content };
    
    if (pageKey === 'nav') {
      newContent.navigation = { ...newContent.navigation, ...updates };
    } else if (pageKey === 'metadata') {
      newContent.metadata = { ...newContent.metadata, ...updates };
    } else {
      newContent[pageKey as keyof Content] = { ...newContent[pageKey as keyof Content], ...updates };
    }
    
    setContent(newContent);
    setHasUnsavedChanges(true);
    console.log(`📝 Contenu mis à jour (${pageKey}) - marqué comme modifié`);
  };

  // Fonction pour nettoyer le contenu des propriétés temporaires
  const cleanContent = (data: any) => {
    const cleaned = JSON.parse(JSON.stringify(data)); // Deep clone
    delete cleaned._status;
    delete cleaned._lastModified;
    return cleaned;
  };

  // Fonction pour réinitialiser l'état des modifications non sauvegardées
  const resetUnsavedChanges = () => {
    console.log('🔄 Réinitialisation de hasUnsavedChanges');
    setHasUnsavedChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchContent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const currentPageData = (() => {
    switch (currentPage) {
      case 'nav':
        return content.navigation;
      case 'metadata':
        return content.metadata;
      default:
        return content[currentPage as keyof Content];
    }
  })();

  const currentPageConfig = PAGES.find(p => p.id === currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        pages={PAGES}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Zone principale */}
      <div className="lg:ml-64 flex flex-col">
        {/* Header avec SaveBar sticky */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-4xl font-semibold text-gray-900 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
                  {currentPageConfig?.label}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentPageConfig?.path ? `Page: ${currentPageConfig.path}` : 'Configuration'}
                </p>
              </div>
                
              {/* Status bar et boutons d'action */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Modifications non enregistrées
                  </span>
                )}
                
                {isPreviewMode && (
                  <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Preview actif
                  </span>
                )}
                
                {saveStatus === 'saving' && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Enregistrement...</span>
                  </div>
                )}
                
                {saveStatus === 'success' && (
                  <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Enregistré à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                
                {saveStatus === 'error' && (
                  <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    Erreur lors de l'enregistrement
                  </span>
                )}

                {/* Bouton Aperçu */}
                {currentPageConfig?.path && (
                  <button
                    onClick={hasUnsavedChanges ? handlePreview : () => window.open(currentPageConfig.path!, '_blank')}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                      hasUnsavedChanges 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                    title={hasUnsavedChanges ? "Aperçu avec les modifications non sauvegardées" : "Voir la page publiée"}
                  >
                    {hasUnsavedChanges ? '👁️ Aperçu' : '🔗 Voir la page'}
                  </button>
                )}



                {/* Bouton Enregistrer brouillon */}
                <button
                  onClick={() => handleSaveWithStatus('draft')}
                  disabled={saveStatus === 'saving'}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    saveStatus === 'saving'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                  title={pageStatus === 'published' ? "Passer la page en brouillon" : "Enregistrer comme brouillon"}
                >
                  {pageStatus === 'published' ? '📝 Passer en brouillon' : '💾 Enregistrer brouillon'}
                </button>

                {/* Bouton Publier */}
                <button
                  onClick={() => handleSaveWithStatus('published')}
                  disabled={saveStatus === 'saving'}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    saveStatus === 'saving'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : pageStatus === 'published'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {pageStatus === 'published' ? '✅ Mettre à jour' : '🚀 Publier'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {currentPageConfig && (
              <>
                {/* Informations de statut */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Statut :</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        pageStatus === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pageStatus === 'published' ? '✅ Publié' : '📝 Brouillon'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Page: {currentPageConfig.label}
                    </div>
                  </div>
                </div>

                {/* Éditeur de blocs */}
                <BlockEditor
                  pageData={currentPageData}
                  pageKey={currentPage}
                  onUpdate={(updates) => updateContent(currentPage, updates)}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 