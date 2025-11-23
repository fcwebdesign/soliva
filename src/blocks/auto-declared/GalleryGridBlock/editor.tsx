'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { Plus, Trash2, Edit3, Image as ImageIcon, Upload, X, GripVertical, Eye, EyeOff, ImagePlus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
  width?: number;
  height?: number;
  hidden?: boolean;
}

interface GalleryGridData {
  images?: GalleryImage[];
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry-2' | 'masonry-3' | 'masonry-4';
  gap?: 'small' | 'medium' | 'large';
  sectionTitle?: string;
  showFilters?: boolean;
  showTitles?: boolean;
  showDescriptions?: boolean;
  enableLightbox?: boolean;
  enableDownload?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

// Composant pour une image draggable
function SortableImageItem({ 
  image, 
  index, 
  onEdit, 
  onReplace,
  onRemove,
  onToggleVisibility,
  onUpdate,
  compact = false
}: { 
  image: GalleryImage; 
  index: number;
  onEdit: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onUpdate?: (field: string, value: any) => void;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpdate) return;

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
      onUpdate('src', result.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Échec de l\'upload de l\'image.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 py-1 px-2 bg-white border border-gray-200 rounded group cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        
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
                  // Modifier : ouvrir le modal d'édition pour Alt, Titre, Catégorie
                  onEdit();
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
        
        {/* Affichage titre/catégorie (lecture seule) */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-gray-900 truncate">
            {image.title || image.alt || 'Sans titre'}
          </div>
          {image.category && (
            <div className="text-[10px] text-blue-600 mt-0.5">
              {image.category}
            </div>
          )}
        </div>
        
        {/* Icône œil au hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-0.5"
          title={image.hidden ? 'Afficher' : 'Masquer'}
        >
          {image.hidden ? (
            <EyeOff className="w-3 h-3 text-gray-400 hover:text-blue-500" />
          ) : (
            <Eye className="w-3 h-3 text-gray-400 hover:text-blue-500" />
          )}
        </button>
      </div>
    );
  }

  // Version non-compacte (originale)
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`relative group border border-gray-200 rounded-lg overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
    >
      <div 
        className="aspect-square relative cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        {image.src ? (
          <img 
            src={image.src} 
            alt={image.alt} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
        
        {/* Overlay avec actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-white/90 hover:bg-white text-black h-8 w-8 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-red-500/90 hover:bg-red-600 text-white h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Indicateur d'édition */}
        <div className="absolute top-1 left-1">
          <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
            {index + 1}
          </div>
        </div>

        {/* Drag handle icon */}
        <div className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded pointer-events-none">
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Infos compactes */}
      <div className="p-2 bg-white">
        <p className="text-xs text-gray-600 truncate">
          {image.title || image.alt || 'Sans titre'}
        </p>
        {image.category && (
          <span className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
            {image.category}
          </span>
        )}
      </div>
    </div>
  );
}

export default function GalleryGridBlockEditor({ data, onChange, compact = false }: { data: GalleryGridData; onChange: (data: GalleryGridData) => void; compact?: boolean }) {
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editMode, setEditMode] = useState<'replace' | 'edit'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addImage = () => {
    const newImage: GalleryImage = {
      id: `image-${Date.now()}`,
      src: '',
      alt: '',
      title: '',
      description: '',
      category: ''
    };
    
    const currentImages = data.images || [];
    updateField('images', [...currentImages, newImage]);
  };

  const addMultipleImages = (urls: string[]) => {
    const newImages: GalleryImage[] = urls.map((url, index) => ({
      id: `image-${Date.now()}-${index}`,
      src: url,
      alt: '',
      title: '',
      description: '',
      category: ''
    }));
    
    const currentImages = data.images || [];
    updateField('images', [...currentImages, ...newImages]);
  };

  const handleMultipleUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return result.url;
      });
      
      const urls = await Promise.all(uploadPromises);
      addMultipleImages(urls);
    } catch (error) {
      console.error('Erreur upload multiple:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = data.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateField('images', newImages);
  };

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    const currentImages = data.images || [];
    const newImages = [...currentImages];
    newImages[index] = { ...newImages[index], ...updates };
    updateField('images', newImages);
  };

  // Sensors pour drag & drop avec dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentImages = data.images || [];
      const oldIndex = currentImages.findIndex(img => img.id === active.id);
      const newIndex = currentImages.findIndex(img => img.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(currentImages, oldIndex, newIndex);
        updateField('images', newImages);
      }
    }
  };

  const toggleImageVisibility = (index: number) => {
    const currentImages = data.images || [];
    const newImages = [...currentImages];
    newImages[index] = { ...newImages[index], hidden: !newImages[index].hidden };
    updateField('images', newImages);
  };

  // Obtenir les catégories uniques
  const categories = Array.from(new Set((data.images || []).map(img => img.category).filter(Boolean)));

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          {/* Titre de section */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre de section</label>
            <input
              type="text"
              value={data.sectionTitle || ''}
              onChange={(e) => updateField('sectionTitle', e.target.value)}
              placeholder="Ex: Notre Galerie"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Configuration générale */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Layout</label>
              <Select
                value={data.layout || 'grid-3'}
                onValueChange={(value) => updateField('layout', value)}
                open={openSelect === 'layout'}
                onOpenChange={(open) => setOpenSelect(open ? 'layout' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="grid-2" className="text-[13px]">Grid 2 colonnes</SelectItem>
                  <SelectItem value="grid-3" className="text-[13px]">Grid 3 colonnes</SelectItem>
                  <SelectItem value="grid-4" className="text-[13px]">Grid 4 colonnes</SelectItem>
                  <SelectItem value="masonry-2" className="text-[13px]">Masonry 2 colonnes</SelectItem>
                  <SelectItem value="masonry-3" className="text-[13px]">Masonry 3 colonnes</SelectItem>
                  <SelectItem value="masonry-4" className="text-[13px]">Masonry 4 colonnes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Espacement</label>
              <Select
                value={data.gap || 'medium'}
                onValueChange={(value) => updateField('gap', value)}
                open={openSelect === 'gap'}
                onOpenChange={(open) => setOpenSelect(open ? 'gap' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="small" className="text-[13px]">Petit</SelectItem>
                  <SelectItem value="medium" className="text-[13px]">Moyen</SelectItem>
                  <SelectItem value="large" className="text-[13px]">Grand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options d'affichage */}
          <div className="space-y-1">
            <label className="block text-[10px] text-gray-400 mb-1">Options d'affichage</label>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center space-x-1.5">
                <Switch
                  id="showFilters"
                  checked={data.showFilters !== false}
                  onCheckedChange={(checked) => updateField('showFilters', checked)}
                  className="h-3 w-5"
                />
                <label htmlFor="showFilters" className="text-[11px]">Filtres</label>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <Switch
                  id="showTitles"
                  checked={data.showTitles !== false}
                  onCheckedChange={(checked) => updateField('showTitles', checked)}
                  className="h-3 w-5"
                />
                <label htmlFor="showTitles" className="text-[11px]">Titres</label>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <Switch
                  id="showDescriptions"
                  checked={data.showDescriptions !== false}
                  onCheckedChange={(checked) => updateField('showDescriptions', checked)}
                  className="h-3 w-5"
                />
                <label htmlFor="showDescriptions" className="text-[11px]">Descriptions</label>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <Switch
                  id="enableLightbox"
                  checked={data.enableLightbox !== false}
                  onCheckedChange={(checked) => updateField('enableLightbox', checked)}
                  className="h-3 w-5"
                />
                <label htmlFor="enableLightbox" className="text-[11px]">Lightbox</label>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <Switch
                  id="enableDownload"
                  checked={data.enableDownload !== false}
                  onCheckedChange={(checked) => updateField('enableDownload', checked)}
                  className="h-3 w-5"
                />
                <label htmlFor="enableDownload" className="text-[11px]">Téléchargement</label>
              </div>
            </div>
          </div>

          {/* Gestion des images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400">Images de la galerie</label>
              <div className="flex gap-1">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
                  className="hidden"
                  id="multiple-upload-compact"
                  ref={(input) => {
                    if (input) {
                      input.onclick = () => {
                        input.value = '';
                      };
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('multiple-upload-compact') as HTMLInputElement;
                    if (input) input.click();
                  }}
                  disabled={isUploading}
                  className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  {isUploading ? '...' : 'Multiple'}
                </button>
                <button
                  onClick={addImage}
                  className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Ajouter
                </button>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="p-1.5 bg-blue-50 rounded text-[10px]">
                <span className="text-blue-800">Catégories: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {categories.map(category => (
                    <span key={category} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Liste verticale d'images avec dnd-kit */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(data.images || []).map(img => img.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {(data.images || []).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded text-[11px]">
                      <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p>Aucune image</p>
                    </div>
                  ) : (
                    (data.images || []).map((image, index) => (
                      <SortableImageItem
                        key={image.id}
                        image={image}
                        index={index}
                        onEdit={() => {
                          setEditMode('edit');
                          setEditingImage(image);
                        }}
                        onReplace={() => {}} // Plus utilisé, géré directement par file input
                        onRemove={() => removeImage(index)}
                        onToggleVisibility={() => toggleImageVisibility(index)}
                        onUpdate={(field, value) => updateImage(index, { [field]: value })}
                        compact={true}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Modal d'édition d'image */}
        <Dialog open={Boolean(editingImage)} onOpenChange={(open) => !open && setEditingImage(null)}>
          <DialogContent className="!max-w-[425px]">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base font-semibold">Éditer l'image</DialogTitle>
            </DialogHeader>
            
            {editingImage && (() => {
              const imageIndex = (data.images || []).findIndex(img => img.id === editingImage.id);
              return (
                <div className="space-y-2">
                  {/* Aperçu de l'image - très petit */}
                  <div className="w-20 h-20 relative bg-gray-100 rounded overflow-hidden mx-auto">
                    {editingImage.src ? (
                      <img 
                        src={editingImage.src} 
                        alt={editingImage.alt} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload d'image - seulement en mode "replace" */}
                  {editMode === 'replace' && (
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-1">Image</Label>
                      <MediaUploader
                        currentUrl={editingImage.src || ''}
                        onUpload={(url) => {
                          if (imageIndex !== -1) {
                            updateImage(imageIndex, { src: url });
                            setEditingImage({ ...editingImage, src: url });
                          }
                        }}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Formulaire d'édition - très compact */}
                  <div className="space-y-2">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Alt *</Label>
                    <input
                      type="text"
                      value={editingImage.alt}
                      onChange={(e) => {
                        const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                        if (index !== -1) {
                          updateImage(index, { alt: e.target.value });
                          setEditingImage({ ...editingImage, alt: e.target.value });
                        }
                      }}
                      placeholder="Description"
                      className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Titre</Label>
                    <input
                      type="text"
                      value={editingImage.title || ''}
                      onChange={(e) => {
                        const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                        if (index !== -1) {
                          updateImage(index, { title: e.target.value });
                          setEditingImage({ ...editingImage, title: e.target.value });
                        }
                      }}
                      placeholder="Titre"
                      className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Catégorie</Label>
                    <input
                      type="text"
                      value={editingImage.category || ''}
                      onChange={(e) => {
                        const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                        if (index !== -1) {
                          updateImage(index, { category: e.target.value });
                          setEditingImage({ ...editingImage, category: e.target.value });
                        }
                      }}
                      placeholder="nature, portrait..."
                      className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setEditingImage(null)} className="h-7 px-2 text-xs">
                      Fermer
                    </Button>
                    <Button size="sm" onClick={() => setEditingImage(null)} className="h-7 px-2 text-xs">
                      OK
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Version non-compacte (originale)
  return (
    <div className="block-editor">
      <div className="space-y-6">
        {/* Titre de section */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Titre de section</Label>
          <Input
            value={data.sectionTitle || ''}
            onChange={(e) => updateField('sectionTitle', e.target.value)}
            placeholder="Ex: Notre Galerie"
          />
        </div>

        {/* Configuration générale */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </Label>
            <Select
              value={data.layout || 'grid-3'}
              onValueChange={(value) => updateField('layout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid-2">Grid 2 colonnes</SelectItem>
                <SelectItem value="grid-3">Grid 3 colonnes</SelectItem>
                <SelectItem value="grid-4">Grid 4 colonnes</SelectItem>
                <SelectItem value="masonry-2">Masonry 2 colonnes</SelectItem>
                <SelectItem value="masonry-3">Masonry 3 colonnes</SelectItem>
                <SelectItem value="masonry-4">Masonry 4 colonnes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Espacement
            </Label>
            <Select
              value={data.gap || 'medium'}
              onValueChange={(value) => updateField('gap', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petit</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="large">Grand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options d'affichage */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Options d'affichage</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showFilters"
                checked={data.showFilters !== false}
                onCheckedChange={(checked) => updateField('showFilters', checked)}
              />
              <Label htmlFor="showFilters" className="text-sm">Afficher les filtres</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showTitles"
                checked={data.showTitles !== false}
                onCheckedChange={(checked) => updateField('showTitles', checked)}
              />
              <Label htmlFor="showTitles" className="text-sm">Afficher les titres</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showDescriptions"
                checked={data.showDescriptions !== false}
                onCheckedChange={(checked) => updateField('showDescriptions', checked)}
              />
              <Label htmlFor="showDescriptions" className="text-sm">Afficher les descriptions</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableLightbox"
                checked={data.enableLightbox !== false}
                onCheckedChange={(checked) => updateField('enableLightbox', checked)}
              />
              <Label htmlFor="enableLightbox" className="text-sm">Lightbox</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableDownload"
                checked={data.enableDownload !== false}
                onCheckedChange={(checked) => updateField('enableDownload', checked)}
              />
              <Label htmlFor="enableDownload" className="text-sm">Téléchargement</Label>
            </div>
          </div>
        </div>

        {/* Thème */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </Label>
          <Select
            value={data.theme || 'auto'}
            onValueChange={(value) => updateField('theme', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automatique (suit le thème global)</SelectItem>
              <SelectItem value="light">Thème clair forcé</SelectItem>
              <SelectItem value="dark">Thème sombre forcé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gestion des images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Images de la galerie</h4>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
                className="hidden"
                id="multiple-upload"
                ref={(input) => {
                  if (input) {
                    input.onclick = () => {
                      input.value = '';
                    };
                  }
                }}
              />
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2 cursor-pointer"
                disabled={isUploading}
                onClick={() => {
                  const input = document.getElementById('multiple-upload') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Upload...' : 'Upload multiple'}
              </Button>
              <Button onClick={addImage} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une image
              </Button>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Catégories détectées :</p>
              <div className="flex flex-wrap gap-1">
                {categories.map(category => (
                  <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grille d'images avec dnd-kit */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={(data.images || []).map(img => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-6 gap-3">
                {(data.images || []).length === 0 ? (
                  <div className="col-span-6 text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm">Aucune image pour le moment</p>
                    <p className="text-xs text-gray-400 mt-1">Utilisez "Upload multiple" ou "Ajouter une image"</p>
                  </div>
                ) : (
                  (data.images || []).map((image, index) => (
                    <SortableImageItem
                      key={image.id}
                      image={image}
                      index={index}
                      onEdit={() => {
                        setEditMode('edit');
                        setEditingImage(image);
                      }}
                      onReplace={() => {}} // Plus utilisé, géré directement par file input
                      onRemove={() => removeImage(index)}
                      onToggleVisibility={() => toggleImageVisibility(index)}
                      onUpdate={(field, value) => updateImage(index, { [field]: value })}
                      compact={false}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Modal d'édition d'image */}
      <Dialog open={Boolean(editingImage)} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent className="!max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-semibold">Éditer l'image</DialogTitle>
          </DialogHeader>
          
          {editingImage && (() => {
            const imageIndex = (data.images || []).findIndex(img => img.id === editingImage.id);
            return (
              <div className="space-y-2">
                {/* Aperçu de l'image - très petit */}
                <div className="w-20 h-20 relative bg-gray-100 rounded overflow-hidden mx-auto">
                  {editingImage.src ? (
                    <img 
                      src={editingImage.src} 
                      alt={editingImage.alt} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload d'image */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1">Image</Label>
                  <MediaUploader
                    currentUrl={editingImage.src || ''}
                    onUpload={(url) => {
                      if (imageIndex !== -1) {
                        updateImage(imageIndex, { src: url });
                        setEditingImage({ ...editingImage, src: url });
                      }
                    }}
                    compact={false}
                  />
                </div>

                {/* Formulaire d'édition - très compact */}
                <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Alt *</Label>
                  <Input
                    value={editingImage.alt}
                    onChange={(e) => {
                      const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                      if (index !== -1) {
                        updateImage(index, { alt: e.target.value });
                        setEditingImage({ ...editingImage, alt: e.target.value });
                      }
                    }}
                    placeholder="Description"
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Titre</Label>
                  <Input
                    value={editingImage.title || ''}
                    onChange={(e) => {
                      const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                      if (index !== -1) {
                        updateImage(index, { title: e.target.value });
                        setEditingImage({ ...editingImage, title: e.target.value });
                      }
                    }}
                    placeholder="Titre"
                    className="text-xs h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-700">Catégorie</Label>
                  <Input
                    value={editingImage.category || ''}
                    onChange={(e) => {
                      const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                      if (index !== -1) {
                        updateImage(index, { category: e.target.value });
                        setEditingImage({ ...editingImage, category: e.target.value });
                      }
                    }}
                    placeholder="nature, portrait..."
                    className="text-xs h-8"
                  />
                </div>
              </div>

                {/* Actions */}
                <div className="flex justify-end gap-1 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setEditingImage(null)} className="h-7 px-2 text-xs">
                    Fermer
                  </Button>
                  <Button size="sm" onClick={() => setEditingImage(null)} className="h-7 px-2 text-xs">
                    OK
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
