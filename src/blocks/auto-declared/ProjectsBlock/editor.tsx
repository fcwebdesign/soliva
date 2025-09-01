import React from 'react';

interface ProjectsData {
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function ProjectsBlockEditor({ data, onChange }: { data: ProjectsData; onChange: (data: ProjectsData) => void }) {
  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const toggleProject = (projectId: string) => {
    const currentSelected = data.selectedProjects || [];
    const isSelected = currentSelected.includes(projectId);
    
    if (isSelected) {
      const newSelected = currentSelected.filter(id => id !== projectId);
      updateField('selectedProjects', newSelected);
    } else {
      const newSelected = [...currentSelected, projectId];
      updateField('selectedProjects', newSelected);
    }
  };

  const allProjects = [
    { id: 'project-1', title: 'Project Alpha', category: 'Brand' },
    { id: 'project-2', title: 'Project Beta', category: 'Digital' },
    { id: 'project-3', title: 'Project Gamma', category: 'Strategy' },
    { id: 'project-4', title: 'Project Delta', category: 'Digital' }
  ];

  const selectedProjects = data.selectedProjects || [];
  const selectedItems = allProjects.filter(project => selectedProjects.includes(project.id));

  return (
    <div className="block-editor">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la section
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ex: NOS RÉALISATIONS"
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre maximum de projets
          </label>
          <input
            type="number"
            value={data.maxProjects || 6}
            onChange={(e) => updateField('maxProjects', parseInt(e.target.value) || 6)}
            placeholder="6"
            className="block-input"
            min="1"
            max="12"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projets à afficher
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Colonne gauche - Projets sélectionnés */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Projets sélectionnés</h4>
              <div className="space-y-2 min-h-[200px]">
                {selectedItems.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-8">
                    Aucun projet sélectionné
                  </div>
                ) : (
                  selectedItems.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <div className="text-sm font-medium text-gray-700">{project.title}</div>
                        <div className="text-xs text-gray-500">{project.category}</div>
                      </div>
                      <button
                        onClick={() => toggleProject(project.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Colonne droite - Tous les projets disponibles */}
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Projets disponibles</h4>
              <div className="space-y-2">
                {allProjects.map(project => {
                  const isSelected = selectedProjects.includes(project.id);
                  return (
                    <div
                      key={project.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleProject(project.id)}
                    >
                      <div className="text-sm font-medium">{project.title}</div>
                      <div className="text-xs text-gray-500">{project.category}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cliquez sur un projet pour l'ajouter/retirer. Laissez vide pour afficher tous les projets.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <p>Ce bloc affiche automatiquement les projets de la page Portfolio en 3 colonnes.</p>
        </div>
      </div>
    </div>
  );
}
