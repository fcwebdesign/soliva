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
    <div className="block-editor">
      <div className="space-y-4">
        {/* Sélecteur de thème */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={theme}
            onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>

        {/* Liste des questions/réponses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Questions / Réponses ({items.length})
          </label>
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                Aucune question. Cliquez sur "Ajouter une Q&A" pour commencer.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  {/* En-tête avec contrôles */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Boutons de réorganisation */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Descendre"
                      >
                        ↓
                      </button>
                      
                      {/* Bouton supprimer */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                      placeholder="Votre question ici..."
                      className="block-input"
                    />
                  </div>

                  {/* Réponse */}
                  <div>
                    <textarea
                      value={item.answer.replace(/<[^>]*>/g, '')}
                      onChange={(e) => updateItem(item.id, 'answer', `<p>${e.target.value}</p>`)}
                      placeholder="Réponse à la question..."
                      rows={4}
                      className="block-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      HTML supporté. Le texte sera automatiquement enveloppé dans un paragraphe.
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Bouton Ajouter standardisé (comme ServicesBlock) */}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Ajouter une Q&A
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

