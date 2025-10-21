"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Home, Mail, Palette, FileText, Settings, Layout, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Page {
  id: string;
  title: string;
  description: string;
  type: 'home' | 'contact' | 'studio' | 'work' | 'blog' | 'settings' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  lastModified?: string;
  status: 'published' | 'draft';
}

export default function PagesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('content');

  const [pages, setPages] = useState<Page[]>([]);

  // Fonction pour générer la liste des pages dynamiquement
  const generatePagesList = (content: any): Page[] => {
    const pagesList: Page[] = [
      {
        id: 'home',
        title: 'Accueil',
        description: 'Page d\'accueil du site',
        type: 'home',
        icon: Home,
        status: 'published',
        lastModified: '2024-01-15'
      },
      {
        id: 'contact',
        title: 'Contact',
        description: 'Page de contact et coordonnées',
        type: 'contact',
        icon: Mail,
        status: 'published',
        lastModified: '2024-01-10'
      },
      {
        id: 'studio',
        title: 'Studio',
        description: 'Présentation du studio',
        type: 'studio',
        icon: Palette,
        status: 'published',
        lastModified: '2024-01-12'
      }
    ];

    // Ajouter les pages personnalisées depuis le contenu
    if (content.pages?.pages && Array.isArray(content.pages.pages)) {
      content.pages.pages.forEach((customPage: any) => {
        if (customPage && typeof customPage === 'object') {
          pagesList.push({
            id: customPage.id,
            title: customPage.title || 'Page personnalisée',
            description: customPage.description || 'Page personnalisée',
            type: 'custom',
            icon: FileText,
            status: customPage.status || 'published',
            lastModified: customPage.publishedAt ? new Date(customPage.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
        }
      });
    }

    return pagesList;
  };

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
      
      // Générer la liste des pages dynamiquement
      const pagesList = generatePagesList(data);
      setPages(pagesList);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (pageId: string) => {
    if (pageId === 'home' || pageId === 'contact' || pageId === 'studio') {
      router.push(`/admin?page=${pageId}`);
    } else {
      // Pour les pages personnalisées, rediriger vers l'éditeur avec le slug
      router.push(`/admin/pages/${pageId}`);
    }
  };

  const handlePreviewPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      window.open(`/${pageId}`, '_blank');
    }
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      // Trouver la page à dupliquer
      const pageToDuplicate = content.pages?.pages?.find((page: any) => 
        page.id === pageId
      );
      
      if (!pageToDuplicate) {
        toast.error('Page non trouvée');
        return;
      }
      
              // Créer une copie avec un nouveau slug
        const duplicatedPage = {
          ...pageToDuplicate,
          id: `page-${Date.now()}`,
          slug: `${pageToDuplicate.slug}-copy`,
          title: `${pageToDuplicate.title} (copie)`,
          status: 'draft'
        };
        
        // Ajouter la page dupliquée au contenu
        const newContent = { ...content };
        if (!newContent.pages) newContent.pages = { pages: [] };
        if (!newContent.pages.pages) newContent.pages.pages = [];
        newContent.pages.pages.push(duplicatedPage);
      
      // Sauvegarder
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la duplication');
      }
      
      // Mettre à jour l'état local
      setContent(newContent);
      const updatedPagesList = generatePagesList(newContent);
      setPages(updatedPagesList);
      
      toast.success('Page dupliquée avec succès !');
      
    } catch (err) {
      console.error('Erreur duplication:', err);
      toast.error('Erreur lors de la duplication de la page');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      try {
        // Supprimer la page du contenu
        const newContent = { ...content };
        
        if (pageId === 'home' || pageId === 'contact' || pageId === 'studio') {
          // Ne pas permettre la suppression des pages système
          toast.error('Impossible de supprimer une page système.');
          return;
        }
        
        // Supprimer la page personnalisée
        if (newContent.pages?.pages && Array.isArray(newContent.pages.pages)) {
          newContent.pages.pages = newContent.pages.pages.filter((page: any) => 
            page.id !== pageId
          );
        }
        
        // Sauvegarder les modifications
        const response = await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }
        
        // Mettre à jour l'état local
        setContent(newContent);
        const updatedPagesList = generatePagesList(newContent);
        setPages(updatedPagesList);
        
        toast.success('Page supprimée avec succès !');
        
      } catch (err) {
        console.error('Erreur suppression:', err);
        toast.error('Erreur lors de la suppression de la page');
      }
    }
  };

  const handleNewPage = () => {
    // Rediriger vers une page d'édition vide
    router.push('/admin/pages/new');
  };

  const getPageStats = () => {
    const total = pages.length;
    const published = pages.filter(p => p.status === 'published').length;
    const drafts = pages.filter(p => p.status === 'draft').length;
    
    return { total, published, drafts };
  };

  const stats = getPageStats();



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 admin-page">
        <div className="flex">
          <Sidebar 
            currentPage="pages" 
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
          currentPage="pages" 
        />
        
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-4xl font-semibold text-gray-900 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
                    Pages
                  </h1>
                  <p className="text-sm text-gray-500">Page: /pages</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'content'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Layout className="w-4 h-4 mr-2" />
                      Contenu
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'settings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </div>
                  </button>
                </nav>
              </div>

              {activeTab === 'content' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-6 h-6 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Pages ({stats.total})</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {stats.published} publié{stats.published !== 1 ? 's' : ''}
                        </span>
                        {stats.drafts > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            {stats.drafts} brouillon{stats.drafts !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleNewPage} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nouvelle page
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {pages.map((page, index) => (
                      <div key={`${page.id}-${index}`} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-md font-semibold text-gray-900 truncate">
                                {page.title}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                page.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {page.status === 'published' ? 'Publié' : 'Brouillon'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-gray-500">
                                ID: {page.id}
                              </p>

                              {page.lastModified && (
                                <p className="text-sm text-gray-500">
                                  Modifié: {page.lastModified}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <Button
                              onClick={() => handleEditPage(page.id)}
                              size="sm"
                              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md"
                              title="Éditer la page"
                            >
                              Éditer
                            </Button>
                            <Button
                              onClick={() => handlePreviewPage(page.id)}
                              size="sm"
                              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-md"
                              title="Aperçu de la page"
                            >
                              Aperçu
                            </Button>
                            <Button
                              onClick={() => handleDuplicatePage(page.id)}
                              size="sm"
                              className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-md"
                              title="Dupliquer cette page"
                            >
                              Dupliquer
                            </Button>
                            <Button
                              onClick={() => handleDeletePage(page.id)}
                              size="sm"
                              className="text-xs bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md"
                              title="Supprimer cette page"
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings className="w-6 h-6 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Paramètres des pages</h3>
                    </div>
                    <p className="text-gray-500">Configuration des paramètres généraux des pages.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 