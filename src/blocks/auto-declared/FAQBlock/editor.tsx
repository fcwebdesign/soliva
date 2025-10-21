'use client';

import React from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQBlockData {
  items?: FAQItem[];
  theme?: 'light' | 'dark' | 'auto';
}

interface FAQBlockEditorProps {
  data: FAQBlockData;
  onChange: (data: FAQBlockData) => void;
}

export default function FAQBlockEditor({ data, onChange }: FAQBlockEditorProps) {
  const items = data.items || [];
  const theme = data.theme || 'auto';

  const addItem = () => {
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: 'Nouvelle question ?',
      answer: '<p>Réponse à la question...</p>'
    };
    
    onChange({
      ...data,
      items: [...items, newItem]
    });
  };

  const updateItem = (id: string, field: 'question' | 'answer', value: string) => {
    onChange({
      ...data,
      items: items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeItem = (id: string) => {
    onChange({
      ...data,
      items: items.filter(item => item.id !== id)
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    onChange({
      ...data,
      items: newItems
    });
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de thème */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Thème
        </label>
        <select
          value={theme}
          onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="auto">Auto (thème global)</option>
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </div>

      {/* Liste des questions/réponses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">
            Questions / Réponses ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Ajouter une Q&A
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            Aucune question. Cliquez sur "Ajouter une Q&A" pour commencer.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 border border-gray-300 rounded-lg space-y-3 bg-white"
              >
                {/* En-tête avec contrôles */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Question {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Boutons de réorganisation */}
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Monter"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Descendre"
                    >
                      ↓
                    </button>
                    
                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                    placeholder="Votre question ici..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Réponse */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Réponse
                  </label>
                  <textarea
                    value={item.answer.replace(/<[^>]*>/g, '')}
                    onChange={(e) => updateItem(item.id, 'answer', `<p>${e.target.value}</p>`)}
                    placeholder="Réponse à la question..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    HTML supporté. Le texte sera automatiquement enveloppé dans un paragraphe.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aperçu */}
      {items.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2 text-gray-700">
            Aperçu (frontend) :
          </p>
          <div className="space-y-2">
            {items.map((item, index) => (
              <details key={item.id} className="border-b border-gray-300 last:border-0 pb-2">
                <summary className="cursor-pointer font-medium py-2 hover:opacity-70">
                  {item.question}
                </summary>
                <div 
                  className="text-sm text-gray-600 pl-4 pt-2"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

