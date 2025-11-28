'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { ImageThumbnail, useImageUpload } from '../components';

interface InfiniteTextScrollData {
  text?: string;
  speed?: number; // 0-100
  fontSize?: number; // Ancien champ (déprécié)
  size?: 'normal' | 'large'; // Taille prédéfinie (H2 / H1)
  position?: 'top' | 'center' | 'bottom';
  positionOffset?: number; // Offset en px
  color?: string; // Couleur du texte
  theme?: 'light' | 'dark' | 'auto';
  backgroundImage?: string; // Image de fond
}

export default function InfiniteTextScrollEditor({
  data,
  onChange,
  compact = false,
  context,
}: {
  data: InfiniteTextScrollData;
  onChange: (data: InfiniteTextScrollData) => void;
  compact?: boolean;
  context?: any;
}) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(!!data.backgroundImage);
  const { fileInputRef, isUploading, uploadImage, triggerFileSelect } = useImageUpload({
    onSuccess: (url) => {
      updateField('backgroundImage', url);
      setIsImageOpen(true);
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      alert('Échec de l\'upload de l\'image.');
    },
  });

  // Récupérer la palette actuelle depuis le contexte
  const currentPalette = useMemo(() => {
    if (!context) return null;
    try {
      return resolvePaletteFromContent(context);
    } catch {
      return null;
    }
  }, [context]);

  // Obtenir la couleur de fond de la palette
  const paletteBackgroundColor = currentPalette?.background || '#ffffff';
  // Taille actuelle (fallback sur l'ancien fontSize)
  const currentSize: 'normal' | 'large' =
    data.size || (typeof data.fontSize === 'number' && data.fontSize >= 120 ? 'large' : 'normal');

  const updateField = (field: keyof InfiniteTextScrollData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
  };

  useEffect(() => {
    if (!data.backgroundImage) {
      setIsImageOpen(false);
    }
  }, [data.backgroundImage]);

  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Texte</label>
            <input
              type="text"
              value={data.text || ''}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Freelance Developer -"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Vitesse (0-100)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 -mx-2 px-2">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[data.speed ?? 50]}
                    onValueChange={(values) => updateField('speed', values[0])}
                  />
                </div>
                <span className="text-[11px] text-gray-500 text-right flex-shrink-0 w-12">
                  {data.speed ?? 50}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Taille</label>
              <Select
                value={currentSize}
                onValueChange={(value) => updateField('size', value as any)}
                open={openSelect === 'size'}
                onOpenChange={(open) => setOpenSelect(open ? 'size' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="normal" className="text-[13px]">Normal (H2)</SelectItem>
                  <SelectItem value="large" className="text-[13px]">Large (H1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Couleur texte</label>
              <Select
                value={data.color || 'auto'}
                onValueChange={(value) => updateField('color', value === 'auto' ? undefined : value)}
                open={openSelect === 'color'}
                onOpenChange={(open) => setOpenSelect(open ? 'color' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="auto" className="text-[13px]">
                    Auto (Palette)
                  </SelectItem>
                  <SelectItem value="#ffffff" className="text-[13px]">Blanc</SelectItem>
                  <SelectItem value="#000000" className="text-[13px]">Noir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">
                Couleur de fond
                {currentPalette && (
                  <span className="ml-1 text-[9px] text-gray-500">
                    (Palette: {currentPalette.name})
                  </span>
                )}
              </label>
              <Select
                value={data.theme || 'auto'}
                onValueChange={(value) => updateField('theme', value as any)}
                open={openSelect === 'theme'}
                onOpenChange={(open) => setOpenSelect(open ? 'theme' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="auto" className="text-[13px]">
                    Auto {currentPalette && `(${paletteBackgroundColor})`}
                  </SelectItem>
                  <SelectItem value="light" className="text-[13px]">Blanc</SelectItem>
                  <SelectItem value="dark" className="text-[13px]">Noir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image + position (chevron) */}
          <div className="border border-gray-200 rounded overflow-hidden bg-white">
            <div className="flex items-center gap-2 py-2 px-3 bg-white border-b border-gray-200">
              <button
                type="button"
                className="w-4 h-4 flex items-center justify-center text-gray-400"
                onClick={() => data.backgroundImage && setIsImageOpen(!isImageOpen)}
                disabled={!data.backgroundImage}
              >
                {isImageOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
              <ImageThumbnail
                currentUrl={data.backgroundImage}
                alt="Image de fond"
                size={12}
                onUpload={(url) => {
                  updateField('backgroundImage', url);
                  setIsImageOpen(true);
                }}
                onRemove={() => {
                  updateField('backgroundImage', '');
                  setIsImageOpen(false);
                }}
                onEdit={() => setIsImageOpen(true)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-700">Image de fond</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {data.backgroundImage ? 'Gérer via la vignette' : 'Ajouter une image pour positionner le texte'}
                </p>
              </div>
              {!data.backgroundImage && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerFileSelect();
                  }}
                  disabled={isUploading}
                  className="text-[12px]"
                >
                  {isUploading ? 'Upload...' : 'Ajouter'}
                </Button>
              )}
            </div>

            {isImageOpen && data.backgroundImage && (
              <div className="px-3 pb-3 bg-gray-50 border-t border-gray-200 space-y-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Position du texte</label>
                  <Select
                    value={data.position || 'bottom'}
                    onValueChange={(value) => updateField('position', value as any)}
                    open={openSelect === 'position-image-compact'}
                    onOpenChange={(open) => setOpenSelect(open ? 'position-image-compact' : null)}
                  >
                    <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="shadow-none border rounded">
                      <SelectItem value="top" className="text-[13px]">Haut</SelectItem>
                      <SelectItem value="center" className="text-[13px]">Centre</SelectItem>
                      <SelectItem value="bottom" className="text-[13px]">Bas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Offset position (px)</label>
                  <input
                    type="number"
                    value={data.positionOffset || 0}
                    onChange={(e) => updateField('positionOffset', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="block-editor space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Texte</Label>
          <Input
            type="text"
            value={data.text || ''}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Freelance Developer -"
            className="w-full mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Couleur de fond</Label>
          <Select
            value={data.theme || 'auto'}
            onValueChange={(value) => updateField('theme', value as any)}
            open={openSelect === 'theme-full'}
            onOpenChange={(open) => setOpenSelect(open ? 'theme-full' : null)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="light">Blanc</SelectItem>
              <SelectItem value="dark">Noir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Vitesse (0-100)</Label>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 -mx-2 px-2">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[data.speed ?? 50]}
                onValueChange={(values) => updateField('speed', values[0])}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
              {data.speed ?? 50}
            </span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Taille</Label>
          <Select
            value={currentSize}
            onValueChange={(value) => updateField('size', value as any)}
            open={openSelect === 'size-full'}
            onOpenChange={(open) => setOpenSelect(open ? 'size-full' : null)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (H2)</SelectItem>
              <SelectItem value="large">Large (H1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Couleur texte</Label>
          <Select
            value={data.color || 'auto'}
            onValueChange={(value) => updateField('color', value === 'auto' ? undefined : value)}
            open={openSelect === 'color-full'}
            onOpenChange={(open) => setOpenSelect(open ? 'color-full' : null)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Palette)</SelectItem>
              <SelectItem value="#ffffff">Blanc</SelectItem>
              <SelectItem value="#000000">Noir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label className="text-sm font-medium text-gray-700">Image de fond</Label>
          <div className="mt-2 border border-gray-200 rounded overflow-hidden bg-white">
            <div className="flex items-center gap-3 p-3 bg-white border-b border-gray-200">
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center text-gray-400"
                onClick={() => data.backgroundImage && setIsImageOpen(!isImageOpen)}
                disabled={!data.backgroundImage}
              >
                {isImageOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <ImageThumbnail
                currentUrl={data.backgroundImage}
                alt="Image de fond"
                size={12}
                onUpload={(url) => {
                  updateField('backgroundImage', url);
                  setIsImageOpen(true);
                }}
                onRemove={() => {
                  updateField('backgroundImage', '');
                  setIsImageOpen(false);
                }}
                onEdit={() => setIsImageOpen(true)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">Image de fond</p>
                <p className="text-xs text-gray-500 truncate">
                  {data.backgroundImage ? 'Gérer l’image via la vignette' : 'Ajouter une image pour positionner le texte'}
                </p>
              </div>
              {!data.backgroundImage && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerFileSelect();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? 'Upload...' : 'Ajouter'}
                </Button>
              )}
            </div>

            {isImageOpen && data.backgroundImage && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Position du texte</Label>
                  <Select
                    value={data.position || 'bottom'}
                    onValueChange={(value) => updateField('position', value as any)}
                    open={openSelect === 'position-image-full'}
                    onOpenChange={(open) => setOpenSelect(open ? 'position-image-full' : null)}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Haut</SelectItem>
                      <SelectItem value="center">Centre</SelectItem>
                      <SelectItem value="bottom">Bas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Offset position (px)</Label>
                  <Input
                    type="number"
                    value={data.positionOffset || 0}
                    onChange={(e) => updateField('positionOffset', parseInt(e.target.value) || 0)}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
