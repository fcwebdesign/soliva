'use client';

import React, { useMemo, useState, useRef } from 'react';
import { FALLBACK_SLIDES } from './component';
import type { ImageData } from '@/blocks/auto-declared/components/ReusableImage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, ChevronDown, ChevronRight, ImagePlus, Trash2, Eye, EyeOff, Edit3, Upload, Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

type SlideEditorItem = {
  id?: string;
  title?: string;
  image?: ImageData;
  alt?: string;
  src?: string;
  aspectRatio?: string;
  hidden?: boolean;
};

interface ScrollSliderData {
  slides?: SlideEditorItem[];
  previewIndex?: number;
  showIndicators?: boolean;
  showProgressBar?: boolean;
}

const normalizeSlides = (raw: SlideEditorItem[] | undefined) => {
  // Minimum 1 slide : fallback si liste vide/absente
  const source = raw && raw.length > 0 ? raw : [FALLBACK_SLIDES[0]];
  return source.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `slide-${idx}`,
        title: `Slide ${idx + 1}`,
        image: { src: item, alt: `Slide ${idx + 1}`, aspectRatio: '16:9' } as ImageData,
      };
    }
    const src = item.image?.src || (item as any).src || '';
    return {
      id: item.id || `slide-${idx}`,
      title: item.title || '',
      image: {
        src,
        alt: item.image?.alt || item.alt || '',
        aspectRatio: item.image?.aspectRatio || item.aspectRatio || '16:9',
      } as ImageData,
      hidden: item.hidden || false,
    };
  });
};

function SortableSlideItem({
  slide,
  index,
  isOpen,
  onToggle,
  onSelect,
  onUpdate,
  onRemove,
}: {
  slide: SlideEditorItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelect?: () => void;
  onUpdate: (patch: Partial<SlideEditorItem>) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id || `slide-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

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
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      onUpdate({ image: { ...(slide.image as ImageData), src: result.url } });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Échec de l\'upload de l\'image.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded overflow-hidden bg-white"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1 py-1 px-2 group hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          try {
            if (typeof onToggle === 'function') {
              onToggle();
            }
            if (typeof onSelect === 'function') {
              onSelect();
            }
          } catch (err) {
            console.error('ScrollSliderEditor: erreur lors du toggle/select slide', err);
          }
        }}
        {...attributes}
        {...listeners}
      >
        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
          {isOpen ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
        </div>
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />

        {/* Thumbnail */}
        {slide.image?.src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <img src={slide.image.src} alt={slide.image.alt || 'Image'} className="w-full h-full object-contain p-0.5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 shadow-none border rounded">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
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
            className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            onPointerDown={(e) => e.stopPropagation()}
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
          onPointerDown={(e) => e.stopPropagation()}
          className="hidden"
        />

        {/* Title/alt preview */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-gray-900 truncate">{slide.title || slide.image?.alt || 'Sans titre'}</div>
          {slide.image?.aspectRatio && (
            <div className="text-[9px] text-gray-500 mt-0.5">Ratio {slide.image.aspectRatio}</div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ hidden: !slide.hidden });
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="cursor-pointer flex-shrink-0 p-0.5"
            title={slide.hidden ? 'Afficher' : 'Masquer'}
          >
            {slide.hidden ? <EyeOff className="w-3 h-3 text-gray-400 hover:text-blue-500" /> : <Eye className="w-3 h-3 text-gray-400 hover:text-blue-500" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="cursor-pointer flex-shrink-0 p-0.5"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-2 pb-2 pt-1 space-y-2 bg-gray-50 border-t border-gray-200">
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Titre</label>
            <input
              type="text"
              value={slide.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Titre du slide"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Description (alt text)</label>
            <input
              type="text"
              value={slide.image?.alt || ''}
              onChange={(e) => onUpdate({ image: { ...(slide.image as ImageData), alt: e.target.value } })}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Description (alt text)"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Ratio</label>
          <Select
            value={slide.image?.aspectRatio || '16:9'}
            onValueChange={(value) => onUpdate({ image: { ...(slide.image as ImageData), aspectRatio: value } })}
            onOpenChange={(open) => {
              if (!open) return;
            }}
          >
            <SelectTrigger
              className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Ratio" />
            </SelectTrigger>
            <SelectContent className="shadow-none border rounded">
              <SelectItem value="auto" className="text-[13px]">Auto</SelectItem>
              <SelectItem value="1:1" className="text-[13px]">1:1</SelectItem>
                <SelectItem value="4:5" className="text-[13px]">4:5</SelectItem>
                <SelectItem value="3:4" className="text-[13px]">3:4</SelectItem>
                <SelectItem value="2:3" className="text-[13px]">2:3</SelectItem>
                <SelectItem value="16:9" className="text-[13px]">16:9</SelectItem>
                <SelectItem value="3:2" className="text-[13px]">3:2</SelectItem>
                <SelectItem value="2:1" className="text-[13px]">2:1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScrollSliderEditor({
  data,
  onChange,
  blockId,
}: {
  data: ScrollSliderData;
  onChange: (data: ScrollSliderData) => void;
  blockId?: string;
}) {
  const slides = useMemo(() => normalizeSlides(data.slides), [data.slides]);
  const initialIndex = 0;
  const [previewIndexState, setPreviewIndexState] = useState<number>(initialIndex);
  const [openSlideId, setOpenSlideId] = useState<string | null>(slides[initialIndex]?.id || slides[0]?.id || null);
  const [isUploading, setIsUploading] = useState(false);
  const multipleInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, previewIndexState));
    const nextId = slides[nextIndex]?.id || slides[0]?.id || null;
    if (nextId !== openSlideId) {
      console.log('[ScrollSliderEditor] sync openSlideId from previewIndexState', { previewIndex: previewIndexState, nextId });
      setOpenSlideId(nextId);
    }
  }, [previewIndexState, slides]);

  const notifyContentUpdate = () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('content-updated'));
        console.log('[ScrollSliderEditor] dispatched content-updated');
      }
    } catch (err) {
      console.error('ScrollSliderEditor: erreur notify content-updated', err);
    }
  };

  const clampPreviewIndex = (next: SlideEditorItem[], desired?: number) =>
    Math.max(0, Math.min(next.length - 1, desired ?? 0));

  const sendPreviewMessage = (index: number, version?: number) => {
    try {
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'SCROLL_SLIDER_PREVIEW', payload: { blockId: blockId || (data as any)?.id, previewIndex: index, previewVersion: version || Date.now() } },
          '*'
        );
        console.log('[ScrollSliderEditor] postMessage SCROLL_SLIDER_PREVIEW', { index, version });
      }
    } catch (e) {
      console.error('ScrollSliderEditor: erreur postMessage preview', e);
    }
  };

  const updateSlides = (next: SlideEditorItem[], nextPreview?: number) => {
    try {
      const preview = clampPreviewIndex(next, nextPreview ?? previewIndexState);
      const version = Date.now();
      console.log('[ScrollSliderEditor] updateSlides', { previewIndex: preview, nextLength: next.length, version, blockId: blockId || (data as any)?.id });
      setPreviewIndexState(preview);
      onChange({ ...data, slides: next, previewIndex: preview, previewVersion: version });
      notifyContentUpdate();
      sendPreviewMessage(preview, version);
    } catch (err) {
      console.error('ScrollSliderEditor: erreur updateSlides', err);
    }
  };
  const setPreviewIndex = (index: number) => {
    try {
      const version = Date.now();
      console.log('[ScrollSliderEditor] setPreviewIndex', { index, version, blockId: blockId || (data as any)?.id });
      setPreviewIndexState(index);
      onChange({ ...data, slides, previewIndex: index, previewVersion: version });
      notifyContentUpdate();

      sendPreviewMessage(index, version);
  } catch (err) {
    console.error('ScrollSliderEditor: erreur setPreviewIndex', err);
  }
};
  const updateSlide = (id: string, patch: Partial<SlideEditorItem>) => {
    const next = slides.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide));
    updateSlides(next, previewIndexState);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) {
      toast.warning('Au moins un slide est requis.');
      return;
    }
    const next = slides.filter((slide) => slide.id !== id);
    const nextPreview = clampPreviewIndex(next, previewIndexState);
    updateSlides(next, nextPreview);
    if (openSlideId === id) {
      setOpenSlideId(next[nextPreview]?.id || next[0]?.id || null);
    }
  };

  const addSlide = () => {
    const newSlide: SlideEditorItem = {
      id: `slide-${Date.now()}`,
      title: 'Nouveau slide',
      image: { src: '', alt: '', aspectRatio: '16:9' } as ImageData,
    };
    const next = [...slides, newSlide];
    updateSlides(next, next.length - 1);
    setOpenSlideId(newSlide.id || null);
  };

  const handleSingleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      const newSlide: SlideEditorItem = {
        id: `slide-${Date.now()}`,
        title: 'Nouveau slide',
        image: { src: result.url, alt: '', aspectRatio: '16:9' } as ImageData,
      };
      const next = [...slides, newSlide];
      updateSlides(next, next.length - 1);
      setOpenSlideId(newSlide.id || null);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
      if (singleInputRef.current) singleInputRef.current.value = '';
    }
  };

  const handleMultipleUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Upload failed');
        const result = await response.json();
        return result.url as string;
      });
      const urls = await Promise.all(uploadPromises);
      const newSlides = urls.map((url, idx) => ({
        id: `slide-${Date.now()}-${idx}`,
        title: 'Nouveau slide',
        image: { src: url, alt: '', aspectRatio: '16:9' } as ImageData,
      }));
      const next = [...slides, ...newSlides];
      const firstNewIndex = slides.length;
      updateSlides(next, firstNewIndex);
      if (newSlides[0]) setOpenSlideId(newSlides[0].id || null);
    } catch (error) {
      console.error('Erreur upload multiple:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
      if (multipleInputRef.current) multipleInputRef.current.value = '';
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSlides = arrayMove(slides, oldIndex, newIndex);
        updateSlides(newSlides, clampPreviewIndex(newSlides, previewIndexState));
      }
    }
  };

  return (
    <div
      className="space-y-3"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="showIndicators"
            checked={data.showIndicators !== false}
            onCheckedChange={(checked) => {
              console.log('[ScrollSliderEditor] toggle showIndicators', { checked, blockId: blockId || (data as any)?.id });
              onChange({ ...data, showIndicators: checked });
              notifyContentUpdate();
            }}
            className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
          />
          <label htmlFor="showIndicators" className="text-[10px] font-medium">Numéros</label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="showProgressBar"
            checked={data.showProgressBar !== false}
            onCheckedChange={(checked) => {
              console.log('[ScrollSliderEditor] toggle showProgressBar', { checked, blockId: blockId || (data as any)?.id });
              onChange({ ...data, showProgressBar: checked });
              notifyContentUpdate();
            }}
            className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
          />
          <label htmlFor="showProgressBar" className="text-[10px] font-medium">Barre de scroll</label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="block text-[10px] text-gray-400">Slides</label>
        <div className="flex gap-1">
          <input
            ref={multipleInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
            onClick={(e) => {
              const input = e.currentTarget;
              input.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => multipleInputRef.current?.click()}
            disabled={isUploading}
            className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <Upload className="h-3 w-3" />
            {isUploading ? '...' : 'Multiple'}
          </button>
          <input
            ref={singleInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSingleUpload}
          />
          <button
            type="button"
            onClick={() => singleInputRef.current?.click()}
            disabled={isUploading}
            className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            {isUploading ? '...' : 'Ajouter'}
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id || '')} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id || `slide-${index}`}
                slide={slide}
                index={index}
                isOpen={openSlideId === slide.id}
                onToggle={() => setOpenSlideId((prev) => (prev === slide.id ? null : slide.id || null))}
                onSelect={() => setPreviewIndex(index)}
                onUpdate={(patch) => updateSlide(slide.id as string, patch)}
                onRemove={() => removeSlide(slide.id as string)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
