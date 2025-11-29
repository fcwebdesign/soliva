'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { ImageItemData, AspectRatioValue, ImageListEditor } from '@/blocks/auto-declared/components';

type CarouselImage = ImageItemData & {
  aspectRatio?: AspectRatioValue | string;
};

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
  const handleImagesChange = (items: CarouselImage[]) => {
    onChange({ ...data, images: items });
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

        <ImageListEditor
          items={images as CarouselImage[]}
          onChange={handleImagesChange}
          label="Images"
          compact
          defaultAspectRatio="16:9"
          altPlaceholder="Description (alt text)"
        />

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
        <ImageListEditor
          items={images as CarouselImage[]}
          onChange={handleImagesChange}
          label="Images"
          compact={false}
          defaultAspectRatio="16:9"
        />
      </div>
    </div>
  );
}
