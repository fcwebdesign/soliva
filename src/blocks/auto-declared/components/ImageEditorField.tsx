'use client';

import React, { useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useImageUpload } from './hooks/useImageUpload';
import { AspectRatioSelect, AspectRatioValue } from './AspectRatioSelect';
import type { ImageData } from './ReusableImage';

interface ImageEditorFieldProps {
  /** Données de l'image actuelle */
  image: ImageData;
  /** Callback quand l'image est mise à jour */
  onChange: (image: ImageData) => void;
  /** Mode compact pour l'éditeur visuel */
  compact?: boolean;
  /** Afficher le champ aspect ratio */
  showAspectRatio?: boolean;
  /** Afficher le champ alt text */
  showAltText?: boolean;
  /** Label personnalisé */
  label?: string;
  /** Taille de la miniature */
  thumbnailSize?: 8 | 12 | 16;
}

/**
 * Composant admin réutilisable pour éditer une image
 * Gère l'upload, le remplacement, la suppression, alt text et aspect ratio
 */
export default function ImageEditorField({
  image,
  onChange,
  compact = false,
  showAspectRatio = true,
  showAltText = true,
  label,
  thumbnailSize = 12,
}: ImageEditorFieldProps) {
  const { fileInputRef, isUploading, uploadImage, triggerFileSelect } = useImageUpload({
    onSuccess: (url) => {
      onChange({ ...image, src: url });
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

  const handleRemove = () => {
    onChange({ src: '', alt: '', aspectRatio: 'auto' });
  };

  // Mode compact pour l'éditeur visuel
  if (compact) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-[10px] text-gray-400 mb-1">{label}</label>
        )}
        
        <div className="flex items-center gap-2">
          {/* Miniature avec dropdown */}
          {image.src ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`${sizeClasses[thumbnailSize]} border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {isUploading ? (
                    <span className="text-[10px] text-gray-400">...</span>
                  ) : (
                    <img
                      src={image.src}
                      alt={image.alt || 'Image'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 shadow-none border rounded">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileSelect();
                  }}
                  className="text-[13px] text-gray-700 hover:text-gray-900"
                >
                  <ImagePlus className="w-3 h-3 mr-2" />
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
              className={`${sizeClasses[thumbnailSize]} border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                triggerFileSelect();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {isUploading ? (
                <span className="text-[10px] text-gray-400">...</span>
              ) : (
                <span className="text-[10px] text-gray-400">+</span>
              )}
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

          {/* Alt text */}
          {showAltText && (
            <Input
              type="text"
              value={image.alt || ''}
              onChange={(e) => {
                onChange({ ...image, alt: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Description (alt text)"
              className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          )}

          {/* Aspect ratio */}
          {showAspectRatio && (
            <AspectRatioSelect
              value={(image.aspectRatio || 'auto') as AspectRatioValue}
              onValueChange={(value) => {
                onChange({ ...image, aspectRatio: value });
              }}
              size="compact"
            />
          )}
        </div>
      </div>
    );
  }

  // Mode normal pour le BO classique
  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      
      <div className="flex items-start gap-4">
        {/* Miniature */}
        {image.src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-24 h-24 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors">
                {isUploading ? (
                  <span className="text-xs text-gray-400">...</span>
                ) : (
                  <img
                    src={image.src}
                    alt={image.alt || 'Image'}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={triggerFileSelect}>
                <ImagePlus className="w-4 h-4 mr-2" />
                Remplacer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRemove} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            className="w-24 h-24 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={triggerFileSelect}
          >
            {isUploading ? (
              <span className="text-xs text-gray-400">...</span>
            ) : (
              <span className="text-xs text-gray-400">+</span>
            )}
          </div>
        )}

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Champs de saisie */}
        <div className="flex-1 space-y-3">
          {showAltText && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Texte alternatif</Label>
              <Input
                type="text"
                value={image.alt || ''}
                onChange={(e) => {
                  onChange({ ...image, alt: e.target.value });
                }}
                placeholder="Description de l'image (alt text)"
                className="mt-2"
              />
            </div>
          )}

          {showAspectRatio && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Ratio d'aspect</Label>
              <AspectRatioSelect
                value={(image.aspectRatio || 'auto') as AspectRatioValue}
                onValueChange={(value) => {
                  onChange({ ...image, aspectRatio: value });
                }}
                size="normal"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

