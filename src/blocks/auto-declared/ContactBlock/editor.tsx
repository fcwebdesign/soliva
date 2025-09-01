import React from 'react';

interface ContactData {
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContactBlockEditor({ data, onChange }: { data: ContactData; onChange: (data: ContactData) => void }) {
  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="block-editor">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question/Titre
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ex: Would you like to see a demo?"
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte du bouton
          </label>
          <input
            type="text"
            value={data.ctaText || ''}
            onChange={(e) => updateField('ctaText', e.target.value)}
            placeholder="Ex: Yes, sign me up"
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lien du bouton
          </label>
          <input
            type="text"
            value={data.ctaLink || ''}
            onChange={(e) => updateField('ctaLink', e.target.value)}
            placeholder="Ex: /contact ou https://..."
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>
      </div>
    </div>
  );
}
