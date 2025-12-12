"use client";

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Trash2, ImagePlus, Edit3, GripVertical, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MediaUploader from '../../../app/admin/components/MediaUploader';

interface HoverClientItem {
  id?: string;
  name?: string;
  image?: {
    src?: string;
    alt?: string;
  };
  hidden?: boolean;
}

interface HoverClientsData {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  items?: HoverClientItem[];
}

// Composant pour un item client en mode compact (sortable)
function ClientItem({
  item,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  onToggleVisibility,
}: {
  item: HoverClientItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<HoverClientItem>) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id || `client-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
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
      onUpdate({ image: { ...(item.image || {}), src: result.url } });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Échec de l\'upload de l\'image.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded overflow-hidden"
    >
      {/* Header - cliquable pour ouvrir/fermer */}
      <div
        className="flex items-center gap-1 py-1 px-2 group hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={onToggle}
        {...attributes}
        {...listeners}
      >
        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          )}
        </div>
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        {/* Miniature de l'image - dropdown si image existe */}
        {item.image?.src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={item.image.src}
                  alt={item.image.alt || item.name}
                  className="w-full h-full object-cover"
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
              fileInputRef.current?.click();
            }}
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
          className="hidden"
        />

        {/* Nom du client */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-gray-900 truncate">
            {item.name || 'Sans nom'}
          </div>
        </div>

        {/* Icônes : œil et poubelle */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
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

      {/* Contenu accordion - champs d'édition */}
      {isOpen && (
        <div className="px-2 pb-2 pt-1 space-y-2 bg-gray-50 border-t border-gray-200">
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Nom</label>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Nom du client"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">Texte alternatif</label>
            <input
              type="text"
              value={item.image?.alt || ''}
              onChange={(e) => onUpdate({ image: { ...(item.image || {}), alt: e.target.value } })}
              placeholder="Description de l'image"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HoverClientsBlockEditor({ data, onChange, compact = false }: { data: HoverClientsData; onChange: (next: HoverClientsData) => void; compact?: boolean }) {
  const blockData = data || {};
  const items = blockData.items || [];
  const [openClientId, setOpenClientId] = useState<string | null>(null);

  const updateField = (field: keyof HoverClientsData, value: any) => {
    onChange({
      ...blockData,
      [field]: value,
    });
  };

  const updateItem = (index: number, updates: Partial<HoverClientItem>) => {
    const next = [...items];
    next[index] = { ...(next[index] || {}), ...updates };
    updateField('items', next);
  };

  const addItem = () => {
    const next = [
      ...items,
      { id: `client-${Date.now()}`, name: 'Client', image: { src: '' } },
    ];
    updateField('items', next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateField('items', next);
  };

  const toggleClientVisibility = (index: number) => {
    const item = items[index];
    updateItem(index, { hidden: !item.hidden });
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
      const oldIndex = items.findIndex((item, idx) => (item.id || `client-${idx}`) === active.id);
      const newIndex = items.findIndex((item, idx) => (item.id || `client-${idx}`) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        updateField('items', newItems);
      }
    }
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              value={blockData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Trusted us"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Sous-titre</label>
            <input
              type="text"
              value={blockData.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Selected clients"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-gray-400">Clients ({items.length})</label>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item, index) => item.id || `client-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {items.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded text-[11px]">
                    Aucun client
                  </div>
                ) : (
                  items.map((item, index) => {
                    const itemId = item.id || `client-${index}`;
                    const isOpen = openClientId === itemId;

                    return (
                      <ClientItem
                        key={itemId}
                        item={item}
                        index={index}
                        isOpen={isOpen}
                        onToggle={() => setOpenClientId(isOpen ? null : itemId)}
                        onUpdate={(updates) => updateItem(index, updates)}
                        onRemove={() => removeItem(index)}
                        onToggleVisibility={() => toggleClientVisibility(index)}
                      />
                    );
                  })
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Bouton ajouter en bas */}
          <button
            type="button"
            onClick={addItem}
            className="w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-3 w-3 inline mr-1" />
            Ajouter un client
          </button>
        </div>
      </div>
    );
  }

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateField('items', next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Titre</Label>
          <Input
            value={blockData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Trusted us"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Sous-titre</Label>
          <Input
            value={blockData.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Selected clients"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur de fond</Label>
          <Input
            type="color"
            value={blockData.backgroundColor || ''}
            onChange={(e) => updateField('backgroundColor', e.target.value || undefined)}
            placeholder="Thème par défaut"
          />
          <p className="text-[10px] text-gray-400">Laisser vide pour utiliser le thème</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur du texte</Label>
          <Input
            type="color"
            value={blockData.textColor || ''}
            onChange={(e) => updateField('textColor', e.target.value || undefined)}
            placeholder="Thème par défaut"
          />
          <p className="text-[10px] text-gray-400">Laisser vide pour utiliser le thème</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur secondaire</Label>
          <Input
            type="color"
            value={blockData.mutedColor || ''}
            onChange={(e) => updateField('mutedColor', e.target.value || undefined)}
            placeholder="Thème par défaut"
          />
          <p className="text-[10px] text-gray-400">Laisser vide pour utiliser le thème</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur soulignement</Label>
          <Input
            type="color"
            value={blockData.accentColor || ''}
            onChange={(e) => updateField('accentColor', e.target.value || undefined)}
            placeholder="Thème par défaut"
          />
          <p className="text-[10px] text-gray-400">Laisser vide pour utiliser le thème</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Thème</Label>
        <Select
          value={blockData.theme || 'auto'}
          onValueChange={(value) => updateField('theme', value)}
        >
          <SelectTrigger className="h-10 px-3 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="light">Clair</SelectItem>
            <SelectItem value="dark">Sombre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <Label className="text-xs text-gray-600">Clients</Label>
          <p className="text-[11px] text-gray-400">Nom + image affichée au survol</p>
        </div>
        <Button variant="outline" size="sm" onClick={addItem}>
          + Ajouter un client
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-4">
            Ajoutez un client pour commencer.
          </div>
        )}

        {items.map((item, index) => (
          <div key={item.id || index} className="border border-gray-200 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[12px] font-medium text-gray-700">Client #{index + 1}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveItem(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, index + 1)}
                >
                  ↓
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700">
                  Supprimer
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Nom</Label>
                <Input
                  value={item.name || ''}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Visibilité</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!item.hidden}
                    onCheckedChange={(checked) => updateItem(index, { hidden: !checked })}
                  />
                  <span className="text-[12px] text-gray-500">{item.hidden ? 'Masqué' : 'Affiché'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Image</Label>
              <MediaUploader
                currentUrl={item.image?.src || ''}
                onUpload={(src) => updateItem(index, { image: { ...(item.image || {}), src } })}
              />
              <Input
                className="mt-2"
                value={item.image?.alt || ''}
                onChange={(e) => updateItem(index, { image: { ...(item.image || {}), alt: e.target.value } })}
                placeholder="Texte alternatif"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
