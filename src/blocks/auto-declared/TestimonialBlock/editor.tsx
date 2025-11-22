'use client';

import React, { useState } from 'react';
import MediaUploader from '@/app/admin/components/MediaUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, Trash2, ImageIcon } from 'lucide-react';
import WysiwygEditorWrapper from '@/components/WysiwygEditorWrapper';

interface TestimonialItem {
  id: string;
  testimonial: string;
  author: string;
  company: string;
  role?: string;
  avatar?: {
    src: string;
    alt: string;
  };
  rating?: number;
  hidden?: boolean;
}

interface TestimonialData {
  title?: string;
  items?: TestimonialItem[];
  theme?: 'light' | 'dark' | 'auto';
  columns?: number;
}

// Composant pour un témoignage draggable en mode compact
function SortableTestimonialItem({ 
  item, 
  index, 
  isOpen, 
  onToggle, 
  onUpdate, 
  onRemove 
}: { 
  item: TestimonialItem; 
  index: number; 
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof TestimonialItem, value: any) => void;
  onRemove: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

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
      onUpdate('avatar', { ...item.avatar, src: uploadData.url });
    } catch (err) {
      console.error('Erreur upload:', err);
      alert('Erreur lors de l\'upload de l\'avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageClick = () => {
    if (!item.avatar?.src) {
      // Pas d'image : ouvrir directement le sélecteur
      fileInputRef.current?.click();
    }
    // Si image : le DropdownMenu s'ouvrira
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onUpdate('avatar', { src: '', alt: '' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded group"
    >
      {/* Header cliquable pour toggle + draggable */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => {
          // Si on clique sur un bouton, ne pas toggle
          if ((e.target as HTMLElement).closest('button')) return;
          onToggle();
        }}
        className="flex items-center gap-2 py-2 px-2 bg-white cursor-pointer"
      >
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        
        {/* Miniature avatar - clic direct si vide, dropdown si image */}
        {item.avatar?.src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div 
                className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <img 
                  src={item.avatar.src} 
                  alt={item.avatar.alt || item.author} 
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
            className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
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

        {/* Auteur + Entreprise */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-gray-900 truncate font-medium">
            {item.author || 'Client name'}
          </div>
          <div className="text-[11px] text-gray-500 truncate">
            {item.company || 'Company name'}
          </div>
        </div>

        {/* Icônes au hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate('hidden', !item.hidden);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-0.5"
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
          onPointerDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 p-0.5"
          title="Supprimer"
        >
          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
        </button>

        {/* Chevron pour indiquer l'état */}
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>

      {/* Contenu accordéon */}
      {isOpen && (
        <div className="px-2 pb-2 space-y-2 bg-gray-50" onClick={(e) => e.stopPropagation()}>
          {/* Témoignage avec TipTap */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Témoignage</label>
            <WysiwygEditorWrapper
              value={item.testimonial || ''}
              onChange={(value: string) => onUpdate('testimonial', value)}
              placeholder="Client testimonial text..."
              compact={true}
            />
          </div>

          {/* Auteur + Entreprise */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Nom</label>
              <input
                type="text"
                value={item.author}
                onChange={(e) => onUpdate('author', e.target.value)}
                placeholder="Client name"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Entreprise</label>
              <input
                type="text"
                value={item.company}
                onChange={(e) => onUpdate('company', e.target.value)}
                placeholder="Company name"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Fonction */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Fonction (optionnel)</label>
            <input
              type="text"
              value={item.role || ''}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="CEO, Director..."
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Rating simplifié */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Note (optionnel)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={item.rating || 0}
                onChange={(e) => onUpdate('rating', parseInt(e.target.value))}
                className="flex-1 h-2"
              />
              <span className="text-[13px] text-gray-600 min-w-[2rem]">
                {item.rating || 0}/5
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestimonialBlockEditor({ 
  data, 
  onChange,
  compact = false
}: { 
  data: TestimonialData; 
  onChange: (data: TestimonialData) => void;
  compact?: boolean;
}) {
  const title = data.title || '';
  const items = data.items || [];
  const theme = data.theme || 'auto';
  const [openItemId, setOpenItemId] = useState<string | null>(null);

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
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      onChange({
        ...data,
        items: newOrder
      });
    }
  };

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  const addItem = () => {
    const newItem: TestimonialItem = {
      id: `testimonial-${Date.now()}`,
      testimonial: 'Un témoignage client très positif sur votre travail...',
      author: 'Nom du client',
      company: 'Nom de l\'entreprise',
      role: 'Fonction',
      avatar: {
        src: '',
        alt: ''
      },
      rating: 5
    };
    
    onChange({
      ...data,
      items: [...items, newItem]
    });
  };

  const updateItem = (id: string, field: keyof TestimonialItem, value: any) => {
    onChange({
      ...data,
      items: items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeItem = (id: string) => {
    onChange({
      ...data,
      items: items.filter(item => item.id !== id)
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    onChange({
      ...data,
      items: newItems
    });
  };

  const handleAvatarUpload = (id: string, src: string) => {
    updateItem(id, 'avatar', {
      ...items.find(item => item.id === id)?.avatar,
      src
    });
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
              value={title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Client Testimonials"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Colonnes</label>
            <Select 
              value={String(data.columns || 3)} 
              onValueChange={(value) => onChange({ ...data, columns: parseInt(value, 10) })}
            >
              <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border rounded">
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Témoignages ({items.length})
            </label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndCompact}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {items.map((item) => (
                    <SortableTestimonialItem
                      key={item.id}
                      item={item}
                      index={items.indexOf(item)}
                      isOpen={openItemId === item.id}
                      onToggle={() => toggleItem(item.id)}
                      onUpdate={(field, value) => updateItem(item.id, field, value)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <button
              onClick={addItem}
              className="w-full mt-2 py-1.5 px-2 border border-gray-300 border-dashed rounded text-[13px] text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors hover:bg-gray-50"
            >
              + Ajouter un témoignage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor">
      <div className="space-y-4">
        {/* Titre de la section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la section
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Ex: Témoignages clients"
            className="block-input"
          />
        </div>

        {/* Nombre de colonnes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de colonnes
          </label>
          <select
            value={data.columns || 3}
            onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value, 10) })}
            className="block-input"
          >
            <option value={2}>2 colonnes</option>
            <option value={3}>3 colonnes (par défaut)</option>
            <option value={4}>4 colonnes</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choisissez le nombre de colonnes pour l'affichage de la grille de témoignages.
          </p>
        </div>

        {/* Sélecteur de thème */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={theme}
            onChange={(e) => onChange({ ...data, theme: e.target.value as 'light' | 'dark' | 'auto' })}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>

        {/* Liste des témoignages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Témoignages ({items.length})
          </label>
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                Aucun témoignage. Cliquez sur "Ajouter un témoignage" pour commencer.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {/* En-tête avec contrôles */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      Témoignage {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Boutons de réorganisation */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Descendre"
                      >
                        ↓
                      </button>
                      
                      {/* Bouton supprimer */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Témoignage *
                    </label>
                    <textarea
                      value={item.testimonial}
                      onChange={(e) => updateItem(item.id, 'testimonial', e.target.value)}
                      placeholder="Le témoignage du client..."
                      rows={3}
                      className="block-input text-sm"
                    />
                  </div>

                  {/* Author Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nom du client *
                      </label>
                      <input
                        type="text"
                        value={item.author}
                        onChange={(e) => updateItem(item.id, 'author', e.target.value)}
                        placeholder="Jean Dupont"
                        className="block-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Entreprise *
                      </label>
                      <input
                        type="text"
                        value={item.company}
                        onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                        placeholder="Nom de l'entreprise"
                        className="block-input text-sm"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fonction (optionnel)
                    </label>
                    <input
                      type="text"
                      value={item.role || ''}
                      onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                      placeholder="CEO, Directeur Marketing, etc."
                      className="block-input text-sm"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Photo du client (optionnel)
                    </label>
                    <MediaUploader
                      currentUrl={item.avatar?.src || ''}
                      onUpload={(src) => handleAvatarUpload(item.id, src)}
                    />
                    {item.avatar?.src && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Texte alternatif (pour l'accessibilité)
                        </label>
                        <input
                          type="text"
                          value={item.avatar.alt || ''}
                          onChange={(e) => updateItem(item.id, 'avatar', { ...item.avatar, alt: e.target.value })}
                          placeholder="Description de la photo"
                          className="block-input text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Note (optionnel)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={item.rating || 0}
                        onChange={(e) => updateItem(item.id, 'rating', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < (item.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 min-w-[2.5rem]">
                        {item.rating || 0}/5
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, 'rating', 0)}
                      className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                    >
                      Masquer la note
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Bouton Ajouter standardisé */}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Ajouter un témoignage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
