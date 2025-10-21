"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const TemplateManager = ({ onTemplateChange }) => {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger la liste des templates disponibles
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    }
  };

  const applyTemplate = async (templateId) => {
    if (!confirm(`Êtes-vous sûr de vouloir appliquer le template "${templateId}" ?`)) {
      return;
    }

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
        const data = await response.json();
        setCurrentTemplate(templateId);
        onTemplateChange(data.content);
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
    if (!confirm('Êtes-vous sûr de vouloir restaurer votre site original ?')) {
      return;
    }

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
          {currentTemplate || 'Site original (pas de template appliqué)'}
        </p>
      </div>

      {/* Liste des templates */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Templates disponibles</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Template Minimaliste Premium */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl font-bold">M</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Minimaliste Premium</h3>
                <p className="text-sm text-gray-600 mt-1">Design épuré, typographie bold</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Framer Motion</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Nouveau</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Template minimaliste avec animations fluides, typographie impactante et design monochrome.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => applyTemplate('minimaliste-premium')}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Appliquer
                </button>
                <button
                  onClick={() => window.open('/?template=minimaliste-premium', '_blank')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Aperçu
                </button>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default TemplateManager; 