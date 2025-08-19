"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlockEditor from '../../components/BlockEditor';
import Sidebar from '../../components/Sidebar';
import MediaUploader from '../../components/MediaUploader';
import type { Content } from '@/types/content';

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
  { id: 'backup', label: 'Sauvegarde', path: null, icon: '💾' },
];

interface Project {
  id: string;
  title: string;
  content?: string;
  slug?: string;
  status?: 'draft' | 'published';
  publishedAt?: string;
  excerpt?: string;
  client?: string;
  category?: string;
  year?: string;
  featured?: boolean;
  blocks?: any[];
}

export default function WorkProjectEdit() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [content, setContent] = useState<Content | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger le contenu et trouver le projet
  useEffect(() => {
    fetchContent();
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
      
      // Trouver le projet par ID
      const foundProject = data.work?.adminProjects?.find((p: Project) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        // Créer un nouveau projet si pas trouvé
        const newProject = {
          id: projectId === 'new' ? `project-${Date.now()}` : projectId,
          title: 'Nouveau projet',
          content: '',
          status: 'draft' as const,
          client: '',
          category: '',
          year: new Date().getFullYear().toString(),
          featured: false
        };
        setProject(newProject);
        
        // Ajouter le projet au contenu s'il n'existe pas
        const newContent = { ...data };
        if (!newContent.work) newContent.work = { hero: { title: '', subtitle: '' }, description: '', projects: [], adminProjects: [] };
        if (!newContent.work.adminProjects) newContent.work.adminProjects = [];
        
        newContent.work.adminProjects.push(newProject);
        
        setContent(newContent);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = (updates: Partial<Project>) => {
    if (!project) return;
    
    const updatedProject = { ...project, ...updates };
    setProject(updatedProject);
    setHasUnsavedChanges(true);
  };

  const handleSaveWithStatus = async (status: 'draft' | 'published') => {
    if (!project || !content) return;
    
    // Mettre à jour le statut et la date de publication si nécessaire
    const updatedProject = {
      ...project,
      status,
      ...(status === 'published' && project.status !== 'published' && {
        publishedAt: new Date().toISOString()
      })
    };
    
    // Mettre à jour l'état local avant la sauvegarde
    setProject(updatedProject);
    
    // Utiliser la logique de sauvegarde existante
    await handleSaveInternal(updatedProject);
  };

  const handleSave = () => handleSaveWithStatus(project?.status || 'draft');

  // Écouter les messages de l'aperçu
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'SAVE_FROM_PREVIEW') {
        console.log('📢 Demande de sauvegarde depuis l\'aperçu');
        console.log('📊 État du projet avant sauvegarde:', {
          hasProject: !!project,
          hasBlocks: !!project?.blocks,
          blocksCount: project?.blocks?.length || 0,
          hasContent: !!project?.content,
          contentLength: project?.content?.length || 0
        });
        // Sauvegarder automatiquement le projet actuel
        await handleSaveWithStatus('published');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [project]);

  const handlePreview = async () => {
    if (!project) return;
    
    try {
      // 1. Créer une révision temporaire avec les modifications actuelles
      const previewId = `preview-${Date.now()}`;
      console.log('📝 Création aperçu projet:', {
        projectId: project.id,
        slug: project.slug,
        hasUnsavedChanges,
        blocksCount: project.blocks?.length || 0
      });
      
      // 2. Générer le HTML à partir des blocs pour l'aperçu
      let previewContent = project.content || '';
      
      if (project.blocks && Array.isArray(project.blocks) && project.blocks.length > 0) {
        previewContent = project.blocks.map(block => {
          switch (block.type) {
            case 'h2':
              return block.content ? `<h2>${block.content}</h2>` : '';
            case 'h3':
              return block.content ? `<h3>${block.content}</h3>` : '';
            case 'content':
              return block.content || '';
            case 'image':
              return block.image?.src ? `<img src="${block.image.src}" alt="${block.image.alt || ''}" />` : '';
            case 'cta':
              return (block.ctaText || block.ctaLink) ? 
                `<div class="cta-block"><p>${block.ctaText || ''}</p><a href="${block.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
            default:
              return '';
          }
        }).filter(html => html.trim() !== '').join('\n');
      }
      
      if (!previewContent || previewContent.trim() === '') {
        previewContent = `<p>Contenu du projet en cours de rédaction...</p>`;
      }
      
      // 3. Créer le projet avec le contenu généré
      const previewProject = {
        ...project,
        content: previewContent
      };
      
      // 4. Récupérer le contenu complet pour mettre à jour la section work
      const contentResponse = await fetch('/api/content');
      const fullContent = await contentResponse.json();
      
      // 5. Mettre à jour le projet dans la liste des projets
      console.log('🔍 Recherche du projet dans la liste:', {
        projectId: project.id,
        projectSlug: project.slug,
        existingProjects: fullContent.work.projects.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title }))
      });
      
      const updatedProjects = fullContent.work.projects.map((p: any) => {
        if (p.id === project.id || p.slug === project.slug) {
          // Fusionner le projet existant avec les modifications
          return {
            ...p, // Garder tous les champs existants (image, alt, etc.)
            ...previewProject, // Appliquer les modifications (title, content, etc.)
            content: previewProject.content // S'assurer que le contenu des blocs est bien appliqué
          };
        }
        return p;
      });
      
      console.log('✅ Projet mis à jour dans l\'aperçu:', {
        updatedProjectsCount: updatedProjects.length,
        previewProject: {
          title: previewProject.title,
          slug: previewProject.slug,
          hasContent: !!previewProject.content,
          contentLength: previewProject.content?.length || 0
        }
      });
      
      const previewContentData = {
        ...fullContent,
        work: {
          ...fullContent.work,
          projects: updatedProjects
        },
        _isPreview: true,
        _previewId: previewId,
        _originalPage: 'work'
      };
      
      // 6. Sauvegarder la révision temporaire
      const response = await fetch('/api/admin/preview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previewId,
          content: previewContentData,
          page: 'work'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'aperçu');
      }
      
      // 7. Ouvrir l'URL spéciale d'aperçu
      window.open(`/work/${project.slug || project.id}?preview=${previewId}`, '_blank');
      
    } catch (err) {
      console.error('Erreur aperçu projet:', err);
      alert('Erreur lors de la création de l\'aperçu');
    }
  };

  const handleSaveInternal = async (projectToSave: Project = project!) => {
    if (!projectToSave || !content) return;
    
    try {
      setSaveStatus('saving');
      
      // Forcer la génération du HTML à partir des blocs s'ils existent
      let finalContent = projectToSave.content || '';
      
      if (projectToSave.blocks && Array.isArray(projectToSave.blocks) && projectToSave.blocks.length > 0) {
        console.log('🔄 Génération du HTML à partir des blocs pour sauvegarde');
        finalContent = projectToSave.blocks.map(block => {
          switch (block.type) {
            case 'h2':
              return block.content ? `<h2>${block.content}</h2>` : '';
            case 'h3':
              return block.content ? `<h3>${block.content}</h3>` : '';
            case 'content':
              return block.content || '';
            case 'image':
              return block.image?.src ? `<img src="${block.image.src}" alt="${block.image.alt || ''}" />` : '';
            case 'cta':
              return (block.ctaText || block.ctaLink) ? 
                `<div class="cta-block"><p>${block.ctaText || ''}</p><a href="${block.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
            default:
              return '';
          }
        }).filter(html => html.trim() !== '').join('\n');
      }
      
      // Nettoyer le contenu du projet avant sauvegarde
      const cleanProjectContent = (content: string) => {
        if (!content) return '';
        
        // Supprimer les anciens blocs invalides du contenu HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Supprimer les éléments qui correspondent aux anciens blocs
        const invalidElements = tempDiv.querySelectorAll('[data-block-type="list"], [data-block-type="quote"]');
        invalidElements.forEach(el => el.remove());
        
        return tempDiv.innerHTML;
      };
      
      // Nettoyer le contenu du projet
      const cleanedProject = {
        ...projectToSave,
        content: cleanProjectContent(finalContent)
      };
      
      console.log('💾 Projet à sauvegarder:', {
        id: cleanedProject.id,
        title: cleanedProject.title,
        status: cleanedProject.status,
        publishedAt: cleanedProject.publishedAt,
        contentLength: cleanedProject.content?.length || 0,
        contentPreview: cleanedProject.content?.substring(0, 100),
        hasBlocks: !!cleanedProject.blocks,
        blocksCount: cleanedProject.blocks?.length || 0
      });
      
      // Mettre à jour le projet dans le contenu
      const newContent = { ...content };
      const projectIndex = newContent.work.adminProjects.findIndex((p: Project) => p.id === projectId);
      
      console.log('💾 Sauvegarde projet:', { projectId, cleanedProject, projectIndex });
      console.log('💾 Contenu avant sauvegarde:', JSON.stringify(newContent.work.adminProjects, null, 2));
      
      if (projectIndex >= 0) {
        newContent.work.adminProjects[projectIndex] = cleanedProject;
      } else {
        newContent.work.adminProjects.push(cleanedProject);
      }
      
      // Synchroniser avec la liste projects pour le frontend
      if (!newContent.work.projects) {
        newContent.work.projects = [];
      }
      
      // Trouver le projet dans la liste projects
      const projectInFrontend = newContent.work.projects.find((p: any) => p.slug === cleanedProject.slug);
      
      if (projectInFrontend) {
        // Mettre à jour le projet existant
        const projectFrontendIndex = newContent.work.projects.findIndex((p: any) => p.slug === cleanedProject.slug);
        newContent.work.projects[projectFrontendIndex] = {
          ...projectInFrontend,
          title: cleanedProject.title,
          description: cleanedProject.description,
          excerpt: cleanedProject.excerpt,
          content: cleanedProject.content,
          category: cleanedProject.category,
          client: cleanedProject.client,
          year: cleanedProject.year,
          featured: cleanedProject.featured,
          status: cleanedProject.status,
          publishedAt: cleanedProject.publishedAt,
          image: cleanedProject.image,
          alt: cleanedProject.alt
        };
      } else {
        // Ajouter le projet à la liste frontend
        newContent.work.projects.push({
          title: cleanedProject.title,
          description: cleanedProject.description,
          excerpt: cleanedProject.excerpt,
          content: cleanedProject.content,
          category: cleanedProject.category,
          client: cleanedProject.client,
          year: cleanedProject.year,
          featured: cleanedProject.featured,
          status: cleanedProject.status,
          publishedAt: cleanedProject.publishedAt,
          slug: cleanedProject.slug,
          image: cleanedProject.image,
          alt: cleanedProject.alt
        });
      }
      
      console.log('💾 Contenu après sauvegarde:', JSON.stringify(newContent.work.adminProjects, null, 2));
      console.log('💾 Structure envoyée:', {
        hasContent: !!newContent,
        allKeys: Object.keys(newContent),
        workKeys: Object.keys(newContent.work || {}),
        adminProjectsCount: newContent.work?.adminProjects?.length || 0,
        projectsCount: newContent.work?.projects?.length || 0,
        hasHome: !!newContent.home,
        hasContact: !!newContent.contact,
        hasStudio: !!newContent.studio,
        hasBlog: !!newContent.blog,
        hasNav: !!newContent.nav,
        hasMetadata: !!newContent.metadata
      });
      
      // Sauvegarder
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Projet non trouvé</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour à l'administration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[256px_1fr]">
      {/* Sidebar gauche */}
      <Sidebar 
        pages={PAGES}
        settings={SETTINGS}
        currentPage="work"
        onPageChange={(pageId) => {
          if (pageId === 'work') {
            router.push('/admin');
          } else {
            router.push(`/admin?page=${pageId}`);
          }
        }}
      />

      {/* Zone principale */}
      <div className="flex flex-col">
        {/* Header avec SaveBar sticky */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-gray-900 mb-2" style={{ fontSize: '2.25rem' }}>
                  {project.title || 'Nouveau projet'}
                </h1>
                <button
                  onClick={() => {
                    // Rediriger directement vers la page work
                    router.push('/admin?page=work');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Retour aux projets
                </button>
              </div>
            
              <div className="flex items-center space-x-3">
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Modifications non enregistrées
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
                    Enregistré
                  </span>
                )}
                
                <button
                  onClick={hasUnsavedChanges ? handlePreview : () => window.open(`/work/${project.slug || project.id}`, '_blank')}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    hasUnsavedChanges 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                  title={hasUnsavedChanges ? "Aperçu avec les modifications non sauvegardées" : "Voir le projet publié"}
                >
                  {hasUnsavedChanges ? '👁️ Aperçu' : '🔗 Voir la page'}
                </button>
                
                <button
                  onClick={() => handleSaveWithStatus('draft')}
                  disabled={saveStatus === 'saving'}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    saveStatus === 'saving'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                  title={project.status === 'published' ? "Repasser le projet en brouillon" : "Enregistrer comme brouillon"}
                >
                  {project.status === 'published' ? '📝 Passer en brouillon' : '💾 Enregistrer brouillon'}
                </button>
                
                <button
                  onClick={() => handleSaveWithStatus('published')}
                  disabled={saveStatus === 'saving'}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    saveStatus === 'saving'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : project.status === 'published'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {project.status === 'published' ? '✅ Mettre à jour' : '🚀 Publier'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du projet
              </label>
              <input
                type="text"
                value={project.title || ''}
                onChange={(e) => updateProject({ title: e.target.value })}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Titre du projet..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={project.slug || project.id || ''}
                onChange={(e) => {
                  const newSlug = e.target.value;
                  updateProject({ 
                    slug: newSlug,
                    id: newSlug // Mettre à jour l'ID avec le slug
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="slug-du-projet"
              />
            </div>

            {/* Extrait (description courte) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extrait (description courte)
              </label>
              <textarea
                value={project.excerpt || ''}
                onChange={(e) => updateProject({ excerpt: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                placeholder="Description courte du projet (apparaît sur la page work et dans les aperçus)..."
                rows={3}
              />
            </div>

            {/* Image principale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image principale
              </label>
              <MediaUploader
                currentUrl={project.image || ''}
                onUpload={(url) => updateProject({ image: url })}
              />
            </div>

            {/* Métadonnées du projet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  value={project.client || ''}
                  onChange={(e) => updateProject({ client: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nom du client"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={project.category || ''}
                  onChange={(e) => updateProject({ category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Web, Print, Branding..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année
                </label>
                <input
                  type="text"
                  value={project.year || ''}
                  onChange={(e) => updateProject({ year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="2024"
                />
              </div>
            </div>

            {/* Projet en vedette */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={project.featured || false}
                  onChange={(e) => updateProject({ featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Projet en vedette (affiché en premier)
                </span>
              </label>
            </div>

            {/* Extrait */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extrait (description courte)
              </label>
              <textarea
                value={project.excerpt || ''}
                onChange={(e) => updateProject({ excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Description courte du projet..."
              />
            </div>

            {/* Informations de statut */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                  </span>
                </div>
                {project.publishedAt && (
                  <div className="text-sm text-gray-500">
                    Publié le {new Date(project.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Éditeur de blocs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu du projet
              </label>
              <BlockEditor
                pageData={project}
                pageKey="project"
                onUpdate={(updates) => updateProject(updates)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 