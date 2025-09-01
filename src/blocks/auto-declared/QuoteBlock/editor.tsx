import React from 'react';

interface QuoteData {
  quote: string;
  author: string;
  role?: string;
  theme: 'light' | 'dark' | 'auto';
}

export default function QuoteBlockEditor({ data, onChange }: { data: QuoteData; onChange: (data: QuoteData) => void }) {
  // S'assurer que les valeurs ont des fallbacks
  const safeData = {
    quote: data.quote || '',
    author: data.author || '',
    role: data.role || '',
    theme: data.theme || 'auto'
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Citation
        </label>
        <textarea
          value={safeData.quote}
          onChange={(e) => onChange({ ...data, quote: e.target.value })}
          placeholder="Votre citation..."
          rows={3}
          className="block-input"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Auteur
          </label>
          <input
            type="text"
            value={safeData.author}
            onChange={(e) => onChange({ ...data, author: e.target.value })}
            placeholder="Nom de l'auteur"
            className="block-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rôle/Fonction
          </label>
          <input
            type="text"
            value={safeData.role}
            onChange={(e) => onChange({ ...data, role: e.target.value })}
            placeholder="CEO, Designer, etc."
            className="block-input"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Thème
        </label>
        <select
          value={safeData.theme}
          onChange={(e) => onChange({ ...data, theme: e.target.value as 'light' | 'dark' | 'auto' })}
          className="block-input"
        >
          <option value="auto">Automatique (suit le thème global)</option>
          <option value="light">Thème clair forcé</option>
          <option value="dark">Thème sombre forcé</option>
        </select>
      </div>
    </div>
  );
}