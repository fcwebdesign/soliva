"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

interface Page {
  id: string;
  title: string;
  description: string;
  type: 'home' | 'contact' | 'studio' | 'work' | 'blog' | 'settings';
  icon: string;
  lastModified?: string;
  status: 'published' | 'draft';
}

export default function PagesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('content');

  const pages: Page[] = [
    {
      id: 'home',
      title: 'Accueil',
      description: 'Page d\'accueil du site',
      type: 'home',
      icon: '🏠',
      status: 'published',
      lastModified: '2024-01-15'
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Page de contact et coordonnées',
      type: 'contact',
      icon: '📧',
      status: 'published',
      lastModified: '2024-01-10'
    },
    {
      id: 'studio',
      title: 'Studio',
      description: 'Présentation du studio',
      type: 'studio',
      icon: '🎨',
      status: 'published',
      lastModified: '2024-01-12'
    },
    {
      id: 'work',
      title: 'Travaux',
      description: 'Portfolio et projets',
      type: 'work',
      icon: '💼',
      status: 'published',
      lastModified: '2024-01-08'
    },
    {
      id: 'blog',
      title: 'Journal',
      description: 'Articles et actualités',
      type: 'blog',
      icon: '📝',
      status: 'published',
      lastModified: '2024-01-14'
    }
  ];

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
      const data = await response.json();
      setContent(data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (pageId: string) => {
    router.push(`/admin?page=${pageId}`);
  };

  const handlePreviewPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      window.open(`/${pageId}`, '_blank');
    }
  };

  const handleDuplicatePage = (pageId: string) => {
    // Logique pour dupliquer une page
    console.log('Dupliquer la page:', pageId);
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      // Logique pour supprimer une page
      console.log('Supprimer la page:', pageId);
    }
  };

  const handleNewPage = () => {
    // Logique pour créer une nouvelle page
    console.log('Créer une nouvelle page');
  };

  const getPageStats = () => {
    const total = pages.length;
    const published = pages.filter(p => p.status === 'published').length;
    const drafts = pages.filter(p => p.status === 'draft').length;
    
    return { total, published, drafts };
  };

  const stats = getPageStats();

  // Données pour la sidebar (comme dans la page principale)
  const PAGES = [
    { id: 'home', label: 'Accueil', path: '/', icon: '🏠' },
    { id: 'studio', label: 'Studio', path: '/studio', icon: '🎨' },
    { id: 'contact', label: 'Contact', path: '/contact', icon: '📧' },
    { id: 'work', label: 'Work', path: '/work', icon: '💼' },
    { id: 'blog', label: 'Blog', path: '/blog', icon: '📝' },
  ];

  const SETTINGS = [
    { id: 'nav', label: 'Navigation', path: null, icon: '🧭' },
    { id: 'metadata', label: 'Métadonnées', path: null, icon: '⚙️' },
    { id: 'templates', label: 'Templates', path: null, icon: '🎨' },
    { id: 'footer', label: 'Footer', path: null, icon: '🦶' },
    { id: 'backup', label: 'Sauvegarde', path: null, icon: '💾' },
  ];

  const handlePageChange = (pageId: string) => {
    router.push(`/admin?page=${pageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 admin-page">
        <div className="flex">
          <Sidebar 
            pages={PAGES} 
            settings={SETTINGS} 
            currentPage="pages" 
            onPageChange={handlePageChange} 
          />
          <div className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-page">
      <div className="flex">
        <Sidebar 
          pages={PAGES} 
          settings={SETTINGS} 
          currentPage="pages" 
          onPageChange={handlePageChange} 
        />
        
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                  <p className="text-sm text-gray-500">Page: /pages</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.open('/pages', '_blank')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span>🔗</span>
                    <span>Voir la page</span>
                  </button>
                  <button
                    onClick={() => console.log('Passer en brouillon')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span>📄</span>
                    <span>Passer en brouillon</span>
                  </button>
                  <button
                    onClick={() => console.log('Mettre à jour')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <span>✅</span>
                    <span>Mettre à jour</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Status */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Statut :</span>
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Publié
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Page: Pages
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'content', label: 'Contenu' },
                  { id: 'settings', label: 'Paramètres' },
                  { id: 'filters', label: 'Filtres' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'content' && (
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">📄</span>
                      Pages ({stats.total})
                    </h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-green-600">✅ {stats.published} publié{stats.published > 1 ? 's' : ''}</span>
                      {stats.drafts > 0 && (
                        <span className="text-sm text-yellow-600">{stats.drafts} brouillon{stats.drafts > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleNewPage}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>➕</span>
                    <span>Nouvelle page</span>
                  </button>
                </div>

                {/* Pages List */}
                <div className="space-y-4">
                  {pages.map(page => (
                    <div key={page.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{page.icon}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                page.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {page.status === 'published' ? '✅ Publié' : '📄 Brouillon'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {page.id}</p>
                            {page.lastModified && (
                              <p className="text-xs text-gray-400">Modifié le: {page.lastModified}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <span>✏️</span>
                            <span>Éditer</span>
                          </button>
                          <button
                            onClick={() => handlePreviewPage(page.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <span>👁️</span>
                            <span>Aperçu</span>
                          </button>
                          <button
                            onClick={() => handleDuplicatePage(page.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <span>📄</span>
                            <span>Dupliquer</span>
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <span>🗑️</span>
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres des pages</h3>
                <p className="text-gray-500">Configuration des paramètres généraux des pages.</p>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
                <p className="text-gray-500">Gestion des filtres et de la recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 