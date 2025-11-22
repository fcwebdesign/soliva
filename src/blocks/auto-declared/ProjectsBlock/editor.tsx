import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface ProjectsData {
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[];
  theme?: 'light' | 'dark' | 'auto';
  columns?: number;
  displayMode?: 'grid' | 'carousel';
}

interface Project {
  id: string;
  title: string;
  category?: string;
  status?: string;
  featured?: boolean;
}

// Composant pour un projet draggable
function SortableProjectItem({ project, onRemove }: { project: Project; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-1 py-1 px-2 bg-white border border-gray-200 rounded group cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="w-3 h-3 text-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-gray-900 truncate">{project.title}</div>
        <div className="text-[10px] text-gray-500">{project.category}</div>
      </div>
      {project.featured && (
        <span className="text-[10px] text-yellow-600">⭐</span>
      )}
      <button
        onClick={onRemove}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-400 hover:text-red-500 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

export default function ProjectsBlockEditor({ data, onChange, compact = false }: { data: ProjectsData; onChange: (data: ProjectsData) => void; compact?: boolean }) {
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

  // État pour les projets récupérés depuis l'API
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/content', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const content = await response.json();
        
        // Récupérer les projets publiés depuis adminProjects ou projects
        let projects: Project[] = [];
        
        if (content.work?.adminProjects) {
          // Priorité aux projets de l'admin (avec blocs)
          projects = content.work.adminProjects
            .filter((p: any) => p.status === 'published')
            .map((p: any, index: number) => ({
              id: p.id || p.slug || `project-${index}`,
              title: p.title,
              category: p.category,
              status: p.status,
              featured: p.featured
            }));
        } else if (content.work?.projects) {
          // Fallback vers les projets publics
          projects = content.work.projects.map((p: any, index: number) => ({
            id: p.id || p.slug || `project-${index}`,
            title: p.title,
            category: p.category,
            status: p.status,
            featured: p.featured
          }));
        }
        
        // Supprimer les doublons basés sur l'ID
        const uniqueProjects = projects.filter((project, index, self) => 
          index === self.findIndex(p => p.id === project.id)
        );
        
        // Trier par featured puis par titre
        uniqueProjects.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.title.localeCompare(b.title);
        });
        
        setAllProjects(uniqueProjects);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        // Fallback vers des projets par défaut en cas d'erreur
        setAllProjects([
          { id: 'project-1', title: 'Project Alpha', category: 'Brand' },
          { id: 'project-2', title: 'Project Beta', category: 'Digital' },
          { id: 'project-3', title: 'Project Gamma', category: 'Strategy' },
          { id: 'project-4', title: 'Project Delta', category: 'Digital' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const selectedProjects = data.selectedProjects || [];
  // Maintenir l'ordre de selectedProjects
  const selectedItems = selectedProjects
    .map(id => allProjects.find(p => p.id === id))
    .filter(Boolean) as Project[];

  // Sensors pour drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = selectedProjects.indexOf(active.id as string);
      const newIndex = selectedProjects.indexOf(over.id as string);
      const newOrder = arrayMove(selectedProjects, oldIndex, newIndex);
      updateField('selectedProjects', newOrder);
    }
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Selected Works"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Max projets</label>
                <Select 
                  value={String(data.maxProjects || 6)} 
                  onValueChange={(value) => updateField('maxProjects', parseInt(value, 10))}
                >
                  <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="shadow-none border rounded">
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Colonnes</label>
                <Select 
                  value={String(data.columns || 3)} 
                  onValueChange={(value) => updateField('columns', parseInt(value, 10))}
                >
                  <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="shadow-none border rounded">
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Affichage</label>
              <Select 
                value={data.displayMode || 'grid'} 
                onValueChange={(value) => updateField('displayMode', value)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="grid">Grille (tout afficher)</SelectItem>
                  <SelectItem value="carousel">Carousel (avec navigation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projets sélectionnés avec drag & drop */}
          {selectedItems.length > 0 && (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">
                Projets sélectionnés ({selectedItems.length})
              </label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedProjects}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {selectedItems.map(project => (
                      <SortableProjectItem
                        key={project.id}
                        project={project}
                        onRemove={() => toggleProject(project.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Ajouter des projets
            </label>
            <div className="border border-gray-200 rounded p-2 max-h-[150px] overflow-y-auto bg-white">
              {loading ? (
                <div className="text-[11px] text-gray-400 text-center py-4">Chargement...</div>
              ) : allProjects.length === 0 ? (
                <div className="text-[11px] text-gray-400 text-center py-4">Aucun projet</div>
              ) : (
                <div className="space-y-1">
                  {allProjects.map(project => {
                    const isSelected = selectedProjects.includes(project.id);
                    return (
                      <label
                        key={project.id}
                        className="flex gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProject(project.id)}
                          className="peer h-4 w-4 shrink-0 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground rounded-[3px] mt-[3px]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-gray-900 truncate">{project.title}</div>
                          <div className="text-[10px] text-gray-500">{project.category}</div>
                        </div>
                        {project.featured && (
                          <span className="text-[10px] text-yellow-600">⭐</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-[13px] text-gray-400 mt-3">
              Si vide, tous les projets publiés seront affichés
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
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
            Nombre de colonnes
          </label>
          <select
            value={data.columns || 3}
            onChange={(e) => updateField('columns', parseInt(e.target.value, 10))}
            className="block-input"
          >
            <option value={2}>2 colonnes</option>
            <option value={3}>3 colonnes (par défaut)</option>
            <option value={4}>4 colonnes</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choisissez le nombre de colonnes pour l'affichage de la grille de projets.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode d'affichage
          </label>
          <select
            value={data.displayMode || 'grid'}
            onChange={(e) => updateField('displayMode', e.target.value)}
            className="block-input"
          >
            <option value="grid">Grille (tout afficher)</option>
            <option value="carousel">Carousel (avec navigation)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            En mode grille, tous les projets sont affichés. En mode carousel, vous pouvez naviguer entre les pages.
          </p>
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
                {loading ? (
                  <div className="text-sm text-gray-400 text-center py-4">
                    Chargement des projets...
                  </div>
                ) : allProjects.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-4">
                    Aucun projet publié trouvé
                  </div>
                ) : (
                  allProjects.map(project => {
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
                        <div className="text-xs text-gray-500">
                          {project.category}
                          {project.featured && (
                            <span className="ml-2 px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                              ⭐ Vedette
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cliquez sur un projet pour l'ajouter/retirer. Laissez vide pour afficher tous les projets.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <p>Ce bloc affiche les projets publiés de votre administration. Les projets en vedette apparaissent en premier.</p>
          {allProjects.length > 0 && (
            <p className="mt-1">
              {allProjects.length} projet{allProjects.length > 1 ? 's' : ''} disponible{allProjects.length > 1 ? 's' : ''} 
              ({allProjects.filter(p => p.featured).length} en vedette)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
