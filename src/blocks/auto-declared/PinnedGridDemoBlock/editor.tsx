'use client';

import React from 'react';

interface PinnedGridDemoData {
  colors?: string[];
  duration?: number;
}

export default function PinnedGridDemoEditor({ data, onChange }: { data: PinnedGridDemoData; onChange: (data: PinnedGridDemoData) => void }) {
  const update = (field: keyof PinnedGridDemoData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleColorChange = (index: number, value: string) => {
    const next = Array.isArray(data.colors) ? [...data.colors] : [];
    next[index] = value;
    update('colors', next);
  };

  const addColor = () => {
    const next = Array.isArray(data.colors) ? [...data.colors, '#0f172a'] : ['#0f172a'];
    update('colors', next);
  };

  const removeColor = (index: number) => {
    const next = (Array.isArray(data.colors) ? data.colors : []).filter((_, i) => i !== index);
    update('colors', next);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">Durée du pin (% viewport)</label>
        <input
          type="number"
          min={120}
          max={400}
          value={typeof data.duration === 'number' ? data.duration : 250}
          onChange={(e) => update('duration', parseInt(e.target.value, 10) || 0)}
          className="block-input"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Couleurs (grille)</label>
          <button
            type="button"
            onClick={addColor}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Ajouter une couleur
          </button>
        </div>
        <div className="space-y-2">
          {(Array.isArray(data.colors) ? data.colors : []).map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(idx, e.target.value)}
                className="h-9 w-12 border rounded"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleColorChange(idx, e.target.value)}
                className="block-input flex-1"
              />
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
