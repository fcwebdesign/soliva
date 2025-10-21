'use client';

import React, { useEffect } from 'react';
import WysiwygEditor from '../../../app/admin/components/WysiwygEditor';
import MediaUploader from '../../../app/admin/components/MediaUploader';

interface CardItem {
  title: string;
  label: string;
  summary: string;
  content: string;
  media?: {
    src: string;
    alt: string;
  };
  theme?: 'automation' | 'research' | 'marketing' | 'go-to-market';
  isExpanded?: boolean;
}

interface ExpandableCardData {
  cards?: CardItem[];
}

interface ExpandableCardEditorProps {
  data: ExpandableCardData;
  onChange: (data: ExpandableCardData) => void;
}

export default function ExpandableCardEditor({ data, onChange }: ExpandableCardEditorProps) {
  const cards = data.cards || [];

  // Initialiser après montage si aucune carte
  useEffect(() => {
    if (!data.cards || data.cards.length === 0) {
      onChange({
        ...data,
        cards: [
          {
            title: 'Automatisation',
            label: 'Service',
            summary: 'Optimisez vos processus avec nos automatisations.',
            content: '<ul><li>Audit des flux</li><li>Zaps/Make scénarios</li><li>Intégrations API</li></ul>',
            media: { src: '', alt: '' },
            theme: 'automation',
            isExpanded: false,
          },
          {
            title: 'Automatisation',
            label: 'Service',
            summary: 'Optimisez vos processus avec nos automatisations.',
            content: '<ul><li>Audit des flux</li><li>Zaps/Make scénarios</li><li>Intégrations API</li></ul>',
            media: { src: '', alt: '' },
            theme: 'automation',
            isExpanded: false,
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCard = (index: number, patch: Partial<CardItem>) => {
    const next = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ ...data, cards: next });
  };

  const addCard = () => {
    const next: CardItem = {
      title: 'Nouveau service',
      label: 'Service',
      summary: '',
      content: '',
      media: { src: '', alt: '' },
      theme: 'automation',
      isExpanded: false,
    };
    onChange({ ...data, cards: [...cards, next] });
  };

  const removeCard = (index: number) => {
    const next = cards.filter((_, i) => i !== index);
    onChange({ ...data, cards: next });
  };


  return (
    <div className="block-editor space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Cartes</h4>
        <button type="button" onClick={addCard} className="btn btn-secondary">Ajouter une carte</button>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Carte #{index + 1}</span>
              <button type="button" onClick={() => removeCard(index)} className="text-red-600 text-sm">Supprimer</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
              <input type="text" value={card.label || ''} onChange={(e) => updateCard(index, { label: e.target.value })} className="block-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input type="text" value={card.title || ''} onChange={(e) => updateCard(index, { title: e.target.value })} className="block-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
              <input type="text" value={card.summary || ''} onChange={(e) => updateCard(index, { summary: e.target.value })} className="block-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
              <WysiwygEditor value={card.content || ''} onChange={(content: string) => updateCard(index, { content })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Média (optionnel)</label>
              <MediaUploader currentUrl={card.media?.src || ''} onUpload={(src) => updateCard(index, { media: { ...(card.media || {}), src } })} />
              <input type="text" value={card.media?.alt || ''} onChange={(e) => updateCard(index, { media: { ...(card.media || {}), alt: e.target.value } })} placeholder="Alt" className="block-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
              <select value={card.theme || 'automation'} onChange={(e) => updateCard(index, { theme: e.target.value as CardItem['theme'] })} className="block-input">
                <option value="automation">Automation</option>
                <option value="research">Research</option>
                <option value="marketing">Marketing</option>
                <option value="go-to-market">Go-to-market</option>
              </select>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id={`expanded-${index}`} checked={card.isExpanded || false} onChange={(e) => updateCard(index, { isExpanded: e.target.checked })} className="h-4 w-4 border-gray-300 rounded" />
              <label htmlFor={`expanded-${index}`} className="ml-2 block text-sm text-gray-700">Étendue par défaut</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
