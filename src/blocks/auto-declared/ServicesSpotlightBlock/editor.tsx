'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Eye, EyeOff, ImagePlus, Edit3 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SpotlightItem = {
  id?: string;
  title: string;
  indicator?: string;
  image?: { src?: string; alt?: string };
  hidden?: boolean;
};

interface ServicesSpotlightData {
  title?: string;
  kicker?: string;
  indicatorLabel?: string;
  items?: SpotlightItem[];
  showIndicator?: boolean;
  headingVariant?: 'small' | 'medium' | 'large';
  itemHeadingVariant?: 'small' | 'medium' | 'large';
}

const FALLBACK_ITEMS: SpotlightItem[] = [
  { title: 'Camera Work', indicator: '[ Framing ]', image: { src: '/blocks/services-spotlight/spotlight-1.jpg', alt: 'Camera work' } },
  { title: 'Visual Direction', indicator: '[ Vision ]', image: { src: '/blocks/services-spotlight/spotlight-2.jpg', alt: 'Visual direction' } },
  { title: 'Sound Design', indicator: '[ Resonance ]', image: { src: '/blocks/services-spotlight/spotlight-3.jpg', alt: 'Sound design' } },
  { title: 'Film Editing', indicator: '[ Sequence ]', image: { src: '/blocks/services-spotlight/spotlight-4.jpg', alt: 'Film editing' } },
];

function SortableItem({
  item,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  compact,
  labelClass,
  inputClass,
}: {
  item: SpotlightItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<SpotlightItem>) => void;
  onRemove: () => void;
  compact: boolean;
  labelClass: string;
  inputClass: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id || `spot-${index}` });
  const [localTitle, setLocalTitle] = useState(item.title);
  const [localIndicator, setLocalIndicator] = useState(item.indicator || '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalTitle(item.title);
    setLocalIndicator(item.indicator || '');
  }, [item.title, item.indicator]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const scheduleUpdate = (nextTitle: string, nextIndicator: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ title: nextTitle, indicator: nextIndicator });
      debounceRef.current = null;
    }, 200);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      onUpdate({ image: { ...(item.image || {}), src: result.url } });
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors de l’upload.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded bg-white">
      <div
        className={`group flex items-center gap-2 ${compact ? 'py-2 px-2' : 'py-3 px-3'} cursor-pointer hover:bg-gray-50 transition-colors`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        {...attributes}
        {...listeners}
      >
        {isOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />

        {item.image?.src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={item.image.src} alt={item.image.alt || item.title || ''} className="w-full h-full object-cover" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 shadow-none border rounded">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUpload();
                }}
                className="text-[13px] text-gray-700 hover:text-gray-900"
              >
                <ImagePlus className="w-3 h-3 mr-2" />
                Remplacer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="text-[13px] text-gray-700 hover:text-gray-900"
              >
                <Edit3 className="w-3 h-3 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
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
            className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              triggerUpload();
            }}
          >
            <span className="text-[10px] text-gray-400">+</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
        />

        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-gray-900 truncate font-medium">
            {item.title || `Item ${index + 1}`}
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {item.indicator || ''}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ hidden: !item.hidden });
            }}
            className="cursor-pointer flex-shrink-0 p-0.5"
            title={item.hidden ? 'Afficher' : 'Masquer'}
          >
            {item.hidden ? (
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
            className="cursor-pointer flex-shrink-0 p-0.5"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-2 pb-2 pt-1 space-y-2 bg-gray-50 border-t border-gray-200">
          <div className="grid gap-1">
            <label className="block text-[10px] text-gray-400 mb-0.5">Titre</label>
            <input
              className={inputClass}
              value={localTitle}
              onChange={(e) => {
                const val = e.target.value;
                setLocalTitle(val);
                scheduleUpdate(val, localIndicator);
              }}
              placeholder="Camera Work"
            />
          </div>

          <div className="grid gap-1">
            <label className="block text-[10px] text-gray-400 mb-0.5">Indicateur</label>
            <input
              className={inputClass}
              value={localIndicator}
              onChange={(e) => {
                const val = e.target.value;
                setLocalIndicator(val);
                scheduleUpdate(localTitle, val);
              }}
              placeholder="[ Framing ]"
            />
          </div>

          <div className="grid gap-1">
            <label className="block text-[10px] text-gray-400 mb-0.5">Texte alternatif</label>
            <input
              className={inputClass}
              value={item.image?.alt || ''}
              onChange={(e) => onUpdate({ image: { ...(item.image || {}), alt: e.target.value } })}
              placeholder="Texte alternatif"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicesSpotlightEditor({
  data,
  onChange,
  compact = false,
}: {
  data: ServicesSpotlightData;
  onChange: (data: ServicesSpotlightData) => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState<SpotlightItem[]>(data.items && data.items.length ? data.items : FALLBACK_ITEMS);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setItems(data.items && data.items.length ? data.items : FALLBACK_ITEMS);
  }, [data.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateItems = (next: SpotlightItem[]) => {
    setItems(next);
    onChange({ ...data, items: next });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item, idx) => (item.id || `spot-${idx}`) === active.id);
      const newIndex = items.findIndex((item, idx) => (item.id || `spot-${idx}`) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        updateItems(reordered);
      }
    }
  };

  const addItem = () => {
    const next = [
      ...items,
      {
        id: `spot-${Date.now()}`,
        title: `New item ${items.length + 1}`,
        indicator: '[ Indicator ]',
        image: {},
      },
    ];
    updateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.warning('Au moins un item est requis.');
      return;
    }
    const next = items.filter((_, i) => i !== index);
    updateItems(next);
  };

  const updateItem = (index: number, updates: Partial<SpotlightItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...updates } : item));
    updateItems(next);
  };

  const labelClass = compact ? 'block text-[10px] text-gray-400 mb-1' : 'block text-sm font-medium text-gray-700';
  const inputClass = compact
    ? 'w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors'
    : 'block-input';
  const textareaClass = compact
    ? 'w-full px-2 py-2 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none resize-none transition-colors min-h-[80px]'
    : 'block-input';

  const ItemsList = () => (
    <div className="space-y-2">
      <div className={compact ? 'text-[11px] font-medium text-gray-700' : 'text-sm font-medium text-gray-800'}>
        Items ({items.length})
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item, idx) => item.id || `spot-${idx}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id || index}
                item={item}
                index={index}
                compact={compact}
                isOpen={openId === (item.id || `spot-${index}`)}
                onToggle={() => setOpenId(openId === (item.id || `spot-${index}`) ? null : item.id || `spot-${index}`)}
                onUpdate={(updates) => updateItem(index, updates)}
                onRemove={() => removeItem(index)}
                labelClass={labelClass}
                inputClass={inputClass}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addItem}
        className="w-full border border-dashed border-gray-300 rounded px-3 py-2 text-[13px] text-gray-600 bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Ajouter un item
      </button>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <div>
          <label className={labelClass}>Titre</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={data.title ?? 'Services'}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Services"
          />
        </div>

        <div>
          <label className={labelClass}>Taille des items</label>
          <select
            className={inputClass}
            value={data.itemHeadingVariant || 'medium'}
            onChange={(e) => onChange({ ...data, itemHeadingVariant: e.target.value as 'small' | 'medium' | 'large' })}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="showIndicator"
            checked={data.showIndicator !== false}
            onCheckedChange={(checked) => onChange({ ...data, showIndicator: checked })}
            className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
          />
          <label htmlFor="showIndicator" className="text-[10px] font-medium">Afficher l'indicateur</label>
        </div>

        <ItemsList />
      </div>
    );
  }

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="grid gap-3">
        <Label htmlFor="title">Titre</Label>
        <Textarea
          id="title"
          value={data.title ?? 'Services'}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Services"
          rows={2}
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="itemHeadingVariant">Taille des items</Label>
        <select
          id="itemHeadingVariant"
          className="block-input"
          value={data.itemHeadingVariant || 'medium'}
          onChange={(e) => onChange({ ...data, itemHeadingVariant: e.target.value as 'small' | 'medium' | 'large' })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="showIndicator"
          checked={data.showIndicator !== false}
          onCheckedChange={(checked) => onChange({ ...data, showIndicator: checked })}
          className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
        />
        <Label htmlFor="showIndicator" className="text-[10px] font-medium">Afficher l'indicateur</Label>
      </div>

      <ItemsList />
    </div>
  );
}
