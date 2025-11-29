'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImageItem, ImageItemData, AspectRatioValue } from './';

export interface ImageListEditorProps<T extends ImageItemData> {
  items: T[];
  onChange: (items: T[]) => void;
  label?: string;
  compact?: boolean;
  /** Valeur par défaut pour l'aspect ratio des nouveaux items (ex: '16:9' ou 'auto') */
  defaultAspectRatio?: AspectRatioValue | string;
  /** Placeholder pour l'alt dans le mode compact */
  altPlaceholder?: string;
}

/**
 * Liste d'images réutilisable pour l'admin (compact ou non).
 * Repose sur SortableImageItem pour l'upload/alt/ratio et le drag.
 */
export default function ImageListEditor<T extends ImageItemData>({
  items,
  onChange,
  label = 'Images',
  compact = true,
  defaultAspectRatio = 'auto',
  altPlaceholder = 'Description (alt text)',
}: ImageListEditorProps<T>) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const normalizedItems: T[] = useMemo(() => {
    return (items || []).map((img, idx) => ({
      ...img,
      id: img.id || `img-${idx}`,
      aspectRatio: (img as any).aspectRatio || defaultAspectRatio,
    }));
  }, [items, defaultAspectRatio]);

  const updateItem = (index: number, payload: Partial<T>) => {
    const next = normalizedItems.map((img, i) => (i === index ? { ...img, ...payload } : img));
    onChange(next);
  };

  const addItem = () => {
    const next: T = {
      id: `img-${Date.now()}`,
      src: '',
      alt: '',
      aspectRatio: defaultAspectRatio,
    } as T;
    onChange([...(normalizedItems as any[]), next]);
  };

  const removeItem = (index: number) => {
    const next = normalizedItems.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = normalizedItems.findIndex((img) => (img.id || '') === active.id);
    const newIndex = normalizedItems.findIndex((img) => (img.id || '') === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(normalizedItems, oldIndex, newIndex);
    onChange(reordered);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
          {label} ({normalizedItems.length})
        </label>
        <div className="space-y-1">
          {normalizedItems.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
              Aucune image
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={normalizedItems.map((img, idx) => img.id || `img-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                {normalizedItems.map((img, idx) => (
                  <SortableImageItem
                    key={img.id || `img-${idx}`}
                    item={img}
                    index={idx}
                    compact
                    onUpdate={(field, value) => updateItem(idx, { [field]: value } as Partial<T>)}
                    onRemove={() => removeItem(idx)}
                    onToggleVisibility={() => {
                      const current = normalizedItems[idx];
                      updateItem(idx, { hidden: !current.hidden } as Partial<T>);
                    }}
                    openSelect={openSelect}
                    onOpenSelectChange={setOpenSelect}
                    compactFields={[
                      { key: 'alt', placeholder: altPlaceholder },
                    ]}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          <button
            type="button"
            onClick={addItem}
            className="w-full px-2 py-2 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-3 w-3 inline mr-1" />
            Ajouter une image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={normalizedItems.map((img, idx) => img.id || `img-${idx}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {normalizedItems.map((img, idx) => (
              <SortableImageItem
                key={img.id || `img-${idx}`}
                item={img}
                index={idx}
                compact={false}
                onUpdate={(field, value) => updateItem(idx, { [field]: value } as Partial<T>)}
                onRemove={() => removeItem(idx)}
                onToggleVisibility={() => {
                  const current = normalizedItems[idx];
                  updateItem(idx, { hidden: !current.hidden } as Partial<T>);
                }}
                openSelect={openSelect}
                onOpenSelectChange={setOpenSelect}
              />
            ))}
            {!normalizedItems.length && (
              <div className="text-sm text-gray-500">Aucune image. Ajoutez-en une pour commencer.</div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
