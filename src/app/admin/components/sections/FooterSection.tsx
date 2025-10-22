import React from 'react';
import { Footprints } from 'lucide-react';

interface FooterSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({ localData, updateField }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Footprints className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Footer</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réseaux sociaux
          </label>
          <textarea
            value={localData.socials?.join('\n') || ''}
            onChange={(e) => updateField('socials', e.target.value.split('\n').filter(Boolean))}
            placeholder="Un réseau par ligne"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default FooterSection;
