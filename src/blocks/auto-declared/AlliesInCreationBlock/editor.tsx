'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AllyItem = {
  id: string;
  label?: string;
  link?: string;
  featured?: boolean;
  hidden?: boolean;
};

type AlliesData = {
  title?: string;
  subtitle?: string;
  items?: AllyItem[];
};

const defaultItems: AllyItem[] = [
  { id: 'ally-1', label: 'Blackline Studio', link: '/' },
  { id: 'ally-2', label: 'North Axis', link: '/work' },
  { id: 'ally-3', label: 'Vanta Works', link: '/studio' },
  { id: 'ally-4', label: 'Oblique Films', link: '/blog' },
];

function SortableItemRow({
  item,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  onToggleHidden,
  availablePages,
}: {
  item: AllyItem;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<AllyItem>) => void;
  onRemove: () => void;
  onToggleHidden: () => void;
  availablePages: Array<{ key: string; label: string; path: string }>;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded bg-white" onClick={(e) => e.stopPropagation()}>
      <div className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 transition-colors group" onClick={onToggle}>
        {isOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
          aria-label="Déplacer"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <span className="text-[12px] text-gray-700 truncate flex-1">{item.label || 'Sans titre'}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="text-gray-400 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onToggleHidden();
            }}
            aria-label={item.hidden ? 'Afficher' : 'Masquer'}
          >
            {item.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
          <button
            type="button"
            className="text-gray-400 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-3 py-3 space-y-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Label</label>
              <input
                type="text"
                value={item.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Page de destination</label>
              <Select
                value={availablePages.find((p) => p.path === item.link)?.path || (item.link ? '__custom' : '')}
                onValueChange={(value) => {
                  if (value === '__custom') {
                    onUpdate({ link: '' });
                  } else {
                    onUpdate({ link: value });
                  }
                }}
              >
                <SelectTrigger className="w-full h-[36px] px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none shadow-none">
                  <SelectValue placeholder="Sélectionner une page" />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded max-h-64">
                  {availablePages.map((page) => (
                    <SelectItem key={page.key} value={page.path} className="text-[13px] py-1.5">
                      {page.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom" className="text-[13px] py-1.5 text-gray-500">
                    URL personnalisée
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {item.link === '' || (item.link && !availablePages.find((p) => p.path === item.link)) ? (
            <input
              type="text"
              value={item.link || ''}
              onChange={(e) => onUpdate({ link: e.target.value })}
              placeholder="https://..."
              className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AlliesInCreationEditor({ data, onChange }: { data: AlliesData; onChange: (next: AlliesData) => void }) {
  const items = useMemo(() => (data.items && data.items.length ? data.items : defaultItems), [data.items]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [availablePages, setAvailablePages] = useState<Array<{ key: string; label: string; path: string }>>([]);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((content) => {
        const pages = [
          { key: 'home', label: 'Accueil', path: '/' },
          { key: 'work', label: 'Réalisations', path: '/work' },
          { key: 'studio', label: 'Studio', path: '/studio' },
          { key: 'blog', label: 'Journal', path: '/blog' },
          { key: 'contact', label: 'Contact', path: '/contact' },
          ...(content?.pages?.pages || []).map((page: any) => ({
            key: page.slug || page.id,
            label: page.title || 'Page personnalisée',
            path: `/${page.slug || page.id}`,
          })),
        ];
        setAvailablePages(pages);
      })
      .catch((err) => console.error('Erreur chargement pages:', err));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateItems = (next: AllyItem[]) => onChange({ ...data, items: next });

  const addItem = () => {
    const newItem: AllyItem = {
      id: `ally-${Date.now()}`,
      label: 'Nouveau partenaire',
      link: '',
      featured: false,
      hidden: false,
    };
    updateItems([...items, newItem]);
    setOpenId(newItem.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        updateItems(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Surtitre</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="block text-[10px] text-gray-400">Allies ({items.length})</label>
        <button
          type="button"
          onClick={addItem}
          className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Ajouter
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItemRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                onUpdate={(patch) =>
                  updateItems(items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)))
                }
                onRemove={() => updateItems(items.filter((i) => i.id !== item.id))}
                onToggleHidden={() =>
                  updateItems(items.map((i) => (i.id === item.id ? { ...i, hidden: !i.hidden } : i)))
                }
                availablePages={availablePages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
