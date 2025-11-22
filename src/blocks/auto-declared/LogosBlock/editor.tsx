import React, { useState, useRef } from 'react';
import { LogoUploader } from '../../../app/admin/components/MediaUploader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, ImageIcon } from 'lucide-react';

interface LogosData {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  logos: Array<{
    id?: string;
    src?: string;
    image?: string;
    alt?: string;
    name?: string;
    hidden?: boolean;
  }>;
}

// Composant pour un logo draggable en mode compact
function SortableLogoItem({ logo, index, onUpdate, onRemove }: { 
  logo: any; 
  index: number; 
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: logo.id || `logo-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const uploadData = await response.json();
      onUpdate('src', uploadData.url);
    } catch (err) {
      console.error('Erreur upload:', err);
      alert('Erreur lors de l\'upload du logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageClick = () => {
    if (!logo.src && !logo.image) {
      // Pas d'image : ouvrir directement le sélecteur
      fileInputRef.current?.click();
    }
    // Si image : le DropdownMenu s'ouvrira
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onUpdate('src', '');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 py-1 px-2 bg-white border border-gray-200 rounded group cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
      
      {/* Miniature du logo - clic direct si vide, dropdown si image */}
      {logo.src || logo.image ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div 
              className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <img 
                src={logo.src || logo.image} 
                alt={logo.alt || logo.name || 'Logo'} 
                className="w-full h-full object-contain p-1"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              handleReplace();
            }} className="text-[13px]">
              <ImageIcon className="w-3 h-3 mr-2" />
              Remplacer
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
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
            handleImageClick();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] text-gray-400">+</span>
        </div>
      )}
      
      {/* Input file invisible */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="hidden"
      />
      
      {/* Input nom du client */}
      <input
        type="text"
        value={logo.alt || logo.name || ''}
        onChange={(e) => onUpdate('alt', e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Client name"
        className="flex-1 min-w-0 px-2 py-1 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
      />
      
      {/* Icônes au hover : œil et poubelle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate('hidden', !logo.hidden);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-0.5"
        title={logo.hidden ? 'Afficher' : 'Masquer'}
      >
        {logo.hidden ? (
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
  );
}

export default function LogosBlockEditor({ data, onChange, compact = false }: { data: LogosData; onChange: (data: LogosData) => void; compact?: boolean }) {
  const [draggedLogoIndex, setDraggedLogoIndex] = useState<number | null>(null);
  const [dragOverLogoIndex, setDragOverLogoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateLogo = (index: number, field: string, value: any) => {
    const logos = [...(data.logos || [])];
    logos[index] = {
      ...logos[index],
      [field]: value
    };
    updateField('logos', logos);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const uploadData = await response.json();
      
      // Ajouter le logo avec l'image uploadée
      const newLogos = [...(data.logos || []), { id: `logo-${Date.now()}`, src: uploadData.url, alt: '' }];
      updateField('logos', newLogos);
    } catch (err) {
      console.error('Erreur upload:', err);
      alert('Erreur lors de l\'upload du logo');
    } finally {
      setIsUploading(false);
      // Reset l'input pour pouvoir uploader le même fichier à nouveau
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addLogo = () => {
    // Ouvrir directement le sélecteur de fichier
    fileInputRef.current?.click();
  };

  const removeLogo = (index: number) => {
    const logos = [...(data.logos || [])];
    logos.splice(index, 1);
    updateField('logos', logos);
  };

  // Drag & drop natif pour les logos
  const handleLogoDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedLogoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    document.body.classList.add('dragging');
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleLogoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedLogoIndex !== null && draggedLogoIndex !== index) {
      setDragOverLogoIndex(index);
    }
  };

  const handleLogoDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedLogoIndex === null || draggedLogoIndex === dropIndex) return;

    const logos = [...(data.logos || [])];
    const [draggedLogo] = logos.splice(draggedLogoIndex, 1);
    logos.splice(dropIndex, 0, draggedLogo);
    
    updateField('logos', logos);
    
    setDraggedLogoIndex(null);
    setDragOverLogoIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleLogoDragEnd = () => {
    document.querySelectorAll('.logo-drag-item.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    setDraggedLogoIndex(null);
    setDragOverLogoIndex(null);
    document.body.classList.remove('dragging');
  };

  // S'assurer que tous les logos ont un ID
  const logosWithIds = (data.logos || []).map((logo, index) => ({
    ...logo,
    id: logo.id || `logo-${index}`
  }));

  // Sensors pour drag & drop (mode compact)
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

  const handleDragEndCompact = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = logosWithIds.findIndex(l => l.id === active.id);
      const newIndex = logosWithIds.findIndex(l => l.id === over.id);
      const newOrder = arrayMove(logosWithIds, oldIndex, newIndex);
      updateField('logos', newOrder);
    }
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Our Clients"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Logos ({logosWithIds.length})
            </label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndCompact}
            >
              <SortableContext
                items={logosWithIds.map(l => l.id!)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {logosWithIds.map((logo, index) => (
                    <SortableLogoItem
                      key={logo.id}
                      logo={logo}
                      index={index}
                      onUpdate={(field, value) => updateLogo(index, field, value)}
                      onRemove={() => removeLogo(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <button
              onClick={addLogo}
              disabled={isUploading}
              className="w-full mt-2 py-1.5 px-2 border border-gray-300 border-dashed rounded text-[13px] text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Upload en cours...' : '+ Ajouter un logo'}
            </button>
            
            {/* Input file invisible pour l'upload direct */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la section
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ex: NOS CLIENTS"
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logos clients
          </label>
          <div className="logos-grid-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {(data.logos || []).map((logo, index) => (
              <div 
                key={index} 
                data-logo-index={index}
                className={`logo-drop-zone p-3 border border-gray-200 rounded-lg transition-all duration-200 ${
                  draggedLogoIndex === index ? 'dragging' : ''
                } ${
                  dragOverLogoIndex === index && draggedLogoIndex !== index 
                    ? 'drag-over' 
                    : ''
                }`}
                onDragOver={(e) => handleLogoDragOver(e, index)}
                onDrop={(e) => handleLogoDrop(e, index)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverLogoIndex(null);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="logo-drag-item flex items-center gap-2"
                    draggable
                    onDragStart={(e) => handleLogoDragStart(e, index)}
                    onDragEnd={handleLogoDragEnd}
                  >
                    <span className="logo-drag-handle text-xs">⋮⋮</span>
                    <span className="text-xs font-medium text-gray-600">Logo {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeLogo(index)}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                    title="Supprimer ce logo"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="logo-drop-indicator">
                  Déposer ici
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Image
                    </label>
                    <LogoUploader
                      currentUrl={logo.src || logo.image || ''}
                      onUpload={(src) => updateLogo(index, 'src', src)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nom du client
                    </label>
                    <input
                      type="text"
                      value={logo.alt || logo.name || ''}
                      onChange={(e) => updateLogo(index, 'alt', e.target.value)}
                      placeholder="Ex: Apple"
                      className="block-input text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addLogo}
              className="w-full py-2 px-3 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors hover:bg-gray-50"
            >
              + Ajouter un logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
