"use client";
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useRouter } from 'next/navigation';
import WysiwygEditor from './WysiwygEditor';
import MediaUploader from './MediaUploader';
import VersionList from './VersionList';

interface Block {
  id: string;
  type: 'h2' | 'h3' | 'content' | 'image' | 'cta';
  content: string;
  image?: {
    src: string;
    alt: string;
  };
  ctaText?: string;
  ctaLink?: string;
}

interface BlockEditorProps {
  pageData: any;
  pageKey: string;
  onUpdate: (updates: any) => void;
}

export default function BlockEditor({ pageData, pageKey, onUpdate }: BlockEditorProps) {
  const router = useRouter();
  const [localData, setLocalData] = useState(pageData || {});
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  
  // Synchroniser localData avec pageData quand pageData change
  useEffect(() => {
    if (pageData) {
      setLocalData(pageData);
    }
  }, [pageData]);

  // Éviter les reconversions inutiles
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);
  const [initialContent, setInitialContent] = useState<string>('');
  
  // États pour les onglets des pages Work et Blog
  const [workActiveTab, setWorkActiveTab] = useState('content');
  const [blogActiveTab, setBlogActiveTab] = useState('content');
  
  useEffect(() => {
    if (pageData && !hasInitialized && !isUpdatingContent) {
      setHasInitialized(true);
      
      // Priorité 1: Charger les blocs sauvegardés s'ils existent
      if (pageData.blocks && Array.isArray(pageData.blocks) && pageData.blocks.length > 0) {
        console.log('🔄 Chargement des blocs sauvegardés');
        setBlocks(pageData.blocks);
        setInitialContent(pageData.content || '');
      }
      // Priorité 2: Créer un bloc content à partir du HTML existant
      else if (pageData.content && pageData.content !== initialContent) {
        console.log('🔄 Création d\'un bloc content initial');
        setInitialContent(pageData.content);
        setBlocks([{
          id: 'block-1',
          type: 'content',
          content: pageData.content
        }]);
      }
      // Priorité 3: Créer un bloc vide
      else {
        console.log('🔄 Création d\'un bloc vide');
        setBlocks([{
          id: 'block-1',
          type: 'content',
          content: ''
        }]);
      }
    }
  }, [pageData, hasInitialized, isUpdatingContent, initialContent]);

  // Nettoyer les blocs invalides UNIQUEMENT lors de la conversion initiale
  useEffect(() => {
    if (blocks.length > 0) {
      const cleanedBlocks = cleanInvalidBlocks(blocks);
      console.log('🔍 Vérification des blocs:', { 
        total: blocks.length, 
        cleaned: cleanedBlocks.length,
        blocks: blocks.map(b => ({ id: b.id, type: b.type }))
      });
      
      // Ne nettoyer que si on a des blocs invalides ET qu'on vient de charger
      if (cleanedBlocks.length !== blocks.length && blocks.some(b => !['h2', 'h3', 'content', 'image', 'cta'].includes(b.type))) {
        console.log('🧹 Nettoyage automatique des blocs invalides');
        setBlocks(cleanedBlocks);
        updateBlocksContent(cleanedBlocks);
      }
    }
  }, [blocks.length]); // Se déclenche quand le nombre de blocs change

  const convertContentToBlocks = (content: string) => {
    if (!content) {
      setBlocks([]);
      return;
    }
    
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      setBlocks([{
        id: 'block-1',
        type: 'content',
        content: content
      }]);
      return;
    }
    
    console.log('🔄 Conversion du contenu:', content.substring(0, 100) + '...');
    
    // Nettoyer le contenu HTML avant conversion
    const cleanContent = (html: string) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Supprimer les anciens blocs invalides
      const invalidElements = tempDiv.querySelectorAll('[data-block-type="list"], [data-block-type="quote"]');
      invalidElements.forEach(el => el.remove());
      
      return tempDiv.innerHTML;
    };
    
    const cleanedContent = cleanContent(content);
    
    // Convertir le HTML en blocs
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedContent;
    
    const blocks: Block[] = [];
    let blockId = 1;
    
    // Vérifier si le contenu semble être du HTML simple (pas de structure de blocs)
    const hasStructuredContent = tempDiv.querySelector('h2, h3, img, .cta-block');
    
    if (!hasStructuredContent && tempDiv.children.length <= 1) {
      // Si c'est du contenu simple, créer un seul bloc content
      blocks.push({
        id: 'block-1',
        type: 'content',
        content: cleanedContent
      });
    } else {
      // Parcourir les éléments enfants pour le contenu structuré
      Array.from(tempDiv.children).forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h2':
            blocks.push({
              id: `block-${blockId++}`,
              type: 'h2',
              content: element.textContent || ''
            });
            break;
          case 'h3':
            blocks.push({
              id: `block-${blockId++}`,
              type: 'h3',
              content: element.textContent || ''
            });
            break;
          case 'img':
            const img = element as HTMLImageElement;
            blocks.push({
              id: `block-${blockId++}`,
              type: 'image',
              content: '',
              image: {
                src: img.src || '',
                alt: img.alt || ''
              }
            });
            break;
          default:
            // Pour tout autre élément (y compris blockquote, ul, ol), créer un bloc content
            if ((element.textContent && element.textContent.trim()) || (element.innerHTML && element.innerHTML.trim())) {
              blocks.push({
                id: `block-${blockId++}`,
                type: 'content',
                content: element.outerHTML
              });
            }
            break;
        }
      });
    }
    
    // Si aucun bloc n'a été créé mais qu'il y a du contenu, créer un bloc content
    if (blocks.length === 0 && content && typeof content === 'string' && content.trim()) {
      blocks.push({
        id: 'block-1',
        type: 'content',
        content: content
      });
    }
    
    console.log('✅ Blocs créés:', blocks.map(b => ({ id: b.id, type: b.type })));
    
    // Nettoyer et appliquer les blocs
    const cleanedBlocks = cleanInvalidBlocks(blocks);
    setBlocks(cleanedBlocks);
  };

  // Fonction pour nettoyer les blocs invalides
  const cleanInvalidBlocks = (blocks: Block[]): Block[] => {
    const validTypes: Block['type'][] = ['h2', 'h3', 'content', 'image', 'cta'];
    
    const filteredBlocks = blocks.filter(block => {
      // Supprimer les blocs avec des types invalides
      if (!validTypes.includes(block.type)) {
        console.warn(`🚫 Bloc invalide supprimé: ${block.type}`);
        return false;
      }
      
      // Nettoyer les blocs content vides
      if (block.type === 'content' && (!block.content || (typeof block.content === 'string' && block.content.trim() === ''))) {
        console.warn(`🚫 Bloc content vide supprimé`);
        return false;
      }
      
      return true;
    });
    
    const reindexedBlocks = filteredBlocks.map((block, index) => ({
      ...block,
      id: `block-${index + 1}` // Réindexer les IDs
    }));
    
    console.log('🧹 Nettoyage terminé:', {
      avant: blocks.length,
      apres: reindexedBlocks.length,
      supprimes: blocks.length - reindexedBlocks.length
    });
    
    return reindexedBlocks;
  };

  const updateField = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newData = { ...localData };
    let current = newData;
    
    // Créer les objets manquants dans le chemin
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    setLocalData(newData);
    onUpdate(newData);
  };

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      ...(type === 'image' && { image: { src: '', alt: '' } }),
      ...(type === 'cta' && { ctaText: '', ctaLink: '' })
    };
    
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    // Mettre à jour le contenu après ajout
    updateBlocksContent(newBlocks);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
    // Mettre à jour le contenu après modification
    updateBlocksContent(newBlocks);
  };

  const removeBlock = (blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(newBlocks);
    // Mettre à jour le contenu après suppression
    updateBlocksContent(newBlocks);
  };

  const updateBlocksContent = (newBlocks: Block[]) => {
    setIsUpdatingContent(true);
    
    // Générer le HTML à partir des blocs
    const htmlContent = newBlocks.map(block => {
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
    }).filter(html => html && typeof html === 'string' && html.trim() !== '').join('\n');
    
    console.log('💾 Génération HTML:', {
      blocks: newBlocks.map(b => ({ type: b.type, content: b.content?.substring(0, 50) })),
      html: htmlContent.substring(0, 200)
    });
    
    // Mettre à jour les champs content ET blocks
    updateField('content', htmlContent);
    updateField('blocks', newBlocks);
    
    // Réinitialiser le flag après un délai
    setTimeout(() => {
      setIsUpdatingContent(false);
    }, 500);
  };

  // Fonction pour sauvegarder le contenu des blocs
  const saveBlocksContent = () => {
    console.log('💾 Sauvegarde du contenu des blocs');
    updateBlocksContent(blocks);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setBlocks(items);
    // Sauvegarder le contenu après réorganisation
    updateBlocksContent(items);
  };

  // Drag & drop natif
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    
    const cleanedBlocks = cleanInvalidBlocks(newBlocks);
    setBlocks(cleanedBlocks);
    updateBlocksContent(cleanedBlocks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEndNative = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderBlock = (block: Block, index: number) => {
    if (!block || !block.type) {
      return <div className="text-red-500">Erreur: bloc invalide</div>;
    }
    
    switch (block.type) {
      case 'h2':
        return (
          <div className="block-editor">
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Titre de section (H2)"
              className="block-input h2-input"
            />
          </div>
        );
      
      case 'h3':
        return (
          <div className="block-editor">
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Sous-titre (H3)"
              className="block-input h3-input"
            />
          </div>
        );
      
      case 'content':
        return (
          <div className="block-editor">
            <WysiwygEditor
              value={block.content}
              onChange={(content) => updateBlock(block.id, { content })}
            />
          </div>
        );
      
      
      
      case 'image':
        return (
          <div className="block-editor">
            <MediaUploader
              currentUrl={block.image?.src || ''}
              onUpload={(src) => updateBlock(block.id, { image: { ...block.image, src } })}
            />
            <input
              type="text"
              value={block.image?.alt || ''}
              onChange={(e) => updateBlock(block.id, { image: { ...block.image, alt: e.target.value } })}
              placeholder="Description de l'image (alt text)"
              className="block-input"
            />
          </div>
        );
      
      case 'cta':
        return (
          <div className="block-editor">
            <input
              type="text"
              value={block.ctaText || ''}
              onChange={(e) => updateBlock(block.id, { ctaText: e.target.value })}
              placeholder="Texte du CTA"
              className="block-input"
            />
            <input
              type="text"
              value={block.ctaLink || ''}
              onChange={(e) => updateBlock(block.id, { ctaLink: e.target.value })}
              placeholder="Lien du CTA"
              className="block-input"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderBlockTypeLabel = (type: Block['type']) => {
    switch (type) {
      case 'h2': return 'Titre H2';
      case 'h3': return 'Sous-titre H3';
      case 'content': return 'Contenu';
      case 'image': return 'Image';
      case 'cta': return 'CTA';
      default: return type;
    }
  };

  const renderHeroBlock = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-semibold text-gray-900">Section Hero</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={localData?.hero?.title || ''}
            onChange={(e) => updateField('hero.title', e.target.value)}
            placeholder="Titre de la page"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderContentBlock = () => {
    // Pour les pages blog et work, la description est directement à la racine
    const isDirectDescription = pageKey === 'blog' || pageKey === 'work';
    const descriptionPath = isDirectDescription ? 'description' : 'content.description';
    const descriptionValue = isDirectDescription ? localData.description : localData.content?.description;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-semibold text-gray-900">Contenu</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <WysiwygEditor
              value={descriptionValue || ''}
              onChange={(value) => updateField(descriptionPath, value)}
              placeholder="Description de la page"
            />
          </div>
        
        {localData.content?.image && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <MediaUploader
              currentUrl={localData.content.image.src}
              onUpload={(url) => updateField('content.image.src', url)}
            />
            <input
              type="text"
              value={localData.content.image.alt || ''}
              onChange={(e) => updateField('content.image.alt', e.target.value)}
              placeholder="Texte alternatif de l'image"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-2"
            />
          </div>
        )}
      </div>
    </div>
    );
  };



  const renderArticlesBlock = () => {
    const articles = localData.articles || [];
    const publishedCount = articles.filter((a: any) => a.status === 'published').length;
    const draftCount = articles.filter((a: any) => a.status === 'draft' || !a.status).length;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📝</span>
              <h3 className="text-lg font-semibold text-gray-900">Articles ({articles.length})</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✅ {publishedCount} publié{publishedCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                📝 {draftCount} brouillon{draftCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              const newId = `article-${Date.now()}`;
              router.push(`/admin/blog/${newId}`);
            }}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Nouvel article
          </button>
        </div>
        
        <div className="space-y-3">
          {articles.map((article: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-md font-semibold text-gray-900 truncate">
                      {article.title || `Article ${index + 1}`}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">
                      ID: {article.slug || article.id}
                    </p>
                    {article.publishedAt && (
                      <p className="text-sm text-gray-500">
                        Publié: {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => router.push(`/admin/blog/${article.id}`)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    title="Éditer l'article complet"
                  >
                    ✏️ Éditer
                  </button>
                  <button 
                    onClick={() => window.open(`/blog/${article.slug || article.id}`, '_blank')}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    title="Aperçu de l'article"
                  >
                    👁️ Aperçu
                  </button>
                  <button className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors">
                    📋 Dupliquer
                  </button>
                  <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectsBlock = () => {
    const projects = localData.adminProjects || [];
    const publishedCount = projects.filter((p: any) => p.status === 'published').length;
    const draftCount = projects.filter((p: any) => p.status === 'draft' || !p.status).length;
    const featuredCount = projects.filter((p: any) => p.featured).length;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💼</span>
              <h3 className="text-lg font-semibold text-gray-900">Projets ({projects.length})</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✅ {publishedCount} publié{publishedCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                📝 {draftCount} brouillon{draftCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                ⭐ {featuredCount} en vedette
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              const newId = `project-${Date.now()}`;
              router.push(`/admin/work/${newId}`);
            }}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Nouveau projet
          </button>
        </div>
        
        <div className="space-y-3">
          {projects.map((project: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-md font-semibold text-gray-900 truncate">
                      {project.title || `Projet ${index + 1}`}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                    </span>
                    {project.featured && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        ⭐ Vedette
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">
                      ID: {project.slug || project.id}
                    </p>
                    {project.client && (
                      <p className="text-sm text-gray-500">
                        Client: {project.client}
                      </p>
                    )}
                    {project.category && (
                      <p className="text-sm text-gray-500">
                        Catégorie: {project.category}
                      </p>
                    )}
                    {project.year && (
                      <p className="text-sm text-gray-500">
                        Année: {project.year}
                      </p>
                    )}
                    {project.publishedAt && (
                      <p className="text-sm text-gray-500">
                        Publié: {new Date(project.publishedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => router.push(`/admin/work/${project.id}`)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    title="Éditer le projet complet"
                  >
                    ✏️ Éditer
                  </button>
                  <button 
                    onClick={() => window.open(`/work/${project.slug || project.id}`, '_blank')}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    title="Aperçu du projet"
                  >
                    👁️ Aperçu
                  </button>
                  <button className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors">
                    📋 Dupliquer
                  </button>
                  <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNavBlock = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🧭</span>
        <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>
          <input
            type="text"
            value={localData.logo || ''}
            onChange={(e) => updateField('logo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items de menu
          </label>
          <textarea
            value={localData.items?.join('\n') || ''}
            onChange={(e) => updateField('items', e.target.value.split('\n').filter(Boolean))}
            placeholder="Un item par ligne"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation
          </label>
          <input
            type="text"
            value={localData.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderMetadataBlock = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">⚙️</span>
        <h3 className="text-lg font-semibold text-gray-900">Métadonnées</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={localData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={localData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderContactBlock = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">📧</span>
        <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={localData.hero?.title || ''}
            onChange={(e) => updateField('hero.title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborations - Titre
            </label>
            <input
              type="text"
              value={localData.sections?.collaborations?.title || ''}
              onChange={(e) => updateField('sections.collaborations.title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborations - Email
            </label>
            <input
              type="email"
              value={localData.sections?.collaborations?.email || ''}
              onChange={(e) => updateField('sections.collaborations.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inquiries - Titre
            </label>
            <input
              type="text"
              value={localData.sections?.inquiries?.title || ''}
              onChange={(e) => updateField('sections.inquiries.title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inquiries - Email
            </label>
            <input
              type="email"
              value={localData.sections?.inquiries?.email || ''}
              onChange={(e) => updateField('sections.inquiries.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réseaux sociaux
          </label>
          <textarea
            value={localData.socials?.join('\n') || ''}
            onChange={(e) => updateField('socials', e.target.value.split('\n').filter(Boolean))}
            placeholder="Un réseau par ligne"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderBlogTabs = () => {
    return (
      <div className="space-y-6">
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setBlogActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                blogActiveTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Contenu
            </button>
            <button
              onClick={() => setBlogActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                blogActiveTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Paramètres
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {blogActiveTab === 'content' && renderArticlesBlock()}
        {blogActiveTab === 'settings' && (
          <div className="space-y-6">
            {renderHeroBlock()}
            {renderContentBlock()}
          </div>
        )}
      </div>
    );
  };

  const renderWorkTabs = () => {
    return (
      <div className="space-y-6">
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setWorkActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                workActiveTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Contenu
            </button>
            <button
              onClick={() => setWorkActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                workActiveTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Paramètres
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {workActiveTab === 'content' && renderProjectsBlock()}
        {workActiveTab === 'settings' && (
          <div className="space-y-6">
            {renderHeroBlock()}
            {renderContentBlock()}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour rendre l'éditeur drag & drop
  const renderDragDropEditor = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-semibold text-gray-900">Éditeur de contenu</h3>
        </div>
        
        {/* Menu pour ajouter des blocs */}
        <div className="flex items-center space-x-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addBlock(e.target.value as Block['type']);
                e.target.value = '';
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Ajouter un bloc...</option>
            <option value="h2">Titre H2</option>
            <option value="h3">Sous-titre H3</option>
            <option value="content">Contenu</option>
            <option value="image">Image</option>
            <option value="cta">CTA</option>
          </select>
        </div>
      </div>
      
      {/* Zone de blocs avec drag & drop natif */}
      <div 
        className="space-y-4 min-h-[100px] p-2 rounded-lg border-2 border-dashed border-gray-200 transition-colors"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
        }}
        onDrop={(e) => {
          e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
        }}
      >
        {(blocks || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">Aucun bloc pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">Utilisez le menu ci-dessus pour ajouter votre premier bloc</p>
          </div>
        ) : (
          (blocks || []).map((block, index) => (
            <div
              key={block.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`block-container relative ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${
                dragOverIndex === index && draggedIndex !== index 
                  ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' 
                  : ''
              }`}
            >
              {/* Indicateur de drop au-dessus */}
              {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-10"></div>
              )}
              
              {/* Indicateur de drop en dessous */}
              {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-10"></div>
              )}
              <div 
                className="block-header"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEndNative}
              >
                <div className="drag-handle cursor-grab active:cursor-grabbing">
                  ⋮⋮
                </div>
                <span className="block-type">{renderBlockTypeLabel(block.type)}</span>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="remove-block"
                >
                  ×
                </button>
              </div>
              {renderBlock(block, index)}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Si c'est un article individuel, utiliser l'éditeur de blocs
  if (pageKey === 'article') {
    return (
      <div className="space-y-6">
        {renderDragDropEditor()}
      </div>
    );
  }

  // Si c'est un projet individuel, utiliser l'éditeur de blocs
  if (pageKey === 'project' || pageKey.startsWith('project-')) {
    return (
      <div className="space-y-6">
        {renderDragDropEditor()}
      </div>
    );
  }
  
  // Si c'est la page blog générale, afficher les onglets
  if (pageKey === 'blog' && localData.articles) {
    return renderBlogTabs();
  }

  // Si c'est la page work générale, afficher les onglets
  if (pageKey === 'work' && localData.adminProjects) {
    return renderWorkTabs();
  }

  // Exposer la fonction saveBlocksContent via ref (seulement si ref existe)
  // React.useImperativeHandle(ref, () => ({
  //   saveBlocksContent
  // }), [blocks]);

  const renderBackupBlock = () => {
    const handleCreateBackup = async () => {
      setBackupLoading(true);
      try {
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'backup' }),
        });
        
        if (response.ok) {
          alert('Sauvegarde créée avec succès !');
        } else {
          alert('Erreur lors de la création de la sauvegarde');
        }
      } catch (err) {
        alert('Erreur lors de la création de la sauvegarde');
      } finally {
        setBackupLoading(false);
      }
    };

    const handleCleanupVersions = async () => {
      if (!confirm('Nettoyer les anciennes versions ? (garde les 10 plus récentes)')) {
        return;
      }
      
      try {
        const response = await fetch('/api/admin/versions/cleanup', {
          method: 'POST',
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`✅ ${result.deleted} anciennes versions supprimées !`);
          // Recharger la liste des versions
          window.location.reload();
        } else {
          alert('Erreur lors du nettoyage');
        }
      } catch (err) {
        alert('Erreur lors du nettoyage');
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-2xl">💾</span>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des sauvegardes</h3>
        </div>

        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCreateBackup}
              disabled={backupLoading}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <span>💾</span>
              <span>{backupLoading ? 'Création...' : 'Créer une sauvegarde'}</span>
            </button>

            <button
              onClick={handleCleanupVersions}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <span>🧹</span>
              <span>Nettoyer les versions</span>
            </button>
          </div>

          {/* Liste des versions */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Versions sauvegardées</h4>
            <VersionList onRevert={(filename) => {
              alert(`Version ${filename} restaurée !`);
              window.location.reload();
            }} />
          </div>
        </div>
      </div>
    );
  };

  // Si c'est la page backup, afficher la gestion des sauvegardes
  if (pageKey === 'backup') {
    return (
      <div className="space-y-6">
        {renderBackupBlock()}
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Rendu conditionnel selon le type de page */}
      {pageKey === 'home' && renderHeroBlock()}
      {pageKey === 'contact' && renderContactBlock()}
      
      {/* Pour les projets et articles individuels, afficher l'éditeur de blocs */}
      {(pageKey === 'project' || pageKey === 'article' || pageKey.startsWith('project-') || pageKey.startsWith('article-')) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Éditeur de contenu</h3>
          {renderDragDropEditor()}
        </div>
      )}
      
      {/* Pour les autres pages, afficher les blocs classiques */}
      {!['blog', 'work', 'backup', 'project', 'article'].includes(pageKey) && !pageKey.startsWith('project-') && !pageKey.startsWith('article-') && (
        <>
          {renderContentBlock()}
          {renderMetadataBlock()}
          {renderNavBlock()}
        </>
      )}
    </div>
  );
} 