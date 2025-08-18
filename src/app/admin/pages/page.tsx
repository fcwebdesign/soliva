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

  const pages: Page[] = [
    {
      id: 'home',
      title: 'Accueil',
      description: 'Page d\'accueil du site',
      type: 'home',
      icon: '🏠',
      status: 'published'
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Page de contact et coordonnées',
      type: 'contact',
      icon: '📧',
      status: 'published'
    },
    {
      id: 'studio',
      title: 'Studio',
      description: 'Présentation du studio',
      type: 'studio',
      icon: '🎨',
      status: 'published'
    },
    {
      id: 'work',
      title: 'Travaux',
      description: 'Portfolio et projets',
      type: 'work',
      icon: '💼',
      status: 'published'
    },
    {
      id: 'blog',
      title: 'Journal',
      description: 'Articles et actualités',
      type: 'blog',
      icon: '📝',
      status: 'published'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configuration générale du site',
      type: 'settings',
      icon: '⚙️',
      status: 'published'
    }
  ];

  useEffect(() => {
    fetchContent();
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
    router.push(`/admin/pages/${pageId}`);
  };

  const getPageStats = (pageType: string) => {
    if (!content) return { items: 0, published: 0 };
    
    switch (pageType) {
      case 'work':
        const projects = content.work?.adminProjects || [];
        return {
          items: projects.length,
          published: projects.filter((p: any) => p.status === 'published').length
        };
      case 'blog':
        const articles = content.blog?.articles || [];
        return {
          items: articles.length,
          published: articles.filter((a: any) => a.status === 'published').length
        };
      default:
        return { items: 1, published: 1 };
    }
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Pages</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gérez le contenu de toutes les pages du site
              </p>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => {
                const stats = getPageStats(page.type);
                
                return (
                  <div
                    key={page.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => handleEditPage(page.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{page.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {page.description}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                      </span>
                    </div>

                    {/* Statistiques pour Work et Blog */}
                    {(page.type === 'work' || page.type === 'blog') && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {page.type === 'work' ? 'Projets' : 'Articles'}
                          </span>
                          <div className="flex space-x-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              {stats.items} total
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              {stats.published} publié{stats.published !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Cliquez pour éditer
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/${page.id === 'home' ? '' : page.id}`, '_blank');
                            }}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                            title="Voir la page"
                          >
                            👁️ Aperçu
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPage(page.id);
                            }}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                            title="Éditer la page"
                          >
                            ✏️ Éditer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 