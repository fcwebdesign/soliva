"use client";
import { useState, useEffect } from 'react';
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
  const [content, setContent] = useState<Content | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published'); // Nouveau état pour le statut de la page

  // Charger le contenu initial
  useEffect(() => {
    fetchContent();
  }, []);

  // Confirmation avant de quitter si modifications non enregistrées
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
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

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setContent(data);
      
      // Définir le statut de la page (pour simplifier, on considère toutes les pages comme publiées par défaut)
      setPageStatus('published');
      
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
      setSaveStatus('saving');
      setPageStatus(status);
      
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...content,
          _status: status, // Ajouter le statut au contenu
          _lastModified: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setSaveStatus('success');
      setHasUnsavedChanges(false);
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSave = () => handleSaveWithStatus(pageStatus);

  const handlePreview = async () => {
    if (!content) return;
    
    try {
      // Sauvegarder temporairement dans sessionStorage pour l'aperçu
      sessionStorage.setItem(`preview-${currentPage}`, JSON.stringify(content));
      
      // Ouvrir l'aperçu avec un paramètre spécial
      const previewPath = PAGES.find(p => p.id === currentPage)?.path || '/';
      window.open(`${previewPath}?preview=true`, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu:', err);
    }
  };

  const updateContent = (pageKey: string, updates: any) => {
    if (!content) return;
    
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
    <div className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[256px_1fr]">
      {/* Sidebar */}
      <Sidebar 
        pages={PAGES}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Zone principale */}
      <div className="flex flex-col">
        {/* Header avec SaveBar sticky */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{currentPageConfig?.icon}</span>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {currentPageConfig?.label}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {currentPageConfig?.path ? `Page: ${currentPageConfig.path}` : 'Configuration'}
                    </p>
                  </div>
                </div>
              </div>
                
              {/* Status bar et boutons d'action */}
              <div className="flex items-center space-x-4">
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