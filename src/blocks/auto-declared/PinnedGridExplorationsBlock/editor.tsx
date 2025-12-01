'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import ImageListEditor from '@/blocks/auto-declared/components/ImageListEditor';
import type { ImageItemData } from '@/blocks/auto-declared/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface PinnedGridExplorationsData {
  duration?: number;
  images?: Array<string | { src: string; alt?: string; aspectRatio?: string }>;
  globalAspect?: 'auto' | '1:1' | '3:2' | '4:3' | '16:9' | '2:1';
}

const demoImages = [
  '/blocks/pinned-grid-explorations/1.webp',
  '/blocks/pinned-grid-explorations/2.webp',
  '/blocks/pinned-grid-explorations/3.webp',
  '/blocks/pinned-grid-explorations/4.webp',
  '/blocks/pinned-grid-explorations/5.webp',
  '/blocks/pinned-grid-explorations/6.webp',
  '/blocks/pinned-grid-explorations/7.webp',
  '/blocks/pinned-grid-explorations/8.webp',
  '/blocks/pinned-grid-explorations/9.webp',
];

export default function PinnedGridExplorationsEditor({ data, onChange }: { data: PinnedGridExplorationsData; onChange: (data: PinnedGridExplorationsData) => void }) {
  const update = (field: keyof PinnedGridExplorationsData, value: any) => {
    onChange({ ...data, [field]: value });
  };
  const hasWarnedRef = useRef(false);

  const slots: ImageItemData[] = useMemo(() => {
    const base = Array.isArray(data.images) ? data.images : [];
    const filled = Array.from({ length: 9 }, (_, i) => base[i] || { id: `placeholder-${i}`, src: '', alt: '', aspectRatio: '16:9' });
    return filled.map((item, idx) => ({
      id: `slot-${idx}`,
      src: typeof item === 'string' ? item : item.src,
      alt: typeof item === 'string' ? '' : item.alt || '',
      aspectRatio: typeof item === 'string' ? '16:9' : item.aspectRatio || '16:9',
    }));
  }, [data.images]);
  const filledCount = slots.filter((s) => s.src && s.src.trim() !== '').length;

  useEffect(() => {
    if (filledCount < 9 && !hasWarnedRef.current) {
      toast.error('Ajoute 9 images avant de sauvegarder (pinned-grid-explorations).', {
        className: 'bg-red-600 text-white border border-red-700',
      });
      hasWarnedRef.current = true;
    }
    if (filledCount >= 9) {
      hasWarnedRef.current = false;
    }
  }, [filledCount]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted-foreground">Durée du scroll</label>
          <Select
            value={String(data.duration || 150)}
            onValueChange={(val) => update('duration', parseInt(val, 10))}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Durée" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="150">Court</SelectItem>
              <SelectItem value="250">Moyen</SelectItem>
              <SelectItem value="400">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted-foreground">Ratio global des items</label>
          <Select
            value={(data as any).globalAspect || '16:9'}
            onValueChange={(val) => update('globalAspect', val)}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="3:2">3:2</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="2:1">2:1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Images (9 slots, UI unifiée)</span>
          <span className={filledCount < 9 ? 'text-red-500' : 'text-gray-500'}>
            {filledCount}/9
          </span>
        </div>
        <ImageListEditor
          items={slots}
          onChange={(next) => {
            const cleaned = next.filter((img) => img.src && img.src.trim() !== '');
            update('images', cleaned);
          }}
          label="Images"
          compact
          defaultAspectRatio="16:9"
          altPlaceholder="Description (alt text)"
          showAspectRatio={false}
          maxItems={9}
        />
        <p className={`text-[11px] ${filledCount < 9 ? 'text-red-500' : 'text-gray-500'}`}>
          9 images fixes : remplacez-les, pas d’ajout au-delà. (Ajoutez les {9 - filledCount} manquantes avant de sauvegarder)
        </p>
      </div>
    </div>
  );
}
