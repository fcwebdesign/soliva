'use client';

import React from 'react';
import WysiwygEditor from './WysiwygEditor';
import MediaUploader from './MediaUploader';
import type { TwoColumnsBlock } from '@/blocks/types';

interface TwoColumnsEditorProps {
  block: TwoColumnsBlock;
  onUpdate: (updates: Partial<TwoColumnsBlock>) => void;
}

// Composant pour l'éditeur de blocs simplifié qui utilise les mêmes composants
function SimpleBlockEditor({ 
  blocks, 
  onUpdate 
}: { 
  blocks: any[]; 
  onUpdate: (data: any) => void; 
}) {
  const [localBlocks, setLocalBlocks] = React.useState(blocks || []);
  const [isLoadingBlockAI, setIsLoadingBlockAI] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Synchroniser localBlocks avec blocks quand ils changent
  React.useEffect(() => {
    setLocalBlocks(blocks || []);
  }, [blocks]);

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

    const newBlocks = [...localBlocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    
    setLocalBlocks(newBlocks);
    onUpdate({ blocks: newBlocks });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const addBlock = (type: string) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      content: '',
      ...(type === 'image' && { image: { src: '', alt: '' } }),
      ...(type === 'cta' && { ctaText: '', ctaLink: '' }),
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
      })
    };

    const newBlocks = [...localBlocks, newBlock];
    setLocalBlocks(newBlocks);
    onUpdate({ blocks: newBlocks });
  };

  const updateBlock = (blockId: string, updates: any) => {
    const newBlocks = localBlocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setLocalBlocks(newBlocks);
    onUpdate({ blocks: newBlocks });
  };

  const removeBlock = (blockId: string) => {
    const newBlocks = localBlocks.filter(block => block.id !== blockId);
    setLocalBlocks(newBlocks);
    onUpdate({ blocks: newBlocks });
  };

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      // Récupérer le bloc actuel pour avoir le titre existant
      const currentBlock = localBlocks.find(block => block.id === blockId);
      
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey: 'two-columns',
          existingBlocks: localBlocks,
          existingTitle: currentBlock?.title || '',
          existingOfferings: currentBlock?.offerings || [],
          context: `Bloc ${blockType} dans une colonne`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error((data as any).error || 'Erreur API');
      }

      // Appliquer la suggestion au bloc selon le type
      if (blockType === 'services') {
        // Pour services, garder le titre existant et mettre à jour seulement les descriptions
        const suggestion = data.suggestedContent;
        if (suggestion.offerings && currentBlock?.offerings) {
          // Mettre à jour seulement les descriptions des services existants
          const updatedOfferings = currentBlock.offerings.map((offering: any, index: number) => ({
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

  const renderBlock = (block: any, index: number) => {
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
              value={block.content || ''}
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
              value={block.content || ''}
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
              value={block.content || ''}
              onChange={(content: string) => updateBlock(block.id, { content })}
              placeholder="Contenu du paragraphe"
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
              onChange={(content: string) => updateBlock(block.id, { content })}
              placeholder="Contenu de la section"
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
                  Services ({block.offerings?.length || 0})
                </label>
                <div className="space-y-3">
                  {(block.offerings || []).map((offering: any, index: number) => (
                    <div key={offering.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Service {index + 1}</span>
                        <button
                          onClick={() => {
                            const newOfferings = block.offerings?.filter((_: any, i: number) => i !== index) || [];
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
                      <WysiwygEditor
                        value={offering.description || ''}
                        onChange={(content: string) => {
                          const newOfferings = [...(block.offerings || [])];
                          newOfferings[index] = { ...offering, description: content };
                          updateBlock(block.id, { offerings: newOfferings });
                        }}
                        placeholder="Description du service"
                      />
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
                  Logos clients
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(block.logos || []).map((logo: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Logo {index + 1}</span>
                        <button
                          onClick={() => {
                            const newLogos = (block.logos || []).filter((_: any, i: number) => i !== index);
                            updateBlock(block.id, { logos: newLogos });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Image
                          </label>
                          <MediaUploader
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
      
      default:
        return <div className="text-gray-500 text-sm">Type de bloc non supporté</div>;
    }
  };

  const availableBlockTypes = ['h2', 'h3', 'content', 'image', 'cta', 'about', 'services', 'projects', 'logos'];

  return (
    <div className="space-y-4">
      {/* Menu pour ajouter des blocs */}
      <div className="flex items-center space-x-2">
        <select
          onChange={(e) => {
            if (e.target.value) {
              addBlock(e.target.value);
              e.target.value = '';
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Ajouter un bloc...</option>
          {availableBlockTypes.map(type => (
            <option key={type} value={type}>
              {type === 'h2' ? 'Titre H2' :
               type === 'h3' ? 'Sous-titre H3' :
               type === 'content' ? 'Contenu' :
               type === 'image' ? 'Image' :
               type === 'cta' ? 'CTA' :
               type === 'about' ? 'À propos' :
               type === 'services' ? 'Services' :
               type === 'projects' ? 'Projets' :
               type === 'logos' ? 'Logos clients' : type}
            </option>
          ))}
        </select>
      </div>
      
      {/* Zone de blocs */}
      <div className="space-y-4">
        {localBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm">Aucun bloc pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">Utilisez le menu ci-dessus pour ajouter votre premier bloc</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localBlocks.map((block, index) => (
              <div
                key={block.id}
                className={`block-container ${draggedIndex === index ? 'dragged' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="block-header">
                  <div className="drag-handle">⋮⋮</div>
                  <span className="block-type">
                    {block.type === 'h2' ? 'Titre H2' :
                     block.type === 'h3' ? 'Sous-titre H3' :
                     block.type === 'content' ? 'Contenu' :
                     block.type === 'image' ? 'Image' :
                     block.type === 'cta' ? 'CTA' :
                     block.type === 'about' ? 'À propos' :
                     block.type === 'services' ? 'Services' :
                     block.type === 'projects' ? 'Projets' :
                     block.type === 'logos' ? 'Logos clients' : block.type}
                  </span>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="remove-block"
                  >
                    ×
                  </button>
                </div>
                {renderBlock(block, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TwoColumnsEditor({ block, onUpdate }: TwoColumnsEditorProps) {
  const updateColumn = (column: 'leftColumn' | 'rightColumn', blocks: any[]) => {
    onUpdate({ [column]: blocks });
  };

  const updateSettings = (settings: Partial<TwoColumnsBlock>) => {
    console.log('🔧 TwoColumnsEditor - updateSettings appelé:', settings);
    onUpdate(settings);
  };

  const renderColumn = (blocks: any[], column: 'left' | 'right') => {
    const columnName = column === 'left' ? 'gauche' : 'droite';
    
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px]">
        <h4 className="text-lg font-semibold mb-4 text-center">Colonne {columnName}</h4>
        
        <SimpleBlockEditor
          blocks={blocks}
          onUpdate={(data) => {
            updateColumn(`${column}Column` as any, data.blocks || []);
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Paramètres du bloc */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Paramètres du bloc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Thème de fond</label>
            <select
              value={block.theme || 'auto'}
              onChange={(e) => updateSettings({ theme: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="auto">Auto</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Disposition</label>
            <select
              value={block.layout || 'left-right'}
              onChange={(e) => updateSettings({ layout: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="left-right">Gauche → Droite</option>
              <option value="right-left">Droite → Gauche</option>
              <option value="stacked-mobile">Empilé sur mobile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Espacement</label>
            <select
              value={block.gap || 'medium'}
              onChange={(e) => updateSettings({ gap: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alignement</label>
            <select
              value={block.alignment || 'top'}
              onChange={(e) => updateSettings({ alignment: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="top">Haut</option>
              <option value="center">Centre</option>
              <option value="bottom">Bas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interface des deux colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderColumn(block.leftColumn || [], 'left')}
        {renderColumn(block.rightColumn || [], 'right')}
      </div>
    </div>
  );
} 