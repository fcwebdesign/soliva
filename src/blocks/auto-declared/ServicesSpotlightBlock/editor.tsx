'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { toast } from 'sonner';

type SpotlightItem = {
  id?: string;
  title: string;
  indicator?: string;
  image?: { src?: string; alt?: string };
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
}: {
  data: ServicesSpotlightData;
  onChange: (data: ServicesSpotlightData) => void;
}) {
  const [items, setItems] = useState<SpotlightItem[]>(data.items && data.items.length ? data.items : FALLBACK_ITEMS);

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

  const updateImageField = (index: number, value: { src?: string; alt?: string }) => {
    const next = items.map((item, i) => (i === index ? { ...item, image: { ...item.image, ...value } } : item));
    updateItems(next);
  };

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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Items</Label>
          <Button variant="outline" size="sm" onClick={addItem} className="h-8 px-2 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id || index} className="border border-gray-200 rounded p-3 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>Item {index + 1}</span>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 'up')}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 'down')}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Titre</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItemField(index, 'title', e.target.value)}
                  placeholder="Camera Work"
                />
              </div>

              <div className="grid gap-2">
                <Label>Indicateur</Label>
                <Input
                  value={item.indicator || ''}
                  onChange={(e) => updateItemField(index, 'indicator', e.target.value)}
                  placeholder="[ Framing ]"
                />
              </div>

              <div className="grid gap-2">
                <Label>Image</Label>
                <MediaUploader
                  value={item.image?.src || ''}
                  onChange={(url) => updateImageField(index, { src: url })}
                  compact
                />
                <Input
                  value={item.image?.alt || ''}
                  onChange={(e) => updateImageField(index, { alt: e.target.value })}
                  placeholder="Texte alternatif"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
