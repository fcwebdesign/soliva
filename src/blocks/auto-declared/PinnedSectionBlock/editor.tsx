'use client';

import React, { useState } from 'react';
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';

interface PinnedSectionData {
  kicker?: string;
  title?: string;
  description?: string;
  background?: string;
  textColor?: string;
  pinDuration?: number;
  paddingY?: number;
  theme?: 'light' | 'dark' | 'auto';
}

export default function PinnedSectionEditor({
  data,
  onChange,
  compact = false,
  context,
}: {
  data: PinnedSectionData;
  onChange: (data: PinnedSectionData) => void;
  compact?: boolean;
  context?: any;
}) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const update = (field: keyof PinnedSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getBlockContentSuggestion = async (field: 'title' | 'description') => {
    setIsLoadingBlockAI(field);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: 'pinned-section',
          pageKey: field,
          context: context || `Copie pour ${field} d'une section pinée`,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      update(field, responseData.suggestedContent);
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor space-y-4">
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">Kicker</label>
        <input
          type="text"
          value={data.kicker || ''}
          onChange={(e) => update('kicker', e.target.value)}
          placeholder="Kicker (petit label)"
          className="block-input"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">Titre</label>
          <button
            onClick={() => getBlockContentSuggestion('title')}
            disabled={isLoadingBlockAI === 'title'}
            className={`px-2 py-1 text-xs font-medium rounded ${
              isLoadingBlockAI === 'title'
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {isLoadingBlockAI === 'title' ? '🤖...' : '🤖 IA'}
          </button>
        </div>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Titre principal"
          className="block-input"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <button
            onClick={() => getBlockContentSuggestion('description')}
            disabled={isLoadingBlockAI === 'description'}
            className={`px-2 py-1 text-xs font-medium rounded ${
              isLoadingBlockAI === 'description'
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {isLoadingBlockAI === 'description' ? '🤖...' : '🤖 IA'}
          </button>
        </div>
        <WysiwygEditor
          value={data.description || ''}
          onChange={(content: string) => update('description', content)}
          placeholder="Description courte..."
          onAISuggestion={() => getBlockContentSuggestion('description')}
          isLoadingAI={isLoadingBlockAI === 'description'}
          compact={compact}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Durée du pin (% viewport)</label>
          <input
            type="number"
            min={60}
            max={400}
            value={typeof data.pinDuration === 'number' ? data.pinDuration : 180}
            onChange={(e) => update('pinDuration', parseInt(e.target.value, 10) || 0)}
            className="block-input"
          />
          <p className="text-[11px] text-muted-foreground">Recommandé : 120 à 220 pour un test fluide.</p>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Padding vertical (px)</label>
          <input
            type="number"
            min={32}
            max={240}
            value={typeof data.paddingY === 'number' ? data.paddingY : 96}
            onChange={(e) => update('paddingY', parseInt(e.target.value, 10) || 0)}
            className="block-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Fond</label>
          <input
            type="text"
            value={data.background || ''}
            onChange={(e) => update('background', e.target.value)}
            placeholder="Ex: #0f172a ou linear-gradient(...)"
            className="block-input"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Couleur du texte</label>
          <input
            type="text"
            value={data.textColor || ''}
            onChange={(e) => update('textColor', e.target.value)}
            placeholder="Ex: #f8fafc ou var(--foreground)"
            className="block-input"
          />
        </div>
      </div>
    </div>
  );
}
