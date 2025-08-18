"use client";
import { useState, useEffect } from 'react';
import VersionList from './VersionList';

interface RightPanelProps {
  onSave: () => Promise<void>;
  onPreview: () => void;
  onDisablePreview: () => void;
  isPreviewMode: boolean;
  currentPage: string;
  onRevert: (filename: string) => void;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  hasUnsavedChanges: boolean;
}

interface Version {
  filename: string;
  createdAt: string;
}

export default function RightPanel({
  onSave,
  onPreview,
  onDisablePreview,
  isPreviewMode,
  currentPage,
  onRevert,
  saveStatus,
  hasUnsavedChanges,
}: RightPanelProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);

  // Charger les versions
  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setVersionsLoading(true);
      const response = await fetch('/api/admin/versions');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des versions');
      }
      
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      console.error('Erreur versions:', err);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleRevert = async (filename: string) => {
    if (!confirm('Êtes-vous sûr de vouloir revenir à cette version ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du revert');
      }

      onRevert(filename);
      alert('Version restaurée avec succès !');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du revert');
    }
  };

  return (
    <aside className="hidden xl:flex xl:flex-col xl:bg-white xl:border-l xl:border-gray-200">
      {/* Actions principales */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        
        {/* Bouton Enregistrer */}
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving' || !hasUnsavedChanges}
          className={`w-full mb-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            saveStatus === 'saving'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : hasUnsavedChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enregistrement...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>💾</span>
              <span>Enregistrer</span>
            </div>
          )}
        </button>

        {/* Bouton Preview */}
        {isPreviewMode ? (
          <button
            onClick={onDisablePreview}
            className="w-full mb-3 px-4 py-3 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>👁️</span>
              <span>Désactiver l'aperçu</span>
            </div>
          </button>
        ) : (
          <button
            onClick={onPreview}
            className="w-full mb-3 px-4 py-3 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>👁️</span>
              <span>Activer l'aperçu</span>
            </div>
          </button>
        )}

        {/* Raccourci clavier */}
        <div className="text-xs text-gray-500 text-center mt-4 p-2 bg-gray-50 rounded-lg">
          💡 Raccourci : <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">⌘</kbd> + <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">S</kbd>
        </div>
      </div>

      {/* Versions */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Versions</h3>
          <button
            onClick={fetchVersions}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            🔄
          </button>
        </div>

        {versionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Chargement des versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Aucune version disponible</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.slice(0, 10).map((version) => (
              <div
                key={version.filename}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {new Date(version.createdAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {version.filename}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevert(version.filename)}
                    className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    Restaurer
                  </button>
                </div>
              </div>
            ))}
            
            {versions.length > 10 && (
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  +{versions.length - 10} versions plus anciennes
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {hasUnsavedChanges ? (
            <span className="text-orange-600">⚠️ Modifications non enregistrées</span>
          ) : (
            <span className="text-green-600">✅ Toutes les modifications sont enregistrées</span>
          )}
        </div>
      </div>
    </aside>
  );
} 