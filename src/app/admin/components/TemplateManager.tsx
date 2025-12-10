"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

interface TemplateManagerProps {
  onTemplateChange: (template: any) => void;
}

interface Template {
  id: string;
  key?: string;
  name: string;
  description: string;
  preview: string;
}

const TemplateManager = ({ onTemplateChange }: TemplateManagerProps): React.JSX.Element => {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Charger la liste des templates disponibles puis détecter le template actif
    loadTemplates();
  }, []);

  const loadTemplates = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/templates');
      let fetchedTemplates: Template[] = [];
      if (response.ok) {
        const data = await response.json();
        fetchedTemplates = data.templates || [];
        setTemplates(fetchedTemplates);
      }

      // Déterminer le template appliqué actuellement
      try {
        const contentRes = await fetch('/api/content', { cache: 'no-store' });
        if (contentRes.ok) {
          const siteContent = await contentRes.json();
          const activeKey = siteContent?._template as string | undefined;
          if (activeKey) {
            const active =
              fetchedTemplates.find((t) => (t.id || t.key) === activeKey) ||
              templates.find((t) => (t.id || t.key) === activeKey);
            if (active) setCurrentTemplate(active as any);
          } else {
            setCurrentTemplate(null);
          }
        }
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    }
  };

  const applyTemplate = async (templateId: string): Promise<void> => {
    const confirmed = await confirm({
      title: 'Appliquer ce template ?',
      description: `Le template "${templateId}" sera appliqué à votre site. Vous pourrez revenir en arrière ultérieurement.`,
      confirmText: 'Appliquer'
    });
    
    if (!confirmed) return;

    setLoading(true);
    try {
      // Appliquer le template
      const response = await fetch('/api/admin/templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        await response.json();
        const template = templates.find(t => t.id === templateId);
        if (template) {
          setCurrentTemplate(template);
        }
        // Rafraîchir le contenu actif pour mettre à jour l'état du template courant
        try {
          const contentRes = await fetch('/api/content', { cache: 'no-store' });
          if (contentRes.ok) {
            const nextContent = await contentRes.json();
            onTemplateChange(nextContent);
          }
        } catch {
          // ignore
        }
        toast.success('Template appliqué avec succès ! Visitez la page d\'accueil pour voir le nouveau design.');
      } else {
        throw new Error('Erreur lors de l\'application du template');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'application du template');
    } finally {
      setLoading(false);
    }
  };

  const restoreOriginal = async () => {
    const confirmed = await confirm({
      title: 'Restaurer le site original ?',
      description: 'Le template actuel sera supprimé et votre site reviendra à sa configuration d\'origine.',
      confirmText: 'Restaurer',
      variant: 'destructive'
    });
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/templates/restore', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTemplate(null);
        onTemplateChange(data.content);
        toast.success('Site original restauré !');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(`Erreur lors de la restauration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Gestion des Templates
      </h3>

      {/* Template actuel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Template actuel</h4>
        <p className="text-sm text-gray-600">
          {currentTemplate?.name || 'Site original (pas de template appliqué)'}
        </p>
      </div>

      {/* Liste des templates dynamiques */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Templates disponibles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t, index) => (
            <div key={`${t.id}-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white text-2xl font-bold">{t.name?.[0]?.toUpperCase() || 'T'}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t.name || t.id}</h3>
                  {t.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.description}</p>
                  )}
                </div>
              </div>
              <div className="p-6 flex gap-2">
                <button
                  onClick={() => applyTemplate(t.id)}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Appliquer
                </button>
                <button
                  onClick={() => window.open(`/?template=${t.id}`, '_blank')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Aperçu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurer le site original */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">Restaurer le site original</h4>
        <button
          onClick={restoreOriginal}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Restauration...' : 'Restaurer le site original'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Restaure votre contenu original (projets, textes, etc.) depuis la sauvegarde automatique.
        </p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Conseil :</strong> Votre contenu original est automatiquement sauvegardé lors de la première application d'un template. 
            Vous retrouverez tous vos projets et textes personnalisés.
          </p>
        </div>
      </div>
      {/* Dialogue de confirmation */}
      <ConfirmDialog />
    </div>
  );
};

export default TemplateManager; 
