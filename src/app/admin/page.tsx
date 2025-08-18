"use client";
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BlockEditor from './components/BlockEditor';
import RightPanel from './components/RightPanel';
import type { Content } from '@/types/content';

const PAGES = [
  { id: 'home', label: 'Accueil', path: '/', icon: '🏠' },
  { id: 'contact', label: 'Contact', path: '/contact', icon: '📧' },
  { id: 'studio', label: 'Studio', path: '/studio', icon: '🎨' },
  { id: 'work', label: 'Work', path: '/work', icon: '💼' },
  { id: 'blog', label: 'Blog', path: '/blog', icon: '📝' },
  { id: 'nav', label: 'Navigation', path: null, icon: '🧭' },
  { id: 'metadata', label: 'Métadonnées', path: null, icon: '⚙️' },
];

export default function AdminPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      setError(null);
      
      console.log('🔄 Chargement du contenu...');
      const response = await fetch('/api/admin/content');
      
      console.log('📡 Réponse API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Contenu chargé:', data);
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Le contenu est vide. Vérifiez que le fichier content.json existe.');
      }
      
      setContent(data);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('❌ Erreur lors du chargement:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleContentUpdate = (updates: any) => {
    if (!content) return;

    const newContent = { ...content };
    newContent[currentPage as keyof Content] = updates;
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      setSaveStatus('saving');
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const updatedContent = await response.json();
      setContent(updatedContent);
      setSaveStatus('success');
      setHasUnsavedChanges(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
      throw error;
    }
  };

  const handlePreview = () => {
    const pagePaths: Record<string, string> = {
      home: '/',
      contact: '/contact',
      studio: '/studio',
      work: '/work',
      blog: '/blog',
    };
    
    const targetPath = pagePaths[currentPage] || '/';
    window.open(`/api/admin/preview/enable?to=${targetPath}`, '_blank');
    setIsPreviewMode(true);
  };

  const handleDisablePreview = () => {
    window.open('/api/admin/preview/disable', '_blank');
    setIsPreviewMode(false);
  };

  const handleRevert = (filename: string) => {
    fetchContent();
  };

  const handleResetContent = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le contenu avec le seed complet ? Cela va remplacer tout le contenu actuel.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/reset-content', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réinitialisation');
      }

      const result = await response.json();
      console.log('✅ Contenu réinitialisé:', result);
      
      // Recharger le contenu
      await fetchContent();
      alert('Contenu réinitialisé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      alert('Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchContent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Réessayer
            </button>
            <div className="text-xs text-gray-500">
              <p>Si le problème persiste :</p>
              <p>1. Vérifiez que le fichier data/content.json existe</p>
              <p>2. Ouvrez la console (F12) pour voir les détails</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Aucun contenu disponible</p>
        </div>
      </div>
    );
  }

  const currentPageData = content?.[currentPage as keyof Content];
  const currentPageInfo = PAGES.find(p => p.id === currentPage);
  
  // Debug: afficher les données de la page courante
  console.log('🔍 Debug - Page courante:', currentPage);
  console.log('🔍 Debug - Contenu complet:', JSON.stringify(content, null, 2));
  console.log('🔍 Debug - Données de la page:', JSON.stringify(currentPageData, null, 2));

  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[256px_1fr_320px]">
      {/* Sidebar gauche */}
      <Sidebar 
        pages={PAGES}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Zone centrale */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {currentPageInfo?.label}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {currentPageInfo?.path || 'Configuration globale'}
                  </p>
                </div>
                
                {/* Status bar */}
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

                  {/* Bouton de réinitialisation */}
                  <button
                    onClick={handleResetContent}
                    disabled={loading}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400"
                    title="Réinitialiser le contenu avec le seed complet"
                  >
                    🔄 Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-6 overflow-auto h-full">
          <div className="w-full h-full max-w-6xl mx-auto">
            <BlockEditor
              pageData={currentPageData}
              pageKey={currentPage}
              onUpdate={handleContentUpdate}
            />
          </div>
        </main>
      </div>

      {/* Sidebar droite */}
      <RightPanel
        onSave={handleSave}
        onPreview={handlePreview}
        onDisablePreview={handleDisablePreview}
        isPreviewMode={isPreviewMode}
        currentPage={currentPage}
        onRevert={handleRevert}
        saveStatus={saveStatus}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
} 