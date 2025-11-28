'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface GalleryImage {
  id?: string;
  src: string;
  alt?: string;
  hidden?: boolean;
}

interface MouseImageGalleryData {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  theme?: 'light' | 'dark' | 'auto';
  transparentHeader?: boolean;
  speed?: number;
}

function SortableImageItem({
  image,
  index,
  onUpdate,
  onRemove,
  onToggleVisibility,
  onReplace,
}: {
  image: GalleryImage;
  index: number;
  onUpdate: (field: keyof GalleryImage, value: any) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onReplace: (file: File) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id || `mouse-image-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.6 : 1,
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onReplace(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-1 px-2 bg-white border border-gray-200 rounded group ${
        image.hidden ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" {...attributes} {...listeners} />

      <div
        className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        {image.src ? (
          <img src={image.src} alt={image.alt || 'Image'} className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-[10px] text-gray-400">+</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />

      <input
        type="text"
        value={image.alt || ''}
        onChange={(e) => onUpdate('alt', e.target.value)}
        placeholder="Description (alt text)"
        className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title={image.hidden ? 'Afficher' : 'Masquer'}
      >
        {image.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function MouseImageGalleryEditor({
  data,
  onChange,
}: {
  data: MouseImageGalleryData;
  onChange: (data: MouseImageGalleryData) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [openBlockId, setOpenBlockId] = useState<string | null>(null);

  const normalizedImages = useMemo(() => data.images || [], [data.images]);

  const addImage = () => {
    const newImage = {
      id: `mouse-image-${Date.now()}`,
      src: '',
      alt: '',
    };
    onChange({ ...data, images: [...normalizedImages, newImage] });
  };

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    const newImages = [...normalizedImages];
    newImages[index] = { ...newImages[index], ...updates };
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = normalizedImages.filter((_, i) => i !== index);
    onChange({ ...data, images: newImages });
  };

  const toggleVisibility = (index: number) => {
    const img = normalizedImages[index];
    if (!img) return;
    updateImage(index, { hidden: !img.hidden });
  };

  const handleReplace = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    const result = await response.json();
    updateImage(index, { src: result.url });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = normalizedImages.findIndex((img) => img.id === active.id);
      const newIndex = normalizedImages.findIndex((img) => img.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(normalizedImages, oldIndex, newIndex);
        onChange({ ...data, images: newOrder });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Titre"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Sous-titre</Label>
          <Input
            id="subtitle"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            placeholder="Texte descriptif"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 items-end">
        <div className="space-y-2">
          <Label>Vitesse (réactivité)</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[typeof data.speed === 'number' ? data.speed : 60]}
            onValueChange={([value]) => onChange({ ...data, speed: value })}
          />
          <div className="text-xs text-gray-500">{data.speed ?? 60}</div>
        </div>
        <div className="space-y-2">
          <Label>Thème</Label>
          <Select value={data.theme || 'auto'} onValueChange={(value) => onChange({ ...data, theme: value as any })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="light">Clair</SelectItem>
              <SelectItem value="dark">Sombre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-sm">Header transparent</Label>
            <p className="text-[11px] text-gray-500 leading-snug">Force le header en overlay (fix first block).</p>
          </div>
          <Switch
            checked={!!data.transparentHeader}
            onCheckedChange={(checked) => onChange({ ...data, transparentHeader: checked })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Images ({normalizedImages.length})</h3>
        <Button size="sm" onClick={addImage}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une image
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={normalizedImages.map((img) => img.id || '')} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {normalizedImages.map((image, index) => (
              <SortableImageItem
                key={image.id || `image-${index}`}
                image={image}
                index={index}
                onUpdate={(field, value) => updateImage(index, { [field]: value })}
                onRemove={() => removeImage(index)}
                onToggleVisibility={() => toggleVisibility(index)}
                onReplace={(file) => handleReplace(index, file)}
              />
            ))}
            {normalizedImages.length === 0 && (
              <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded p-3 text-center">
                Ajoute tes premières images pour activer la galerie.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
