"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import BlockEditor from '../../components/BlockEditor';

interface PageData {
  [key: string]: any;
}

export default function PageEdit() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [pageData, setPageData] = useState<PageData>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Configuration des pages
  const pageConfigs = {
    home: {
      title: 'Accueil',
      icon: '🏠',
      description: 'Page d\'accueil du site',
      dataPath: 'home'
    },
    contact: {
      title: 'Contact', 
      icon: '📧',
      description: 'Page de contact et coordonnées',
      dataPath: 'contact'
    },
    studio: {
      title: 'Studio',
      icon: '🎨', 
      description: 'Présentation du studio',
      dataPath: 'studio'
    },
    work: {
      title: 'Travaux',
      icon: '💼',
      description: 'Portfolio et projets - Configuration générale',
      dataPath: 'work'
    },
    blog: {
      title: 'Journal',
      icon: '📝',
      description: 'Articles et actualités - Configuration générale', 
      dataPath: 'blog'
    },
    settings: {
      title: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration générale du site',
      dataPath: 'nav'
    }
  };

  const currentPage = pageConfigs[pageId as keyof typeof pageConfigs];

  useEffect(() => {
    if (!currentPage) {
      router.push('/admin/pages');
      return;
    }
    fetchContent();
  }, [pageId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      const data = await response.json();
      setContent(data);
      
      // Extraire les données de la page spécifique
      const specificPageData = data[currentPage.dataPath] || {};
      setPageData(specificPageData);
      
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePageData = (updates: any) => {
    const updatedPageData = { ...pageData, ...updates };
    setPageData(updatedPageData);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!content || !currentPage) return;
    
    try {
      setSaveStatus('saving');
      
      // Créer le nouveau contenu avec les modifications
      const newContent = {
        ...content,
        [currentPage.dataPath]: pageData
      };
      
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      
      setContent(newContent);
      setHasUnsavedChanges(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handlePreview = () => {
    let previewUrl = '/';
    switch (pageId) {
      case 'home':
        previewUrl = '/';
        break;
      case 'contact':
        previewUrl = '/contact';
        break;
      case 'studio':
        previewUrl = '/studio';
        break;
      case 'work':
        previewUrl = '/work';
        break;
      case 'blog':
        previewUrl = '/blog';
        break;
      default:
        previewUrl = '/';
    }
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page non trouvée</h2>
          <p className="text-gray-600 mb-4">La page demandée n'existe pas.</p>
          <button
            onClick={() => router.push('/admin/pages')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        pages={[]}
        settings={[]}
        currentPage=""
        onPageChange={() => {}}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/pages')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Retour
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currentPage.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentPage.title}</h1>
                  <p className="text-sm text-gray-600">{currentPage.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  ⚠️ Modifications non sauvegardées
                </span>
              )}
              
              {saveStatus === 'saving' && (
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  💾 Sauvegarde...
                </span>
              )}
              
              {saveStatus === 'success' && (
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  ✅ Sauvegardé
                </span>
              )}
              
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  ❌ Erreur
                </span>
              )}
              
              <button
                onClick={handlePreview}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                👁️ Aperçu
              </button>
              
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saveStatus === 'saving' ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <BlockEditor
              pageData={pageData}
              pageKey={pageId}
              onUpdate={updatePageData}
            />
          </div>
        </main>
      </div>
    </div>
  );
} 