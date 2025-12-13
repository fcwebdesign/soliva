"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import HeaderAdmin from '../../components/HeaderAdmin';
import BlockEditor from '../../components/BlockEditor';
import MediaUploader from '../../components/MediaUploader';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { Content } from '@/types/content';

const PAGES = [
  { id: 'home', label: 'Accueil', path: '/', icon: '🏠' },
  { id: 'studio', label: 'Studio', path: '/studio', icon: '🎨' },
  { id: 'contact', label: 'Contact', path: '/contact', icon: '📧' },
  { id: 'work', label: 'Portfolio', path: '/work', icon: '💼' },
  { id: 'blog', label: 'Blog', path: '/blog', icon: '📝' },
];

const SETTINGS = [
  { id: 'nav', label: 'Navigation', path: null, icon: '🧭' },
  { id: 'metadata', label: 'Métadonnées', path: null, icon: '⚙️' },
  { id: 'backup', label: 'Sauvegarde', path: null, icon: '💾' },
];

const slugify = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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
  
  const [siteKey, setSiteKey] = useState<string>('soliva');
  const [content, setContent] = useState<Content | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger le contenu et trouver le projet
  useEffect(() => {
    fetchContent();
  }, []);

  // Écouter les mises à jour de contenu (depuis le visual editor ou autres sources)
  useEffect(() => {
    let isSaving = false; // Flag pour éviter de recharger pendant la sauvegarde
    
    const handleContentUpdate = (event: CustomEvent) => {
      // ✅ CRITIQUE : Ne pas recharger si c'est nous qui venons de sauvegarder
      // (pour éviter de perdre le projet actuel et créer un nouveau projet)
      if (isSaving) {
        return;
      }
      
      // Recharger seulement si la mise à jour concerne un autre projet
      const updatedProjectId = event.detail?.work?.adminProjects?.find((p: any) => 
        p.id === projectId || p.slug === projectId
      );
      
      if (!updatedProjectId) {
        fetchContent();
      }
    };

    window.addEventListener('content-updated', handleContentUpdate as EventListener);
    
    // Écouter aussi les changements de localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (isSaving) {
        return;
      }
      if (e.key === 'content-updated' || e.key?.includes('updated')) {
        fetchContent();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Vérifier périodiquement si le contenu a été mis à jour (fallback)
    const intervalId = setInterval(() => {
      if (isSaving) return; // Ignorer pendant la sauvegarde
      
      const lastUpdate = localStorage.getItem('content-updated');
      if (lastUpdate) {
        // Recharger seulement si on détecte une mise à jour récente (dans les 5 dernières secondes)
        const updateTime = parseInt(lastUpdate, 10);
        if (Date.now() - updateTime < 5000) {
          fetchContent();
        }
      }
    }, 2000);

    // Exposer le flag pour la sauvegarde
    (window as any).__workPageIsSaving = (saving: boolean) => {
      isSaving = saving;
    };

    return () => {
      window.removeEventListener('content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
      delete (window as any).__workPageIsSaving;
    };
  }, [projectId]);

  // Ajouter la classe admin-page au body
  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const resolveSiteKey = async (): Promise<string> => {
    // 1) Paramètre d'URL ?template=...
    if (typeof window !== 'undefined') {
      const urlTemplate = new URLSearchParams(window.location.search).get('template');
      if (urlTemplate) {
        setSiteKey(urlTemplate);
        return urlTemplate;
      }
    }
    // 2) Contenu public courant (porte la clé _template)
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const tpl = data?._template || 'soliva';
        setSiteKey(tpl);
        return tpl;
      }
    } catch {
      // ignore et fallback soliva
    }
    setSiteKey('soliva');
    return 'soliva';
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const tpl = await resolveSiteKey();
      const response = await fetch(`/api/admin/content?site=${encodeURIComponent(tpl)}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setContent(data);
      
      // Trouver le projet par ID (priorité) ou par slug (fallback)
      // ✅ CRITIQUE : Chercher aussi par slug en priorité si projectId ressemble à un slug
      let foundProject = data.work?.adminProjects?.find((p: Project) => 
        p.id === projectId || p.slug === projectId
      );
      
      // Si toujours pas trouvé, chercher par slug ou id de manière plus large
      if (!foundProject) {
        foundProject = data.work?.adminProjects?.find((p: Project) => 
          (p.slug && p.slug === projectId) || (p.id && p.id === projectId)
        );
      }
      if (foundProject) {
        // S'assurer que le projet a un id
        if (!foundProject.id) {
          foundProject.id = foundProject.slug || projectId;
        }
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
      // Utiliser /api/content/metadata pour les métadonnées
      // Pour le projet complet, utiliser /api/content/project/[slug] si nécessaire
      const contentResponse = await fetch('/api/content/metadata');
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
      
      // Toast de confirmation
      toast.success('Aperçu créé avec succès', {
        description: 'L\'aperçu s\'ouvre dans un nouvel onglet'
      });
      
    } catch (err) {
      console.error('Erreur aperçu projet:', err);
      toast.error('Erreur lors de la création de l\'aperçu', {
        description: 'Veuillez réessayer ou vérifier votre connexion'
      });
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
      
      // ✅ CRITIQUE : Préserver un slug propre (priorité à l'input, sinon généré depuis le titre)
      const userSlug = projectToSave.slug ? slugify(projectToSave.slug) : '';
      const titleSlug = projectToSave.title ? slugify(projectToSave.title) : '';
      const projectSlug = userSlug || titleSlug || slugify(projectId) || slugify(projectToSave.id || '') || `project-${Date.now()}`;
      
      // Nettoyer le contenu du projet
      // IMPORTANT : Préserver les blocs pour la synchronisation avec le visual editor
      const cleanedProject = {
        ...projectToSave,
        slug: projectSlug, // Garantir qu'un slug existe (priorité au slug existant, puis projectId de l'URL)
        content: cleanProjectContent(finalContent),
        blocks: projectToSave.blocks // Préserver les blocs (utilisés par le visual editor)
      };
      
      // Mettre à jour le projet dans le contenu
      const newContent = { ...content };
      const projectIndex = newContent.work.adminProjects.findIndex((p: Project) => p.id === projectId);
      
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
      const projectInFrontend = newContent.work.projects.find((p: any) => p.slug === projectSlug);
      
      if (projectInFrontend) {
        // Mettre à jour le projet existant
        const projectFrontendIndex = newContent.work.projects.findIndex((p: any) => p.slug === projectSlug);
        newContent.work.projects[projectFrontendIndex] = {
          ...projectInFrontend,
          title: cleanedProject.title,
          description: (cleanedProject as any).description,
          excerpt: (cleanedProject as any).excerpt,
          content: cleanedProject.content,
          category: cleanedProject.category,
          client: cleanedProject.client,
          year: cleanedProject.year,
          featured: cleanedProject.featured,
          status: cleanedProject.status,
          publishedAt: cleanedProject.publishedAt,
          slug: projectSlug, // Toujours inclure le slug
          image: (cleanedProject as any).image,
          alt: (cleanedProject as any).alt
        } as any;
      } else {
        // Ajouter le projet à la liste frontend
        newContent.work.projects.push({
          title: cleanedProject.title,
          description: (cleanedProject as any).description,
          excerpt: (cleanedProject as any).excerpt,
          content: cleanedProject.content,
          category: cleanedProject.category,
          client: cleanedProject.client,
          year: cleanedProject.year,
          featured: cleanedProject.featured,
          status: cleanedProject.status,
          publishedAt: cleanedProject.publishedAt,
          slug: projectSlug, // Toujours inclure le slug (requis par le schéma)
          image: (cleanedProject as any).image,
          alt: (cleanedProject as any).alt
        } as any);
      }
      
      // Sauvegarder
      const response = await fetch(`/api/admin/content?site=${encodeURIComponent(siteKey)}`, {
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

      await response.json();

      // ✅ CRITIQUE : Mettre à jour l'état local immédiatement après la sauvegarde
      // pour que l'interface se mette à jour sans avoir besoin de rafraîchir
      setContent(newContent);
      setProject(cleanedProject);
      setSaveStatus('success');
      setHasUnsavedChanges(false);
      
      // 🔀 Si on était sur /admin/work/new (ou un ID différent), rediriger vers l'URL du projet pour éviter la recréation
      // Fallback sur l'id si jamais le slug est vide (sécurité)
      if ((projectId === 'new' || projectId !== cleanedProject.slug) && (cleanedProject.slug || cleanedProject.id)) {
        router.replace(`/admin/work/${cleanedProject.slug || cleanedProject.id}`);
      }
      
      // ✅ CRITIQUE : Marquer qu'on est en train de sauvegarder pour éviter le rechargement
      if (typeof window !== 'undefined' && (window as any).__workPageIsSaving) {
        (window as any).__workPageIsSaving(true);
      }
      
      // ✅ CRITIQUE : Ne PAS mettre à jour l'URL pour éviter les redirections
      // L'URL reste sur le projectId actuel, même si le slug a changé
      // Cela évite les rechargements et les problèmes de synchronisation
      
      // Notifier le front pour mise à jour live des blocs projets
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('content-updated', {
            detail: {
              work: newContent.work
            }
          }));
          // Déclencher un changement de storage pour forcer le rechargement
          localStorage.setItem('content-updated', String(Date.now()));
        }
      } catch (error) {
        // ignore
      } finally {
        // ✅ CRITIQUE : Réinitialiser le flag après un court délai pour permettre la notification
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window as any).__workPageIsSaving) {
            (window as any).__workPageIsSaving(false);
          }
        }, 1000);
      }
      
      // Toast de succès
      toast.success('Projet sauvegardé avec succès', {
        description: projectToSave.status === 'published' ? 'Le projet est maintenant publié' : 'Brouillon enregistré'
      });
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setSaveStatus('error');
      
      // Toast d'erreur
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Veuillez réessayer ou vérifier votre connexion',
        action: {
          label: 'Réessayer',
          onClick: () => handleSaveInternal(projectToSave)
        }
      });
      
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
        currentPage="work"
      />

      {/* Zone principale */}
      <div className="flex flex-col">
        {/* Header avec SaveBar sticky */}
        <HeaderAdmin
          title={project.title || 'Nouveau projet'}
          backButton={{
            text: '← Retour aux projets',
            onClick: () => router.push('/admin?page=work')
          }}
          actions={{
            hasUnsavedChanges,
            saveStatus,
            onPreview: hasUnsavedChanges ? handlePreview : () => window.open(`/work/${project.slug || project.id}`, '_blank'),
            onSaveDraft: () => handleSaveWithStatus('draft'),
            onPublish: () => handleSaveWithStatus('published'),
            previewDisabled: saveStatus === 'saving',
            saveDisabled: saveStatus === 'saving',
            publishDisabled: saveStatus === 'saving',
            previewTitle: hasUnsavedChanges ? "Aperçu avec les modifications non sauvegardées" : "Voir le projet publié",
            draftTitle: project.status === 'published' ? "Repasser le projet en brouillon" : "Enregistrer comme brouillon"
          }}
        />

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
                currentUrl={(project as any).image || ''}
                onUpload={(url) => updateProject({ image: url } as any)}
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
                <Checkbox
                  checked={project.featured || false}
                  onCheckedChange={(checked) => updateProject({ featured: !!checked })}
                  className="rounded-[3px]"
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
