import React, { useState } from 'react';
import WysiwygEditorWrapper from '../../../components/WysiwygEditorWrapper';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Briefcase } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ServicesBlockEditorProps {
  data: any;
  onChange: (data: any) => void;
  compact?: boolean;
}

// Composant sortable pour chaque service
function SortableServiceItem({
  offering,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  onToggleVisibility,
  onGenerateDescription,
  isLoadingAI,
  blockId
}: {
  offering: any;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onGenerateDescription: () => void;
  isLoadingAI: boolean;
  blockId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: offering.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.6 : 1,
  };

  const isHidden = offering.hidden || false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded overflow-hidden ${isHidden ? 'opacity-50' : ''}`}
    >
      {/* Header collapsible */}
      <div
        className="flex items-center gap-1 py-1 px-2 group hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={onToggle}
        {...attributes}
        {...listeners}
      >
        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          )}
        </div>
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 flex-shrink-0">
          {index + 1}.
        </span>
        <span className={`text-sm truncate flex-1 ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {offering.title || 'Service sans titre'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all flex-shrink-0"
          title={isHidden ? "Afficher" : "Masquer"}
        >
          {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-all flex-shrink-0"
          title="Supprimer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Contenu éditable */}
      {isOpen && (
        <div className="px-2 pb-2 space-y-2 bg-white border-t border-gray-100">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 mt-2">Titre</label>
            <input
              type="text"
              value={offering.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder="Titre du service"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Description</label>
            <WysiwygEditorWrapper
              value={offering.description || ''}
              onChange={(description: string) => onUpdate('description', description)}
              placeholder="Description du service"
              compact={true}
              onAISuggestion={onGenerateDescription}
              isLoadingAI={isLoadingAI}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Icône (optionnel)</label>
            <input
              type="text"
              value={offering.icon || ''}
              onChange={(e) => onUpdate('icon', e.target.value)}
              placeholder="Ex: 🚀 ou emoji"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicesBlockEditor({ data, onChange, compact = false }: ServicesBlockEditorProps) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Configuration des capteurs pour dnd-kit
  const mouseSensor = useSensor(PointerSensor, {
    activationConstraint: { 
      delay: 150,
      tolerance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(mouseSensor, keyboardSensor);

  const toggleItem = (id: string) => {
    // Accordéon : ouvrir l'item cliqué et fermer les autres
    if (openItems.has(id)) {
      // Si déjà ouvert, on ferme tout
      setOpenItems(new Set());
    } else {
      // Sinon on ouvre seulement celui-ci
      setOpenItems(new Set([id]));
    }
  };

  // Fonction de gestion du drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const offerings = data.offerings || [];

    if (over && active.id !== over.id) {
      const oldIndex = offerings.findIndex((item: any) => item.id === active.id);
      const newIndex = offerings.findIndex((item: any) => item.id === over.id);

      const newOfferings = arrayMove(offerings, oldIndex, newIndex);
      updateField('offerings', newOfferings);
    }
  };

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateOffering = (id: string, field: string, value: any) => {
    const offerings = [...(data.offerings || [])];
    const index = offerings.findIndex((o: any) => o.id === id);
    if (index !== -1) {
    offerings[index] = {
      ...offerings[index],
      [field]: value
    };
    updateField('offerings', offerings);
    }
  };

  const addOffering = () => {
    const newOffering = {
      id: `service-${Date.now()}`,
      title: 'Service Heading',
      description: '<p>Descriptive service content body text explaining the key features and benefits of this offering.</p>',
      icon: '',
      hidden: false
    };
    const offerings = [...(data.offerings || []), newOffering];
    updateField('offerings', offerings);
  };

  const removeOffering = (id: string) => {
    const offerings = (data.offerings || []).filter((o: any) => o.id !== id);
    updateField('offerings', offerings);
  };

  const toggleOfferingVisibility = (id: string) => {
    const offerings = [...(data.offerings || [])];
    const index = offerings.findIndex((o: any) => o.id === id);
    if (index !== -1) {
      offerings[index] = {
        ...offerings[index],
        hidden: !offerings[index].hidden
      };
      updateField('offerings', offerings);
    }
  };

  const getServiceDescriptionSuggestion = async (serviceId: string, serviceTitle: string) => {
    const loadingId = serviceId;
    setIsLoadingBlockAI(loadingId);
    try {
      const response = await fetch('/api/admin/ai/suggest-service-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceTitle,
          pageKey: 'services',
          context: `Description pour le service "${serviceTitle}" dans la page services`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      // Mettre à jour la description du service
      updateOffering(serviceId, 'description', responseData.suggestedDescription);
      
    } catch (error: any) {
      console.error('Erreur suggestion description service IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const offerings = data.offerings || [];

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Titre */}
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Nos services"
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Liste des services */}
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
            Services ({offerings.length})
          </label>
          <div className="space-y-1">
            {offerings.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                Aucun service
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={offerings.map((o: any) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {offerings.map((offering: any, index: number) => (
                    <SortableServiceItem
                      key={offering.id}
                      offering={offering}
                      index={index}
                      isOpen={openItems.has(offering.id)}
                      onToggle={() => toggleItem(offering.id)}
                      onUpdate={(field, value) => updateOffering(offering.id, field, value)}
                      onRemove={() => removeOffering(offering.id)}
                      onToggleVisibility={() => toggleOfferingVisibility(offering.id)}
                      onGenerateDescription={() => getServiceDescriptionSuggestion(offering.id, offering.title)}
                      isLoadingAI={isLoadingBlockAI === offering.id}
                      blockId={data.id || ''}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            
            {/* Bouton ajouter */}
            <button
              type="button"
              onClick={addOffering}
              className="w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              + Ajouter
            </button>
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
            placeholder="Ex: OUR CORE OFFERINGS"
            className="block-input"
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
            Services ({offerings.length})
          </label>
          <div className="space-y-3">
            {offerings.map((offering: any, index: number) => (
              <div key={offering.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Service {index + 1}</span>
                  <button
                    onClick={() => removeOffering(offering.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
                <input
                  type="text"
                  value={offering.title}
                  onChange={(e) => updateOffering(offering.id, 'title', e.target.value)}
                  placeholder="Titre du service"
                  className="block-input mb-2"
                />
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => getServiceDescriptionSuggestion(offering.id, offering.title)}
                    disabled={isLoadingBlockAI === offering.id || !offering.title?.trim()}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      isLoadingBlockAI === offering.id || !offering.title?.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                    }`}
                    title={!offering.title?.trim() ? "Saisissez d'abord un titre" : "Générer la description"}
                  >
                    {isLoadingBlockAI === offering.id ? '🤖...' : '✨ IA'}
                  </button>
                </div>
                <div className="mb-2">
                  <WysiwygEditorWrapper
                    value={offering.description || ''}
                    onChange={(description: string) => updateOffering(offering.id, 'description', description)}
                    placeholder="Description du service"
                  />
                </div>
                <input
                  type="text"
                  value={offering.icon || ''}
                  onChange={(e) => updateOffering(offering.id, 'icon', e.target.value)}
                  placeholder="Icône (optionnel)"
                  className="block-input"
                />
              </div>
            ))}
            <button
              onClick={addOffering}
              className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Ajouter un service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 