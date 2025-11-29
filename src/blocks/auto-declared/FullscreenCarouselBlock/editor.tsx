'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { SortableImageItem, ImageItemData, AspectRatioValue } from '@/blocks/auto-declared/components';
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

type CarouselImage = ImageItemData & {
  aspectRatio?: AspectRatioValue | string;
};

interface FullscreenCarouselData {
  title?: string;
  images?: CarouselImage[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function FullscreenCarouselEditor({
  data,
  onChange,
  compact = false,
  context,
}: {
  data: FullscreenCarouselData;
  onChange: (data: FullscreenCarouselData) => void;
  compact?: boolean;
  context?: any;
}) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );
  const currentPalette = useMemo(() => {
    if (!context) return null;
    try {
      return resolvePaletteFromContent(context);
    } catch {
      return null;
    }
  }, [context]);

  const images = data.images || [];

  const updateImage = (index: number, payload: Partial<CarouselImage>) => {
    const next = images.map((img, i) => (i === index ? { ...img, ...payload } : img));
    onChange({ ...data, images: next });
  };

  const addImage = () => {
    const next: CarouselImage = {
      id: `img-${Date.now()}`,
      src: '',
      alt: '',
      aspectRatio: '16:9',
    };
    onChange({ ...data, images: [...images, next] });
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange({ ...data, images: next });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => (img.id || '') === active.id);
    const newIndex = images.findIndex((img) => (img.id || '') === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(images, oldIndex, newIndex);
    onChange({ ...data, images: reordered });
  };

  if (compact) {
    return (
      <div className="block-editor space-y-3">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="More on this campaign"
            className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
            Images ({images.length})
          </label>
          <div className="space-y-1">
            {images.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                Aucune image
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={images.map((img, idx) => img.id || `img-${idx}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {images.map((img, idx) => (
                    <SortableImageItem
                      key={img.id || `img-${idx}`}
                      item={img as CarouselImage}
                      index={idx}
                      compact
                      onUpdate={(field, value) => updateImage(idx, { [field]: value })}
                      onRemove={() => removeImage(idx)}
                      openSelect={openSelect}
                      onOpenSelectChange={setOpenSelect}
                      compactFields={[
                        { key: 'alt', placeholder: 'Description (alt text)' },
                      ]}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            <Button type="button" size="sm" variant="outline" onClick={addImage} className="w-full text-[12px]">
              <Plus className="h-3 w-3 mr-1" /> Ajouter une image
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Thème
            {currentPalette && (
              <span className="ml-1 text-[9px] text-gray-500">
                (Palette: {currentPalette.name})
              </span>
            )}
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
            className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          >
            <option value="auto">Auto</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="block-editor space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Titre</Label>
          <Input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="More on this campaign"
            className="w-full mt-2"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Thème</Label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
            className="w-full mt-2 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="auto">Auto</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Images</Label>
          <Button type="button" size="sm" variant="outline" onClick={addImage}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={images.map((img, idx) => img.id || `img-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {images.map((img, idx) => (
                <SortableImageItem
                  key={img.id || `img-${idx}`}
                  item={img as CarouselImage}
                  index={idx}
                  compact={false}
                  onUpdate={(field, value) => updateImage(idx, { [field]: value })}
                  onRemove={() => removeImage(idx)}
                  openSelect={openSelect}
                  onOpenSelectChange={setOpenSelect}
                />
              ))}
              {!images.length && (
                <div className="text-sm text-gray-500">Aucune image. Ajoutez-en une pour commencer.</div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
