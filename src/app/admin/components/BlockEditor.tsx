"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import WysiwygEditor from './WysiwygEditor';
import MediaUploader, { LogoUploader } from './MediaUploader';
import VersionList from './VersionList';
import { renderAutoBlockEditor } from "@/app/admin/components/AutoBlockIntegration";
import { getAutoDeclaredBlock, getBlockMetadata, getAvailableBlockTypes, createAutoBlockInstance } from '@/blocks/auto-declared/registry';
import { getBlockLabel, renderBlockPreview, getCategorizedBlocks } from '@/utils/blockCategories';
import { FileText, Briefcase, Navigation, Settings, Mail, Footprints, Save, Target, Layout, Tag, Atom, Trash2, Plus, Search, Type, Heading2, Image, Columns, Phone, Grid3x3, FolderOpen, Building2, Quote, ChevronDown, Lock, AlignLeft, GripHorizontal, Grid3x2, List, Brain, AlertTriangle, X } from 'lucide-react';
import SommairePanel from '@/components/admin/SommairePanel';
import MobileSommaireButton from '@/components/admin/MobileSommaireButton';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Block {
  id: string;
  type: string; // Plus de union type fixe !
  [key: string]: any; // Accepte n'importe quelle propriété
}

interface BlockEditorProps {
  pageData: any;
  pageKey: string;
  onUpdate: (updates: any) => void;
  onShowArticleGenerator?: () => void;
}

export default function BlockEditor({ pageData, pageKey, onUpdate, onShowArticleGenerator }: BlockEditorProps) {
  const router = useRouter();
  const [localData, setLocalData] = useState(pageData || {});
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPlanSheetOpen, setIsPlanSheetOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  
  // Fonction pour gérer la sélection d'un bloc depuis le plan
  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    
    // Scroll vers l'élément sélectionné
    setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Mise en surbrillance temporaire avec fond coloré
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        element.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          element.style.backgroundColor = '';
          element.style.transition = '';
        }, 2000);
      }
    }, 100);
  };
  
  // Fonction pour gérer la suppression d'un bloc depuis le plan
  const handleDeleteBlockFromPlan = (blockId: string) => {
    setBlockToDelete(blockId);
    setShowDeleteConfirm(true);
  };
  
  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (blockToDelete) {
      removeBlock(blockToDelete);
      setSelectedBlockId(null); // Désélectionner le bloc supprimé
      
      // Notification de succès
      toast.success("Bloc supprimé", {
        description: "Le bloc a été supprimé avec succès.",
        duration: 3000,
      });
    }
    setShowDeleteConfirm(false);
    setBlockToDelete(null);
  };
  
  // Fonction pour annuler la suppression
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBlockToDelete(null);
  };
  
  // Écouter l'événement de fermeture du Sheet
  useEffect(() => {
    const handleCloseSheet = () => {
      setIsPlanSheetOpen(false);
    };

    window.addEventListener('close-sheet', handleCloseSheet);
    return () => window.removeEventListener('close-sheet', handleCloseSheet);
  }, []);

  const [blockSearchTerm, setBlockSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Basique': true,
    'Pro': true
  });
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [aiProfileCompleteness, setAiProfileCompleteness] = useState<number | null>(null);
  const [draggedLogoIndex, setDraggedLogoIndex] = useState<number | null>(null);
  const [dragOverLogoIndex, setDragOverLogoIndex] = useState<number | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80); // Valeur par défaut
  const [sommaireTop, setSommaireTop] = useState(96); // Position dynamique du sommaire
  
  // Compter les sections/blocs pour l'auto-suggestion
  const sectionsCount = blocks.length;
  const shouldShowPlanSuggestion = sectionsCount >= 6;
  
  // Synchroniser localData avec pageData quand pageData change
  useEffect(() => {
    if (pageData) {
      setLocalData(pageData);
    }
  }, [pageData]);

  // Charger le profil IA au montage
  useEffect(() => {
    const loadAIProfile = async () => {
      try {
        const response = await fetch('/api/admin/ai/profile');
        const data = await response.json();
        if (data.completenessScore !== undefined) {
          setAiProfileCompleteness(data.completenessScore);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement du profil IA:', error);
      }
    };
    
    loadAIProfile();
  }, []);

  // Calculer la hauteur du header principal pour le positionnement sticky
  useEffect(() => {
    const calculateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
        // Calculer la position du sommaire : hauteur du header + 24px de marge
        setSommaireTop(height + 24);
      }
    };

    // Calculer au montage
    calculateHeaderHeight();

    // Recalculer si la fenêtre change de taille
    window.addEventListener('resize', calculateHeaderHeight);
    
    // Observer les changements de taille du header
    const header = document.querySelector('header');
    if (header) {
      const observer = new ResizeObserver(calculateHeaderHeight);
      observer.observe(header);
      
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', calculateHeaderHeight);
      };
    }
    
    return () => {
      window.removeEventListener('resize', calculateHeaderHeight);
    };
  }, []);

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
    const validTypes = getAvailableBlockTypes(); // Récupère automatiquement depuis le registre
    
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

  const addBlock = (type: string) => {
    console.log('🔧 Ajout du bloc:', type);
    
    try {
      // Créer automatiquement le bloc avec les bonnes données depuis le registre
      const newBlock = createAutoBlockInstance(type);
      
      console.log('🔧 Nouveau bloc créé:', newBlock);
      
      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      
      // Mémoriser l'ID du bloc créé pour le scroll
      setLastCreatedId(newBlock.id);
      
      // Fermer le Sheet après ajout
      setIsSheetOpen(false);
      // Mettre à jour le contenu après ajout
      updateBlocksContent(newBlocks);
    } catch (error) {
      console.error('❌ Erreur lors de la création du bloc:', error);
      // Fallback : créer un bloc basique
      const fallbackBlock: Block = {
        id: `block-${Date.now()}`,
        type,
        content: ''
      };
      
      const newBlocks = [...blocks, fallbackBlock];
      setBlocks(newBlocks);
      
      // Mémoriser l'ID du bloc fallback pour le scroll
      setLastCreatedId(fallbackBlock.id);
      
      setIsSheetOpen(false);
      updateBlocksContent(newBlocks);
    }
  };

  // Fonction pour trouver le parent scrollable
  const getScrollParent = (node: HTMLElement | null): HTMLElement | Window => {
    let p: HTMLElement | null = node?.parentElement ?? null;
    while (p) {
      const s = getComputedStyle(p);
      if (/(auto|scroll)/.test(`${s.overflow}${s.overflowY}${s.overflowX}`)) return p;
      p = p.parentElement;
    }
    return window;
  };

  // Fonction pour scroller vers un élément
  const scrollToEl = (el: HTMLElement, headerH = 0) => {
    const scroller = getScrollParent(el);
    if (scroller === window) {
      const y = el.getBoundingClientRect().top + window.scrollY - (headerH + 80);
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    } else {
      const y = el.offsetTop - (headerH + 80);
      (scroller as HTMLElement).scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // useEffect pour gérer le scroll vers le nouveau bloc
  useEffect(() => {
    if (!lastCreatedId) return;
    
    const el = document.querySelector<HTMLElement>(`[data-block-id="${lastCreatedId}"]`);
    if (!el) return;

    // Hauteur d'un header sticky si présent
    const headerH = document.querySelector<HTMLElement>('[data-fixed-header]')?.offsetHeight ?? 0;

    // Attendre un frame pour que la mise en page se stabilise
    requestAnimationFrame(() => {
      scrollToEl(el, headerH);
      
      // Optionnel: focus discret dans le bloc sans re-scroller
      el.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
    });

    // Réinitialiser l'ID après le scroll
    setLastCreatedId(null);
  }, [lastCreatedId]);

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

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    // Créer une copie du bloc avec un nouvel ID
    const duplicatedBlock: Block = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
      // Ajouter " (copie)" au titre si il existe
      ...(blockToDuplicate.title && { title: `${blockToDuplicate.title} (copie)` }),
      // Ajouter " (copie)" au contenu si il existe
      ...(blockToDuplicate.content && { content: `${blockToDuplicate.content} (copie)` })
    };

    // Trouver l'index du bloc original
    const originalIndex = blocks.findIndex(block => block.id === blockId);
    
    // Insérer la copie juste après l'original
    const newBlocks = [
      ...blocks.slice(0, originalIndex + 1),
      duplicatedBlock,
      ...blocks.slice(originalIndex + 1)
    ];

    setBlocks(newBlocks);
    updateBlocksContent(newBlocks);
    
    // Sélectionner le bloc dupliqué
    setSelectedBlockId(duplicatedBlock.id);
    
    toast.success("Bloc dupliqué avec succès");
  };

  // Fonction pour filtrer les blocs par terme de recherche
  const getFilteredBlocks = () => {
    const allBlocks = getBlockMetadata();
    if (!blockSearchTerm) return allBlocks;
    
    return allBlocks.filter(block => 
      block.label.toLowerCase().includes(blockSearchTerm.toLowerCase()) ||
      block.type.toLowerCase().includes(blockSearchTerm.toLowerCase())
    );
  };

  // Fonction pour grouper les blocs par catégorie (utilise la fonction partagée)
  const getCategorizedBlocksLocal = () => {
    const filteredBlocks = getFilteredBlocks();
    return getCategorizedBlocks(filteredBlocks);
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
            `<div class="contact-block bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-2 h-8 bg-black dark:bg-white mr-4"></div>
                  <h3 class="text-lg font-medium text-black dark:text-white">${block.title || ''}</h3>
                </div>
                <a href="${block.ctaLink || '#'}" class="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
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
          return `<section class="service-offerings-section py-28">
            <div class="container mx-auto">
              ${block.title ? `<div class="mb-12"><h2 class="text-2xl md:text-3xl font-bold tracking-tight text-black">${block.title}</h2></div>` : ''}
              <div class="space-y-0">${offeringsHtml}</div>
            </div>
          </section>`;
        case 'projects':
          const projectsBlockEditor = renderAutoBlockEditor(block, (updates) => updateBlock(block.id, updates), localData);
          if (projectsBlockEditor) {
            return projectsBlockEditor;
        }
        // Fallback vers l'ancien système si le scalable n'est pas disponible
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
                  <p>Ce bloc affiche automatiquement les projets de la page Portfolio en 3 colonnes.</p>
                </div>
              </div>
            </div>
          );
        case 'logos':
          if (!block.logos || block.logos.length === 0) return '';
          const logosHtml = block.logos.map(logo => `
            <div class="logo-item flex items-center justify-center">
              <img src="${logo.src || logo.image || ''}" alt="${logo.alt || logo.name || 'Logo client'}" class="max-w-full h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          `).join('');
          return `<section class="logos-section py-28">
            <div class="container mx-auto">
              ${block.title ? `<div class="mb-12"><h2 class="text-2xl md:text-3xl font-bold tracking-tight text-black">${block.title}</h2></div>` : ''}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                ${logosHtml}
              </div>
            </div>
          </section>`;
        case 'two-columns':
          // Utilisation du système scalable pour le bloc two-columns
          const TwoColumnsBlockScalable = getAutoDeclaredBlock('two-columns')?.component;
          if (TwoColumnsBlockScalable) {
            return (
              <TwoColumnsBlockScalable 
                key={block.id}
                data={block}
              />
            );
          }
          return null;
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
          setLocalData((prevData: any) => {
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
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotificationModal(`Erreur lors de la duplication: ${errorMessage}`, 'error');
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
          setLocalData((prevData: any) => {
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
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotificationModal(`Erreur lors de la suppression: ${errorMessage}`, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const renderBlock = (block: Block, index: number) => {
    console.log('🔧 Rendu du bloc:', block.type, block);
    
    if (!block || !block.type) {
      return <div className="text-red-500">Erreur: bloc invalide</div>;
    }
    
    // Rendu automatique via le système scalable
    return renderAutoBlockEditor(block, (updates) => updateBlock(block.id, updates), localData);
  };

  const renderBlockTypeLabel = (type: string) => {
    // Utiliser les mêmes labels personnalisés que dans le sélecteur
    return getBlockLabel(type);
  };

  const renderHeroBlock = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
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
    if (pageKey !== 'blog' && pageKey !== 'work' && pageKey !== 'contact' && pageKey !== 'studio' && pageKey !== 'custom') return;
    
    setIsLoadingDescriptionAI(true);
    try {
      const response = await fetch('/api/admin/ai/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: pageKey === 'work' ? 'work' : pageKey === 'blog' ? 'blog' : pageKey === 'contact' ? 'contact' : pageKey === 'custom' ? 'custom' : 'studio',
          title: pageKey === 'custom' ? localData.title : undefined
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
      toast.error(`Erreur: ${error.message}`);
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
      toast.error(`Erreur: ${error.message}`);
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
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const renderContentBlock = () => {
    // Pour les pages blog, work, contact, studio et custom, la description est directement à la racine
    const isDirectDescription = pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio' || pageKey === 'custom';
    const descriptionPath = isDirectDescription ? 'description' : 'content.description';
    const descriptionValue = isDirectDescription ? localData.description : localData.content?.description;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
        </div>
        
        <div className="space-y-4">
          {/* Titre pour les pages blog, work, contact, studio et custom */}
          {(pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio' || pageKey === 'custom') && (
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
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
            </div>
            <WysiwygEditor
              value={descriptionValue || ''}
              onChange={(value) => updateField(descriptionPath, value)}
              placeholder="Description de la page"
              onAISuggestion={(pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio' || pageKey === 'custom') ? getDescriptionSuggestion : undefined}
              isLoadingAI={isLoadingDescriptionAI}
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
              <FileText className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Articles ({articles.length})</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {publishedCount} publié{publishedCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {draftCount} brouillon{draftCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (onShowArticleGenerator) {
                  onShowArticleGenerator();
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
              type="button"
            >
              <Brain className="w-4 h-4" />
              💡 Idées d'articles
            </Button>
            <Button
              onClick={() => {
                const newId = `article-${Date.now()}`;
                router.push(`/admin/blog/${newId}`);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel article
            </Button>
          </div>
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
                      {article.status === 'published' ? 'Publié' : 'Brouillon'}
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
                  <Button 
                    onClick={() => router.push(`/admin/blog/${article.id}`)}
                    size="sm"
                    className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md"
                    title="Éditer l'article complet"
                  >
                    Éditer
                  </Button>
                  <Button 
                    onClick={() => window.open(`/blog/${article.slug || article.id}`, '_blank')}
                    size="sm"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-md"
                    title="Aperçu de l'article"
                  >
                    Aperçu
                  </Button>
                  <Button 
                    onClick={() => handleDuplicate('blog', article.id)}
                    disabled={isDuplicating === article.id}
                    size="sm"
                    className={`text-xs border-0 rounded-md ${
                      isDuplicating === article.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    title="Dupliquer cet article"
                  >
                    {isDuplicating === article.id ? '...' : 'Dupliquer'}
                  </Button>
                  <Button 
                    onClick={() => handleDelete('blog', article.id, article.title || `Article ${index + 1}`)}
                    disabled={isDeleting === article.id}
                    size="sm"
                    className={`text-xs border-0 rounded-md ${
                      isDeleting === article.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Supprimer cet article"
                  >
                    {isDeleting === article.id ? '...' : 'Supprimer'}
                  </Button>
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
              <Briefcase className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Projets ({projects.length})</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {publishedCount} publié{publishedCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {draftCount} brouillon{draftCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {featuredCount} en vedette
              </span>
            </div>
          </div>
                    <Button
            onClick={() => {
              const newId = `project-${Date.now()}`;
              router.push(`/admin/work/${newId}`);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Button>
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
                      {project.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    {project.featured && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        Vedette
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
                  <Button 
                    onClick={() => router.push(`/admin/work/${project.id}`)}
                    size="sm"
                    className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md"
                    title="Éditer le projet complet"
                  >
                    Éditer
                  </Button>
                  <Button 
                    onClick={() => window.open(`/work/${project.slug || project.id}`, '_blank')}
                    size="sm"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-md"
                    title="Aperçu du projet"
                  >
                    Aperçu
                  </Button>
                  <Button 
                    onClick={() => handleDuplicate('work', project.id)}
                    disabled={isDuplicating === project.id}
                    size="sm"
                    className={`text-xs border-0 rounded-md ${
                      isDuplicating === project.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    title="Dupliquer ce projet"
                  >
                    {isDuplicating === project.id ? '...' : 'Dupliquer'}
                  </Button>
                  <Button 
                    onClick={() => handleDelete('work', project.id, project.title || `Projet ${index + 1}`)}
                    disabled={isDeleting === project.id}
                    size="sm"
                    className={`text-xs border-0 rounded-md ${
                      isDeleting === project.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Supprimer ce projet"
                  >
                    {isDeleting === project.id ? '...' : 'Supprimer'}
                  </Button>
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
        <Navigation className="w-6 h-6 text-gray-600" />
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
        <Settings className="w-6 h-6 text-gray-600" />
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
        <Mail className="w-6 h-6 text-gray-600" />
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
        <Footprints className="w-6 h-6 text-gray-600" />
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
              <div className="flex items-center">
                <Layout className="w-4 h-4 mr-2" />
                Contenu
              </div>
            </button>
            <button
              onClick={() => setBlogActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                blogActiveTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </div>
            </button>
            <button
              onClick={() => setBlogActiveTab('filters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                blogActiveTab === 'filters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Filtres
              </div>
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {blogActiveTab === 'content' && renderArticlesBlock()}
        {blogActiveTab === 'settings' && (
          <div className="space-y-6">
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
              <div className="flex items-center">
                <Layout className="w-4 h-4 mr-2" />
                Contenu
              </div>
            </button>
            <button
              onClick={() => setWorkActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                workActiveTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </div>
            </button>
            <button
              onClick={() => setWorkActiveTab('filters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                workActiveTab === 'filters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Filtres
              </div>
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {workActiveTab === 'content' && renderProjectsBlock()}
        {workActiveTab === 'settings' && (
          <div className="space-y-6">
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
          toast.info('L\'IA n\'a pas trouvé de nouveaux filtres à suggérer. Vos filtres actuels semblent déjà très complets !');
        }
      } catch (error) {
        console.error('Erreur suggestions IA:', error);
        toast.error(`Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Tag className="w-6 h-6 text-gray-600" />
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
                    className="text-gray-600 p-1"
                    title="Supprimer ce filtre"
                  >
                    <Trash2 className="w-4 h-4" />
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
            <div className="mb-3 text-center">
              <h4 className="text-sm font-medium text-gray-700">Suggestions basées sur votre contenu</h4>
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
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <Atom className="w-8 h-8 text-gray-600" />
                </div>
                <button
                  onClick={getAISuggestions}
                  disabled={isLoadingAI}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-colors"
                >
                  {isLoadingAI ? 'Analyse...' : 'Suggestions IA'}
                </button>
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header sticky */}
      <div 
        className="sticky z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 pb-4"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Éditeur de contenu</h3>
            {shouldShowPlanSuggestion && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-yellow-600 font-medium">
                  {sectionsCount} sections - Ouvrir le Plan ?
                </span>
              </div>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex items-center gap-2">
            {/* Bouton Plan */}
            <Sheet open={isPlanSheetOpen} onOpenChange={setIsPlanSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex items-center gap-2 ${
                    shouldShowPlanSuggestion 
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                      : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                  Plan
                  {shouldShowPlanSuggestion && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-80 p-0 [&>button]:invisible [&>button]:pointer-events-none"
                style={{ 
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)'
                }}
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Plan de la page</SheetTitle>
                  <SheetDescription>
                    Navigation et gestion des sections de la page
                  </SheetDescription>
                </SheetHeader>
                
                <div className="h-full">
                  <SommairePanel 
                    key={`sommaire-${blocks.length}-${blocks.map(b => b.id).join('-')}`}
                    className="border-0" 
                    blocks={blocks} 
                    onSelectBlock={handleSelectBlock}
                    selectedBlockId={selectedBlockId}
                    onDeleteBlock={handleDeleteBlockFromPlan}
                    onDuplicateBlock={duplicateBlock}
                    onReorderBlocks={(newBlocks) => {
                      setBlocks(newBlocks);
                      updateBlocksContent(newBlocks);
                    }}
                  />
                  
                  {/* AlertDialog pour la confirmation de suppression */}
                  <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogPortal>
                      <AlertDialogPrimitive.Content
                        className="fixed left-[50%] top-[50%] z-[100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border !bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
                        style={{ 
                          backgroundColor: '#ffffff !important',
                          borderColor: 'var(--admin-border)',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                      <AlertDialogHeader>
                        <AlertDialogTitle 
                          className="text-gray-900"
                        >
                          Supprimer le bloc
                        </AlertDialogTitle>
                        <AlertDialogDescription 
                          className="text-gray-600"
                        >
                          Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          onClick={cancelDelete}
                          className="!bg-gray-100 !text-gray-800 hover:!bg-gray-200 !border-gray-300"
                        >
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={confirmDelete}
                          className="!bg-gray-900 !text-white hover:!bg-gray-800"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                      </AlertDialogPrimitive.Content>
                    </AlertDialogPortal>
                  </AlertDialog>
                </div>
              </SheetContent>
            </Sheet>

            {/* Menu pour ajouter des blocs */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter un bloc
                </Button>
              </SheetTrigger>
              <SheetContent 
                className="w-[400px] max-w-[400px]"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
              <SheetHeader>
                <SheetTitle>Ajouter un bloc</SheetTitle>
                <SheetDescription>
                  Choisissez le type de bloc à ajouter à votre page
                </SheetDescription>
              </SheetHeader>
              
              {/* Barre de recherche */}
              <div className="mt-6 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un bloc..."
                    value={blockSearchTerm}
                    onChange={(e) => setBlockSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Liste des blocs par catégorie */}
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {Object.entries(getCategorizedBlocksLocal()).map(([categoryName, categoryBlocks]) => (
                  <div key={categoryName} className="mb-6">
                    <button
                      onClick={() => setOpenGroups(prev => ({ ...prev, [categoryName]: !prev[categoryName] }))}
                      className="flex w-full items-center justify-between rounded-lg bg-neutral-100/70 px-3 py-2 text-sm font-semibold mb-3"
                    >
                      <span>{categoryName}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${openGroups[categoryName] ? "rotate-180" : "rotate-0"}`} />
                    </button>
                    
                    {openGroups[categoryName] && (
                      <div className="grid grid-cols-2 gap-3 p-3">
                        {categoryBlocks.map((block) => (
                          <button
                            key={block.type}
                            onClick={() => addBlock(block.type)}
                            className="relative flex h-28 flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-center transition-shadow outline-none hover:shadow-sm focus-visible:ring"
                          >
                            {renderBlockPreview(block.type)}
                            <span className="text-[13px] leading-tight">{getBlockLabel(block.type)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {Object.keys(getCategorizedBlocksLocal()).length === 0 && blockSearchTerm && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun bloc trouvé pour "{blockSearchTerm}"</p>
                  </div>
                )}
              </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Contenu des blocs */}
      <div className="p-6 pt-4">
      
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
            <FileText className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-sm">Aucun bloc pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">Utilisez le menu ci-dessus pour ajouter votre premier bloc</p>
          </div>
        ) : (
          (blocks || []).map((block, index) => (
            <div
              key={block.id}
              data-block-id={block.id}
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
                  <div className="text-sm">Contenu masqué</div>
                  <div className="text-xs mt-1">Cliquez sur "Afficher" pour voir le contenu</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
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
          toast.success('Sauvegarde créée avec succès !');
        } else {
          toast.error('Erreur lors de la création de la sauvegarde');
        }
      } catch (err) {
        toast.error('Erreur lors de la création de la sauvegarde');
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
          toast.success(`${result.deleted} anciennes versions supprimées !`);
          // Recharger la liste des versions
          window.location.reload();
        } else {
          toast.error('Erreur lors du nettoyage');
        }
      } catch (err) {
        toast.error('Erreur lors du nettoyage');
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Save className="w-6 h-6 text-gray-600" />
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
              <Save className="w-4 h-4" />
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
              toast.success(`Version ${filename} restaurée !`);
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



  // Déterminer si cette page doit afficher le sommaire
  const shouldShowSommaire = ['home', 'studio', 'contact', 'project', 'article', 'custom'].includes(pageKey) || 
                            pageKey.startsWith('project-') || pageKey.startsWith('article-');

  return (
    <>
    <div className="flex h-full">
      {/* Zone principale d'édition */}
      <div className="flex-1">
        {/* Bannière profil IA incomplet */}
        {aiProfileCompleteness !== null && aiProfileCompleteness < 80 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Profil IA incomplet ({aiProfileCompleteness}%)
                  </h4>
                  <p className="text-xs text-gray-600">
                    Complétez votre profil IA pour des suggestions plus précises et personnalisées
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.open('/admin/ai', '_blank')}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Compléter
              </button>
            </div>
          </div>
        )}


        <div className="space-y-6">
          {/* Rendu conditionnel selon le type de page */}
          {pageKey === 'home' && (
            <>
              {renderHeroBlock()}
              {renderDragDropEditor()}
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
              {renderDragDropEditor()}
            </>
          )}
          
          {/* Pour les projets et articles individuels, afficher l'éditeur de blocs */}
          {(pageKey === 'project' || pageKey === 'article' || pageKey.startsWith('project-') || pageKey.startsWith('article-')) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Éditeur de contenu</h3>
              {renderDragDropEditor()}
            </div>
          )}
          
          {/* Pour les nouvelles pages personnalisées, afficher l'éditeur de blocs */}
          {pageKey === 'custom' && (
            <>
              {renderContentBlock()}
              {renderDragDropEditor()}
            </>
          )}
          
          {/* Pour les autres pages, afficher les blocs classiques */}
          {!['blog', 'work', 'backup', 'project', 'article', 'contact', 'studio', 'custom', 'metadata'].includes(pageKey) && !pageKey.startsWith('project-') && !pageKey.startsWith('article-') && (
            <>
              {renderContentBlock()}
              {renderMetadataBlock()}
              {renderNavBlock()}
            </>
          )}
          
          {/* Pour la page metadata, afficher seulement le bloc metadata */}
          {pageKey === 'metadata' && (
            <>
              {renderMetadataBlock()}
            </>
          )}
        </div>
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

    </div>
    </>
  );
} 