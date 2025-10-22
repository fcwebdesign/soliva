import React from 'react';
import { Save } from 'lucide-react';
import VersionList from '../VersionList';
import { useVersionManager } from '../hooks/useVersionManager';
import { toast } from "sonner";

const VersionManagerSection: React.FC = () => {
  const { backupLoading, handleCreateBackup, handleCleanupVersions } = useVersionManager();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <Save className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Gestion des sauvegardes</h3>
      </div>

      <div className="space-y-6">
        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCreateBackup}
            disabled={backupLoading}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{backupLoading ? 'Création...' : 'Créer une sauvegarde'}</span>
          </button>

          <button
            onClick={handleCleanupVersions}
            className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <span>🧹</span>
            <span>Nettoyer les versions</span>
          </button>
        </div>

        {/* Liste des versions */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Versions sauvegardées</h4>
          <VersionList onRevert={(filename) => {
            toast.success(`Version ${filename} restaurée !`);
            window.location.reload();
          }} />
        </div>
      </div>
    </div>
  );
};

export default VersionManagerSection;
