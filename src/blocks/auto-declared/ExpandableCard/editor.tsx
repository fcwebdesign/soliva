'use client';

import React from 'react';
import WysiwygEditor from '../../../app/admin/components/WysiwygEditor';
import MediaUploader from '../../../app/admin/components/MediaUploader';

interface ExpandableCardData {
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

interface ExpandableCardEditorProps {
  data: ExpandableCardData;
  onChange: (data: ExpandableCardData) => void;
}

export default function ExpandableCardEditor({ data, onChange }: ExpandableCardEditorProps) {
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
            Label
          </label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => updateField('label', e.target.value)}
            placeholder="Label de la carte"
            className="block-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Titre de la carte"
            className="block-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Résumé
          </label>
          <input
            type="text"
            value={data.summary || ''}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="Résumé de la carte"
            className="block-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu principal
          </label>
          <WysiwygEditor
            value={data.content || ''}
            onChange={(content: string) => updateField('content', content)}
            placeholder="Contenu de la carte qui s'affiche quand elle est étendue..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Média (optionnel)
          </label>
          <MediaUploader
            currentUrl={data.media?.src || ''}
            onUpload={(src) => updateField('media', { ...data.media, src })}
          />
          <input
            type="text"
            value={data.media?.alt || ''}
            onChange={(e) => updateField('media', { ...data.media, alt: e.target.value })}
            placeholder="Description de l'image (alt text)"
            className="block-input"
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème
          </label>
          <select
            value={data.theme || 'automation'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="block-input"
          >
            <option value="automation">Automation</option>
            <option value="research">Research</option>
            <option value="marketing">Marketing</option>
            <option value="go-to-market">Go-to-market</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isExpanded"
            checked={data.isExpanded || false}
            onChange={(e) => updateField('isExpanded', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isExpanded" className="ml-2 block text-sm text-gray-700">
            État étendu par défaut
          </label>
        </div>
      </div>
    </div>
  );
}