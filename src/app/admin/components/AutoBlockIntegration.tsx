'use client';
import React from 'react';
import { getBlockMetadata, createAutoBlockInstance, getAutoDeclaredBlock } from '@/blocks/auto-declared/registry';

// Import des blocs auto-déclarés
import '@/blocks/auto-declared';

// Composant pour l'édition des blocs auto-déclarés
export function AutoBlockEditor({ block, onUpdate, onRemove }: { 
  block: any, 
  onUpdate: (block: any) => void,
  onRemove: (id: string) => void 
}) {
  const autoBlock = getAutoDeclaredBlock(block.type);
  
  if (!autoBlock) {
    return null;
  }

  return (
    <div className="block-editor">
      {autoBlock.editor ? (
        <autoBlock.editor
          data={block}
          onChange={onUpdate}
        />
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Interface d'édition générique pour {block.type}
          </p>
          <div className="mt-2 space-y-2">
            {Object.keys(block).filter(key => key !== 'id' && key !== 'type').map(field => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600">{field}</label>
                <input
                  type="text"
                  value={block[field] || ''}
                  onChange={(e) => onUpdate({ ...block, [field]: e.target.value })}
                  className="w-full p-1 text-xs border rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction pour créer un bloc auto-déclaré
export function createAutoBlock(type: string, id?: string) {
  try {
    return createAutoBlockInstance(type, id);
  } catch (error) {
    console.error('Erreur lors de la création du bloc auto-déclaré:', error);
    return null;
  }
}

// Fonction pour obtenir les métadonnées des blocs
export function getAutoBlockMetadata() {
  return getBlockMetadata();
}

// Fonction pour rendre l'éditeur d'un bloc auto-déclaré
export function renderAutoBlockEditor(block: any, onUpdate?: (updates: any) => void, context?: any) {
  const autoBlock = getAutoDeclaredBlock(block.type);
  
  if (!autoBlock) {
    return null;
  }

  // Extraire les données du bloc (structure plate depuis l'admin)
  // Les blocs peuvent avoir { id, type, items, content, ... } ou { id, type, data: {...} }
  const blockData = block.data && typeof block.data === 'object' && Object.keys(block.data).length > 0
    ? block.data
    : (() => {
        // Structure plate : extraire toutes les propriétés sauf id, type
        const { id, type, ...rest } = block;
        return rest;
      })();

  // Passer le mode compact via context
  const compact = context?.compact || false;
  const initialOpenColumn = context?.initialOpenColumn || null;
  const initialOpenBlockId = context?.initialOpenBlockId || null;
  const editorContext = context?.context || context; // Passer le contexte pour l'IA

  return (
    <div className="block-editor">
      {autoBlock.editor ? (
        React.createElement(autoBlock.editor as React.ComponentType<any>, {
          data: blockData,
          compact: compact,
          context: editorContext,
          initialOpenColumn: initialOpenColumn,
          initialOpenBlockId: initialOpenBlockId,
          onChange: (updates: any) => {
            // Mettre à jour le bloc avec les nouvelles données
            // Si le bloc a déjà une structure avec data, fusionner dans data
            // Sinon, fusionner directement (structure plate)
            // IMPORTANT: Toujours préserver l'ID et le type du bloc original
            let updatedBlock: any;
            if (block.data && typeof block.data === 'object') {
              // Structure avec data : fusionner les updates dans data
              updatedBlock = { 
                ...block, 
                id: block.id, // Préserver l'ID
                type: block.type, // Préserver le type
                data: { ...block.data, ...updates } 
              };
            } else {
              // Structure plate : fusionner directement
              updatedBlock = { 
                ...block, 
                id: block.id, // Préserver l'ID
                type: block.type, // Préserver le type
                ...updates 
              };
            }
            if (onUpdate) onUpdate(updatedBlock);
            // Cette fonction sera appelée par le parent
            console.log('🔄 Mise à jour du bloc auto-déclaré:', { block, updates, updatedBlock });
          }
        })
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Interface d'édition générique pour {block.type}
          </p>
          <div className="mt-2 space-y-2">
            {Object.keys(block).filter(key => key !== 'id' && key !== 'type').map(field => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600">{field}</label>
                <input
                  type="text"
                  value={block[field] || ''}
                  onChange={(e) => {
                    const updatedBlock = { ...block, [field]: e.target.value };
                    if (onUpdate) onUpdate(updatedBlock);
                    console.log('🔄 Mise à jour générique:', updatedBlock);
                  }}
                  className="w-full p-1 text-xs border rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
