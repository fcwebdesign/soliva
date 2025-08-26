"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import WysiwygEditor from './WysiwygEditor';
import MediaUploader, { LogoUploader } from './MediaUploader';
import VersionList from './VersionList';
import TwoColumnsEditor from './TwoColumnsEditor';

interface Block {
  id: string;
  type: 'h2' | 'h3' | 'content' | 'image' | 'cta' | 'contact' | 'about' | 'services' | 'projects' | 'logos' | 'two-columns';
  content: string;
  title?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
  ctaText?: string;
  ctaLink?: string;
  icon?: string;
  offerings?: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
  maxProjects?: number;
  selectedProjects?: string[];
  logos?: Array<{
    src?: string;
    image?: string;
    alt?: string;
    name?: string;
  }>;
  leftColumn?: any[];
  rightColumn?: any[];
  layout?: 'left-right' | 'right-left' | 'stacked-mobile';
  gap?: 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
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
  const [draggedLogoIndex, setDraggedLogoIndex] = useState<number | null>(null);
  const [dragOverLogoIndex, setDragOverLogoIndex] = useState<number | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  
  // Synchroniser localData avec pageData quand pageData change
  useEffect(() => {
    if (pageData) {
      setLocalData(pageData);
    }
  }, [pageData]);

  // Réinitialiser l'état quand on change de page
  useEffect(() => {
    console.log(`🔄 Changement de page détecté: ${pageKey}`);
    setHasInitialized(false);
    setIsUpdatingContent(false);
    setInitialContent('');
    setBlocks([]);
  }, [pageKey]);

  // Éviter les reconversions inutiles
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);
  const [initialContent, setInitialContent] = useState<string>('');
  
  // États pour les onglets des pages Work, Blog et Contact
  const [workActiveTab, setWorkActiveTab] = useState('content');
  const [blogActiveTab, setBlogActiveTab] = useState('content');
  const [contactActiveTab, setContactActiveTab] = useState('content');
  
  // États pour les suggestions IA (séparés par page)
  const [workAiSuggestions, setWorkAiSuggestions] = useState<string[]>([]);
  const [blogAiSuggestions, setBlogAiSuggestions] = useState<string[]>([]);
  const [workIsLoadingAI, setWorkIsLoadingAI] = useState(false);
  const [blogIsLoadingAI, setBlogIsLoadingAI] = useState(false);
  
  // États pour les suggestions de description IA
  const [isLoadingDescriptionAI, setIsLoadingDescriptionAI] = useState(false);
  
  // États pour les suggestions de contenu de blocs IA
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);
  
  // États pour les actions de duplication et suppression
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // État pour gérer la visibilité des blocs
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(() => {
    // Charger l'état depuis localStorage au démarrage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`collapsed-blocks-${pageKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  
  // États pour les notifications modales
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  
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
              if (cleanedBlocks.length !== blocks.length && blocks.some(b => !['h2', 'h3', 'content', 'image', 'cta', 'about'].includes(b.type))) {
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
            const hasStructuredContent = tempDiv.querySelector('h2, h3, img, .cta-block, .about-block');
    
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
    const validTypes: Block['type'][] = ['h2', 'h3', 'content', 'image', 'cta', 'contact', 'about', 'services', 'projects', 'logos', 'two-columns'];
    
    const filteredBlocks = blocks.filter(block => {
      // Supprimer les blocs avec des types invalides
      if (!validTypes.includes(block.type)) {
        console.warn(`🚫 Bloc invalide supprimé: ${block.type}`);
        return false;
      }
      
      // Nettoyer les blocs content vides (seulement s'ils sont vraiment vides après édition)
      if (block.type === 'content' && block.content === null) {
        console.warn(`🚫 Bloc content null supprimé`);
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
    console.log('🔧 Ajout du bloc:', type);
    
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      ...(type === 'image' && { image: { src: '', alt: '' } }),
      ...(type === 'cta' && { ctaText: '', ctaLink: '' }),
      ...(type === 'contact' && { title: '', ctaText: '', ctaLink: '' }),
      ...(type === 'about' && { title: '', content: '' }),
      ...(type === 'services' && { 
  title: 'OUR CORE OFFERINGS', 
  offerings: [
    {
      id: 'service-1',
      title: 'Commercial Excellence',
      description: 'We deliver tailored commercial excellence services...',
      icon: ''
    }
  ]
}),
...(type === 'projects' && { 
  title: 'NOS RÉALISATIONS',
  maxProjects: 6,
  selectedProjects: []
}),
...(type === 'logos' && { 
  title: 'NOS CLIENTS',
  logos: []
}),
...(type === 'two-columns' && { 
  leftColumn: [],
  rightColumn: [],
  layout: 'left-right',
  gap: 'medium',
  alignment: 'top'
})
    };
    
    console.log('🔧 Nouveau bloc créé:', newBlock);
    
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

  const toggleBlockVisibility = (blockId: string) => {
    const newCollapsedBlocks = new Set(collapsedBlocks);
    if (newCollapsedBlocks.has(blockId)) {
      newCollapsedBlocks.delete(blockId);
    } else {
      newCollapsedBlocks.add(blockId);
    }
    setCollapsedBlocks(newCollapsedBlocks);
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`collapsed-blocks-${pageKey}`, JSON.stringify(Array.from(newCollapsedBlocks)));
    }
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
        case 'contact':
          return (block.title || block.ctaText || block.ctaLink) ? 
            `<div class="contact-block bg-gray-50 rounded-lg p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-2 h-8 bg-black mr-4"></div>
                  <h3 class="text-lg font-medium text-black">${block.title || ''}</h3>
                </div>
                <a href="${block.ctaLink || '#'}" class="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  ${block.ctaText || 'Contact'}
                </a>
              </div>
            </div>` : '';
        case 'about':
          return (block.title || block.content) ? 
            `<div class="about-block"><h2>${block.title || ''}</h2><div>${block.content || ''}</div></div>` : '';
        case 'services':
          if (!block.offerings || block.offerings.length === 0) return '';
          const offeringsHtml = block.offerings.map(offering => `
            <div class="service-offering-block border-b border-black/10 py-8 last:border-b-0">
              <div class="grid grid-cols-1 md:grid-cols-11 gap-6 items-start">
                                  <div class="md:col-span-7">
                    ${offering.icon ? `<div class="mb-2"><span class="text-blue-400 text-lg">${offering.icon}</span></div>` : ''}
                    <h3 class="text-2xl md:text-3xl font-bold tracking-tight text-black">${offering.title || ''}</h3>
                  </div>
                  <div class="md:col-span-5 flex justify-end">
                    <p class="max-w-[68ch]">${offering.description || ''}</p>
                  </div>
              </div>
            </div>
          `).join('');
          return `<section class="service-offerings-section py-32">
            <div class="container mx-auto">
              ${block.title ? `<div class="mb-12"><h2 class="text-2xl md:text-3xl font-bold tracking-tight text-black">${block.title}</h2></div>` : ''}
              <div class="space-y-0">${offeringsHtml}</div>
            </div>
          </section>`;
        case 'projects':
          return `<section class="projects-section py-32">
            <div class="container mx-auto">
              ${block.title ? `<div class="mb-12"><h2 class="text-2xl md:text-3xl font-bold tracking-tight text-black">${block.title}</h2></div>` : ''}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Les projets seront injectés dynamiquement -->
              </div>
            </div>
          </section>`;
        case 'logos':
          if (!block.logos || block.logos.length === 0) return '';
          const logosHtml = block.logos.map(logo => `
            <div class="logo-item flex items-center justify-center">
              <img src="${logo.src || logo.image || ''}" alt="${logo.alt || logo.name || 'Logo client'}" class="max-w-full h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          `).join('');
          return `<section class="logos-section py-32">
            <div class="container mx-auto">
              ${block.title ? `<div class="mb-12"><h2 class="text-2xl md:text-3xl font-bold tracking-tight text-black">${block.title}</h2></div>` : ''}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                ${logosHtml}
              </div>
            </div>
          </section>`;
        case 'two-columns':
          const gapClasses = {
            small: 'gap-4',
            medium: 'gap-8',
            large: 'gap-12'
          };
          const alignmentClasses = {
            top: 'items-start',
            center: 'items-center',
            bottom: 'items-end'
          };
          const layoutClasses = {
            'left-right': 'grid-cols-1 md:grid-cols-2',
            'right-left': 'grid-cols-1 md:grid-cols-2',
            'stacked-mobile': 'grid-cols-1 lg:grid-cols-2'
          };
          
          const leftColumnHtml = (block.leftColumn || []).map((subBlock: any) => {
            switch (subBlock.type) {
              case 'h2': return subBlock.content ? `<h2>${subBlock.content}</h2>` : '';
              case 'h3': return subBlock.content ? `<h3>${subBlock.content}</h3>` : '';
              case 'content': return subBlock.content || '';
              case 'image': return subBlock.image?.src ? `<img src="${subBlock.image.src}" alt="${subBlock.image.alt || ''}" />` : '';
              case 'cta': return (subBlock.ctaText || subBlock.ctaLink) ? 
                `<div class="cta-block"><p>${subBlock.ctaText || ''}</p><a href="${subBlock.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
              case 'contact': return (subBlock.title || subBlock.ctaText || subBlock.ctaLink) ? 
                `<div class="contact-block bg-gray-50 rounded-lg p-6 shadow-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-2 h-8 bg-black mr-4"></div>
                      <h3 class="text-lg font-medium text-black">${subBlock.title || ''}</h3>
                    </div>
                    <a href="${subBlock.ctaLink || '#'}" class="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      ${subBlock.ctaText || 'Contact'}
                    </a>
                  </div>
                </div>` : '';
              default: return '';
            }
          }).join('');
          
          const rightColumnHtml = (block.rightColumn || []).map((subBlock: any) => {
            switch (subBlock.type) {
              case 'h2': return subBlock.content ? `<h2>${subBlock.content}</h2>` : '';
              case 'h3': return subBlock.content ? `<h3>${subBlock.content}</h3>` : '';
              case 'content': return subBlock.content || '';
              case 'image': return subBlock.image?.src ? `<img src="${subBlock.image.src}" alt="${subBlock.image.alt || ''}" />` : '';
              case 'cta': return (subBlock.ctaText || subBlock.ctaLink) ? 
                `<div class="cta-block"><p>${subBlock.ctaText || ''}</p><a href="${subBlock.ctaLink || ''}" class="cta-button">En savoir plus</a></div>` : '';
              case 'contact': return (subBlock.title || subBlock.ctaText || subBlock.ctaLink) ? 
                `<div class="contact-block bg-gray-50 rounded-lg p-6 shadow-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-2 h-8 bg-black mr-4"></div>
                      <h3 class="text-lg font-medium text-black">${subBlock.title || ''}</h3>
                    </div>
                    <a href="${subBlock.ctaLink || '#'}" class="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      ${subBlock.ctaText || 'Contact'}
                    </a>
                  </div>
                </div>` : '';
              default: return '';
            }
          }).join('');
          
          return `<div class="grid ${layoutClasses[block.layout || 'left-right']} ${gapClasses[block.gap || 'medium']} ${alignmentClasses[block.alignment || 'top']}">
            <div class="space-y-4">${leftColumnHtml}</div>
            <div class="space-y-4">${rightColumnHtml}</div>
          </div>`;
        default:
          return '';
      }
    }).filter(html => html && typeof html === 'string' && html.trim() !== '').join('\n');
    
    console.log('💾 Génération HTML:', {
      blocks: newBlocks.map(b => ({ 
        type: b.type, 
        content: typeof b.content === 'string' ? b.content.substring(0, 50) : b.content 
      })),
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

  // Drag & drop natif pour les logos - Version améliorée
  const handleLogoDragStart = (e: React.DragEvent, index: number) => {
    // Empêcher la propagation vers les éléments parents
    e.stopPropagation();
    
    setDraggedLogoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Ajouter la classe dragging au body
    document.body.classList.add('dragging');
    
    // Ajouter une classe à l'élément dragué pour le style
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleLogoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    // Ne mettre en surbrillance que si on drag un élément différent
    if (draggedLogoIndex !== null && draggedLogoIndex !== index) {
      setDragOverLogoIndex(index);
    }
  };

  const handleLogoDrop = (e: React.DragEvent, dropIndex: number, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedLogoIndex === null || draggedLogoIndex === dropIndex) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.logos) return;

    const newLogos = [...block.logos];
    const [draggedLogo] = newLogos.splice(draggedLogoIndex, 1);
    newLogos.splice(dropIndex, 0, draggedLogo);
    
    const updatedBlock = { ...block, logos: newLogos };
    const updatedBlocks = blocks.map(b => b.id === blockId ? updatedBlock : b);
    
    setBlocks(updatedBlocks);
    updateBlocksContent(updatedBlocks);
    
    // Réinitialiser les états
    setDraggedLogoIndex(null);
    setDragOverLogoIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleLogoDragEnd = () => {
    // Retirer la classe dragging de tous les éléments
    document.querySelectorAll('.logo-drag-item.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    
    setDraggedLogoIndex(null);
    setDragOverLogoIndex(null);
    document.body.classList.remove('dragging');
  };

  // Fonction pour dupliquer un contenu
  const handleDuplicate = async (type: 'work' | 'blog', id: string) => {
    try {
      setIsDuplicating(id);
      
      const response = await fetch('/api/admin/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la duplication');
      }

      const result = await response.json();
      
      // Mettre à jour l'interface sans recharger la page
      if (result.success) {
        // Recharger le contenu depuis l'API
        const contentResponse = await fetch('/api/admin/content');
        if (contentResponse.ok) {
          const newContent = await contentResponse.json();
          
          // Mettre à jour seulement la partie spécifique sans flash
          setLocalData(prevData => {
            if (type === 'work') {
              return {
                ...prevData,
                adminProjects: newContent.work?.adminProjects || []
              };
            } else if (type === 'blog') {
              return {
                ...prevData,
                articles: newContent.blog?.articles || []
              };
            }
            return prevData;
          });
          
          // Afficher une notification modale
          showNotificationModal('✅ Contenu dupliqué avec succès !', 'success');
        }
      }
      
    } catch (error) {
      console.error('Erreur duplication:', error);
      showNotificationModal(`Erreur lors de la duplication: ${error.message}`, 'error');
    } finally {
      setIsDuplicating(null);
    }
  };

  // Fonction pour afficher une notification modale
  const showNotificationModal = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // Fermer automatiquement après 3 secondes
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Fonction pour supprimer un contenu
  const handleDelete = async (type: 'work' | 'blog', id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setIsDeleting(id);
      
      const response = await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      const result = await response.json();
      
      // Mettre à jour l'interface sans recharger la page
      if (result.success) {
        // Recharger le contenu depuis l'API
        const contentResponse = await fetch('/api/admin/content');
        if (contentResponse.ok) {
          const newContent = await contentResponse.json();
          
          // Mettre à jour seulement la partie spécifique sans flash
          setLocalData(prevData => {
            if (type === 'work') {
              return {
                ...prevData,
                adminProjects: newContent.work?.adminProjects || []
              };
            } else if (type === 'blog') {
              return {
                ...prevData,
                articles: newContent.blog?.articles || []
              };
            }
            return prevData;
          });
          
          // Afficher une notification modale
          showNotificationModal('🗑️ Contenu supprimé avec succès !', 'success');
        }
      }
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotificationModal(`Erreur lors de la suppression: ${error.message}`, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const renderBlock = (block: Block, index: number) => {
    console.log('🔧 Rendu du bloc:', block.type, block);
    
    if (!block || !block.type) {
      return <div className="text-red-500">Erreur: bloc invalide</div>;
    }
    
    switch (block.type) {
      case 'h2':
        return (
          <div className="block-editor">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => getBlockContentSuggestion(block.id, 'h2')}
                disabled={isLoadingBlockAI === block.id}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isLoadingBlockAI === block.id 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {isLoadingBlockAI === block.id ? '🤖...' : '🤖 IA'}
              </button>
            </div>
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
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => getBlockContentSuggestion(block.id, 'h3')}
                disabled={isLoadingBlockAI === block.id}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isLoadingBlockAI === block.id 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {isLoadingBlockAI === block.id ? '🤖...' : '🤖 IA'}
              </button>
            </div>
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
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => getBlockContentSuggestion(block.id, 'content')}
                disabled={isLoadingBlockAI === block.id}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isLoadingBlockAI === block.id 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {isLoadingBlockAI === block.id ? '🤖...' : '🤖 IA'}
              </button>
            </div>
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
      
      case 'contact':
        return (
          <div className="block-editor">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question/Titre
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="Ex: Would you like to see a demo?"
                  className="block-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={block.ctaText || ''}
                  onChange={(e) => updateBlock(block.id, { ctaText: e.target.value })}
                  placeholder="Ex: Yes, sign me up"
                  className="block-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien du bouton
                </label>
                <input
                  type="text"
                  value={block.ctaLink || ''}
                  onChange={(e) => updateBlock(block.id, { ctaLink: e.target.value })}
                  placeholder="Ex: /contact ou https://..."
                  className="block-input"
                />
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="block-editor">
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              placeholder="Titre de la section"
              className="block-input"
            />
            <WysiwygEditor
              value={block.content || ''}
              onChange={(content) => updateBlock(block.id, { content })}
            />
          </div>
        );
      
      case 'services':
        return (
          <div className="block-editor">

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="Ex: OUR CORE OFFERINGS"
                  className="block-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thème de fond
                </label>
                <select
                  value={block.theme || 'auto'}
                  onChange={(e) => updateBlock(block.id, { theme: e.target.value as 'light' | 'dark' | 'auto' })}
                  className="block-input"
                >
                  <option value="auto">Automatique (suit le thème global)</option>
                  <option value="light">Thème clair forcé</option>
                  <option value="dark">Thème sombre forcé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services ({block.offerings?.length || 0})
                </label>
                <div className="space-y-3">
                  {(block.offerings || []).map((offering, index) => (
                    <div key={offering.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Service {index + 1}</span>
                        <button
                          onClick={() => {
                            const newOfferings = block.offerings?.filter((_, i) => i !== index) || [];
                            updateBlock(block.id, { offerings: newOfferings });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                      <input
                        type="text"
                        value={offering.title}
                        onChange={(e) => {
                          const newOfferings = [...(block.offerings || [])];
                          newOfferings[index] = { ...offering, title: e.target.value };
                          updateBlock(block.id, { offerings: newOfferings });
                        }}
                        placeholder="Titre du service"
                        className="block-input mb-2"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => getServiceDescriptionSuggestion(block.id, index, offering.title)}
                          disabled={isLoadingBlockAI === `${block.id}-${index}` || !offering.title?.trim()}
                          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                            isLoadingBlockAI === `${block.id}-${index}` || !offering.title?.trim()
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                          }`}
                          title={!offering.title?.trim() ? "Saisissez d'abord un titre" : "Générer la description"}
                        >
                          {isLoadingBlockAI === `${block.id}-${index}` ? '🤖...' : '🤖 IA'}
                        </button>
                      </div>
                      <div className="mb-2">
                        <WysiwygEditor
                          value={offering.description || ''}
                          onChange={(description) => {
                            const newOfferings = [...(block.offerings || [])];
                            newOfferings[index] = { ...offering, description };
                            updateBlock(block.id, { offerings: newOfferings });
                          }}
                          placeholder="Description du service"
                        />
                      </div>
                      <input
                        type="text"
                        value={offering.icon || ''}
                        onChange={(e) => {
                          const newOfferings = [...(block.offerings || [])];
                          newOfferings[index] = { ...offering, icon: e.target.value };
                          updateBlock(block.id, { offerings: newOfferings });
                        }}
                        placeholder="Icône (optionnel)"
                        className="block-input"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOffering = {
                        id: `service-${Date.now()}`,
                        title: '',
                        description: '',
                        icon: ''
                      };
                      const newOfferings = [...(block.offerings || []), newOffering];
                      updateBlock(block.id, { offerings: newOfferings });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    + Ajouter un service
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'logos':
        return (
          <div className="block-editor">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="Ex: NOS CLIENTS"
                  className="block-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thème de fond
                </label>
                <select
                  value={block.theme || 'auto'}
                  onChange={(e) => updateBlock(block.id, { theme: e.target.value as 'light' | 'dark' | 'auto' })}
                  className="block-input"
                >
                  <option value="auto">Automatique (suit le thème global)</option>
                  <option value="light">Thème clair forcé</option>
                  <option value="dark">Thème sombre forcé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logos clients
                </label>
                <div className="logos-grid-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {(block.logos || []).map((logo, index) => (
                    <div 
                      key={index} 
                      data-logo-index={index}
                      className={`logo-drop-zone p-3 border border-gray-200 rounded-lg transition-all duration-200 ${
                        draggedLogoIndex === index ? 'dragging' : ''
                      } ${
                        dragOverLogoIndex === index && draggedLogoIndex !== index 
                          ? 'drag-over' 
                          : ''
                      }`}
                      onDragOver={(e) => handleLogoDragOver(e, index)}
                      onDrop={(e) => handleLogoDrop(e, index, block.id)}
                      onDragLeave={(e) => {
                        // S'assurer que la zone de drop se désactive quand on quitte
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverLogoIndex(null);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className="logo-drag-item flex items-center gap-2"
                          draggable
                          onDragStart={(e) => handleLogoDragStart(e, index)}
                          onDragEnd={handleLogoDragEnd}
                        >
                          <span className="logo-drag-handle text-xs">⋮⋮</span>
                          <span className="text-xs font-medium text-gray-600">Logo {index + 1}</span>
                        </div>
                        <button
                          onClick={() => {
                            const newLogos = (block.logos || []).filter((_, i) => i !== index);
                            updateBlock(block.id, { logos: newLogos });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                          title="Supprimer ce logo"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Indicateur de drop */}
                      <div className="logo-drop-indicator">
                        Déposer ici
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Image
                          </label>
                          <LogoUploader
                            currentUrl={logo.src || logo.image || ''}
                            onUpload={(src) => {
                              const newLogos = [...(block.logos || [])];
                              newLogos[index] = { ...newLogos[index], src };
                              updateBlock(block.id, { logos: newLogos });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nom du client
                          </label>
                          <input
                            type="text"
                            value={logo.alt || logo.name || ''}
                            onChange={(e) => {
                              const newLogos = [...(block.logos || [])];
                              newLogos[index] = { ...newLogos[index], alt: e.target.value };
                              updateBlock(block.id, { logos: newLogos });
                            }}
                            placeholder="Ex: Apple"
                            className="block-input text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newLogos = [...(block.logos || []), { src: '', alt: '' }];
                      updateBlock(block.id, { logos: newLogos });
                      
                      // Ajouter une animation d'apparition au nouveau logo
                      setTimeout(() => {
                        const newLogoElement = document.querySelector(`[data-logo-index="${newLogos.length - 1}"]`);
                        if (newLogoElement) {
                          newLogoElement.classList.add('logo-item-enter');
                        }
                      }, 100);
                    }}
                    className="w-full py-2 px-3 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors hover:bg-gray-50"
                  >
                    + Ajouter un logo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="block-editor">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="Ex: NOS RÉALISATIONS"
                  className="block-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de projets
                </label>
                <input
                  type="number"
                  value={block.maxProjects || 6}
                  onChange={(e) => updateBlock(block.id, { maxProjects: parseInt(e.target.value) || 6 })}
                  placeholder="6"
                  className="block-input"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thème de fond
                </label>
                <select
                  value={block.theme || 'auto'}
                  onChange={(e) => updateBlock(block.id, { theme: e.target.value as 'light' | 'dark' | 'auto' })}
                  className="block-input"
                >
                  <option value="auto">Automatique (suit le thème global)</option>
                  <option value="light">Thème clair forcé</option>
                  <option value="dark">Thème sombre forcé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projets à afficher
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Colonne gauche - Projets sélectionnés */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Projets sélectionnés</h4>
                    <div className="space-y-2 min-h-[200px]">
                      {(() => {
                        const allProjects = [
                          { id: 'project-1', title: 'Project Alpha', category: 'Brand' },
                          { id: 'project-2', title: 'Project Beta', category: 'Digital' },
                          { id: 'project-3', title: 'Project Gamma', category: 'Strategy' },
                          { id: 'project-4', title: 'Project Delta', category: 'Digital' }
                        ];
                        const selectedProjects = block.selectedProjects || [];
                        const selectedItems = allProjects.filter(project => selectedProjects.includes(project.id));
                        
                        if (selectedItems.length === 0) {
                          return (
                            <div className="text-sm text-gray-400 text-center py-8">
                              Aucun projet sélectionné
                            </div>
                          );
                        }
                        
                        return selectedItems.map(project => (
                          <div key={project.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <div className="text-sm font-medium text-gray-700">{project.title}</div>
                              <div className="text-xs text-gray-500">{project.category}</div>
                            </div>
                            <button
                              onClick={() => {
                                const newSelected = selectedProjects.filter(id => id !== project.id);
                                updateBlock(block.id, { selectedProjects: newSelected });
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  {/* Colonne droite - Tous les projets disponibles */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Projets disponibles</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'project-1', title: 'Project Alpha', category: 'Brand' },
                        { id: 'project-2', title: 'Project Beta', category: 'Digital' },
                        { id: 'project-3', title: 'Project Gamma', category: 'Strategy' },
                        { id: 'project-4', title: 'Project Delta', category: 'Digital' }
                      ].map(project => {
                        const isSelected = block.selectedProjects?.includes(project.id) || false;
                        return (
                          <div
                            key={project.id}
                            className={`p-2 rounded border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (!isSelected) {
                                const currentSelected = block.selectedProjects || [];
                                const newSelected = [...currentSelected, project.id];
                                updateBlock(block.id, { selectedProjects: newSelected });
                              }
                            }}
                          >
                            <div className="text-sm font-medium">{project.title}</div>
                            <div className="text-xs text-gray-500">{project.category}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Cliquez sur un projet pour l'ajouter/retirer. Laissez vide pour afficher tous les projets.
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p>Ce bloc affiche automatiquement les projets de la page Work en 3 colonnes.</p>
              </div>
            </div>
          </div>
        );
      
      case 'two-columns':
        return (
          <div className="block-editor">
            <TwoColumnsEditor
              block={block}
              onUpdate={(updates) => updateBlock(block.id, updates)}
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
      case 'contact': return 'Contact';
      case 'about': return 'À propos';
              case 'services': return 'Services';
        case 'projects': return 'Projets';
      case 'logos': return 'Logos clients';
      case 'two-columns': return 'Deux colonnes';
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sous-titre
          </label>
          <textarea
            value={localData?.hero?.subtitle || ''}
            onChange={(e) => updateField('hero.subtitle', e.target.value)}
            placeholder="Sous-titre de la page"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Utilisez \n pour les retours à la ligne
          </p>
        </div>
      </div>
    </div>
  );

  const getDescriptionSuggestion = async () => {
    if (pageKey !== 'blog' && pageKey !== 'work' && pageKey !== 'contact' && pageKey !== 'studio') return;
    
    setIsLoadingDescriptionAI(true);
    try {
      const response = await fetch('/api/admin/ai/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: pageKey === 'work' ? 'work' : pageKey === 'blog' ? 'blog' : pageKey === 'contact' ? 'contact' : 'studio'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Appliquer la suggestion
      const descriptionPath = 'description';
      updateField(descriptionPath, data.suggestedDescription);
      
    } catch (error) {
      console.error('Erreur suggestion description IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingDescriptionAI(false);
    }
  };

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      // Récupérer le bloc actuel pour avoir le titre existant
      const currentBlock = blocks.find(block => block.id === blockId);
      
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey,
          existingBlocks: blocks,
          existingTitle: currentBlock?.title || '',
          existingOfferings: currentBlock?.offerings || [],
          context: `Bloc ${blockType} dans la page ${pageKey}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Appliquer la suggestion au bloc selon le type
      if (blockType === 'services') {
        // Pour services, garder le titre existant et mettre à jour seulement les descriptions
        const suggestion = data.suggestedContent;
        if (suggestion.offerings && currentBlock?.offerings) {
          // Mettre à jour seulement les descriptions des services existants
          const updatedOfferings = currentBlock.offerings.map((offering, index) => ({
            ...offering,
            description: suggestion.offerings[index]?.description || offering.description
          }));
          updateBlock(blockId, { offerings: updatedOfferings });
        } else if (suggestion.offerings) {
          // Si pas d'offerings existants, utiliser les nouveaux
          updateBlock(blockId, { offerings: suggestion.offerings });
        }
      } else {
        // Pour les autres types, mettre à jour le contenu
        updateBlock(blockId, { content: data.suggestedContent });
      }
      
    } catch (error) {
      console.error('Erreur suggestion contenu bloc IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const getServiceDescriptionSuggestion = async (blockId: string, serviceIndex: number, serviceTitle: string) => {
    const loadingId = `${blockId}-${serviceIndex}`;
    setIsLoadingBlockAI(loadingId);
    try {
      const response = await fetch('/api/admin/ai/suggest-service-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceTitle,
          pageKey,
          context: `Description pour le service "${serviceTitle}" dans la page ${pageKey}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Mettre à jour seulement la description du service spécifique
      const currentBlock = blocks.find(block => block.id === blockId);
      if (currentBlock?.offerings) {
        const updatedOfferings = [...currentBlock.offerings];
        updatedOfferings[serviceIndex] = {
          ...updatedOfferings[serviceIndex],
          description: data.suggestedDescription
        };
        updateBlock(blockId, { offerings: updatedOfferings });
      }
      
    } catch (error) {
      console.error('Erreur suggestion description service IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const renderContentBlock = () => {
    // Pour les pages blog, work, contact et studio, la description est directement à la racine
    const isDirectDescription = pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio';
    const descriptionPath = isDirectDescription ? 'description' : 'content.description';
    const descriptionValue = isDirectDescription ? localData.description : localData.content?.description;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-semibold text-gray-900">Contenu</h3>
        </div>
        
        <div className="space-y-4">
          {/* Titre pour les pages contact et studio */}
          {(pageKey === 'contact' || pageKey === 'studio') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={localData.hero?.title || ''}
                onChange={(e) => updateField('hero.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={`Titre de la page ${pageKey}`}
              />
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              {(pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio') && (
                <button
                  onClick={getDescriptionSuggestion}
                  disabled={isLoadingDescriptionAI}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    isLoadingDescriptionAI 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  }`}
                >
                  {isLoadingDescriptionAI ? '🤖 Génération...' : '🤖 Suggestion IA'}
                </button>
              )}
            </div>
            <WysiwygEditor
              value={descriptionValue || ''}
              onChange={(value) => updateField(descriptionPath, value)}
              placeholder="Description de la page"
            />
          </div>
        
        {/* Section image seulement si ce n'est pas la page contact ou studio */}
        {pageKey !== 'contact' && pageKey !== 'studio' && localData.content?.image && (
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
                  <button 
                    onClick={() => handleDuplicate('blog', article.id)}
                    disabled={isDuplicating === article.id}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      isDuplicating === article.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                    title="Dupliquer cet article"
                  >
                    {isDuplicating === article.id ? '⏳...' : '📋 Dupliquer'}
                  </button>
                  <button 
                    onClick={() => handleDelete('blog', article.id, article.title || `Article ${index + 1}`)}
                    disabled={isDeleting === article.id}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      isDeleting === article.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Supprimer cet article"
                  >
                    {isDeleting === article.id ? '⏳...' : '🗑️ Supprimer'}
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
                  <button 
                    onClick={() => handleDuplicate('work', project.id)}
                    disabled={isDuplicating === project.id}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      isDuplicating === project.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                    title="Dupliquer ce projet"
                  >
                    {isDuplicating === project.id ? '⏳...' : '📋 Dupliquer'}
                  </button>
                  <button 
                    onClick={() => handleDelete('work', project.id, project.title || `Projet ${index + 1}`)}
                    disabled={isDeleting === project.id}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      isDeleting === project.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Supprimer ce projet"
                  >
                    {isDeleting === project.id ? '⏳...' : '🗑️ Supprimer'}
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
      </div>
    </div>
  );

  const renderFooterBlock = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🦶</span>
        <h3 className="text-lg font-semibold text-gray-900">Footer</h3>
      </div>
      
      <div className="space-y-4">
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
            <button
              onClick={() => setBlogActiveTab('filters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                blogActiveTab === 'filters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏷️ Filtres
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
        {blogActiveTab === 'filters' && renderFiltersBlock()}
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
            <button
              onClick={() => setWorkActiveTab('filters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                workActiveTab === 'filters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏷️ Filtres
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
        {workActiveTab === 'filters' && renderFiltersBlock()}
      </div>
    );
  };

  const renderFiltersBlock = () => {
    const currentFilters = localData.filters || ['All', 'Strategy', 'Brand', 'Digital', 'IA'];
    const isWork = pageKey === 'work';
    const aiSuggestions = isWork ? workAiSuggestions : blogAiSuggestions;
    const isLoadingAI = isWork ? workIsLoadingAI : blogIsLoadingAI;
    const setAiSuggestions = isWork ? setWorkAiSuggestions : setBlogAiSuggestions;

    const addFilter = (filter: string) => {
      if (!currentFilters.includes(filter)) {
        updateField('filters', [...currentFilters, filter]);
      }
    };

    const removeFilter = (indexToRemove: number) => {
      const newFilters = currentFilters.filter((_, index) => index !== indexToRemove);
      updateField('filters', newFilters);
    };

    const getAISuggestions = async () => {
      const isWork = pageKey === 'work';
      const setLoading = isWork ? setWorkIsLoadingAI : setBlogIsLoadingAI;
      const setSuggestions = isWork ? setWorkAiSuggestions : setBlogAiSuggestions;
      
      setLoading(true);
      try {
        const response = await fetch('/api/admin/ai/suggest-filters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: isWork ? 'work' : 'blog' 
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur API');
        }

        // Filtrer les suggestions qui ne sont pas déjà présentes
        const newSuggestions = data.suggestedFilters.filter(
          (suggestion: string) => !currentFilters.includes(suggestion)
        );
        
        setSuggestions(newSuggestions);
        
        if (newSuggestions.length === 0) {
          alert('🤖 L\'IA n\'a pas trouvé de nouveaux filtres à suggérer. Vos filtres actuels semblent déjà très complets !');
        }
      } catch (error) {
        console.error('Erreur suggestions IA:', error);
        alert(`❌ Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-2xl">🏷️</span>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche : Filtres actuels */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filtres actuels</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentFilters.map((filter, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="text-blue-800 font-medium">{filter}</span>
                  <button
                    onClick={() => removeFilter(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-colors"
                    title="Supprimer ce filtre"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            {currentFilters.length === 0 && (
              <p className="text-gray-500 text-sm italic">Aucun filtre défini</p>
            )}
          </div>

          {/* Colonne droite : Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Suggestions basées sur votre contenu</h4>
              <button
                onClick={getAISuggestions}
                disabled={isLoadingAI}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isLoadingAI 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {isLoadingAI ? '🤖 Analyse...' : '🤖 Suggestions IA'}
              </button>
            </div>

            {/* Suggestions IA */}
            {aiSuggestions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={`ai-${index}`}
                    onClick={() => {
                      addFilter(suggestion);
                      setAiSuggestions(prev => prev.filter(s => s !== suggestion));
                    }}
                    className="text-left px-3 py-2 text-sm bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors"
                  >
                    ✨ {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">Cliquez sur "🤖 Suggestions IA" pour obtenir des suggestions basées sur votre contenu</p>
              </div>
            )}
          </div>
        </div>

        {/* Zone d'ajout manuel */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ajouter un filtre personnalisé
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nom du filtre..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    addFilter(value);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  addFilter(value);
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
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
            <option value="contact">Contact</option>
            <option value="about">À propos</option>
            <option value="services">Services</option>
            <option value="projects">Projets</option>
            <option value="logos">Logos clients</option>
            <option value="two-columns">Deux colonnes</option>
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
                  onClick={() => toggleBlockVisibility(block.id)}
                  className="toggle-block mr-2"
                  title={collapsedBlocks.has(block.id) ? "Afficher le contenu" : "Masquer le contenu"}
                >
                  {collapsedBlocks.has(block.id) ? "Afficher" : "Masquer"}
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="remove-block"
                >
                  ×
                </button>
              </div>
              {!collapsedBlocks.has(block.id) && renderBlock(block, index)}
              {collapsedBlocks.has(block.id) && (
                <div className="block-collapsed-indicator p-4 text-center text-gray-400 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm">📝 Contenu masqué</div>
                  <div className="text-xs mt-1">Cliquez sur "Afficher" pour voir le contenu</div>
                </div>
              )}
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

  // Si c'est la page footer, afficher le bloc footer
  if (pageKey === 'footer') {
    return (
      <div className="space-y-6">
        {renderFooterBlock()}
      </div>
    );
  }



  return (
    <>
      <div className="space-y-6">
        {/* Rendu conditionnel selon le type de page */}
        {pageKey === 'home' && (
          <>
            {renderHeroBlock()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Éditeur de contenu</h3>
              {renderDragDropEditor()}
            </div>
          </>
        )}
        {pageKey === 'contact' && (
          <>
            {renderContentBlock()}
            {renderContactBlock()}
          </>
        )}
        {pageKey === 'studio' && (
          <>
            {renderContentBlock()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Éditeur de contenu</h3>
              {renderDragDropEditor()}
            </div>
          </>
        )}
        
        {/* Pour les projets et articles individuels, afficher l'éditeur de blocs */}
        {(pageKey === 'project' || pageKey === 'article' || pageKey.startsWith('project-') || pageKey.startsWith('article-')) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Éditeur de contenu</h3>
            {renderDragDropEditor()}
          </div>
        )}
        
        {/* Pour les autres pages, afficher les blocs classiques */}
        {!['blog', 'work', 'backup', 'project', 'article', 'contact', 'studio'].includes(pageKey) && !pageKey.startsWith('project-') && !pageKey.startsWith('article-') && (
          <>
            {renderContentBlock()}
            {renderMetadataBlock()}
            {renderNavBlock()}
          </>
        )}
      </div>

      {/* Notification modale */}
      {showNotification && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="text-center">
              <div className={`text-4xl mb-4 ${
                notificationType === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {notificationType === 'success' ? '✅' : '❌'}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {notificationType === 'success' ? 'Succès' : 'Erreur'}
              </h3>
              <p className="text-gray-600 mb-6">
                {notificationMessage}
              </p>
              <button
                onClick={() => setShowNotification(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
} 