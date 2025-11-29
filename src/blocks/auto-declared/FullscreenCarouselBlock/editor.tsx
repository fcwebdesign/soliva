'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';

interface CarouselImage {
  src?: string;
  alt?: string;
}

interface FullscreenCarouselData {
  title?: string;
  images?: CarouselImage[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function FullscreenCarouselEditor({
  data,
  onChange,
  compact = false,
  context,
}: {
  data: FullscreenCarouselData;
  onChange: (data: FullscreenCarouselData) => void;
  compact?: boolean;
  context?: any;
}) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const currentPalette = useMemo(() => {
    if (!context) return null;
    try {
      return resolvePaletteFromContent(context);
    } catch {
      return null;
    }
  }, [context]);

  const images = data.images || [];

  const updateImage = (index: number, field: keyof CarouselImage, value: string) => {
    const next = images.map((img, i) => (i === index ? { ...img, [field]: value } : img));
    onChange({ ...data, images: next });
  };

  const addImage = () => {
    onChange({ ...data, images: [...images, { src: '', alt: '' }] });
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange({ ...data, images: next });
  };

  if (compact) {
    return (
      <div className="block-editor space-y-3">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="More on this campaign"
            className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] text-gray-400">Images</label>
          {images.map((img, idx) => (
            <div key={idx} className="border border-gray-200 rounded p-2 space-y-2">
              <input
                type="text"
                value={img.src || ''}
                onChange={(e) => updateImage(idx, 'src', e.target.value)}
                placeholder="URL de l'image"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                placeholder="Texte alternatif"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeImage(idx)}
                className="text-[12px] text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Supprimer
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={addImage} className="w-full text-[12px]">
            <Plus className="h-3 w-3 mr-1" /> Ajouter une image
          </Button>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Thème
            {currentPalette && (
              <span className="ml-1 text-[9px] text-gray-500">
                (Palette: {currentPalette.name})
              </span>
            )}
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
            className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          >
            <option value="auto">Auto</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="block-editor space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Titre</Label>
          <Input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="More on this campaign"
            className="w-full mt-2"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Thème</Label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
            className="w-full mt-2 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="auto">Auto</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Images</Label>
          <Button type="button" size="sm" variant="outline" onClick={addImage}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={idx} className="border border-gray-200 rounded p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Image URL</Label>
                  <Input
                    type="text"
                    value={img.src || ''}
                    onChange={(e) => updateImage(idx, 'src', e.target.value)}
                    placeholder="https://..."
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Alt</Label>
                  <Input
                    type="text"
                    value={img.alt || ''}
                    onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                    placeholder="Texte alternatif"
                    className="w-full mt-1"
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeImage(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            </div>
          ))}
          {!images.length && (
            <div className="text-sm text-gray-500">Aucune image. Ajoutez-en une pour commencer.</div>
          )}
        </div>
      </div>
    </div>
  );
}
