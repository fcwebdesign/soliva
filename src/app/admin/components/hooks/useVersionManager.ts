import { useState } from 'react';
import { toast } from "sonner";
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

export const useVersionManager = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const { confirm } = useConfirmDialog();

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' }),
      });
      
      if (response.ok) {
        toast.success('Sauvegarde créée avec succès !');
      } else {
        toast.error('Erreur lors de la création de la sauvegarde');
      }
    } catch (err) {
      toast.error('Erreur lors de la création de la sauvegarde');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleCleanupVersions = async () => {
    const confirmed = await confirm({
      title: 'Nettoyer les anciennes versions ?',
      description: 'Seules les 10 versions les plus récentes seront conservées. Les autres seront supprimées.',
      confirmText: 'Nettoyer'
    });
    
    if (!confirmed) return;
    
    try {
      const response = await fetch('/api/admin/versions/cleanup', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`${result.deleted} anciennes versions supprimées !`);
        // Recharger la liste des versions
        window.location.reload();
      } else {
        toast.error('Erreur lors du nettoyage');
      }
    } catch (err) {
      toast.error('Erreur lors du nettoyage');
    }
  };

  return {
    backupLoading,
    handleCreateBackup,
    handleCleanupVersions
  };
};
