'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ImageListEditor } from '../components';
import type { ImageItemData } from '../components';
import { toast } from 'sonner';

type SpotlightItem = {
  id?: string;
  title: string;
  indicator?: string;
  image?: { src?: string; alt?: string; aspectRatio?: string };
};

interface ServicesSpotlightData {
  title?: string;
  kicker?: string;
  indicatorLabel?: string;
  items?: SpotlightItem[];
  showIndicator?: boolean;
}

const FALLBACK_ITEMS: SpotlightItem[] = [
  { title: 'Camera Work', indicator: '[ Framing ]', image: { src: '/blocks/services-spotlight/spotlight-1.jpg', alt: 'Camera work' } },
  { title: 'Visual Direction', indicator: '[ Vision ]', image: { src: '/blocks/services-spotlight/spotlight-2.jpg', alt: 'Visual direction' } },
  { title: 'Sound Design', indicator: '[ Resonance ]', image: { src: '/blocks/services-spotlight/spotlight-3.jpg', alt: 'Sound design' } },
  { title: 'Film Editing', indicator: '[ Sequence ]', image: { src: '/blocks/services-spotlight/spotlight-4.jpg', alt: 'Film editing' } },
];

export default function ServicesSpotlightEditor({
  data,
  onChange,
  compact = false,
}: {
  data: ServicesSpotlightData;
  onChange: (data: ServicesSpotlightData) => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState<SpotlightItem[]>(data.items && data.items.length ? data.items : FALLBACK_ITEMS);

  useEffect(() => {
    setItems(data.items && data.items.length ? data.items : FALLBACK_ITEMS);
  }, [data.items]);

  const imageItems: ImageItemData[] = useMemo(
    () =>
      items.map((item, idx) => ({
        id: item.id || `spot-${idx}`,
        src: item.image?.src || '',
        alt: item.image?.alt || item.title || '',
        aspectRatio: item.image?.aspectRatio || '16:9',
      })),
    [items]
  );

  const updateItems = (next: SpotlightItem[]) => {
    setItems(next);
    onChange({ ...data, items: next });
  };

  const addItem = () => {
    const next = [
      ...items,
      {
        id: `spot-${Date.now()}`,
        title: `New item ${items.length + 1}`,
        indicator: '[ Indicator ]',
        image: {},
      },
    ];
    updateItems(next);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.warning('Au moins un item est requis.');
      return;
    }
    const next = items.filter((_, i) => i !== index);
    updateItems(next);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [current] = next.splice(index, 1);
    next.splice(target, 0, current);
    updateItems(next);
  };

  const updateItemField = (index: number, field: keyof SpotlightItem, value: any) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    updateItems(next);
  };

  const syncImages = (nextImages: ImageItemData[]) => {
    const next = nextImages.map((img, idx) => {
      const existingById = items.find((it, i) => (it.id || `spot-${i}`) === img.id);
      const base = existingById || items[idx] || { title: `Item ${idx + 1}`, indicator: '[ Indicator ]' };
      return {
        ...base,
        id: img.id || base.id || `spot-${idx}`,
        image: { src: img.src, alt: img.alt, aspectRatio: img.aspectRatio },
      };
    });
    updateItems(next);
  };

  const labelClass = compact ? 'block text-[10px] text-gray-400 mb-1' : 'block text-sm font-medium text-gray-700';
  const inputClass = compact
    ? 'w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors'
    : 'block-input';
  const textareaClass = compact
    ? 'w-full px-2 py-2 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none resize-none transition-colors min-h-[80px]'
    : 'block-input';

  const ItemsList = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className={compact ? 'text-[11px] font-medium' : 'text-sm font-medium'}>Items</Label>
        {compact ? (
          <button type="button" className="text-[12px] text-blue-600 hover:underline" onClick={addItem}>
            + Ajouter
          </button>
        ) : (
          <Button variant="outline" size="sm" onClick={addItem} className="h-8 px-2 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Ajouter
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className={compact ? 'border border-gray-200 rounded p-2 space-y-2' : 'border border-gray-200 rounded p-3 space-y-3'}
          >
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>Item {index + 1}</span>
              <div className="ml-auto flex items-center gap-2">
                {compact ? (
                  <>
                    <button type="button" onClick={() => moveItem(index, 'up')} className="text-gray-500 hover:text-gray-800">↑</button>
                    <button type="button" onClick={() => moveItem(index, 'down')} className="text-gray-500 hover:text-gray-800">↓</button>
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600">Suppr</button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 'up')}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 'down')}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label className={labelClass}>Titre</label>
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) => updateItemField(index, 'title', e.target.value)}
                placeholder="Camera Work"
              />
            </div>

            <div className="grid gap-2">
              <label className={labelClass}>Indicateur</label>
              <input
                className={inputClass}
                value={item.indicator || ''}
                onChange={(e) => updateItemField(index, 'indicator', e.target.value)}
                placeholder="[ Framing ]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <div>
          <label className={labelClass}>Kicker</label>
          <input
            className={inputClass}
            value={data.kicker ?? '[ Discover ]'}
            onChange={(e) => onChange({ ...data, kicker: e.target.value })}
            placeholder="[ Discover ]"
          />
        </div>

        <div>
          <label className={labelClass}>Titre</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={data.title ?? 'Inside The Studio'}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Inside The Studio"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="showIndicator"
            checked={data.showIndicator !== false}
            onCheckedChange={(checked) => onChange({ ...data, showIndicator: checked })}
            className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
          />
          <label htmlFor="showIndicator" className="text-[10px] font-medium">Afficher l'indicateur</label>
        </div>

        <ImageListEditor
          label="Images (ordre = items)"
          compact
          items={imageItems}
          onChange={syncImages}
          defaultAspectRatio="16:9"
          altPlaceholder="Texte alternatif"
        />

        <ItemsList />
      </div>
    );
  }

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="grid gap-3">
        <Label htmlFor="kicker">Kicker</Label>
        <Input
          id="kicker"
          value={data.kicker ?? '[ Discover ]'}
          onChange={(e) => onChange({ ...data, kicker: e.target.value })}
          placeholder="[ Discover ]"
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="title">Titre</Label>
        <Textarea
          id="title"
          value={data.title ?? 'Inside The Studio'}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Inside The Studio"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="showIndicator"
          checked={data.showIndicator !== false}
          onCheckedChange={(checked) => onChange({ ...data, showIndicator: checked })}
          className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
        />
        <Label htmlFor="showIndicator" className="text-[10px] font-medium">Afficher l'indicateur</Label>
      </div>

      <ImageListEditor
        label="Images (ordre = items)"
        items={imageItems}
        onChange={syncImages}
        defaultAspectRatio="16:9"
        altPlaceholder="Texte alternatif"
      />

      <ItemsList />
    </div>
  );
}
