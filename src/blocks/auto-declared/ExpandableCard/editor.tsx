'use client';

import React, { useEffect, useState } from 'react';
import WysiwygEditor from '../../../app/admin/components/WysiwygEditor';
import WysiwygEditorWrapper from '../../../components/WysiwygEditorWrapper';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Plus, ImageIcon, ImagePlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardItem {
  id?: string;
  title: string;
  label: string;
  summary: string;
  content: string;
  media?: {
    src: string;
    alt: string;
  };
  theme?: 'automation' | 'research' | 'marketing' | 'go-to-market';
  isExpanded?: boolean;
  hidden?: boolean;
}

interface ExpandableCardData {
  title?: string;
  cards?: CardItem[];
  theme?: 'light' | 'dark' | 'auto';
}

interface ExpandableCardEditorProps {
  data: ExpandableCardData;
  onChange: (data: ExpandableCardData) => void;
  compact?: boolean;
}

// Composant sortable pour chaque carte
function SortableCardItem({
  card,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  onToggleVisibility,
  compact = false
}: {
  card: CardItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof CardItem, value: any) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  compact?: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onUpdate('media', { ...(card.media || { alt: '' }), src: result.url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Échec de l\'upload de l\'image.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id || `card-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.6 : 1,
  };

  const isHidden = card.hidden || false;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`border border-gray-200 rounded overflow-hidden ${isHidden ? 'opacity-50' : ''}`}
      >
        {/* Header collapsible */}
        <div
          className="flex items-center gap-1 py-1 px-2 group hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onToggle}
          {...attributes}
          {...listeners}
        >
          <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </div>
          <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 flex-1 truncate">
            {card.title || card.label || `Carte ${index + 1}`}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-0.5"
            title={isHidden ? 'Afficher' : 'Masquer'}
          >
            {isHidden ? (
              <EyeOff className="w-3 h-3 text-gray-400 hover:text-blue-500" />
            ) : (
              <Eye className="w-3 h-3 text-gray-400 hover:text-blue-500" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-0.5"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Contenu accordion */}
        {isOpen && (
          <div className="px-2 pb-2 pt-1 space-y-2 bg-gray-50 border-t border-gray-200">
            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">Label</label>
              <input
                type="text"
                value={card.label || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate('label', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Label"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">Titre</label>
              <input
                type="text"
                value={card.title || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate('title', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Titre"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">Résumé</label>
              <input
                type="text"
                value={card.summary || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate('summary', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Résumé"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">Contenu</label>
              <WysiwygEditorWrapper
                value={card.content || ''}
                onChange={(content: string) => {
                  onUpdate('content', content);
                }}
                compact={true}
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">Média (optionnel)</label>
              <div className="flex items-center gap-2 py-1 px-2 bg-white border border-gray-200 rounded group">
                {/* Miniature de l'image - dropdown si image existe, clic direct si vide */}
                {card.media?.src ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div 
                        className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <img 
                          src={card.media.src} 
                          alt={card.media.alt || 'Image'} 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 shadow-none border rounded">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remplacer : ouvrir directement le sélecteur de fichiers
                          fileInputRef.current?.click();
                        }} 
                        className="text-[13px] text-gray-700 hover:text-gray-900"
                      >
                        <ImagePlus className="w-3 h-3 mr-2" />
                        Remplacer
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate('media', { src: '', alt: card.media?.alt || '' });
                        }}
                        className="text-[13px] text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div 
                    className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Si pas d'image, ouvrir directement le sélecteur de fichiers
                      fileInputRef.current?.click();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-gray-400">+</span>
                  </div>
                )}
                
                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="hidden"
                />
                
                {/* Input alt */}
                <input
                  type="text"
                  value={card.media?.alt || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate('media', { ...(card.media || { src: '' }), alt: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  placeholder="Description (alt text)"
                  className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`expanded-${index}`}
                checked={card.isExpanded || false}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate('isExpanded', e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-3 w-3 border-gray-300 rounded"
              />
              <label htmlFor={`expanded-${index}`} className="text-[10px] text-gray-600 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                Étendue par défaut
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Version non-compacte (originale)
  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Carte #{index + 1}</span>
        <button type="button" onClick={onRemove} className="text-red-600 text-sm">Supprimer</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
        <input type="text" value={card.label || ''} onChange={(e) => onUpdate('label', e.target.value)} className="block-input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
        <input type="text" value={card.title || ''} onChange={(e) => onUpdate('title', e.target.value)} className="block-input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
        <input type="text" value={card.summary || ''} onChange={(e) => onUpdate('summary', e.target.value)} className="block-input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
        <WysiwygEditor 
          value={card.content || ''} 
          onChange={(content: string) => onUpdate('content', content)} 
          placeholder="Description du service..."
          onAISuggestion={null}
          isLoadingAI={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Média (optionnel)</label>
        <MediaUploader currentUrl={card.media?.src || ''} onUpload={(src) => onUpdate('media', { ...(card.media || { alt: '' }), src })} />
        <input type="text" value={card.media?.alt || ''} onChange={(e) => onUpdate('media', { ...(card.media || { src: '' }), alt: e.target.value })} placeholder="Alt" className="block-input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
        <select value={card.theme || 'automation'} onChange={(e) => onUpdate('theme', e.target.value as CardItem['theme'])} className="block-input">
          <option value="automation">Automation</option>
          <option value="research">Research</option>
          <option value="marketing">Marketing</option>
          <option value="go-to-market">Go-to-market</option>
        </select>
      </div>

      <div className="flex items-center">
        <input type="checkbox" id={`expanded-${index}`} checked={card.isExpanded || false} onChange={(e) => onUpdate('isExpanded', e.target.checked)} className="h-4 w-4 border-gray-300 rounded" />
        <label htmlFor={`expanded-${index}`} className="ml-2 block text-sm text-gray-700">Étendue par défaut</label>
      </div>
    </div>
  );
}

export default function ExpandableCardEditor({ data, onChange, compact = false }: ExpandableCardEditorProps) {
  const cards = data.cards || [];
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  // S'assurer que toutes les cartes ont un ID
  useEffect(() => {
    const cardsWithIds = cards.map((card, index) => ({
      ...card,
      id: card.id || `card-${Date.now()}-${index}`,
    }));
    if (cardsWithIds.some((c, i) => c.id !== cards[i]?.id)) {
      onChange({ ...data, cards: cardsWithIds });
    }
  }, [cards.length]);

  // Initialiser après montage si aucune carte
  useEffect(() => {
    if (!data.cards || data.cards.length === 0) {
      onChange({
        ...data,
        cards: [
          {
            id: `card-${Date.now()}-0`,
            title: 'Automatisation',
            label: 'Service',
            summary: 'Optimisez vos processus avec nos automatisations.',
            content: '<ul><li>Audit des flux</li><li>Zaps/Make scénarios</li><li>Intégrations API</li></ul>',
            media: { src: '', alt: '' },
            theme: 'automation',
            isExpanded: false,
          },
          {
            id: `card-${Date.now()}-1`,
            title: 'Automatisation',
            label: 'Service',
            summary: 'Optimisez vos processus avec nos automatisations.',
            content: '<ul><li>Audit des flux</li><li>Zaps/Make scénarios</li><li>Intégrations API</li></ul>',
            media: { src: '', alt: '' },
            theme: 'automation',
            isExpanded: false,
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sensors pour drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => (c.id || `card-${cards.indexOf(c)}`) === active.id);
    const newIndex = cards.findIndex((c) => (c.id || `card-${cards.indexOf(c)}`) === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newCards = arrayMove(cards, oldIndex, newIndex);
      onChange({ ...data, cards: newCards });
    }
  };

  const updateCard = (index: number, patch: Partial<CardItem>) => {
    const next = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ ...data, cards: next });
  };

  const addCard = () => {
    const next: CardItem = {
      id: `card-${Date.now()}`,
      title: 'Nouveau service',
      label: 'Service',
      summary: '',
      content: '',
      media: { src: '', alt: '' },
      theme: 'automation',
      isExpanded: false,
    };
    onChange({ ...data, cards: [...cards, next] });
  };

  const removeCard = (index: number) => {
    const next = cards.filter((_, i) => i !== index);
    onChange({ ...data, cards: next });
    if (openCardId === cards[index]?.id) {
      setOpenCardId(null);
    }
  };

  const toggleCardVisibility = (index: number) => {
    const card = cards[index];
    updateCard(index, { hidden: !card.hidden });
  };


  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          {/* Titre de section */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre de section</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Ex: Nos services"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Liste des cartes */}
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
              Cartes ({cards.length})
            </label>
            <div className="space-y-1">
              {cards.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                  Aucune carte
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={cards.map((c) => c.id || `card-${cards.indexOf(c)}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {cards.map((card, index) => (
                      <SortableCardItem
                        key={card.id || `card-${index}`}
                        card={card}
                        index={index}
                        isOpen={openCardId === (card.id || `card-${index}`)}
                        onToggle={() => {
                          setOpenCardId(openCardId === (card.id || `card-${index}`) ? null : (card.id || `card-${index}`));
                        }}
                        onUpdate={(field, value) => updateCard(index, { [field]: value })}
                        onRemove={() => removeCard(index)}
                        onToggleVisibility={() => toggleCardVisibility(index)}
                        compact={true}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              
              {/* Bouton ajouter */}
              <button
                type="button"
                onClick={addCard}
                className="w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-3 w-3 inline mr-1" />
                Ajouter une carte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Version non-compacte (originale)
  return (
    <div className="block-editor space-y-6">
      {/* Titre de la section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la section
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Ex: Nos services"
          className="block-input"
        />
      </div>

      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Cartes</h4>
        <button type="button" onClick={addCard} className="btn btn-secondary">Ajouter une carte</button>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => (
          <SortableCardItem
            key={card.id || `card-${index}`}
            card={card}
            index={index}
            isOpen={false}
            onToggle={() => {}}
            onUpdate={(field, value) => updateCard(index, { [field]: value })}
            onRemove={() => removeCard(index)}
            onToggleVisibility={() => toggleCardVisibility(index)}
            compact={false}
          />
        ))}
      </div>
    </div>
  );
}
