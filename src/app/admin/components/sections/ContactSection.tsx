import React from 'react';
import { Mail } from 'lucide-react';

interface ContactSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ localData, updateField }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Mail className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborations - Titre
            </label>
            <input
              type="text"
              value={localData.sections?.collaborations?.title || ''}
              onChange={(e) => updateField('sections.collaborations.title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborations - Email
            </label>
            <input
              type="email"
              value={localData.sections?.collaborations?.email || ''}
              onChange={(e) => updateField('sections.collaborations.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inquiries - Titre
            </label>
            <input
              type="text"
              value={localData.sections?.inquiries?.title || ''}
              onChange={(e) => updateField('sections.inquiries.title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inquiries - Email
            </label>
            <input
              type="email"
              value={localData.sections?.inquiries?.email || ''}
              onChange={(e) => updateField('sections.inquiries.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
