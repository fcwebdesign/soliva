'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Save, Rocket } from 'lucide-react';

interface HeaderAdminProps {
  title: string;
  backButton: {
    text: string;
    onClick: () => void;
  };
  actions: {
    hasUnsavedChanges?: boolean;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
    onPreview?: () => void;
    onSaveDraft?: () => void;
    onPublish?: () => void;
    previewDisabled?: boolean;
    saveDisabled?: boolean;
    publishDisabled?: boolean;
    previewText?: string;
    draftText?: string;
    publishText?: string;
    previewTitle?: string;
    draftTitle?: string;
    publishTitle?: string;
  };
}

export default function HeaderAdmin({ title, backButton, actions }: HeaderAdminProps) {
  const {
    hasUnsavedChanges = false,
    saveStatus = 'idle',
    onPreview,
    onSaveDraft,
    onPublish,
    previewDisabled = false,
    saveDisabled = false,
    publishDisabled = false,
    previewText = '👁️ Aperçu',
    draftText = '💾 Enregistrer brouillon',
    publishText = '🚀 Publier',
    previewTitle = 'Aperçu',
    draftTitle = 'Enregistrer comme brouillon',
    publishTitle = 'Publier'
  } = actions;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-2" style={{ fontSize: '2.25rem' }}>
              {title}
            </h1>
            <Button
              onClick={backButton.onClick}
              variant="ghost"
              className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto"
            >
              {backButton.text}
            </Button>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Modifications non enregistrées
              </span>
            )}
            
            {saveStatus === 'saving' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Enregistrement...</span>
              </div>
            )}
            
            {saveStatus === 'success' && (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Enregistré
              </span>
            )}
            
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                ❌ Erreur
              </span>
            )}
            
            {onPreview && (
              <Button
                onClick={onPreview}
                disabled={previewDisabled}
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  previewDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : hasUnsavedChanges 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                title={previewTitle}
              >
                {hasUnsavedChanges ? (
                  <>
                    <Eye className="w-4 h-4 mr-0" />
                    Aperçu
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-0" />
                    Voir la page
                  </>
                )}
              </Button>
            )}
            
            {onSaveDraft && (
              <Button
                onClick={onSaveDraft}
                disabled={saveDisabled || !hasUnsavedChanges}
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  saveDisabled || !hasUnsavedChanges
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                title={draftTitle}
              >
                <Save className="w-4 h-4 mr-0" />
                Enregistrer brouillon
              </Button>
            )}
            
            {onPublish && (
              <Button
                onClick={onPublish}
                disabled={publishDisabled || !hasUnsavedChanges}
                className={`text-sm px-6 py-2 rounded-md transition-colors ${
                  publishDisabled || !hasUnsavedChanges
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={publishTitle}
              >
                <Rocket className="w-4 h-4 mr-0" />
                Publier
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 