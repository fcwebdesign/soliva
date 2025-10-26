"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageLayout from '../components/AdminPageLayout';
import { Home, Mail, Palette, FileText, Settings, Layout, Plus, Pin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ActionButtons from '../components/ActionButtons';
import StatusBadge from '../components/StatusBadge';

interface Page {
  id: string;
  title: string;
  description: string;
  type: 'home' | 'contact' | 'studio' | 'work' | 'blog' | 'settings' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  lastModified?: string;
  status: 'published' | 'draft';
  pinned?: boolean;
}

export default function PagesAdmin() {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('content');

  const [pages, setPages] = useState<Page[]>([]);

  // Fonction pour générer la liste des pages dynamiquement
  const generatePagesList = (content: any): Page[] => {
    const pinnedSystem: string[] = content?.pages?.pinnedSystem || [];
    const pagesList: Page[] = [
      {
        id: 'home',
        title: 'Accueil',
        description: 'Page d\'accueil du site',
        type: 'home' as const,
        icon: Home,
        status: 'published' as const,
        lastModified: '2024-01-15',
        pinned: pinnedSystem.includes('home')
      },
      {
        id: 'contact',
        title: 'Contact',
        description: 'Page de contact et coordonnées',
        type: 'contact' as const,
        icon: Mail,
        status: 'published' as const,
        lastModified: '2024-01-10',
        pinned: pinnedSystem.includes('contact')
      },
      {
        id: 'studio',
        title: 'Studio',
        description: 'Présentation du studio',
        type: 'studio' as const,
        icon: Palette,
        status: 'published' as const,
        lastModified: '2024-01-12',
        pinned: pinnedSystem.includes('studio')
      },
      {
        id: 'work',
        title: 'Portfolio',
        description: 'Liste des projets / portfolio',
        type: 'work',
        icon: FileText,
        status: 'published',
        lastModified: '2024-01-08',
        pinned: pinnedSystem.includes('work')
      },
      {
        id: 'blog',
        title: 'Blog',
        description: 'Journal / articles',
        type: 'blog',
        icon: FileText,
        status: 'published',
        lastModified: '2024-01-05',
        pinned: pinnedSystem.includes('blog')
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
            lastModified: customPage.publishedAt ? new Date(customPage.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            pinned: !!customPage.pinned
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
    if (['home','contact','studio','work','blog'].includes(pageId)) {
      router.push(`/admin?page=${pageId}`);
    } else {
      // Pour les pages personnalisées, rediriger vers l'éditeur avec le slug
      router.push(`/admin/pages/${pageId}`);
    }
  };

  const handleTogglePin = async (page: Page, nextPinned: boolean) => {
    try {
      const newContent = { ...content };
      if (!newContent.pages) newContent.pages = { pages: [] };

      if (page.type === 'custom') {
        if (newContent.pages?.pages && Array.isArray(newContent.pages.pages)) {
          newContent.pages.pages = newContent.pages.pages.map((p: any) =>
            p.id === page.id ? { ...p, pinned: nextPinned } : p
          );
        }
      } else {
        const ps: string[] = Array.isArray(newContent.pages.pinnedSystem) ? [...newContent.pages.pinnedSystem] : [];
        const idx = ps.indexOf(page.id);
        if (nextPinned && idx === -1) ps.push(page.id);
        if (!nextPinned && idx !== -1) ps.splice(idx, 1);
        newContent.pages.pinnedSystem = ps;
      }

      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (!response.ok) throw new Error('Échec sauvegarde');

      setContent(newContent);
      setPages(generatePagesList(newContent));
      toast.success(nextPinned ? 'Page épinglée' : 'Page désépinglée');

      // Dispatch a live update event for Sidebar (without reload)
      try {
        const customs = newContent?.pages?.pages || [];
        const pinnedCustom = customs
          .filter((p: any) => p && p.pinned)
          .map((p: any) => ({ id: p.id, label: p.title || p.id, type: 'custom' as const }));
        const systemMap: Record<string,string> = {
          home: 'Accueil',
          studio: 'Studio',
          contact: 'Contact',
          work: 'Portfolio',
          blog: 'Blog',
        };
        const pinnedSystem: string[] = newContent?.pages?.pinnedSystem || [];
        const hiddenSystem: string[] = newContent?.pages?.hiddenSystem || [];
        const systemItems = pinnedSystem
          .filter((id) => systemMap[id] && !hiddenSystem.includes(id))
          .map((id) => ({ id, label: systemMap[id], type: 'system' as const }));
        const payload = [...systemItems, ...pinnedCustom];
        window.dispatchEvent(new CustomEvent('admin:pinned-updated', { detail: { pinned: payload } }));
      } catch {}
    } catch (e) {
      console.error(e);
      toast.error('Impossible de mettre à jour l\'épinglage');
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
    const confirmed = await confirm({
      title: 'Supprimer cette page ?',
      description: 'Cette action est irréversible. La page sera définitivement supprimée.',
      confirmText: 'Supprimer',
      variant: 'destructive'
    });
    
    if (confirmed) {
      try {
        // Supprimer la page du contenu
        const newContent = { ...content };
        
        if (pageId === 'work' || pageId === 'blog') {
          // Ne pas permettre la suppression des pages système (work/blog)
          toast.error('Impossible de supprimer cette page système.');
          return;
        }

        // Masquer les pages "home/studio/contact" au lieu de les supprimer réellement
        if (['home','contact','studio'].includes(pageId)) {
          const newContent = { ...content };
          if (!newContent.pages) newContent.pages = { pages: [] };
          const hidden: string[] = Array.isArray(newContent.pages.hiddenSystem) ? [...newContent.pages.hiddenSystem] : [];
          if (!hidden.includes(pageId)) hidden.push(pageId);
          newContent.pages.hiddenSystem = hidden;
          
          const response = await fetch('/api/admin/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
          });
          if (!response.ok) throw new Error('Erreur lors de la suppression');
          setContent(newContent);
          setPages(generatePagesList(newContent));
          toast.success('Page masquée avec succès !');
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



  return (
    <AdminPageLayout
      title="Pages"
      description="Gestion des pages du site"
      currentPage="pages"
      loading={loading}
    >
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
                        <StatusBadge status="published" label={`${stats.published} publié${stats.published !== 1 ? 's' : ''}`} />
                        {stats.drafts > 0 && (
                          <StatusBadge status="draft" label={`${stats.drafts} brouillon${stats.drafts !== 1 ? 's' : ''}`} />
                        )}
                      </div>
                    </div>
                    <Button onClick={handleNewPage} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nouvelle page
                    </Button>
                  </div>

                  {/* Sélection de la page d'accueil */}
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Page d'accueil</h4>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="homeMode"
                          value="system"
                          defaultChecked={(content as any)?.pages?.home?.mode !== 'custom'}
                          onChange={async () => {
                            try {
                              const newContent = { ...(content as any) };
                              if (!newContent.pages) newContent.pages = { pages: [] };
                              newContent.pages.home = { mode: 'system' };
                              const res = await fetch('/api/admin/content', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content: newContent })
                              });
                              if (!res.ok) throw new Error('save');
                              setContent(newContent);
                              toast.success("Page d'accueil mise à jour");
                            } catch {
                              toast.error("Impossible de mettre à jour la page d'accueil");
                            }
                          }}
                        />
                        Page système (par défaut)
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="homeMode"
                          value="custom"
                          defaultChecked={(content as any)?.pages?.home?.mode === 'custom'}
                          onChange={async () => {
                            try {
                              const newContent = { ...(content as any) };
                              if (!newContent.pages) newContent.pages = { pages: [] };
                              const previous = newContent.pages.home?.id;
                              newContent.pages.home = { mode: 'custom', id: previous || '' };
                              const res = await fetch('/api/admin/content', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content: newContent })
                              });
                              if (!res.ok) throw new Error('save');
                              setContent(newContent);
                            } catch {
                              toast.error("Impossible de basculer en mode personnalisé");
                            }
                          }}
                        />
                        Utiliser une page personnalisée
                      </label>
                    </div>
                    {(content as any)?.pages?.home?.mode === 'custom' && (
                      <div className="mt-3">
                        <label className="text-xs text-gray-500 mb-1 block">Sélectionner la page</label>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={(content as any)?.pages?.home?.id || ''}
                          onChange={async (e) => {
                            const val = e.target.value;
                            try {
                              const newContent = { ...(content as any) };
                              if (!newContent.pages) newContent.pages = { pages: [] };
                              newContent.pages.home = { mode: 'custom', id: val };
                              const res = await fetch('/api/admin/content', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content: newContent })
                              });
                              if (!res.ok) throw new Error('save');
                              setContent(newContent);
                              toast.success('Page d\'accueil sélectionnée');
                            } catch {
                              toast.error('Impossible de sélectionner la page');
                            }
                          }}
                        >
                          <option value="">— Choisir une page —</option>
                          {(content as any)?.pages?.pages?.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.title || p.id}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {pages.map((page, index) => {
                      const isSystem = ['home','studio','contact','work','blog'].includes(page.type);
                      const hidden = Array.isArray((content as any)?.pages?.hiddenSystem) ? (content as any).pages.hiddenSystem : [];
                      const isDisabledFront = isSystem && hidden.includes(page.id);
                      // Toggle désactivation côté front pour pages système
                      const toggleDisableFront = async () => {
                        try {
                          const newContent = { ...(content as any) };
                          if (!newContent.pages) newContent.pages = { pages: [] };
                          const arr: string[] = Array.isArray(newContent.pages.hiddenSystem) ? [...newContent.pages.hiddenSystem] : [];
                          const idx = arr.indexOf(page.id);
                          if (idx === -1) arr.push(page.id); else arr.splice(idx, 1);
                          newContent.pages.hiddenSystem = arr;
                          const res = await fetch('/api/admin/content', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: newContent })
                          });
                          if (!res.ok) throw new Error('save');
                          setContent(newContent);
                          setPages(generatePagesList(newContent));
                          toast.success(idx === -1 ? 'Page désactivée sur le front' : 'Page réactivée');
                        } catch {
                          toast.error('Impossible de basculer l\'état');
                        }
                      };
                      return (
                      <div key={`${page.id}-${index}`} className={`bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-md font-semibold text-gray-900 truncate">
                                {page.title}
                              </h4>
                              <StatusBadge status={isDisabledFront ? 'archived' : page.status} label={isDisabledFront ? 'Désactivée' : undefined} size="sm" />
                              {/* Badge type de page */}
                              {(['home','studio','contact','work','blog'].includes(page.type)) ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] border bg-gray-50 text-gray-700 border-gray-200">Système</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[11px] border bg-blue-50 text-blue-700 border-blue-200">Custom</span>
                              )}
                              {page.pinned && (
                                <Pin className="w-4 h-4 text-yellow-600" />
                              )}
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
                          
                          <div className="ml-4">
                            <ActionButtons
                              onEdit={() => handleEditPage(page.id)}
                              onPreview={() => handlePreviewPage(page.id)}
                              onDuplicate={!isSystem ? () => handleDuplicatePage(page.id) : undefined}
                              onDelete={isSystem ? toggleDisableFront : () => handleDeletePage(page.id)}
                              disableDelete={false}
                              labels={{ delete: isSystem ? (isDisabledFront ? 'Activer' : 'Désactiver') : 'Supprimer' }}
                              deleteIcon={isSystem ? 'none' : 'trash'}
                              deleteClassName={isSystem ? (isDisabledFront ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800' : 'bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800') : undefined}
                              size="sm"
                            />
                            <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-700">
                              <Checkbox
                                id={`pin-${page.id}`}
                                checked={!!page.pinned}
                                onCheckedChange={(val) => handleTogglePin(page, !!val)}
                              />
                              <label htmlFor={`pin-${page.id}`}>Épingler dans la barre latérale</label>
                            </div>
                            
                          </div>
                        </div>
                      </div>
                    )})}
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
      
      {/* Dialogue de confirmation */}
      <ConfirmDialog />
    </AdminPageLayout>
  );
} 
