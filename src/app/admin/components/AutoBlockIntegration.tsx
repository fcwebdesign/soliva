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
      <div className="flex items-center gap-2 mb-2">
        {(autoBlock.icon || autoBlock.label) && (
          <span className="text-sm font-medium text-gray-700">
            {autoBlock.icon} {autoBlock.label}
          </span>
        )}
        <button
          onClick={() => onRemove(block.id)}
          className="ml-auto px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          🗑️
        </button>
      </div>
      
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
export function renderAutoBlockEditor(block: any, onUpdate?: (updates: any) => void) {
  const autoBlock = getAutoDeclaredBlock(block.type);
  
  if (!autoBlock) {
    return null;
  }

  return (
    <div className="block-editor">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">
          {autoBlock.icon} {autoBlock.label}
        </span>
      </div>
      
      {autoBlock.editor ? (
        <autoBlock.editor
          data={block}
          onChange={(updates: any) => {
            if (onUpdate) onUpdate(updates);
            // Cette fonction sera appelée par le parent
            console.log('🔄 Mise à jour du bloc auto-déclaré:', updates);
          }}
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
