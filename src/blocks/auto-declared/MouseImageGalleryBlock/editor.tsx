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
import { Eye, EyeOff, GripVertical, ImageIcon, ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';

interface GalleryImage {
  id?: string;
  src: string;
  alt?: string;
  hidden?: boolean;
  aspectRatio?: string; // 'auto' | '1:1' | '1:2' | '2:3' | '3:4' | '4:5' | '9:16' | '3:2' | '4:3' | '5:4' | '16:9' | '2:1' | '4:1' | '8:1' | 'stretch'
}

interface MouseImageGalleryData {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  theme?: 'light' | 'dark' | 'auto';
  transparentHeader?: boolean;
  speed?: number;
  maxImages?: number;
  parallax?: {
    enabled?: boolean;
    speed?: number; // 0-1
  };
}

function SortableImageItem({
  image,
  index,
  onUpdate,
  onRemove,
  onToggleVisibility,
  onReplace,
  compact = false,
  openSelect,
  onOpenSelectChange,
}: {
  image: GalleryImage;
  index: number;
  onUpdate: (field: keyof GalleryImage, value: any) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onReplace: (file: File) => Promise<void>;
  compact?: boolean;
  openSelect?: string | null;
  onOpenSelectChange?: (value: string | null) => void;
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

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 py-1 px-2 bg-white border border-gray-200 rounded group ${image.hidden ? 'opacity-50' : ''}`}
      >
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" {...attributes} {...listeners} />
        
        {/* Miniature de l'image - dropdown si image existe, clic direct si vide */}
        {image.src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div 
                className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <img 
                  src={image.src} 
                  alt={image.alt || 'Image'} 
                  className="w-full h-full object-contain p-1"
                />
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
            className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
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
          value={image.alt || ''}
          onChange={(e) => {
            e.stopPropagation();
            onUpdate('alt', e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Description (alt text)"
          className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
        />
        
        {/* Select ratio d'aspect - exactement comme HeroFloatingGalleryEditor */}
        <Select
          value={image.aspectRatio || 'auto'}
          onValueChange={(value) => {
            onUpdate('aspectRatio', value);
          }}
          open={openSelect === `aspect-${index}`}
          onOpenChange={(open) => {
            if (onOpenSelectChange) {
              onOpenSelectChange(open ? `aspect-${index}` : null);
            }
          }}
        >
          <SelectTrigger 
            className="w-[75px] h-[32px] px-1.5 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="Ratio" />
          </SelectTrigger>
          <SelectContent 
            className="shadow-none border rounded w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectItem value="auto" className="text-[13px] py-1.5">Auto</SelectItem>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Square</div>
            <SelectItem value="1:1" className="text-[13px] py-1.5">1:1</SelectItem>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Portrait</div>
            <div className="grid grid-cols-2 gap-0 px-1">
              <SelectItem value="1:2" className="text-[13px] py-1.5">1:2</SelectItem>
              <SelectItem value="2:3" className="text-[13px] py-1.5">2:3</SelectItem>
              <SelectItem value="3:4" className="text-[13px] py-1.5">3:4</SelectItem>
              <SelectItem value="4:5" className="text-[13px] py-1.5">4:5</SelectItem>
              <SelectItem value="9:16" className="text-[13px] py-1.5">9:16</SelectItem>
            </div>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Landscape</div>
            <div className="grid grid-cols-2 gap-0 px-1">
              <SelectItem value="3:2" className="text-[13px] py-1.5">3:2</SelectItem>
              <SelectItem value="4:3" className="text-[13px] py-1.5">4:3</SelectItem>
              <SelectItem value="5:4" className="text-[13px] py-1.5">5:4</SelectItem>
              <SelectItem value="16:9" className="text-[13px] py-1.5">16:9</SelectItem>
              <SelectItem value="2:1" className="text-[13px] py-1.5">2:1</SelectItem>
              <SelectItem value="4:1" className="text-[13px] py-1.5">4:1</SelectItem>
              <SelectItem value="8:1" className="text-[13px] py-1.5">8:1</SelectItem>
            </div>
          </SelectContent>
        </Select>
        
        {/* Boutons visibilité et suppression */}
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

      {/* Select ratio d'aspect - version non-compacte */}
      <Select
        value={image.aspectRatio || 'auto'}
        onValueChange={(value) => {
          onUpdate('aspectRatio', value);
        }}
        open={openSelect === `aspect-${index}`}
        onOpenChange={(open) => {
          if (onOpenSelectChange) {
            onOpenSelectChange(open ? `aspect-${index}` : null);
          }
        }}
      >
        <SelectTrigger 
          className="w-[100px] h-[32px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <SelectValue placeholder="Ratio" />
        </SelectTrigger>
        <SelectContent 
          className="shadow-none border rounded w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectItem value="auto" className="text-[13px] py-1.5">Auto</SelectItem>
          <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Square</div>
          <SelectItem value="1:1" className="text-[13px] py-1.5">1:1</SelectItem>
          <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Portrait</div>
          <div className="grid grid-cols-2 gap-0 px-1">
            <SelectItem value="1:2" className="text-[13px] py-1.5">1:2</SelectItem>
            <SelectItem value="2:3" className="text-[13px] py-1.5">2:3</SelectItem>
            <SelectItem value="3:4" className="text-[13px] py-1.5">3:4</SelectItem>
            <SelectItem value="4:5" className="text-[13px] py-1.5">4:5</SelectItem>
            <SelectItem value="9:16" className="text-[13px] py-1.5">9:16</SelectItem>
          </div>
          <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Landscape</div>
          <div className="grid grid-cols-2 gap-0 px-1">
            <SelectItem value="3:2" className="text-[13px] py-1.5">3:2</SelectItem>
            <SelectItem value="4:3" className="text-[13px] py-1.5">4:3</SelectItem>
            <SelectItem value="5:4" className="text-[13px] py-1.5">5:4</SelectItem>
            <SelectItem value="16:9" className="text-[13px] py-1.5">16:9</SelectItem>
            <SelectItem value="2:1" className="text-[13px] py-1.5">2:1</SelectItem>
            <SelectItem value="4:1" className="text-[13px] py-1.5">4:1</SelectItem>
            <SelectItem value="8:1" className="text-[13px] py-1.5">8:1</SelectItem>
          </div>
        </SelectContent>
      </Select>

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
  compact = false,
  context,
}: {
  data: MouseImageGalleryData;
  onChange: (data: MouseImageGalleryData) => void;
  compact?: boolean;
  context?: any;
}) {
  const imagesWithIds = useMemo(
    () => (data.images || []).map((img, index) => ({ ...img, id: img.id || `mouse-image-${index}` })),
    [data.images]
  );
  const [isUploading, setIsUploading] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Récupérer la palette actuelle depuis le contexte
  const currentPalette = useMemo(() => {
    if (!context) return null;
    try {
      return resolvePaletteFromContent(context);
    } catch {
      return null;
    }
  }, [context]);

  // Obtenir la couleur de fond de la palette
  const paletteBackgroundColor = currentPalette?.background || '#ffffff';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateField = (field: keyof MouseImageGalleryData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateImage = (index: number, field: keyof GalleryImage, value: any) => {
    const next = [...imagesWithIds];
    next[index] = { ...next[index], [field]: value };
    updateField('images', next);
  };

  const removeImage = (index: number) => {
    const next = [...imagesWithIds];
    next.splice(index, 1);
    updateField('images', next);
  };

  const MAX_IMAGES = 50; // Pas de limite pour mouse-image-gallery

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error("Erreur lors de l'upload");
    const result = await response.json();
    return result.url as string;
  };

  const handleSingleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      updateField('images', [...imagesWithIds, { id: `mouse-image-${Date.now()}`, src: url, alt: '' }]);
    } catch (error) {
      alert("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      if (singleFileInputRef.current) singleFileInputRef.current.value = '';
    }
  };

  const handleMultipleUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        urls.push(url);
      }
      const next = [
        ...imagesWithIds,
        ...urls.map((src) => ({ id: `mouse-image-${Date.now()}-${Math.random()}`, src, alt: '' })),
      ];
      updateField('images', next);
    } catch (error) {
      alert("Erreur lors de l'upload multiple");
    } finally {
      setIsUploading(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  const replaceImage = async (index: number, file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      updateImage(index, 'src', url);
    } catch (error) {
      alert("Erreur lors du remplacement");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = imagesWithIds.findIndex((img) => img.id === active.id);
    const newIndex = imagesWithIds.findIndex((img) => img.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    updateField('images', arrayMove(imagesWithIds, oldIndex, newIndex));
  };

  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          {/* Option transparent header */}
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Header transparent
              </label>
              <p className="text-[10px] text-gray-500">
                Active uniquement si ce bloc est le premier. Le header devient transparent pour un effet hero.
              </p>
            </div>
            <Switch
              checked={data.transparentHeader || false}
              onCheckedChange={(checked) => updateField('transparentHeader', checked)}
              className="ml-4"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 mb-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Mouse Image Gallery"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Sous-titre</label>
              <input
                type="text"
                value={data.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Passe la souris pour révéler les visuels."
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Nombre max d'images visibles</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 -mx-2 px-2">
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[data.maxImages ?? 8]}
                    onValueChange={(values) => updateField('maxImages', values[0])}
                  />
                </div>
                <span className="text-[11px] text-gray-500 text-right flex-shrink-0">{data.maxImages ?? 8}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Parallax (scroll)</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!data.parallax?.enabled}
                  onCheckedChange={(checked) => updateField('parallax', { ...(data.parallax || {}), enabled: checked })}
                />
                <div className="flex-1 -mx-2 px-2">
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[data.parallax?.speed ?? 0.25]}
                    onValueChange={(values) =>
                      updateField('parallax', { ...(data.parallax || {}), enabled: true, speed: values[0] })
                    }
                    disabled={!data.parallax?.enabled}
                  />
                </div>
                <span className="text-[11px] text-gray-500 text-right flex-shrink-0 w-12">
                  {(data.parallax?.speed ?? 0.25).toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">
                Couleur de fond
                {currentPalette && (
                  <span className="ml-1 text-[9px] text-gray-500">
                    (Palette: {currentPalette.name})
                  </span>
                )}
              </label>
              <Select
                value={data.theme || 'auto'}
                onValueChange={(value) => updateField('theme', value as any)}
                open={openSelect === 'theme'}
                onOpenChange={(open) => setOpenSelect(open ? 'theme' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="auto" className="text-[13px]">
                    Auto {currentPalette && `(${paletteBackgroundColor})`}
                  </SelectItem>
                  <SelectItem value="light" className="text-[13px]">Blanc</SelectItem>
                  <SelectItem value="dark" className="text-[13px]">Noir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
                Images ({imagesWithIds.length})
              </label>
              <div className="flex gap-1">
                <input
                  ref={multiFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
                />
                <input
                  ref={singleFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSingleUpload}
                />
                <button
                  type="button"
                  onClick={() => multiFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-3 w-3" />
                  {isUploading ? '...' : 'Multiple'}
                </button>
                <button
                  type="button"
                  onClick={() => singleFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" />
                  {isUploading ? '...' : 'Ajouter'}
                </button>
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={imagesWithIds.map((img, idx) => img.id || `mouse-image-${idx}`)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {imagesWithIds.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                      <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p>Aucune image</p>
                    </div>
                  ) : (
                    imagesWithIds.map((image, index) => (
                      <SortableImageItem
                        key={image.id}
                        image={image}
                        index={index}
                        onUpdate={(field, value) => updateImage(index, field, value)}
                        onRemove={() => removeImage(index)}
                        onToggleVisibility={() => updateImage(index, 'hidden', !image.hidden)}
                        onReplace={(file) => replaceImage(index, file)}
                        compact
                        openSelect={openSelect}
                        onOpenSelectChange={setOpenSelect}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
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
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Mouse Image Gallery"
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Sous-titre</Label>
          <Input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Passe la souris pour révéler les visuels."
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Nombre max d'images visibles</Label>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 -mx-2 px-2">
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[data.maxImages ?? 8]}
                  onValueChange={(values) => updateField('maxImages', values[0])}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
                {data.maxImages ?? 8}
              </span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Couleur de fond</Label>
            <Select
              value={data.theme || 'auto'}
              onValueChange={(value) => updateField('theme', value as any)}
              open={openSelect === 'theme-full'}
              onOpenChange={(open) => setOpenSelect(open ? 'theme-full' : null)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="light">Blanc</SelectItem>
                <SelectItem value="dark">Noir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Parallax (scroll)</Label>
            <div className="flex items-center gap-3 mt-2">
              <Switch
                checked={!!data.parallax?.enabled}
                onCheckedChange={(checked) => updateField('parallax', { ...(data.parallax || {}), enabled: checked })}
              />
              <div className="flex-1 -mx-2 px-2">
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[data.parallax?.speed ?? 0.25]}
                  onValueChange={(values) =>
                    updateField('parallax', { ...(data.parallax || {}), enabled: true, speed: values[0] })
                  }
                  disabled={!data.parallax?.enabled}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
                {(data.parallax?.speed ?? 0.25).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-sm">Header transparent</Label>
            <p className="text-[11px] text-gray-500 leading-snug">Force le header en overlay (fix first block).</p>
          </div>
          <Switch
            checked={!!data.transparentHeader}
            onCheckedChange={(checked) => updateField('transparentHeader', checked)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Images de la galerie ({imagesWithIds.length})</h4>
            <p className="text-[12px] text-gray-500">Déplacez pour réordonner, masque/affichez au besoin.</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={multiFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
            />
            <input
              ref={singleFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSingleUpload}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              disabled={isUploading}
              onClick={() => multiFileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? '...' : 'Multiple'}
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex items-center gap-2"
              disabled={isUploading}
              onClick={() => singleFileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4" />
              {isUploading ? '...' : 'Ajouter'}
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={imagesWithIds.map((img, idx) => img.id || `mouse-image-${idx}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {imagesWithIds.map((image, index) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  index={index}
                  onUpdate={(field, value) => updateImage(index, field, value)}
                  onRemove={() => removeImage(index)}
                  onToggleVisibility={() => updateImage(index, 'hidden', !image.hidden)}
                  onReplace={(file) => replaceImage(index, file)}
                  openSelect={openSelect}
                  onOpenSelectChange={setOpenSelect}
                />
              ))}
              {imagesWithIds.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  Pas encore d'image. Ajoutez-en une pour démarrer.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
