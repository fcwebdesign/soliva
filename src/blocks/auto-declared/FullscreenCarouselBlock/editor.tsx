'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  gap?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
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
          defaultAspectRatio="2:3"
          altPlaceholder="Description (alt text)"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Thème
              {currentPalette && (
                <span className="ml-1 text-[9px] text-gray-500">
                  (Palette: {currentPalette.name})
                </span>
              )}
            </label>
            <Select
              value={data.theme || 'auto'}
              onValueChange={(value) => onChange({ ...data, theme: value as any })}
              open={openSelect === 'theme'}
              onOpenChange={(open) => setOpenSelect(open ? 'theme' : null)}
            >
              <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border rounded">
                <SelectItem value="auto" className="text-[13px]">Auto</SelectItem>
                <SelectItem value="light" className="text-[13px]">Clair</SelectItem>
                <SelectItem value="dark" className="text-[13px]">Sombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Espacement</label>
            <Select
              value={data.gap || 'medium'}
              onValueChange={(value) => onChange({ ...data, gap: value as any })}
              open={openSelect === 'gap'}
              onOpenChange={(open) => setOpenSelect(open ? 'gap' : null)}
            >
              <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border rounded">
                <SelectItem value="small" className="text-[13px]">Petit</SelectItem>
                <SelectItem value="medium" className="text-[13px]">Moyen</SelectItem>
                <SelectItem value="large" className="text-[13px]">Grand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Fullscreen
            </label>
            <p className="text-[10px] text-gray-500">
              Le carousel prend toute la largeur de l'écran (bord à bord)
            </p>
          </div>
          <Switch
            checked={data.fullscreen || false}
            onCheckedChange={(checked) => {
              console.log('🔧 [FullscreenCarouselEditor] Switch fullscreen changed:', { checked, currentData: data });
              onChange({ ...data, fullscreen: checked });
            }}
            className="ml-4"
          />
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
          <Select
            value={data.theme || 'auto'}
            onValueChange={(value) => onChange({ ...data, theme: value as any })}
            open={openSelect === 'theme-full'}
            onOpenChange={(open) => setOpenSelect(open ? 'theme-full' : null)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="light">Clair</SelectItem>
              <SelectItem value="dark">Sombre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Espacement</Label>
          <Select
            value={data.gap || 'medium'}
            onValueChange={(value) => onChange({ ...data, gap: value as any })}
            open={openSelect === 'gap-full'}
            onOpenChange={(open) => setOpenSelect(open ? 'gap-full' : null)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="large">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-sm">Fullscreen</Label>
            <p className="text-[11px] text-gray-500 leading-snug">Le carousel prend toute la largeur de l'écran (bord à bord)</p>
          </div>
          <Switch
            checked={!!data.fullscreen}
            onCheckedChange={(checked) => {
              console.log('🔧 [FullscreenCarouselEditor] Switch fullscreen changed (full):', { checked, currentData: data });
              onChange({ ...data, fullscreen: checked });
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <ImageListEditor
          items={images as CarouselImage[]}
          onChange={handleImagesChange}
          label="Images"
          compact={false}
          defaultAspectRatio="2:3"
        />
      </div>
    </div>
  );
}
