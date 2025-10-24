"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Save, Rocket } from 'lucide-react';

interface AdminHeaderProps {
  currentPageConfig: {
    label: string;
    path: string | null;
    icon: string;
  } | null;
  currentPage: string;
  hasUnsavedChanges: boolean;
  isPreviewMode: boolean;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  pageStatus: 'draft' | 'published';
  onPreview: () => void;
  onSaveDraft: () => void;
  onSavePublished: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentPageConfig,
  currentPage,
  hasUnsavedChanges,
  isPreviewMode,
  saveStatus,
  pageStatus,
  onPreview,
  onSaveDraft,
  onSavePublished
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-semibold text-gray-900 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
              {currentPageConfig?.label}
            </h1>
            <p className="text-sm text-gray-500">
              {currentPageConfig?.path ? `Page: ${currentPageConfig.path}` : 'Configuration'}
            </p>
          </div>
            
          {/* Status bar et boutons d'action */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Modifications non enregistrées
              </span>
            )}
            
            {isPreviewMode && (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Preview actif
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
                Enregistré à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Erreur lors de l'enregistrement
              </span>
            )}

            {/* Bouton Aperçu */}
            {currentPageConfig?.path && currentPage !== 'pages' && (
              <Button
                onClick={hasUnsavedChanges ? onPreview : () => window.open(currentPageConfig.path!, '_blank')}
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                title={hasUnsavedChanges ? "Aperçu avec les modifications non sauvegardées" : "Voir la page publiée"}
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

            {/* Brouillon: seulement pour pages de contenu (pas nav/footer/pages) */}
            {currentPage !== 'nav' && currentPage !== 'footer' && currentPage !== 'pages' && (
              <Button
                onClick={onSaveDraft}
                disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  saveStatus === 'saving' || !hasUnsavedChanges
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                title={pageStatus === 'published' ? "Repasser la page en brouillon" : "Enregistrer comme brouillon"}
              >
                <Save className="w-4 h-4 mr-0" />
                Enregistrer brouillon
              </Button>
            )}

            {/* Sauvegarde: active aussi pour nav/footer */}
            {currentPage !== 'pages' && (
              <Button
                onClick={onSavePublished}
                disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                className={`text-sm px-6 py-2 rounded-md transition-colors ${
                  saveStatus === 'saving' || !hasUnsavedChanges
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
