'use client';

import React, { useRef } from 'react';
import { ImagePlus, Trash2, Edit3 } from 'lucide-react';
import { useImageUpload } from './hooks/useImageUpload';

interface ImageThumbnailProps {
  currentUrl?: string;
  alt?: string;
  size?: 8 | 12 | 16;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  onEdit?: () => void;
  stopPropagation?: boolean;
}

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
      alert(error.message || "Échec de l'upload de l'image.");
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

  const stop = (e: React.SyntheticEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const renderThumbContent = () => {
    if (isUploading) {
      return <span className="text-[10px] text-gray-400">...</span>;
    }
    if (currentUrl) {
      return <img src={currentUrl} alt={alt} className="w-full h-full object-cover" />;
    }
    return <span className="text-[10px] text-gray-400">+</span>;
  };

  return (
    <>
      <button
        type="button"
        className={`${sizeClasses[size]} border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
        onClick={(e) => {
          stop(e);
          if (!fileInputRef.current) {
            console.warn('[ImageThumbnail] fileInputRef is null, cannot open file dialog');
          }
          triggerFileSelect();
        }}
        onPointerDown={stop}
      >
        {renderThumbContent()}

        {(onRemove || onEdit) && currentUrl && (
          <div className="absolute top-1 right-1 flex gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 bg-white/80 rounded hover:bg-white transition"
                title="Modifier"
              >
                <Edit3 className="w-3 h-3 text-gray-600" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1 bg-white/80 rounded hover:bg-white transition"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        onClick={stop}
        onPointerDown={stop}
        className="hidden"
      />
    </>
  );
}
