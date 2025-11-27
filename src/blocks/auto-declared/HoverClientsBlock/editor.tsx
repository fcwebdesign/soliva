"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import MediaUploader from '../../../app/admin/components/MediaUploader';

interface HoverClientItem {
  id?: string;
  name: string;
  image?: {
    src?: string;
    alt?: string;
  };
  hidden?: boolean;
}

interface HoverClientsData {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  items?: HoverClientItem[];
}

export default function HoverClientsBlockEditor({ data, onChange }: { data: HoverClientsData; onChange: (next: HoverClientsData) => void; }) {
  const blockData = data || {};
  const items = blockData.items || [];

  const updateField = (field: keyof HoverClientsData, value: any) => {
    onChange({
      ...blockData,
      [field]: value,
    });
  };

  const updateItem = (index: number, updates: Partial<HoverClientItem>) => {
    const next = [...items];
    next[index] = { ...(next[index] || {}), ...updates };
    updateField('items', next);
  };

  const addItem = () => {
    const next = [
      ...items,
      { id: `client-${Date.now()}`, name: 'Client', image: { src: '' } },
    ];
    updateField('items', next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateField('items', next);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateField('items', next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Titre</Label>
          <Input
            value={blockData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Trusted us"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Sous-titre</Label>
          <Input
            value={blockData.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Selected clients"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur de fond</Label>
          <Input
            type="color"
            value={blockData.backgroundColor || '#0d0d10'}
            onChange={(e) => updateField('backgroundColor', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur du texte</Label>
          <Input
            type="color"
            value={blockData.textColor || '#ffffff'}
            onChange={(e) => updateField('textColor', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur secondaire</Label>
          <Input
            type="color"
            value={blockData.mutedColor || '#b3b3b3'}
            onChange={(e) => updateField('mutedColor', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Couleur soulignement</Label>
          <Input
            type="color"
            value={blockData.accentColor || '#ffffff'}
            onChange={(e) => updateField('accentColor', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Thème</Label>
        <Select
          value={blockData.theme || 'auto'}
          onValueChange={(value) => updateField('theme', value)}
        >
          <SelectTrigger className="h-10 px-3 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="light">Clair</SelectItem>
            <SelectItem value="dark">Sombre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <Label className="text-xs text-gray-600">Clients</Label>
          <p className="text-[11px] text-gray-400">Nom + image affichée au survol</p>
        </div>
        <Button variant="outline" size="sm" onClick={addItem}>
          + Ajouter un client
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-4">
            Ajoutez un client pour commencer.
          </div>
        )}

        {items.map((item, index) => (
          <div key={item.id || index} className="border border-gray-200 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[12px] font-medium text-gray-700">Client #{index + 1}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveItem(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, index + 1)}
                >
                  ↓
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700">
                  Supprimer
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Nom</Label>
                <Input
                  value={item.name || ''}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Visibilité</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!item.hidden}
                    onCheckedChange={(checked) => updateItem(index, { hidden: !checked })}
                  />
                  <span className="text-[12px] text-gray-500">{item.hidden ? 'Masqué' : 'Affiché'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Image</Label>
              <MediaUploader
                currentUrl={item.image?.src || ''}
                onUpload={(src) => updateItem(index, { image: { ...(item.image || {}), src } })}
              />
              <Input
                className="mt-2"
                value={item.image?.alt || ''}
                onChange={(e) => updateItem(index, { image: { ...(item.image || {}), alt: e.target.value } })}
                placeholder="Texte alternatif"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
