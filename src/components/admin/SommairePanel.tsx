"use client";
import React, { useState } from 'react';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  MoreVertical,
  FileText,
  Image,
  Layout,
  Building2,
  Quote,
  Phone,
  Mail,
  Target,
  Grid3x3,
  List,
  Type,
  Heading2,
  Columns,
  Trash2,
  Container,
  Square,
  X,
  Info
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card";

interface Section {
  id: string;
  type: string;
  label: string;
  expanded?: boolean;
  children?: Section[];
  level: number;
}

// Données mock hiérarchiques pour la démonstration
const mockSections: Section[] = [
  { 
    id: "1", 
    type: "container", 
    label: "Container", 
    expanded: true, 
    level: 0,
    children: [
      { 
        id: "2", 
        type: "container", 
        label: "Container", 
        expanded: true, 
        level: 1,
        children: [
          { 
            id: "3", 
            type: "accordion", 
            label: "Accordion", 
            expanded: true, 
            level: 2,
            children: [
              { id: "4", type: "container", label: "item #1", expanded: true, level: 3, children: [
                { id: "5", type: "text", label: "Text Editor", level: 4 }
              ]},
              { id: "6", type: "container", label: "item #2", expanded: false, level: 3 },
              { id: "7", type: "container", label: "item #3", expanded: false, level: 3 }
            ]
          },
          { id: "8", type: "spacer", label: "Spacer", level: 2 },
          { id: "9", type: "grid", label: "Grid", expanded: false, level: 2 },
          { id: "10", type: "heading", label: "Heading", level: 2 }
        ]
      }
    ]
  }
];

// Mapping des types vers les icônes
const typeIcons: Record<string, React.ComponentType<any>> = {
  container: Container,
  accordion: List,
  text: Type,
  spacer: Square,
  grid: Grid3x3,
  heading: Heading2,
  image: Image,
  hero: Target,
  content: FileText,
  logos: Building2,
  faq: Quote,
  pricing: Grid3x3,
  testimonials: Quote,
  contact: Phone,
  cta: Target,
  gallery: Image,
  stats: List,
  timeline: Type,
  newsletter: Mail,
  footer: Layout,
  column: Columns,
  'two-columns': Columns,
  'three-columns': Grid3x3,
  'four-columns': Grid3x3,
  'gallery-grid': Grid3x3,
  'h2': Heading2,
  'h3': Type,
  'services': List,
  'projects': Grid3x3,
  'quote': Quote,
  default: FileText
};

interface SommairePanelProps {
  className?: string;
  blocks?: any[];
  onSelectBlock?: (blockId: string) => void;
  selectedBlockId?: string;
  onDeleteBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
  onReorderBlocks?: (newBlocks: any[]) => void;
  renderAction?: (section: Section) => React.ReactNode;
}

// Composant pour les éléments sortables - garde le design original
function SortableItem({ 
  section, 
  index, 
  renderSection 
}: {
  section: Section;
  index: number;
  renderSection: (section: Section, index?: number, dragListeners?: any) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      {renderSection(section, index, listeners)}
    </div>
  );
}

export default function SommairePanel({ className = "", blocks = [], onSelectBlock, selectedBlockId, onDeleteBlock, onDuplicateBlock, onReorderBlocks, renderAction }: SommairePanelProps) {
  
  // Fonction pour gérer les actions sur les sections
  const handleSectionAction = (action: string, section: Section) => {
    switch (action) {
      case 'edit':
        if (onSelectBlock && section.type !== 'column') {
          onSelectBlock(section.id);
        }
        break;
      case 'duplicate':
        if (onDuplicateBlock && section.type !== 'column') {
          onDuplicateBlock(section.id);
        }
        break;
      case 'delete':
        if (onDeleteBlock && section.type !== 'column') {
          onDeleteBlock(section.id);
        }
        break;
    }
  };
  
  // Fonction pour analyser récursivement les blocs et extraire les sous-éléments
  const analyzeBlockStructure = (block: any, level: number = 0): Section => {
    const section: Section = {
      id: block.id || `block-${Date.now()}`,
      type: block.type,
      label: getBlockLabel(block.type),
      level,
      expanded: false // Tout replié par défaut
    };

    // Analyser les colonnes pour les blocs de layout
    if (block.type === 'two-columns' || block.type === 'three-columns' || block.type === 'four-columns') {
      const children: Section[] = [];
      
      // Analyser chaque colonne
      const columnKeys = block.type === 'two-columns' 
        ? ['leftColumn', 'rightColumn']
        : block.type === 'three-columns'
        ? ['leftColumn', 'middleColumn', 'rightColumn']
        : ['column1', 'column2', 'column3', 'column4'];
      
      columnKeys.forEach((columnKey, columnIndex) => {
        // Essayer différentes façons d'accéder aux données des colonnes
        const columnBlocks = block[columnKey] || block.data?.[columnKey] || [];
        
        
        // Créer une section pour la colonne (même si elle est vide)
        const columnSection: Section = {
          id: `${section.id}-${columnKey}`,
          type: 'column',
          label: `Colonne ${columnIndex + 1}`,
          level: level + 1,
          expanded: false, // Replié par défaut
          children: columnBlocks.length > 0 
            ? columnBlocks.map((subBlock: any, subIndex: number) => {
                // S'assurer que le bloc a un ID stable basé sur sa position si pas d'ID
                const stableId = subBlock.id || `${section.id}-${columnKey}-${subIndex}`;
                const blockWithId = { ...subBlock, id: stableId };
                return analyzeBlockStructure(blockWithId, level + 2);
              })
            : []
        };
        children.push(columnSection);
      });
      
      if (children.length > 0) {
        section.children = children;
      }
    }
    
    return section;
  };

  // Fonction pour obtenir un label plus lisible
  const getBlockLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'content': 'Éditeur de texte',
      'h2': 'Titre H2',
      'h3': 'Titre H3',
      'image': 'Image',
      'contact': 'Contact',
      'services': 'Services',
      'projects': 'Projets',
      'logos': 'Logos',
      'quote': 'Citation',
      'gallery-grid': 'Galerie Grid',
      'two-columns': 'Deux colonnes',
      'three-columns': 'Trois colonnes',
      'four-columns': 'Quatre colonnes'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Convertir les blocs en sections avec analyse récursive
  const sections = blocks.length > 0 ? blocks.map((block, index) => 
    analyzeBlockStructure(block, 0)
  ) : mockSections;
  
  const [sectionsState, setSectionsState] = useState<Section[]>(sections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Configuration des capteurs pour dnd-kit avec contraintes d'activation
  const mouseSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 6 }, // drag uniquement si on bouge la souris
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  
  const sensors = useSensors(mouseSensor, keyboardSensor);

  // Fonction pour convertir les sections en blocs
  const convertSectionsToBlocks = (sections: Section[]): any[] => {
    return sections.map(section => {
      const block = blocks.find(b => b.id === section.id);
      return block || { id: section.id, type: section.type, label: section.label };
    });
  };

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Fonction de gestion du drag & drop avec dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionsState.findIndex(section => section.id === active.id);
      const newIndex = sectionsState.findIndex(section => section.id === over.id);

      const newSections = arrayMove(sectionsState, oldIndex, newIndex);
      setSectionsState(newSections);

      // Notifier le parent pour mettre à jour les blocs
      if (onReorderBlocks) {
        const newBlocks = convertSectionsToBlocks(newSections);
        onReorderBlocks(newBlocks);
      }
    }
  };



  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type] || typeIcons.default;
    return <IconComponent className="w-3 h-3" style={{ color: 'var(--admin-text-muted)' }} />;
  };

  const renderSection = (section: Section, index?: number, dragListeners?: any) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isSelected = selectedBlockId === section.id;
    
    return (
      <div key={section.id}>
        <div 
          className={`flex items-center gap-1 py-1 px-2 group transition-colors ${
            section.type === 'column' ? 'cursor-default' : 'cursor-pointer'
          } ${
            section.level === 0 && index !== undefined ? 'cursor-grab active:cursor-grabbing' : ''
          } ${
            isSelected ? 'border-l-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: isSelected ? 'var(--admin-bg-active)' : 'transparent',
            borderLeft: '3px solid transparent',
            transition: 'background-color 0.2s, border-left-color 0.2s',
            paddingLeft: `${section.level === 0 ? 8 : section.level === 1 ? 25 : 25}px`
          }}
          onClick={() => {
            if (onSelectBlock) {
              // Pour les colonnes, passer un format spécial : blockId:columnKey
              if (section.type === 'column') {
                // L'ID de la colonne est au format: blockId-columnKey
                // On cherche le dernier segment qui correspond à leftColumn ou rightColumn
                const id = section.id;
                if (id.endsWith('-leftColumn')) {
                  const blockId = id.slice(0, -11); // Enlever '-leftColumn'
                  onSelectBlock(`${blockId}:leftColumn`);
                } else if (id.endsWith('-rightColumn')) {
                  const blockId = id.slice(0, -12); // Enlever '-rightColumn'
                  onSelectBlock(`${blockId}:rightColumn`);
                } else {
                  // Fallback : utiliser l'ID tel quel
                  onSelectBlock(section.id);
                }
              } else {
                onSelectBlock(section.id);
              }
            }
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          {...(dragListeners && section.level === 0 ? dragListeners : {})}
        >
          {/* Flèche d'expansion - largeur fixe pour alignement */}
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              <button
                type="button"
                aria-label="Basculer l'expansion"
                onPointerDownCapture={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(section.id);
                }}
                className="p-0.5 rounded"
                style={{ 
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-active)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" style={{ color: 'var(--admin-text-muted)' }} />
                ) : (
                  <ChevronRight className="w-3 h-3" style={{ color: 'var(--admin-text-muted)' }} />
                )}
              </button>
            ) : null}
          </div>
          
          
          {/* Icône du type */}
          <div className="flex-shrink-0">
            {getTypeIcon(section.type)}
          </div>
          
          {/* Label */}
          <span className="text-sm flex-1 truncate" style={{ color: 'var(--admin-text-secondary)' }}>
            {section.label}
          </span>
          
          {/* Actions */}
          {renderAction ? (
            renderAction(section)
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1 rounded"
                  style={{ 
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-active)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <MoreVertical className="w-3 h-3" style={{ color: 'var(--admin-text-muted)' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                style={{ 
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)'
                }}
              >
                <DropdownMenuItem 
                  onClick={() => handleSectionAction("edit", section)}
                  style={{ 
                    color: 'var(--admin-text-secondary)',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Éditer
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSectionAction("duplicate", section)}
                  style={{ 
                    color: 'var(--admin-text-secondary)',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuSeparator style={{ backgroundColor: 'var(--admin-border)' }} />
                <DropdownMenuItem 
                  onClick={() => handleSectionAction("delete", section)}
                  style={{ 
                    color: 'var(--admin-error)',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Enfants */}
        {hasChildren && isExpanded && (
          <div>
            {section.children!.map(child => renderSection(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Styles CSS pour le drag & drop */}
      
      <div 
        className={`w-full h-full flex flex-col ${className}`}
        style={{ backgroundColor: 'var(--admin-bg)' }}
      >
      {/* En-tête minimal */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: 'var(--admin-border)' }}
      >
        <h2 className="text-sm font-medium ml-2" style={{ color: 'var(--admin-text)' }}>Structure</h2>
        <button 
          onClick={() => {
            // Fermer le Sheet parent
            const closeEvent = new CustomEvent('close-sheet');
            window.dispatchEvent(closeEvent);
          }}
          className="p-1 rounded transition-colors"
          style={{ 
            backgroundColor: 'transparent',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X className="w-4 h-4" style={{ color: 'var(--admin-text)' }} />
        </button>
      </div>

      {/* Liste des sections avec dnd-kit */}
      <div className="flex-1 overflow-y-auto pt-2 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sectionsState.map(section => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {sectionsState.map((section, index) => (
              <SortableItem
                key={section.id}
                section={section}
                index={index}
                renderSection={renderSection}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Footer avec info */}
      <div className="border-t pt-3 mt-3" style={{ borderColor: 'var(--admin-border)' }}>
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button 
              className="flex items-center gap-2 w-full p-2 rounded transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Info className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                Aide
              </span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Glissez-déposez pour réorganiser les éléments de votre page.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      </div>
    </>
  );
}
