'use client';

import React, { useState, useMemo, useEffect } from 'react';
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { getAutoDeclaredBlock } from '../registry';
import BlockSelectorSheet from '../../../components/admin/BlockSelectorSheet';
import { SheetTrigger } from '../../../components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '../../../components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, ChevronDown, GripVertical, Trash2, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface TwoColumnsData {
  title?: string;
  leftColumn?: any[];
  rightColumn?: any[];
  layout?: 'left-right' | 'right-left' | 'stacked-mobile';
  gap?: 'small' | 'medium' | 'large';
  leftRowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large';
  rightRowGap?: 'inherit' | 'none' | 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

// Composant pour un bloc draggable dans une colonne
function SortableBlockItem({ 
  block, 
  index, 
  column, 
  isOpen, 
  onToggle, 
  onUpdate, 
  onRemove,
  onToggleVisibility,
  renderEditor
}: { 
  block: any; 
  index: number;
  column: 'leftColumn' | 'rightColumn';
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  renderEditor: (block: any, onUpdate: (updates: any) => void) => React.ReactNode;
}) {
  // S'assurer que le bloc a un ID unique (devrait déjà être fourni par le parent)
  const blockId = (block.id && block.id.trim() !== '') ? block.id : `block-${column}-${index}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: blockId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded bg-white">
      {/* Header cliquable */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onToggle();
        }}
        className="flex items-center gap-2 py-1 px-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors group"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
        <span className="flex-1 text-[13px]">{block.type}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title={block.hidden ? "Afficher" : "Masquer"}
        >
          {block.hidden ? (
            <EyeOff className="w-3 h-3" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        {isOpen ? (
          <ChevronUp className="w-3 h-3 text-gray-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-400" />
        )}
      </div>
      {/* Contenu éditeur */}
      {isOpen && (
        <div className="px-2 pb-2 border-t border-gray-200 bg-gray-50" onClick={(e) => e.stopPropagation()}>
          {renderEditor(block, onUpdate)}
        </div>
      )}
    </div>
  );
}


export default function TwoColumnsBlockEditor({ data, onChange, compact = false, initialOpenColumn = null, initialOpenBlockId = null }: { data: TwoColumnsData; onChange: (data: TwoColumnsData) => void; compact?: boolean; initialOpenColumn?: 'left' | 'right' | null; initialOpenBlockId?: string | null }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [draggedColumn, setDraggedColumn] = React.useState<'leftColumn' | 'rightColumn' | null>(null);
  
  // État pour le Sheet de sélection de blocs (version normale)
  const [sheetOpenNormal, setSheetOpenNormal] = React.useState(false);
  const [selectedColumnForSheet, setSelectedColumnForSheet] = React.useState<'leftColumn' | 'rightColumn' | null>(null);
  
  // État pour le Drawer
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingBlock, setEditingBlock] = React.useState<{ block: any; column: string; index: number } | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateColumn = (column: 'leftColumn' | 'rightColumn', blocks: any[]) => {
    updateField(column, blocks);
  };

  const addBlockToColumn = (column: 'leftColumn' | 'rightColumn', blockType: string) => {
    const newBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      ...getDefaultBlockData(blockType)
    };
    
    const currentBlocks = data[column] || [];
    const newBlocks = [...currentBlocks, newBlock];
    updateColumn(column, newBlocks);
    
    // Ouvrir automatiquement le drawer pour éditer le nouveau bloc
    const newBlockIndex = newBlocks.length - 1;
    openDrawer(newBlock, column, newBlockIndex);
  };

  const removeBlockFromColumn = (column: 'leftColumn' | 'rightColumn', index: number) => {
    const currentBlocks = data[column] || [];
    const newBlocks = currentBlocks.filter((_, i) => i !== index);
    updateColumn(column, newBlocks);
  };

  const updateBlockInColumn = (column: 'leftColumn' | 'rightColumn', index: number, updates: any) => {
    const currentBlocks = data[column] || [];
    const newBlocks = [...currentBlocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    updateColumn(column, newBlocks);
  };

  // Fonctions pour le Drawer
  const openDrawer = (block: any, column: string, index: number) => {
    setEditingBlock({ block, column, index });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingBlock(null);
  };

  const saveBlockInDrawer = (updates: any) => {
    if (editingBlock) {
      updateBlockInColumn(editingBlock.column as any, editingBlock.index, updates);
      // Mettre à jour l'état du bloc en cours d'édition
      setEditingBlock({
        ...editingBlock,
        block: { ...editingBlock.block, ...updates }
      });
    }
  };

  const getDefaultBlockData = (blockType: string) => {
    const scalableBlock = getAutoDeclaredBlock(blockType);
    if (scalableBlock) {
      return scalableBlock.defaultData;
    }
    
    // Fallback pour les blocs non scalables
    switch (blockType) {
      case 'content': return { content: '' };
      case 'h2': return { content: '' };
      case 'h3': return { content: '' };
      case 'image': return { image: { src: '', alt: '' } };
      default: return {};
    }
  };

  // Drag & drop natif
  const handleDragStart = (e: React.DragEvent, index: number, column: 'leftColumn' | 'rightColumn') => {
    setDraggedIndex(index);
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, targetColumn: 'leftColumn' | 'rightColumn') => {
    e.preventDefault();
    if (draggedIndex === null || draggedColumn === null) return;

    const sourceBlocks = data[draggedColumn] || [];
    const targetBlocks = data[targetColumn] || [];
    
    if (draggedColumn === targetColumn) {
      // Même colonne : réorganiser
      if (draggedIndex === dropIndex) return;
      const newBlocks = [...sourceBlocks];
      const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(dropIndex, 0, draggedBlock);
      updateColumn(draggedColumn, newBlocks);
    } else {
      // Colonnes différentes : déplacer
      const newSourceBlocks = sourceBlocks.filter((_, i) => i !== draggedIndex);
      const newTargetBlocks = [...targetBlocks];
      newTargetBlocks.splice(dropIndex, 0, sourceBlocks[draggedIndex]);
      
      updateColumn(draggedColumn, newSourceBlocks);
      updateColumn(targetColumn, newTargetBlocks);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedColumn(null);
  };

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey: 'two-columns',
          context: `Contenu pour un bloc ${blockType} dans une colonne`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      // Trouver et mettre à jour le bloc dans la colonne appropriée
      const leftBlocks = data.leftColumn || [];
      const rightBlocks = data.rightColumn || [];
      
      const leftIndex = leftBlocks.findIndex(block => block.id === blockId);
      const rightIndex = rightBlocks.findIndex(block => block.id === blockId);
      
      if (leftIndex !== -1) {
        updateBlockInColumn('leftColumn', leftIndex, { content: responseData.suggestedContent });
      } else if (rightIndex !== -1) {
        updateBlockInColumn('rightColumn', rightIndex, { content: responseData.suggestedContent });
      }
      
    } catch (error) {
      console.error('Erreur suggestion contenu IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const renderColumnEditor = (column: 'leftColumn' | 'rightColumn', title: string) => {
    const blocks = data[column] || [];
    const columnGapKey = column === 'leftColumn' ? 'leftRowGap' : 'rightRowGap';
    const columnGapValue = (data as any)[columnGapKey] || 'inherit';
    
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-gray-400">Espacement</label>
              <select
                value={columnGapValue}
                onChange={(e) => updateField(columnGapKey, e.target.value)}
                className="h-8 px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              >
                <option value="inherit">Hériter</option>
                <option value="none">Aucun</option>
                <option value="small">Petit</option>
                <option value="medium">Moyen</option>
                <option value="large">Grand</option>
              </select>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedColumnForSheet(column);
                setSheetOpenNormal(true);
              }}
            >
              + Ajouter un bloc
            </Button>
          </div>
          
          {/* Sheet de sélection de blocs (composant réutilisable) */}
          {selectedColumnForSheet === column && (
            <BlockSelectorSheet
              open={sheetOpenNormal}
              onOpenChange={(open) => {
                setSheetOpenNormal(open);
                if (!open) setSelectedColumnForSheet(null);
              }}
              onSelectBlock={(blockType) => {
                addBlockToColumn(column, blockType);
                setSheetOpenNormal(false);
                setSelectedColumnForSheet(null);
              }}
            />
          )}
        </div>

        <div className="space-y-3">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm">Aucun bloc pour le moment</p>
              <p className="text-xs text-gray-400 mt-1">Utilisez le menu ci-dessus pour ajouter votre premier bloc</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div 
                key={block.id} 
                className={`block-container ${
                  draggedIndex === index && draggedColumn === column ? 'opacity-50' : ''
                } ${
                  dragOverIndex === index && draggedColumn !== column ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index, column)}
              >
                <div className="block-header">
                  <div 
                    className="drag-handle cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, column)}
                    onDragEnd={handleDragEnd}
                  >
                    ⋮⋮
                  </div>
                  <span className="block-type">{block.type}</span>
                  <button
                    onClick={() => removeBlockFromColumn(column, index)}
                    className="remove-block ml-auto"
                  >
                    ×
                  </button>
                </div>
                
                {/* Remplacer l'édition inline par un clic qui ouvre le Drawer */}
                <div 
                  className="block-content cursor-pointer p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  onClick={() => openDrawer(block, column, index)}
                >
                  <div className="text-sm text-gray-600 mb-2">
                    Cliquez pour éditer ce bloc
                  </div>
                  <div className="text-xs text-gray-400">
                    Type: {block.type}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderBlockEditor = (block: any, onUpdate: (updates: any) => void, isCompact = false) => {
    // Essayer d'abord le système scalable
    const scalableBlock = getAutoDeclaredBlock(block.type);
    if (scalableBlock && scalableBlock.editor) {
      const BlockEditor = scalableBlock.editor;
      // Passer compact seulement si l'éditeur le supporte
      const editorProps: any = {
        data: block,
        onChange: onUpdate
      };
      if (isCompact) {
        editorProps.compact = true;
      }
      return <BlockEditor {...editorProps} />;
    }

    // Fallback pour les blocs non scalables
    switch (block.type) {
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
                {isLoadingBlockAI === block.id ? '🤖...' : ' IA'}
              </button>
            </div>
            <WysiwygEditor
              value={block.content || ''}
              onChange={(content: any) => onUpdate({ content })}
              placeholder="Saisissez votre contenu ici..."
            />
          </div>
        );
      
      case 'h2':
      case 'h3':
        return (
          <div className="block-editor">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => getBlockContentSuggestion(block.id, block.type)}
                disabled={isLoadingBlockAI === block.id}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isLoadingBlockAI === block.id 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {isLoadingBlockAI === block.id ? '🤖...' : ' IA'}
              </button>
            </div>
            <input
              type="text"
              value={block.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder={`Titre ${block.type.toUpperCase()}`}
              className="block-input"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="block-editor">
            <MediaUploader
              currentUrl={block.image?.src || ''}
              onUpload={(src) => onUpdate({ image: { ...block.image, src } })}
            />
            <input
              type="text"
              value={block.image?.alt || ''}
              onChange={(e) => onUpdate({ image: { ...block.image, alt: e.target.value } })}
              placeholder="Description de l'image (alt text)"
              className="block-input mt-2"
            />
          </div>
        );
      
      default:
        return <div className="text-gray-500 text-sm">Éditeur non disponible pour {block.type}</div>;
    }
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    // Si initialOpenBlockId est fourni, ouvrir automatiquement la colonne correspondante
    const getInitialColumn = (): 'left' | 'right' | null => {
      if (initialOpenColumn) return initialOpenColumn;
      if (initialOpenBlockId) {
        // Vérifier dans quelle colonne se trouve le bloc
        const leftColumn = data.leftColumn || [];
        const rightColumn = data.rightColumn || [];
        if (leftColumn.some((b: any) => b.id === initialOpenBlockId)) return 'left';
        if (rightColumn.some((b: any) => b.id === initialOpenBlockId)) return 'right';
      }
      return null;
    };
    
    const [openColumn, setOpenColumn] = useState<'left' | 'right' | null>(getInitialColumn());
    const [sheetOpen, setSheetOpen] = useState(false);
    const [targetColumn, setTargetColumn] = useState<'leftColumn' | 'rightColumn' | null>(null);
    const [openBlockId, setOpenBlockId] = useState<string | null>(initialOpenBlockId);

    // Sensors pour drag & drop
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          delay: 150,
          tolerance: 5
        }
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates
      })
    );

    // Normaliser les IDs des blocs et les sauvegarder si nécessaire
    useEffect(() => {
      let needsUpdate = false;
      const updatedData = { ...data };
      
      ['leftColumn', 'rightColumn'].forEach((col) => {
        const column = col as 'leftColumn' | 'rightColumn';
        const blocks = updatedData[column] || [];
        const normalizedBlocks = blocks.map((block) => {
          if (!block.id || block.id.trim() === '') {
            needsUpdate = true;
            return { ...block, id: `${block.type || 'block'}-${column}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
          }
          return block;
        });
        if (needsUpdate) {
          updatedData[column] = normalizedBlocks;
        }
      });
      
      if (needsUpdate) {
        onChange(updatedData);
      }
    }, [data.leftColumn?.length, data.rightColumn?.length]); // Quand le nombre de blocs change

    // Normaliser les blocs avec des IDs stables pour le rendu
    const normalizedColumns = useMemo(() => {
      return {
        leftColumn: data.leftColumn || [],
        rightColumn: data.rightColumn || []
      };
    }, [data.leftColumn, data.rightColumn]);

    const handleAddBlock = (column: 'leftColumn' | 'rightColumn') => {
      setTargetColumn(column);
      setSheetOpen(true);
    };

    const handleSelectBlock = (blockType: string) => {
      if (targetColumn) {
        addBlockToColumn(targetColumn, blockType);
        setSheetOpen(false);
        setTargetColumn(null);
      }
    };

    const toggleBlock = (blockId: string) => {
      setOpenBlockId(openBlockId === blockId ? null : blockId);
    };

    const handleUpdateBlock = (column: 'leftColumn' | 'rightColumn', index: number, updates: any) => {
      updateBlockInColumn(column, index, updates);
    };

    const handleToggleVisibility = (column: 'leftColumn' | 'rightColumn', index: number) => {
      const blocks = data[column] || [];
      const block = blocks[index];
      if (block) {
        const updatedBlock = { ...block, hidden: !block.hidden };
        updateBlockInColumn(column, index, updatedBlock);
      }
    };

    const handleDragEnd = (event: DragEndEvent, column: 'leftColumn' | 'rightColumn') => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const blocks = normalizedColumns[column];
        
        // Utiliser directement les IDs des blocs pour trouver les indices
        const oldIndex = blocks.findIndex(b => b.id === active.id);
        const newIndex = blocks.findIndex(b => b.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(blocks, oldIndex, newIndex);
          // Sauvegarder avec les IDs normalisés
          updateColumn(column, newOrder);
        }
      }
    };

    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Section Title"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Layout</label>
              <Select 
                value={data.layout || 'left-right'} 
                onValueChange={(value) => updateField('layout', value)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="left-right">Gauche → Droite</SelectItem>
                  <SelectItem value="right-left">Droite → Gauche</SelectItem>
                  <SelectItem value="stacked-mobile">Empilé mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Espacement</label>
              <Select 
                value={data.gap || 'medium'} 
                onValueChange={(value) => updateField('gap', value)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="small">Petit</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="large">Grand</SelectItem>
                  <SelectItem value="xlarge">Très grand</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Alignement</label>
              <Select 
                value={data.alignment || 'top'} 
                onValueChange={(value) => updateField('alignment', value)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="top">Haut</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="bottom">Bas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colonnes en accordéon */}
          <div className="space-y-1">
            {/* Colonne gauche */}
            <div className="border border-gray-200 rounded">
              <button
                onClick={() => setOpenColumn(openColumn === 'left' ? null : 'left')}
                className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[13px] font-medium text-gray-900">
                  Colonne gauche ({(data.leftColumn || []).length})
                </span>
                {openColumn === 'left' ? (
                  <ChevronUp className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                )}
              </button>
              {normalizedColumns.leftColumn.length >= 2 && (
                <div className="px-2 pb-2 flex items-center gap-2">
                  <label className="text-[10px] text-gray-400">Espacement</label>
                  <Select
                    value={(data as any).leftRowGap || 'inherit'}
                    onValueChange={(value) => updateField('leftRowGap', value)}
                  >
                    <SelectTrigger className="h-8 px-2 py-1 text-[12px] shadow-none border border-gray-200 rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="end">
                    <SelectItem value="inherit">Hériter</SelectItem>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="small">Petit</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="large">Grand</SelectItem>
                    <SelectItem value="xlarge">Très grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
              {openColumn === 'left' && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, 'leftColumn')}
                >
                  <SortableContext
                    items={normalizedColumns.leftColumn.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="px-2 pb-2 space-y-1">
                      {normalizedColumns.leftColumn.map((block, index) => {
                        return (
                          <SortableBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            column="leftColumn"
                            isOpen={openBlockId === block.id}
                            onToggle={() => toggleBlock(block.id)}
                            onUpdate={(updates) => handleUpdateBlock('leftColumn', index, updates)}
                            onRemove={() => removeBlockFromColumn('leftColumn', index)}
                            onToggleVisibility={() => handleToggleVisibility('leftColumn', index)}
                            renderEditor={(block, onUpdate) => renderBlockEditor(block, onUpdate, true)}
                          />
                        );
                      })}
                      <button
                        onClick={() => handleAddBlock('leftColumn')}
                        className="w-full py-1.5 px-2 border border-gray-300 border-dashed rounded text-[13px] text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                      >
                        + Ajouter un bloc
                      </button>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Colonne droite */}
            <div className="border border-gray-200 rounded">
              <button
                onClick={() => setOpenColumn(openColumn === 'right' ? null : 'right')}
                className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[13px] font-medium text-gray-900">
                  Colonne droite ({(data.rightColumn || []).length})
                </span>
                {openColumn === 'right' ? (
                  <ChevronUp className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                )}
              </button>
              {normalizedColumns.rightColumn.length >= 2 && (
                <div className="px-2 pb-2 flex items-center gap-2">
                  <label className="text-[10px] text-gray-400">Espacement</label>
                  <Select
                    value={(data as any).rightRowGap || 'inherit'}
                    onValueChange={(value) => updateField('rightRowGap', value)}
                  >
                    <SelectTrigger className="h-8 px-2 py-1 text-[12px] shadow-none border border-gray-200 rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="end">
                    <SelectItem value="inherit">Hériter</SelectItem>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="small">Petit</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="large">Grand</SelectItem>
                    <SelectItem value="xlarge">Très grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
              {openColumn === 'right' && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, 'rightColumn')}
                >
                  <SortableContext
                    items={normalizedColumns.rightColumn.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="px-2 pb-2 space-y-1">
                      {normalizedColumns.rightColumn.map((block, index) => {
                        return (
                          <SortableBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            column="rightColumn"
                            isOpen={openBlockId === block.id}
                            onToggle={() => toggleBlock(block.id)}
                            onUpdate={(updates) => handleUpdateBlock('rightColumn', index, updates)}
                            onRemove={() => removeBlockFromColumn('rightColumn', index)}
                            onToggleVisibility={() => handleToggleVisibility('rightColumn', index)}
                            renderEditor={(block, onUpdate) => renderBlockEditor(block, onUpdate, true)}
                          />
                        );
                      })}
                      <button
                        onClick={() => handleAddBlock('rightColumn')}
                        className="w-full py-1.5 px-2 border border-gray-300 border-dashed rounded text-[13px] text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                      >
                        + Ajouter un bloc
                      </button>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Sheet pour choisir le type de bloc (composant réutilisable) */}
        <BlockSelectorSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onSelectBlock={handleSelectBlock}
          excludeLayouts={true} // Exclure les layouts dans les colonnes
        />
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor">
      <div className="space-y-4">
        {/* Titre (H2) optionnel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre (H2)
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Titre de la section"
            className="block-input"
          />
          <p className="text-xs text-gray-500 mt-1">Affiché au-dessus des colonnes.</p>
        </div>

        {/* Configuration du layout */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </label>
            <select
              value={data.layout || 'left-right'}
              onChange={(e) => updateField('layout', e.target.value)}
              className="block-input"
            >
              <option value="left-right">Gauche → Droite</option>
              <option value="right-left">Droite → Gauche</option>
              <option value="stacked-mobile">Empilé mobile</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espacement
            </label>
            <select
              value={data.gap || 'medium'}
              onChange={(e) => updateField('gap', e.target.value)}
              className="block-input"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignement
            </label>
            <select
              value={data.alignment || 'top'}
              onChange={(e) => updateField('alignment', e.target.value)}
              className="block-input"
            >
              <option value="top">Haut</option>
              <option value="center">Centre</option>
              <option value="bottom">Bas</option>
            </select>
          </div>
        </div>

        {/* Thème */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>

        {/* Éditeurs des colonnes */}
        <div className="grid grid-cols-2 gap-4">
          {renderColumnEditor('leftColumn', 'Colonne gauche')}
          {renderColumnEditor('rightColumn', 'Colonne droite')}
        </div>
      </div>

      {/* Drawer pour l'édition des blocs */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[70vh] max-h-[600px] flex flex-col">
          <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 flex items-center justify-between py-4 px-4">
              <DrawerTitle className="m-0">
                Éditer le bloc - {editingBlock?.block?.type || 'Inconnu'}
              </DrawerTitle>
              <Button onClick={closeDrawer}>
                Fermer
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              {editingBlock && renderBlockEditor(editingBlock.block, saveBlockInDrawer)}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Sheet de sélection de blocs pour la version normale (composant réutilisable) */}
      {selectedColumnForSheet && (
        <BlockSelectorSheet
          open={sheetOpenNormal}
          onOpenChange={(open) => {
            setSheetOpenNormal(open);
            if (!open) setSelectedColumnForSheet(null);
          }}
          onSelectBlock={(blockType) => {
            if (selectedColumnForSheet) {
              addBlockToColumn(selectedColumnForSheet, blockType);
              setSheetOpenNormal(false);
              setSelectedColumnForSheet(null);
            }
          }}
        />
      )}
    </div>
  );
}
