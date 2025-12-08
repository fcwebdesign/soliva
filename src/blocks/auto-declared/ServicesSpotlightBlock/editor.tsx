'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import { ImageEditorField } from '../components';
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
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setItems(data.items && data.items.length ? data.items : FALLBACK_ITEMS);
  }, [data.items]);

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

      <div className="space-y-2">
        {items.map((item, index) => {
          const isOpen = openId === (item.id || `spot-${index}`);
          return (
            <div
              key={item.id || index}
              className="border border-gray-200 rounded bg-white"
            >
              <button
                type="button"
                className={`w-full flex items-center gap-2 ${compact ? 'py-2 px-2' : 'py-3 px-3'} text-left hover:bg-gray-50 transition-colors`}
                onClick={() => setOpenId(isOpen ? null : item.id || `spot-${index}`)}
              >
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 border border-gray-200 rounded bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.image?.src ? (
                      <img src={item.image.src} alt={item.image.alt || item.title || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Img</span>
                    )}
                  </div>
                  <span className="text-[13px] text-gray-900 truncate">{item.title || `Item ${index + 1}`}</span>
                </div>
                {compact ? (
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <button type="button" onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}>↑</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}>↓</button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                      className="text-red-500"
                    >
                      Suppr
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </button>

              {isOpen && (
                <div className={compact ? 'p-2 space-y-2' : 'p-3 space-y-3'}>
                  <ImageEditorField
                    label="Image"
                    value={{
                      src: item.image?.src || '',
                      alt: item.image?.alt || '',
                      aspectRatio: item.image?.aspectRatio || '16:9',
                    }}
                    onChange={(img) =>
                      updateItemField(index, 'image', {
                        src: img.src,
                        alt: img.alt,
                        aspectRatio: img.aspectRatio,
                      })
                    }
                    compact={compact}
                    altPlaceholder="Texte alternatif"
                    defaultAspectRatio="16:9"
                  />

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
              )}
            </div>
          );
        })}
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

      <ItemsList />
    </div>
  );
}
