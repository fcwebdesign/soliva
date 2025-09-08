'use client';

import React from 'react';
import WysiwygEditor from '../../../app/admin/components/WysiwygEditor';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { getAutoDeclaredBlock } from '../registry';

interface ThreeColumnsData {
  leftColumn?: any[];
  middleColumn?: any[];
  rightColumn?: any[];
  layout?: 'left-middle-right' | 'stacked-mobile' | 'stacked-tablet';
  gap?: 'small' | 'medium' | 'large';
  alignment?: 'top' | 'center' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

// Types de blocs supportés dans les colonnes (facilement configurables)
const SUPPORTED_BLOCK_TYPES = [
  'content', 'h2', 'h3', 'image', 'services', 'projects', 'logos', 'contact'
];

export default function ThreeColumnsBlockEditor({ data, onChange }: { data: ThreeColumnsData; onChange: (data: ThreeColumnsData) => void }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [draggedColumn, setDraggedColumn] = React.useState<'leftColumn' | 'middleColumn' | 'rightColumn' | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateColumn = (column: 'leftColumn' | 'middleColumn' | 'rightColumn', blocks: any[]) => {
    updateField(column, blocks);
  };

  const addBlockToColumn = (column: 'leftColumn' | 'middleColumn' | 'rightColumn', blockType: string) => {
    const newBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      ...getDefaultBlockData(blockType)
    };
    
    const currentBlocks = data[column] || [];
    updateColumn(column, [...currentBlocks, newBlock]);
  };

  const removeBlockFromColumn = (column: 'leftColumn' | 'middleColumn' | 'rightColumn', index: number) => {
    const currentBlocks = data[column] || [];
    const newBlocks = currentBlocks.filter((_, i) => i !== index);
    updateColumn(column, newBlocks);
  };

  const updateBlockInColumn = (column: 'leftColumn' | 'middleColumn' | 'rightColumn', index: number, updates: any) => {
    const currentBlocks = data[column] || [];
    const newBlocks = [...currentBlocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    updateColumn(column, newBlocks);
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
  const handleDragStart = (e: React.DragEvent, index: number, column: 'leftColumn' | 'middleColumn' | 'rightColumn') => {
    setDraggedIndex(index);
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, targetColumn: 'leftColumn' | 'middleColumn' | 'rightColumn') => {
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
          pageKey: 'three-columns',
          context: `Contenu pour un bloc ${blockType} dans une colonne`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      // Trouver et mettre à jour le bloc dans la colonne appropriée
      const leftBlocks = data.leftColumn || [];
      const middleBlocks = data.middleColumn || [];
      const rightBlocks = data.rightColumn || [];
      
      const leftIndex = leftBlocks.findIndex(block => block.id === blockId);
      const middleIndex = middleBlocks.findIndex(block => block.id === blockId);
      const rightIndex = rightBlocks.findIndex(block => block.id === blockId);
      
      if (leftIndex !== -1) {
        updateBlockInColumn('leftColumn', leftIndex, { content: responseData.suggestedContent });
      } else if (middleIndex !== -1) {
        updateBlockInColumn('middleColumn', middleIndex, { content: responseData.suggestedContent });
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

  const renderColumnEditor = (column: 'leftColumn' | 'middleColumn' | 'rightColumn', title: string) => {
    const blocks = data[column] || [];
    
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addBlockToColumn(column, e.target.value);
                e.target.value = '';
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Ajouter un bloc...</option>
            {SUPPORTED_BLOCK_TYPES.map(blockType => (
              <option key={blockType} value={blockType}>
                {blockType === 'h2' ? 'Titre H2' :
                 blockType === 'h3' ? 'Sous-titre H3' :
                 blockType === 'content' ? 'Contenu' :
                 blockType === 'image' ? 'Image' :
                 blockType === 'services' ? 'Services' :
                 blockType === 'projects' ? 'Projets' :
                 blockType === 'logos' ? 'Logos clients' :
                 blockType === 'contact' ? 'Contact' : blockType}
              </option>
            ))}
          </select>
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
                
                {renderBlockEditor(block, (updates) => updateBlockInColumn(column, index, updates))}
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
              value={data.layout || 'left-middle-right'}
              onChange={(e) => updateField('layout', e.target.value)}
              className="block-input"
            >
              <option value="left-middle-right">Gauche → Centre → Droite</option>
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
        <div className="grid grid-cols-3 gap-4">
          {renderColumnEditor('leftColumn', 'Colonne gauche')}
          {renderColumnEditor('middleColumn', 'Colonne centre')}
          {renderColumnEditor('rightColumn', 'Colonne droite')}
        </div>
      </div>
    </div>
  );
}
