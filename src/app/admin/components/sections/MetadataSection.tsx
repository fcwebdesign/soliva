import React from 'react';
import { Settings, Layout } from 'lucide-react';

interface MetadataSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const MetadataSection: React.FC<MetadataSectionProps> = ({ localData, updateField }) => {
  const layoutOptions = [
    { value: 'compact', label: 'Compact (1280px)', description: 'Parfait pour les blogs et sites modernes' },
    { value: 'standard', label: 'Standard (1536px)', description: 'Idéal pour les agences et sites corporate' },
    { value: 'wide', label: 'Wide (1920px)', description: 'Parfait pour les portfolios et landing pages' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Métadonnées</h3>
      </div>
      
      <div className="space-y-6">
        {/* Layout Selection */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Layout className="w-5 h-5 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Layout du site
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {layoutOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                  (localData.layout || 'standard') === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="layout"
                  value={option.value}
                  checked={(localData.layout || 'standard') === option.value}
                  onChange={(e) => updateField('layout', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      (localData.layout || 'standard') === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {(localData.layout || 'standard') === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Site Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du site
          </label>
          <input
            type="text"
            value={localData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Nom de votre site"
          />
        </div>
        
        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du site
          </label>
          <textarea
            value={localData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Description courte de votre site"
          />
        </div>
      </div>
    </div>
  );
};

export default MetadataSection;
