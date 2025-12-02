'use client';

import React, { useMemo, useState } from 'react';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SortableImageItem, { ImageItemData } from '@/blocks/auto-declared/components/SortableImageItem';

type StickyItem = ImageItemData & {
  text?: string;
  background?: string;
};

interface StickySectionsData {
  headingTitle?: string;
  headingSubtitle?: string;
  introText?: string;
  outroText?: string;
  items?: StickyItem[];
}

const palette = ['#2f251e', '#43392f', '#2f251e', '#43392f', '#2f251e', '#43392f'];

const defaultItems: StickyItem[] = [
  {
    id: 'item-1',
    src: 'https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9430460_11zon.jpg',
    alt: 'Portrait',
    title: 'The Algorithm',
    text: "The algorithm's workings are shrouded in complexity, and its decision-making processes are inscrutable to the general populace.",
    background: palette[0],
  },
  {
    id: 'item-2',
    src: 'https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9421335_11zon.jpg',
    alt: 'Close-up',
    title: 'The Dogma',
    text: 'The digital gospel etched into the very code of the algorithmic society, served as the bedrock of the cognitive regime.',
    background: palette[1],
  },
  {
    id: 'item-3',
    src: 'https://moussamamadou.github.io/scroll-trigger-gsap-section/images/pexels-cottonbro-9489270_11zon.jpg',
    alt: 'Portrait 2',
    title: 'The Architects',
    text: 'The elusive entities, lacking human form, operate in the shadows, skillfully shaping societal norms through the complex interplay of algorithms and Dogmas.',
    background: palette[2],
  },
];

export default function StickySectionsCodropsEditor({
  data,
  onChange,
}: {
  data: StickySectionsData;
  onChange: (data: StickySectionsData) => void;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const items: StickyItem[] = useMemo(() => {
    const base = Array.isArray(data.items) && data.items.length ? data.items : defaultItems;
    return base.map((item, idx) => ({
      ...item,
      id: item.id || `item-${idx}`,
      background: item.background || palette[idx % palette.length],
    }));
  }, [data.items]);

  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const update = (field: keyof StickySectionsData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateItems = (next: StickyItem[]) => {
    update('items', next);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((img) => (img.id || '') === active.id);
    const newIndex = items.findIndex((img) => (img.id || '') === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    updateItems(arrayMove(items, oldIndex, newIndex));
  };

  const addItem = () => {
    const next: StickyItem = {
      id: `item-${Date.now()}`,
      src: '',
      alt: '',
      title: '',
      text: '',
      background: palette[items.length % palette.length],
    };
    updateItems([...items, next]);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateItems(next);
  };

  const updateItem = (index: number, payload: Partial<StickyItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...payload } : item));
    updateItems(next);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Titre</Label>
          <Input
            value={data.headingTitle || ''}
            onChange={(e) => update('headingTitle', e.target.value)}
            placeholder="Sticky Sections"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Sous-titre</Label>
          <Input
            value={data.headingSubtitle || ''}
            onChange={(e) => update('headingSubtitle', e.target.value)}
            placeholder="An exploration..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Texte intro</Label>
          <Textarea
            rows={3}
            value={data.introText || ''}
            onChange={(e) => update('introText', e.target.value)}
            placeholder="Texte introductif (facultatif)"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Texte outro</Label>
          <Textarea
            rows={3}
            value={data.outroText || ''}
            onChange={(e) => update('outroText', e.target.value)}
            placeholder="Texte de sortie (facultatif)"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Sections sticky</Label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            Ajouter une section
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((img) => img.id || '')} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <SortableImageItem
                  key={item.id || `item-${idx}`}
                  item={item}
                  index={idx}
                  compact
                  onUpdate={(field, value) => updateItem(idx, { [field]: value } as Partial<StickyItem>)}
                  onRemove={() => removeItem(idx)}
                  openSelect={openSelect}
                  onOpenSelectChange={setOpenSelect}
                  compactFields={[
                    { key: 'title', placeholder: 'Titre' },
                  ]}
                  accordionContent={
                    <div className="space-y-2">
                      <div>
                        <Label className="text-[11px] text-gray-500">Texte</Label>
                        <Textarea
                          rows={3}
                          value={item.text || ''}
                          onChange={(e) => updateItem(idx, { text: e.target.value })}
                          placeholder="Texte de la section"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-gray-500">Couleur de fond</Label>
                        <Input
                          type="color"
                          value={item.background || palette[idx % palette.length]}
                          onChange={(e) => updateItem(idx, { background: e.target.value })}
                          className="h-9 p-1"
                        />
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <p className="text-[11px] text-gray-700">Copie de la démo 1 Codrops : sticky + filtres + image qui rotate/translate. Minimum conseillé : 3 sections.</p>
      </div>
    </div>
  );
}
