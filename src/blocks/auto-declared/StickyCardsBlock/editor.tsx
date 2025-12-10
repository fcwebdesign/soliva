'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronRight, ImagePlus, ArrowUp, ArrowDown } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ImageThumbnail from '@/blocks/auto-declared/components/ImageThumbnail';
import AspectRatioSelect, { AspectRatioValue } from '@/blocks/auto-declared/components/AspectRatioSelect';

const generateCardId = () => `card-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;

type StickyCard = {
  id: string;
  index?: string;
  title?: string;
  image?: { src?: string; alt?: string; aspectRatio?: AspectRatioValue };
  aspectRatio?: AspectRatioValue;
  copyTitle?: string;
  description?: string;
  hidden?: boolean;
};

type StickyCardsData = {
  title?: string;
  subtitle?: string;
  cards?: StickyCard[];
  theme?: 'light' | 'dark' | 'auto';
};

function SortableCardRow({
  card,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  onToggleHidden,
  onRatioChange,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
}: {
  card: StickyCard;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<StickyCard>) => void;
  onRemove: () => void;
  onToggleHidden: () => void;
  onRatioChange: (value: AspectRatioValue) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const thumbFileInput = React.useRef<HTMLInputElement>(null);

  const handleThumbSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      onUpdate({ image: { src: result.url, alt: card.image?.alt || file.name, aspectRatio: card.aspectRatio || card.image?.aspectRatio || '16:9' } });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert("Échec de l'upload de l'image.");
    } finally {
      if (thumbFileInput.current) thumbFileInput.current.value = '';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded bg-white" onClick={(e) => e.stopPropagation()}>
      <div className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 transition-colors group cursor-pointer" onClick={onToggle}>
        {isOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
        
        {/* Thumbnail avec dropdown - comme dans TemplateGuidelinesBlock */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {card.image?.src ? (
                <div
                  className="absolute inset-0 w-full h-full bg-center bg-cover"
                  style={{ backgroundImage: `url(${card.image.src})` }}
                  aria-label={card.image.alt || card.title || ''}
                />
              ) : (
                <ImagePlus className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 shadow-none border rounded">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                thumbFileInput.current?.click();
              }}
              className="text-[13px] text-gray-700 hover:text-gray-900"
            >
              <ImagePlus className="w-3 h-3 mr-2" />
              Remplacer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ image: undefined });
              }}
              className="text-[13px] text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={thumbFileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbSelect}
          onClick={(e) => e.stopPropagation()}
        />

        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
          aria-label="Déplacer"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <span className="text-[12px] text-gray-700 truncate flex-1">{card.title || 'Sans titre'}</span>
        
        {/* Move up / down */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`text-gray-400 hover:text-gray-600 ${disableMoveUp ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!disableMoveUp) onMoveUp();
            }}
            aria-label="Monter"
            disabled={disableMoveUp}
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            className={`text-gray-400 hover:text-gray-600 ${disableMoveDown ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!disableMoveDown) onMoveDown();
            }}
            aria-label="Descendre"
            disabled={disableMoveDown}
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

        {/* Ratio select - doit stopper la propagation pour éviter le toggle */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <AspectRatioSelect
            value={(card.aspectRatio || card.image?.aspectRatio || '16:9') as AspectRatioValue}
            onValueChange={onRatioChange}
            size="compact"
            stopPropagation={true}
          />
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="text-gray-400 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onToggleHidden();
            }}
            aria-label={card.hidden ? 'Afficher' : 'Masquer'}
          >
            {card.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
          <button
            type="button"
            className="text-gray-400 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-3 py-3 space-y-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Index</label>
              <input
                type="text"
                value={card.index || ''}
                onChange={(e) => onUpdate({ index: e.target.value })}
                placeholder="01"
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
              <input
                type="text"
                value={card.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Alt (image)</label>
              <input
                type="text"
                value={card.image?.alt || ''}
                onChange={(e) => onUpdate({ image: { ...card.image, alt: e.target.value, aspectRatio: card.aspectRatio || card.image?.aspectRatio || '16:9' } })}
                placeholder="Description de l'image"
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Copy Title</label>
            <input
              type="text"
              value={card.copyTitle || ''}
              onChange={(e) => onUpdate({ copyTitle: e.target.value })}
              placeholder="(About the state)"
              className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Description</label>
            <textarea
              value={card.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={3}
              className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StickyCardsEditor({ data, onChange }: { data: StickyCardsData; onChange: (next: StickyCardsData) => void }) {
  const rawCards = useMemo(() => (data.cards && data.cards.length ? data.cards : []), [data.cards]);
  const cardsWithIds = useMemo(
    () => rawCards.map((card) => (card.id ? card : { ...card, id: generateCardId() })),
    [rawCards]
  );
  const [cardsState, setCardsState] = useState<StickyCard[]>(cardsWithIds);
  const [openId, setOpenId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync local state when upstream data changes
  useEffect(() => {
    setCardsState(cardsWithIds);
  }, [cardsWithIds]);

  const persistCards = (next: StickyCard[]) => {
    setCardsState(next);
    onChange({ ...data, cards: next });
  };

  // Normaliser les cartes sans id (sinon dnd-kit casse avec des clés undefined)
  useEffect(() => {
    if (!cardsWithIds.length) return;
    const changed = cardsWithIds.some((card, index) => card.id !== rawCards[index]?.id);
    if (changed) {
      persistCards(cardsWithIds);
    }
  }, [cardsWithIds, rawCards]);

  const addCard = () => {
    const newCard: StickyCard = {
      id: generateCardId(),
      index: String(cardsState.length + 1).padStart(2, '0'),
      title: 'Nouvelle carte',
      copyTitle: '(About the state)',
      description: '',
      hidden: false,
    };
    persistCards([...cardsState, newCard]);
    setOpenId(newCard.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cardsState.findIndex((c) => c.id === active.id);
      const newIndex = cardsState.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        persistCards(arrayMove(cardsState, oldIndex, newIndex));
      }
    }
  };

  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    const currentIndex = cardsState.findIndex((c) => c.id === cardId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cardsState.length) return;
    persistCards(arrayMove(cardsState, currentIndex, targetIndex));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Surtitre</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Thème</label>
          <Select
            value={data.theme || 'auto'}
            onValueChange={(value) => onChange({ ...data, theme: value as 'light' | 'dark' | 'auto' })}
          >
            <SelectTrigger className="w-full h-[36px] px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none shadow-none">
              <SelectValue placeholder="Auto" />
            </SelectTrigger>
            <SelectContent className="shadow-none border rounded w-full">
              <SelectItem value="auto" className="text-[13px] py-1.5">Auto</SelectItem>
              <SelectItem value="light" className="text-[13px] py-1.5">Clair</SelectItem>
              <SelectItem value="dark" className="text-[13px] py-1.5">Sombre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="block text-[10px] text-gray-400">Cartes ({cardsState.length})</label>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cardsState.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {cardsState.map((card, idx) => (
              <SortableCardRow
                key={card.id}
                card={card}
                isOpen={openId === card.id}
                onToggle={() => setOpenId(openId === card.id ? null : card.id)}
                onUpdate={(patch) => persistCards(cardsState.map((c) => (c.id === card.id ? { ...c, ...patch } : c)))}
                onRemove={() => persistCards(cardsState.filter((c) => c.id !== card.id))}
                onToggleHidden={() => persistCards(cardsState.map((c) => (c.id === card.id ? { ...c, hidden: !c.hidden } : c)))}
                onRatioChange={(value) => {
                  persistCards(
                    cardsState.map((c) =>
                      c.id === card.id
                        ? {
                            ...c,
                            aspectRatio: value,
                            image: c.image ? { ...c.image, aspectRatio: value } : undefined,
                          }
                        : c
                    )
                  );
                }}
                onMoveUp={() => moveCard(card.id, 'up')}
                onMoveDown={() => moveCard(card.id, 'down')}
                disableMoveUp={idx === 0}
                disableMoveDown={idx === cardsState.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addCard}
        className="w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        + Ajouter
      </button>
    </div>
  );
}
