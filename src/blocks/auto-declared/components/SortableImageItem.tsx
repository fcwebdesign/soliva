'use client';

import React from 'react';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageThumbnail from './ImageThumbnail';
import AspectRatioSelect, { AspectRatioValue } from './AspectRatioSelect';

export interface ImageItemData {
  id?: string;
  src?: string;
  alt?: string;
  title?: string;
  aspectRatio?: AspectRatioValue | string;
  hidden?: boolean;
  [key: string]: any; // Permet d'ajouter d'autres champs
}

interface SortableImageItemProps<T extends ImageItemData> {
  /** Données de l'image */
  item: T;
  /** Index dans la liste */
  index: number;
  /** Mode compact (pour l'éditeur visuel) */
  compact?: boolean;
  /** Callback pour mettre à jour un champ */
  onUpdate: (field: keyof T, value: any) => void;
  /** Callback pour supprimer l'item */
  onRemove: () => void;
  /** Callback pour toggle la visibilité */
  onToggleVisibility?: () => void;
  /** Contrôle l'ouverture du select aspect ratio (pour éviter les conflits) */
  openSelect?: string | null;
  /** Callback quand l'ouverture du select change */
  onOpenSelectChange?: (value: string | null) => void;
  /** Champs supplémentaires à afficher sur la ligne (mode compact) */
  compactFields?: Array<{
    key: keyof T;
    placeholder?: string;
    label?: string;
  }>;
  /** Contenu à afficher dans l'accordion (mode compact) */
  accordionContent?: React.ReactNode;
  /** ID pour le sortable (par défaut: item.id ou généré) */
  sortableId?: string;
}

/**
 * Composant générique et réutilisable pour un item image sortable
 * Utilisable dans ImageBlock, GalleryGrid, ScrollSlider, etc.
 */
export default function SortableImageItem<T extends ImageItemData>({
  item,
  index,
  compact = false,
  onUpdate,
  onRemove,
  onToggleVisibility,
  openSelect,
  onOpenSelectChange,
  compactFields = [],
  accordionContent,
  sortableId,
}: SortableImageItemProps<T>) {
  const id = sortableId || item.id || `item-${index}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.6 : 1,
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`border border-gray-200 rounded overflow-hidden bg-white ${item.hidden ? 'opacity-50' : ''}`}
      >
        {/* Ligne principale */}
        <div className="flex items-center gap-2 py-1 px-2 bg-white border-b border-gray-200 group">
          <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" {...attributes} {...listeners} />
          
          {/* Miniature */}
          <ImageThumbnail
            currentUrl={item.src}
            alt={item.alt || item.title || 'Image'}
            size={8}
            onUpload={(url) => onUpdate('src' as keyof T, url)}
            onRemove={onRemove}
            stopPropagation={true}
          />

          {/* Champs compacts personnalisables */}
          {compactFields.map((field) => (
            <input
              key={String(field.key)}
              type="text"
              value={String(item[field.key] || '')}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(field.key, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder={field.placeholder || String(field.key)}
              className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          ))}

          {/* Select ratio d'aspect (si présent) */}
          {item.hasOwnProperty('aspectRatio') && (
            <AspectRatioSelect
              value={item.aspectRatio as AspectRatioValue}
              onValueChange={(value) => onUpdate('aspectRatio' as keyof T, value)}
              open={openSelect === `aspect-${index}`}
              onOpenChange={(open) => {
                if (onOpenSelectChange) {
                  onOpenSelectChange(open ? `aspect-${index}` : null);
                }
              }}
              size="compact"
              stopPropagation={true}
            />
          )}

          {/* Actions hover */}
          {(onToggleVisibility || onRemove) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onToggleVisibility && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility();
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={item.hidden ? 'Afficher' : 'Masquer'}
                >
                  {item.hidden ? (
                    <EyeOff className="w-3 h-3 text-gray-500" />
                  ) : (
                    <Eye className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              )}
              {onRemove && (
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
              )}
            </div>
          )}
        </div>

        {/* Accordion content (si fourni) */}
        {accordionContent && (
          <div className="border-t border-gray-200 p-2 space-y-2 bg-gray-50">
            {accordionContent}
          </div>
        )}
      </div>
    );
  }

  // Mode non-compact (BO classique)
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-md space-y-4 bg-white"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Item #{index + 1}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-red-600 text-sm">
            Supprimer
          </button>
        )}
      </div>

      {/* Miniature avec upload */}
      <div className="flex items-center gap-4">
        <ImageThumbnail
          currentUrl={item.src}
          alt={item.alt || item.title || 'Image'}
          size={16}
          onUpload={(url) => onUpdate('src' as keyof T, url)}
          onRemove={onRemove}
          stopPropagation={false}
        />
        <div className="flex-1 space-y-2">
          {compactFields.map((field) => (
            <div key={String(field.key)}>
              <label className="block text-xs text-gray-500 mb-1">
                {field.label || String(field.key)}
              </label>
              <input
                type="text"
                value={String(item[field.key] || '')}
                onChange={(e) => onUpdate(field.key, e.target.value)}
                placeholder={field.placeholder || String(field.key)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Select ratio si présent */}
      {item.hasOwnProperty('aspectRatio') && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ratio d'aspect</label>
          <AspectRatioSelect
            value={item.aspectRatio as AspectRatioValue}
            onValueChange={(value) => onUpdate('aspectRatio' as keyof T, value)}
            size="normal"
            stopPropagation={false}
          />
        </div>
      )}

      {/* Contenu supplémentaire */}
      {accordionContent}
    </div>
  );
}

