import React from 'react';
import { Navigation } from 'lucide-react';

interface NavSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const NavSection: React.FC<NavSectionProps> = ({ localData, updateField }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Navigation className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>
          <input
            type="text"
            value={localData.logo || ''}
            onChange={(e) => updateField('logo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items de menu
          </label>
          <textarea
            value={localData.items?.join('\n') || ''}
            onChange={(e) => updateField('items', e.target.value.split('\n').filter(Boolean))}
            placeholder="Un item par ligne"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation
          </label>
          <input
            type="text"
            value={localData.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default NavSection;
