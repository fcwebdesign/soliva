'use client';

import React, { useRef } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImagePlus, Trash2, Edit3 } from 'lucide-react';
import { useImageUpload } from './hooks/useImageUpload';

interface ImageThumbnailProps {
  /** URL de l'image actuelle (optionnel) */
  currentUrl?: string;
  /** Alt text pour l'image */
  alt?: string;
  /** Taille de la miniature (par défaut: 8 = 32px) */
  size?: 8 | 12 | 16;
  /** Callback quand une nouvelle image est uploadée */
  onUpload: (url: string) => void;
  /** Callback pour supprimer l'image */
  onRemove?: () => void;
  /** Callback pour éditer (ouvrir un accordion par exemple) */
  onEdit?: () => void;
  /** Empêcher la propagation des événements (utile dans les accordions) */
  stopPropagation?: boolean;
}

/**
 * Composant réutilisable pour afficher une miniature d'image avec dropdown
 * Gère l'upload, le remplacement et la suppression
 */
export default function ImageThumbnail({
  currentUrl,
  alt = 'Image',
  size = 8,
  onUpload,
  onRemove,
  onEdit,
  stopPropagation = true,
}: ImageThumbnailProps) {
  const { fileInputRef, isUploading, uploadImage, triggerFileSelect } = useImageUpload({
    onSuccess: (url) => {
      onUpload(url);
    },
    onError: (error) => {
      alert(error.message || 'Échec de l\'upload de l\'image.');
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
  };

  const sizeClasses = {
    8: 'w-8 h-8',
    12: 'w-12 h-12',
    16: 'w-16 h-16',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  if (currentUrl) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={`${sizeClasses[size]} border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
              onClick={handleClick}
              onPointerDown={handlePointerDown}
            >
              {isUploading ? (
                <span className="text-[10px] text-gray-400">...</span>
              ) : (
                <img
                  src={currentUrl}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 shadow-none border rounded">
            <DropdownMenuItem
              onClick={(e) => {
                if (stopPropagation) e.stopPropagation();
                triggerFileSelect();
              }}
              className="text-[13px] text-gray-700 hover:text-gray-900"
            >
              <ImagePlus className="w-3 h-3 mr-2" />
              Remplacer
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  if (stopPropagation) e.stopPropagation();
                  onEdit();
                }}
                className="text-[13px] text-gray-700 hover:text-gray-900"
              >
                <Edit3 className="w-3 h-3 mr-2" />
                Modifier
              </DropdownMenuItem>
            )}
            {onRemove && (
              <DropdownMenuItem
                onClick={(e) => {
                  if (stopPropagation) e.stopPropagation();
                  onRemove();
                }}
                className="text-[13px] text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          className="hidden"
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`${sizeClasses[size]} border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          triggerFileSelect();
        }}
        onPointerDown={handlePointerDown}
      >
        {isUploading ? (
          <span className="text-[10px] text-gray-400">...</span>
        ) : (
          <span className="text-[10px] text-gray-400">+</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        className="hidden"
      />
    </>
  );
}

