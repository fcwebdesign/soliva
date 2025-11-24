"use client";
import React, { useState } from 'react';

type HeroBlockData = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: 'left' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  backgroundImage?: {
    src?: string;
    alt?: string;
  };
};

export default function HeroBlockEditor({ data, onChange }: { data: HeroBlockData; onChange: (data: HeroBlockData) => void }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);
  const blockId = 'hero-block';

  const getBlockContentSuggestion = async () => {
    setIsLoadingBlockAI(blockId);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType: 'hero',
          pageKey: 'hero',
          context: `Hero de page (titre + sous-titre + CTA). Titre actuel: "${data.title || ''}".`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      onChange({
        ...data,
        title: responseData.suggestedTitle || data.title,
        subtitle: responseData.suggestedContent || data.subtitle,
      });
      
    } catch (error: any) {
      console.error('Erreur suggestion contenu Hero IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={getBlockContentSuggestion}
          disabled={isLoadingBlockAI === blockId}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            isLoadingBlockAI === blockId
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
          }`}
        >
          {isLoadingBlockAI === blockId ? '🤖...' : '🤖 IA'}
        </button>
      </div>

      <input
        type="text"
        value={data.eyebrow || ''}
        onChange={(e) => onChange({ ...data, eyebrow: e.target.value })}
        placeholder="Sur-titre (optionnel)"
        className="block-input"
      />

      <input
        type="text"
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Titre principal"
        className="block-input h2-input"
      />

      <textarea
        value={data.subtitle || ''}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
        placeholder="Sous-titre / description"
        className="block-input min-h-[100px]"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={data.ctaLabel || ''}
          onChange={(e) => onChange({ ...data, ctaLabel: e.target.value })}
          placeholder="Texte du bouton"
          className="block-input"
        />
        <input
          type="text"
          value={data.ctaHref || ''}
          onChange={(e) => onChange({ ...data, ctaHref: e.target.value })}
          placeholder="Lien du bouton"
          className="block-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Alignement</label>
          <select
            value={data.align || 'left'}
            onChange={(e) => onChange({ ...data, align: e.target.value as HeroBlockData['align'] })}
            className="block-input"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Thème</label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => onChange({ ...data, theme: e.target.value as HeroBlockData['theme'] })}
            className="block-input"
          >
            <option value="auto">Auto</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={data.backgroundImage?.src || ''}
          onChange={(e) => onChange({ 
            ...data, 
            backgroundImage: { ...(data.backgroundImage || {}), src: e.target.value } 
          })}
          placeholder="Image de fond (URL)"
          className="block-input"
        />
        <input
          type="text"
          value={data.backgroundImage?.alt || ''}
          onChange={(e) => onChange({ 
            ...data, 
            backgroundImage: { ...(data.backgroundImage || {}), alt: e.target.value } 
          })}
          placeholder="Alt image"
          className="block-input"
        />
      </div>
    </div>
  );
}
