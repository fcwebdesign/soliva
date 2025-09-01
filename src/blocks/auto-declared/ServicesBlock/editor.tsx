import React, { useState } from 'react';
import WysiwygEditor from '../../../app/admin/components/WysiwygEditor';

interface ServicesBlockEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ServicesBlockEditor({ data, onChange }: ServicesBlockEditorProps) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateOffering = (index: number, field: string, value: any) => {
    const offerings = [...(data.offerings || [])];
    offerings[index] = {
      ...offerings[index],
      [field]: value
    };
    updateField('offerings', offerings);
  };

  const addOffering = () => {
    const newOffering = {
      id: `service-${Date.now()}`,
      title: '',
      description: '',
      icon: ''
    };
    const offerings = [...(data.offerings || []), newOffering];
    updateField('offerings', offerings);
  };

  const removeOffering = (index: number) => {
    const offerings = [...(data.offerings || [])];
    offerings.splice(index, 1);
    updateField('offerings', offerings);
  };

  const getServiceDescriptionSuggestion = async (blockId: string, serviceIndex: number, serviceTitle: string) => {
    const loadingId = `${blockId}-${serviceIndex}`;
    setIsLoadingBlockAI(loadingId);
    try {
      const response = await fetch('/api/admin/ai/suggest-service-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceTitle,
          pageKey: 'services', // ou récupérer depuis le contexte
          context: `Description pour le service "${serviceTitle}" dans la page services`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      // Mettre à jour seulement la description du service spécifique
      const offerings = [...(data.offerings || [])];
      offerings[serviceIndex] = {
        ...offerings[serviceIndex],
        description: responseData.suggestedDescription
      };
      updateField('offerings', offerings);
      
    } catch (error) {
      console.error('Erreur suggestion description service IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la section
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Ex: OUR CORE OFFERINGS"
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
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services ({(data.offerings || []).length})
        </label>
        <div className="space-y-3">
          {(data.offerings || []).map((offering: any, index: number) => (
            <div key={offering.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Service {index + 1}</span>
                <button
                  onClick={() => removeOffering(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Supprimer
                </button>
              </div>
              <input
                type="text"
                value={offering.title}
                onChange={(e) => updateOffering(index, 'title', e.target.value)}
                placeholder="Titre du service"
                className="block-input mb-2"
              />
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => getServiceDescriptionSuggestion(data.id, index, offering.title)}
                  disabled={isLoadingBlockAI === `${data.id}-${index}` || !offering.title?.trim()}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    isLoadingBlockAI === `${data.id}-${index}` || !offering.title?.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  }`}
                  title={!offering.title?.trim() ? "Saisissez d'abord un titre" : "Générer la description"}
                >
                  {isLoadingBlockAI === `${data.id}-${index}` ? '🤖...' : '🤖 IA'}
                </button>
              </div>
              <div className="mb-2">
                <WysiwygEditor
                  value={offering.description || ''}
                  onChange={(description) => updateOffering(index, 'description', description)}
                  placeholder="Description du service"
                />
              </div>
              <input
                type="text"
                value={offering.icon || ''}
                onChange={(e) => updateOffering(index, 'icon', e.target.value)}
                placeholder="Icône (optionnel)"
                className="block-input"
              />
            </div>
          ))}
          <button
            onClick={addOffering}
            className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            + Ajouter un service
          </button>
        </div>
      </div>
    </div>
  );
} 