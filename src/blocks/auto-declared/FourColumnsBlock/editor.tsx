'use client';

import React from 'react';
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { getAutoDeclaredBlock } from '../registry';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../../components/ui/drawer';
import { Button } from '../../../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import { Plus, ChevronDown } from 'lucide-react';
import { getCategorizedBlocksForColumns } from '../../../utils/blockCategories';

interface FourColumnsData {
  column1?: any[];
  column2?: any[];
  column3?: any[];
  column4?: any[];
  layout?: 'four-columns' | 'stacked-mobile' | 'stacked-tablet';
  gap?: 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

// Types de blocs supportés dans les colonnes (facilement configurables)
const SUPPORTED_BLOCK_TYPES = [
  'content', 'h2', 'h3', 'image', 'services', 'projects', 'logos', 'contact'
];

export default function FourColumnsBlockEditor({ data, onChange }: { data: FourColumnsData; onChange: (data: FourColumnsData) => void }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [draggedColumn, setDraggedColumn] = React.useState<'column1' | 'column2' | 'column3' | 'column4' | null>(null);
  
  // État pour le Drawer
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingBlock, setEditingBlock] = React.useState<{ block: any; column: string; index: number } | null>(null);
  
  // État pour le Sheet de sélection de blocs
  const [openGroups, setOpenGroups] = React.useState<{ [key: string]: boolean }>({});

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateColumn = (column: 'column1' | 'column2' | 'column3' | 'column4', blocks: any[]) => {
    updateField(column, blocks);
  };

  const addBlockToColumn = (column: 'column1' | 'column2' | 'column3' | 'column4', blockType: string) => {
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

  const removeBlockFromColumn = (column: 'column1' | 'column2' | 'column3' | 'column4', index: number) => {
    const currentBlocks = data[column] || [];
    const newBlocks = currentBlocks.filter((_, i) => i !== index);
    updateColumn(column, newBlocks);
  };

  const updateBlockInColumn = (column: 'column1' | 'column2' | 'column3' | 'column4', index: number, updates: any) => {
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
  const handleDragStart = (e: React.DragEvent, index: number, column: 'column1' | 'column2' | 'column3' | 'column4') => {
    setDraggedIndex(index);
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, targetColumn: 'column1' | 'column2' | 'column3' | 'column4') => {
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
          pageKey: 'four-columns',
          context: `Contenu pour un bloc ${blockType} dans une colonne`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      // Trouver et mettre à jour le bloc dans la colonne appropriée
      const column1Blocks = data.column1 || [];
      const column2Blocks = data.column2 || [];
      const column3Blocks = data.column3 || [];
      const column4Blocks = data.column4 || [];
      
      const column1Index = column1Blocks.findIndex(block => block.id === blockId);
      const column2Index = column2Blocks.findIndex(block => block.id === blockId);
      const column3Index = column3Blocks.findIndex(block => block.id === blockId);
      const column4Index = column4Blocks.findIndex(block => block.id === blockId);
      
      if (column1Index !== -1) {
        updateBlockInColumn('column1', column1Index, { content: responseData.suggestedContent });
      } else if (column2Index !== -1) {
        updateBlockInColumn('column2', column2Index, { content: responseData.suggestedContent });
      } else if (column3Index !== -1) {
        updateBlockInColumn('column3', column3Index, { content: responseData.suggestedContent });
      } else if (column4Index !== -1) {
        updateBlockInColumn('column4', column4Index, { content: responseData.suggestedContent });
      }
      
    } catch (error) {
      console.error('Erreur suggestion contenu IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const renderColumnEditor = (column: 'column1' | 'column2' | 'column3' | 'column4', title: string) => {
    const blocks = data[column] || [];
    
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un bloc
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Choisir un type de bloc</SheetTitle>
                <SheetDescription>
                  Sélectionnez le type de bloc à ajouter dans {title.toLowerCase()}
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto mt-6">
                {Object.entries(getCategorizedBlocksForColumns()).map(([categoryName, categoryBlocks]) => (
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
                          <SheetTrigger asChild key={block.type}>
                            <button
                              onClick={() => addBlockToColumn(column, block.type)}
                              className="relative flex h-28 flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-center transition-shadow outline-none hover:shadow-sm focus-visible:ring"
                            >
                              {block.preview}
                              <span className="text-[13px] leading-tight">{block.label}</span>
                            </button>
                          </SheetTrigger>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
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

  const renderBlockEditor = (block: any, onUpdate: (updates: any) => void) => {
    // Essayer d'abord le système scalable
    const scalableBlock = getAutoDeclaredBlock(block.type);
    if (scalableBlock && scalableBlock.editor) {
      const BlockEditor = scalableBlock.editor;
      return (
        <BlockEditor
          data={block}
          onChange={onUpdate}
        />
      );
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
              onAISuggestion={() => getBlockContentSuggestion(block.id, 'content')}
              isLoadingAI={isLoadingBlockAI === block.id}
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

  return (
    <div className="block-editor">
      <div className="space-y-4">
        {/* Configuration du layout */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </label>
            <select
              value={data.layout || 'four-columns'}
              onChange={(e) => updateField('layout', e.target.value)}
              className="block-input"
            >
              <option value="four-columns">4 Colonnes</option>
              <option value="stacked-mobile">Empilé mobile</option>
              <option value="stacked-tablet">Empilé tablette</option>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {renderColumnEditor('column1', 'Colonne 1')}
          {renderColumnEditor('column2', 'Colonne 2')}
          {renderColumnEditor('column3', 'Colonne 3')}
          {renderColumnEditor('column4', 'Colonne 4')}
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
    </div>
  );
}
