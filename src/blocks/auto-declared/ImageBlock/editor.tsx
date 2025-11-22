'use client';
import React, { useRef, useState } from 'react';
import MediaUploader from '@/app/admin/components/MediaUploader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImageIcon, Trash2 } from 'lucide-react';

interface ImageBlockEditorProps {
  data: {
    id: string;
    type: string;
    image?: {
      src: string;
      alt: string;
    };
  };
  onChange: (updates: any) => void;
  compact?: boolean;
}

export default function ImageBlockEditor({ data, onChange, compact = false }: ImageBlockEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateBlock = (updates: any) => {
    onChange(updates);
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
      updateBlock({ image: { ...data.image, src: uploadData.url } });
    } catch (err) {
      console.error('Erreur upload:', err);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageClick = () => {
    if (!data.image?.src) {
      // Pas d'image : ouvrir directement le sélecteur
      fileInputRef.current?.click();
    }
    // Si image : le DropdownMenu s'ouvrira
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    updateBlock({ image: { src: '', alt: data.image?.alt || '' } });
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Image</label>
            {data.image?.src ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    className="w-full border border-gray-200 rounded flex items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors relative overflow-hidden"
                    style={{ minHeight: '120px' }}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <img 
                      src={data.image.src} 
                      alt={data.image.alt || 'Image'} 
                      className="w-full h-auto max-h-[200px] object-contain p-2"
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
                className="w-full border border-gray-200 border-dashed rounded flex items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors"
                style={{ minHeight: '120px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick();
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-[13px] text-gray-400">+ Cliquer pour ajouter une image</span>
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
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Description (alt text)</label>
            <input
              type="text"
              value={data.image?.alt || ''}
              onChange={(e) => updateBlock({ image: { ...data.image, alt: e.target.value } })}
              placeholder="Image description"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor">
      <MediaUploader
        currentUrl={data.image?.src || ''}
        onUpload={(src) => updateBlock({ image: { ...data.image, src } })}
      />
      <input
        type="text"
        value={data.image?.alt || ''}
        onChange={(e) => updateBlock({ image: { ...data.image, alt: e.target.value } })}
        placeholder="Description de l'image (alt text)"
        className="block-input"
      />
    </div>
  );
}
