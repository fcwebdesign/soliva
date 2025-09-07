"use client";
import React, { useState } from 'react';
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
  Container,
  Square,
  X
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

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
  default: FileText
};

interface SommairePanelProps {
  className?: string;
  blocks?: any[];
}

export default function SommairePanel({ className = "", blocks = [] }: SommairePanelProps) {
  // Convertir les blocs en sections pour l'affichage
  const sections = blocks.length > 0 ? blocks.map((block, index) => ({
    id: block.id || `block-${index}`,
    type: block.type,
    label: block.type.charAt(0).toUpperCase() + block.type.slice(1),
    level: 0,
    expanded: false
  })) : mockSections;
  
  const [sectionsState, setSectionsState] = useState<Section[]>(sections);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  const toggleExpanded = (sectionId: string) => {
    const updateSections = (sections: Section[]): Section[] => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, expanded: !section.expanded };
        }
        if (section.children) {
          return { ...section, children: updateSections(section.children) };
        }
        return section;
      });
    };
    setSectionsState(updateSections(sectionsState));
  };

  const handleSectionAction = (action: string, section: Section) => {
    switch (action) {
      case "edit":
        console.log("Éditer", section.id);
        break;
      case "duplicate":
        console.log("Dupliquer", section.id);
        break;
      case "delete":
        setSectionToDelete(section);
        setDeleteDialogOpen(true);
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (sectionToDelete) {
      // Logique de suppression à implémenter
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
    }
  };

  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type] || typeIcons.default;
    return <IconComponent className="w-3 h-3" style={{ color: 'var(--admin-text-muted)' }} />;
  };

  const renderSection = (section: Section) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = section.expanded;
    
    return (
      <div key={section.id}>
        <div 
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer group transition-colors ${
            section.id === "3" ? "" : ""
          }`}
          style={{ 
            backgroundColor: section.id === "3" ? 'var(--admin-bg-hover)' : 'transparent',
            transition: 'background-color 0.2s',
            paddingLeft: `${section.level * 12 + 8}px`
          }}
          onMouseEnter={(e) => {
            if (section.id !== "3") {
              e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (section.id !== "3") {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {/* Flèche d'expansion */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(section.id)}
              className="flex-shrink-0 p-0.5 rounded"
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
          ) : (
            <div className="w-4" />
          )}
          
          {/* Icône du type */}
          <div className="flex-shrink-0">
            {getTypeIcon(section.type)}
          </div>
          
          {/* Label */}
          <span className="text-sm flex-1 truncate" style={{ color: 'var(--admin-text-secondary)' }}>
            {section.label}
          </span>
          
          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="opacity-0 group-hover:opacity-100 p-1 rounded"
                style={{ 
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
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
    <div 
      className={`w-full h-full flex flex-col ${className}`}
      style={{ backgroundColor: 'var(--admin-bg)' }}
    >
      {/* En-tête minimal */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: 'var(--admin-border)' }}
      >
        <h2 className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Structure</h2>
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

      {/* Liste des sections */}
      <div className="flex-1 overflow-y-auto pt-2">
        {sectionsState.map(section => renderSection(section))}
      </div>


      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-admin-bg border-admin-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-admin-text">Supprimer la section ?</AlertDialogTitle>
            <AlertDialogDescription className="text-admin-text-secondary">
              Cette action est définitive. La section "{sectionToDelete?.label}" sera supprimée de la page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-admin-bg-hover text-admin-text-secondary hover:bg-admin-bg-active">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-admin-error hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
