import React, { useState } from 'react';

interface PageIntroData {
  title?: string;
  description?: string;
  layout?: 'default' | 'two-columns';
}

export default function PageIntroBlockEditor({ data, onChange }: { data: PageIntroData; onChange: (data: PageIntroData) => void }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const getBlockContentSuggestion = async (field: 'title' | 'description') => {
    setIsLoadingBlockAI(field);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType: 'page-intro',
          pageKey: field,
          context: field === 'title' ? 'Titre de page' : 'Description de page'
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      onChange({ 
        ...data, 
        [field]: responseData.suggestedContent 
      });
      
    } catch (error: any) {
      console.error(`Erreur suggestion ${field} IA:`, error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor space-y-4">
      <div className="text-sm text-gray-600 mb-3">
        <p className="mb-1">💡 Ce bloc affiche le titre et la description de la page.</p>
        <p className="text-xs">Si laissés vides, il utilisera automatiquement les métadonnées de la page.</p>
      </div>
      
      {/* Titre */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700">Titre</label>
          <button
            onClick={() => getBlockContentSuggestion('title')}
            disabled={isLoadingBlockAI === 'title'}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              isLoadingBlockAI === 'title' 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {isLoadingBlockAI === 'title' ? '🤖...' : '🤖 IA'}
          </button>
        </div>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Laisser vide pour utiliser le titre de la page"
          className="block-input w-full"
        />
        <p className="text-xs text-gray-500 mt-1">Laisser vide pour utiliser automatiquement le titre de la page</p>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <button
            onClick={() => getBlockContentSuggestion('description')}
            disabled={isLoadingBlockAI === 'description'}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              isLoadingBlockAI === 'description' 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {isLoadingBlockAI === 'description' ? '🤖...' : '🤖 IA'}
          </button>
        </div>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Laisser vide pour utiliser la description de la page"
          rows={3}
          className="block-input w-full"
        />
        <p className="text-xs text-gray-500 mt-1">Laisser vide pour utiliser automatiquement la description de la page</p>
      </div>

      {/* Layout */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Layout</label>
        <select
          value={data.layout || 'default'}
          onChange={(e) => onChange({ ...data, layout: e.target.value as 'default' | 'two-columns' })}
          className="block-input w-full"
        >
          <option value="default">Par défaut (adaptatif selon template)</option>
          <option value="two-columns">2 colonnes (titre gauche, description droite)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          "Par défaut" : layout adaptatif selon le template (Pearl = 2 colonnes, autres = centré)
        </p>
      </div>
    </div>
  );
}

