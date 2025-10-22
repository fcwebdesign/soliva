import React from 'react';
import { Target } from 'lucide-react';

interface HeroSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ localData, updateField }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={localData?.hero?.title || ''}
            onChange={(e) => updateField('hero.title', e.target.value)}
            placeholder="Titre de la page"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sous-titre
          </label>
          <textarea
            value={localData?.hero?.subtitle || ''}
            onChange={(e) => updateField('hero.subtitle', e.target.value)}
            placeholder="Sous-titre de la page"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Utilisez \n pour les retours à la ligne
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
