'use client';
import React, { useRef, useState, useEffect } from 'react';
import MediaUploader from '@/app/admin/components/MediaUploader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImageIcon, Trash2, Eye, EyeOff, ImagePlus, Plus, GripVertical } from 'lucide-react';
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

interface ImageItem {
  id?: string;
  src: string;
  alt: string;
  hidden?: boolean;
}

interface ImageBlockEditorProps {
  data: {
    id: string;
    type: string;
    image?: {
      src: string;
      alt: string;
    };
    images?: ImageItem[];
  };
  onChange: (updates: any) => void;
  compact?: boolean;
}

// Composant sortable pour chaque image
function SortableImageItem({
  image,
  index,
  onUpdate,
  onRemove,
  onToggleVisibility,
  compact = false
}: {
  image: ImageItem;
  index: number;
  onUpdate: (field: keyof ImageItem, value: any) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id || `image-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
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
        
        {/* Icônes au hover : œil et poubelle */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="cursor-pointer flex-shrink-0 p-0.5"
            title={image.hidden ? 'Afficher' : 'Masquer'}
          >
            {image.hidden ? (
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
            className="cursor-pointer flex-shrink-0 p-0.5"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
    );
  }

  // Version non-compacte
  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Image #{index + 1}</span>
        <button type="button" onClick={onRemove} className="text-red-600 text-sm">Supprimer</button>
      </div>
      <MediaUploader
        currentUrl={image.src || ''}
        onUpload={(src) => onUpdate('src', src)}
      />
      <input
        type="text"
        value={image.alt || ''}
        onChange={(e) => onUpdate('alt', e.target.value)}
        placeholder="Description de l'image (alt text)"
        className="block-input"
      />
    </div>
  );
}

export default function ImageBlockEditor({ data, onChange, compact = false }: ImageBlockEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  
  // Migrer l'ancienne structure (une seule image) vers la nouvelle (tableau d'images)
  useEffect(() => {
    if (data.image && !data.images) {
      onChange({
        ...data,
        images: [{
          id: `image-${Date.now()}`,
          src: data.image.src || '',
          alt: data.image.alt || '',
        }],
        image: undefined, // Retirer l'ancienne structure
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Une seule fois au montage

  // S'assurer que toutes les images ont un ID (seulement si nécessaire)
  useEffect(() => {
    const images = data.images || [];
    const needsIds = images.some((img, index) => !img.id);
    if (needsIds) {
      const imagesWithIds = images.map((img, index) => ({
        ...img,
        id: img.id || `image-${Date.now()}-${index}`,
      }));
      // Ne mettre à jour que si vraiment nécessaire pour éviter les boucles
      if (imagesWithIds.some((img, i) => img.id !== images[i]?.id)) {
        onChange({ ...data, images: imagesWithIds });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.images?.length]); // Seulement quand le nombre d'images change

  const updateBlock = (updates: any) => {
    onChange(updates);
  };

  const images = data.images || [];

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

    const oldIndex = images.findIndex((img) => (img.id || `image-${images.indexOf(img)}`) === active.id);
    const newIndex = images.findIndex((img) => (img.id || `image-${images.indexOf(img)}`) === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newImages = arrayMove(images, oldIndex, newIndex);
      onChange({ ...data, images: newImages });
    }
  };

  const handleSingleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
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
      const newImage: ImageItem = {
        id: `image-${Date.now()}`,
        src: result.url,
        alt: '',
      };
      
      onChange({ ...data, images: [...images, newImage] });
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = '';
      }
    }
  };

  const updateImage = (index: number, updates: Partial<ImageItem>) => {
    const newImages = images.map((img, i) => (i === index ? { ...img, ...updates } : img));
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...data, images: newImages });
  };

  const toggleImageVisibility = (index: number) => {
    const image = images[index];
    updateImage(index, { hidden: !image.hidden });
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          {/* Liste des images */}
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
              Images ({images.length})
            </label>
            <div className="space-y-1">
              {images.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                  Aucune image
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map((img) => img.id || `image-${images.indexOf(img)}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {images.map((image, index) => (
                      <SortableImageItem
                        key={image.id || `image-${index}`}
                        image={image}
                        index={index}
                        onUpdate={(field, value) => updateImage(index, { [field]: value })}
                        onRemove={() => removeImage(index)}
                        onToggleVisibility={() => toggleImageVisibility(index)}
                        compact={true}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              
              {/* Bouton ajouter */}
              <input
                ref={singleFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSingleUpload}
                className="hidden"
                id="single-upload-image"
              />
              <button
                type="button"
                onClick={() => {
                  singleFileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Plus className="h-3 w-3 inline mr-1" />
                {isUploading ? 'Upload...' : 'Ajouter une image'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Images</h4>
        <button type="button" onClick={() => {
          const newImage: ImageItem = {
            id: `image-${Date.now()}`,
            src: '',
            alt: '',
          };
          onChange({ ...data, images: [...images, newImage] });
        }} className="btn btn-secondary">Ajouter une image</button>
      </div>

      <div className="space-y-6">
        {images.map((image, index) => (
          <SortableImageItem
            key={image.id || `image-${index}`}
            image={image}
            index={index}
            onUpdate={(field, value) => updateImage(index, { [field]: value })}
            onRemove={() => removeImage(index)}
            onToggleVisibility={() => toggleImageVisibility(index)}
            compact={false}
          />
        ))}
      </div>
    </div>
  );
}
