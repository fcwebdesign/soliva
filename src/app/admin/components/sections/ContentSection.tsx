import React from 'react';
import { Target } from 'lucide-react';
import WysiwygEditor from '../WysiwygEditor';
import MediaUploader from '../MediaUploader';

interface ContentSectionProps {
  pageKey: string;
  localData: any;
  updateField: (path: string, value: any) => void;
  getDescriptionSuggestion?: () => Promise<void>;
  isLoadingDescriptionAI?: boolean;
}

const ContentSection: React.FC<ContentSectionProps> = ({ 
  pageKey, 
  localData, 
  updateField, 
  getDescriptionSuggestion,
  isLoadingDescriptionAI = false
}) => {
  // Pour les pages blog, work, contact, studio et custom, la description est directement à la racine
  const isDirectDescription = pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio' || pageKey === 'custom';
  const descriptionPath = isDirectDescription ? 'description' : 'content.description';
  const descriptionValue = isDirectDescription ? localData.description : localData.content?.description;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
      </div>
      
      <div className="space-y-4">
        {/* Titre pour les pages blog, work, contact, studio et custom */}
        {(pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio' || pageKey === 'custom') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={localData.hero?.title || ''}
              onChange={(e) => updateField('hero.title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder={`Titre de la page ${pageKey}`}
            />
          </div>
        )}
        
        <div>
          <div className="mb-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
          </div>
          <WysiwygEditor
            value={descriptionValue || ''}
            onChange={(value) => updateField(descriptionPath, value)}
            placeholder="Description de la page"
            onAISuggestion={(pageKey === 'blog' || pageKey === 'work' || pageKey === 'contact' || pageKey === 'studio' || pageKey === 'custom') ? getDescriptionSuggestion : undefined}
            isLoadingAI={isLoadingDescriptionAI}
          />
        </div>
      
      {/* Section image seulement si ce n'est pas la page contact ou studio */}
      {pageKey !== 'contact' && pageKey !== 'studio' && localData.content?.image && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <MediaUploader
            currentUrl={localData.content.image.src}
            onUpload={(url) => updateField('content.image.src', url)}
          />
          <input
            type="text"
            value={localData.content.image.alt || ''}
            onChange={(e) => updateField('content.image.alt', e.target.value)}
            placeholder="Texte alternatif de l'image"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-2"
          />
        </div>
      )}
    </div>
  </div>
  );
};

export default ContentSection;
