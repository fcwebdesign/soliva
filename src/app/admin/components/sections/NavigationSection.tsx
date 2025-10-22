"use client";
import React from 'react';
import { Menu, Link, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface NavigationSectionProps {
  footerData: {
    links: Array<{
      id?: string;
      label?: string;
      title?: string;
      url: string;
      customUrl?: string;
      target: string;
    }>;
  };
  availablePages: Array<{
    key: string;
    label: string;
    path: string;
    isCustom?: boolean;
  }>;
  filteredPages: Array<{
    key: string;
    label: string;
    path: string;
    isCustom?: boolean;
  }>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleLink: (pageKey: string) => void;
  onAddCustomLink: () => void;
  onUpdateLinkTitle: (index: number, title: string) => void;
  onUpdateLinkUrl: (index: number, url: string) => void;
  onUpdateLinkTarget: (index: number, target: string) => void;
  onMoveLink: (fromIndex: number, toIndex: number) => void;
  onRemoveLink: (url: string) => void;
  editingLink: number | null;
  onSetEditingLink: (index: number | null) => void;
  draggedItem: any;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({
  footerData,
  availablePages,
  filteredPages,
  searchTerm,
  onSearchChange,
  onToggleLink,
  onAddCustomLink,
  onUpdateLinkTitle,
  onUpdateLinkUrl,
  onUpdateLinkTarget,
  onMoveLink,
  onRemoveLink,
  editingLink,
  onSetEditingLink,
  draggedItem,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        <Menu className="w-6 h-6 inline mr-2 text-gray-600" />
        Navigation
      </h3>
      
      {/* Interface en deux colonnes (1/3 - 2/3) - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Pages disponibles */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Pages disponibles :</h4>
          
          {/* Champ de recherche */}
          <div className="mb-3">
            <input 
              type="text" 
              placeholder="Rechercher une page..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {filteredPages.map((page) => (
              <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  checked={footerData.links.some(link => link.url === page.path)}
                  onCheckedChange={() => onToggleLink(page.path)}
                  className="rounded-[3px]"
                />
                <span className="text-sm">{page.label}</span>
              </label>
            ))}
            {filteredPages.length === 0 && searchTerm && (
              <div className="text-center text-sm text-gray-500 py-4">
                Aucune page trouvée pour "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Pages de navigation (2/3) */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pages de navigation
          </label>
          <p className="text-sm text-gray-600 mb-3">Utilisez les boutons "Éditer" pour personnaliser les noms des pages</p>
        
          {/* Liens sélectionnés (ordre) */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Ordre d'affichage :</h4>
            <div className="space-y-2">
              {footerData.links.map((link, index) => {
                const isDragging = draggedItem === index;
                const isDragOver = dragOverIndex === index;
                
                return (
                  <div 
                    key={`${link.url}-${index}`} 
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDrop={(e) => onDrop(e, index)}
                    onDragEnd={onDragEnd}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-move
                      ${isDragging 
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 opacity-75' 
                        : isDragOver 
                          ? 'border-green-400 bg-green-50 border-dashed' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                      <div className="flex-1 flex items-center gap-2">
                        {editingLink === index ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={link.title || link.label || ''}
                              onChange={(e) => onUpdateLinkTitle(index, e.target.value)}
                              className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nom du lien"
                              autoFocus
                            />
                            {link.url === 'custom' && (
                              <input
                                type="text"
                                value={link.customUrl || ''}
                                onChange={(e) => onUpdateLinkUrl(index, e.target.value)}
                                className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://exemple.com"
                              />
                            )}
                            <div className="flex items-center gap-2">
                              {link.url === 'custom' && (
                                <select
                                  value={link.target || '_blank'}
                                  onChange={(e) => onUpdateLinkTarget(index, e.target.value)}
                                  className="text-xs bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="_self">Même onglet</option>
                                  <option value="_blank">Nouvel onglet</option>
                                </select>
                              )}
                              <Button
                                type="button"
                                onClick={() => onSetEditingLink(null)}
                                size="sm"
                                variant="default"
                              >
                                ✓
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">
                                {link.title || link.label || ''}
                              </span>
                              {link.url === 'custom' && link.customUrl && (
                                <div className="text-xs text-gray-500 truncate">
                                  {link.customUrl}
                                </div>
                              )}
                              {link.url === 'custom' && (
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Link className="w-3 h-3" />
                                  {link.target === '_blank' ? 'Nouvel onglet' : 'Même onglet'}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isDragging && <span className="text-xs text-blue-600 font-medium">En cours...</span>}
                        {isDragOver && <span className="text-xs text-green-600 font-medium">Déposer ici</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <Button
                          onClick={() => onMoveLink(index, index - 1)}
                          size="sm"
                          variant="ghost"
                          title="Déplacer vers le haut"
                        >
                          <ChevronUp className="w-3 h-3 mr-0" />
                        </Button>
                      )}
                      {index < footerData.links.length - 1 && (
                        <Button
                          onClick={() => onMoveLink(index, index + 1)}
                          size="sm"
                          variant="ghost"
                          title="Déplacer vers le bas"
                        >
                          <ChevronDown className="w-3 h-3 mr-0" />
                        </Button>
                      )}
                      {editingLink !== index && (
                        <Button
                          type="button"
                          onClick={() => onSetEditingLink(index)}
                          size="sm"
                          variant="secondary"
                        >
                          Éditer
                        </Button>
                      )}
                      <Button
                        onClick={() => onRemoveLink(link.url)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Retirer ce lien"
                      >
                        <Trash2 className="w-3 h-3 mr-0" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bouton Lien personnalisé */}
          <div className="mt-4">
            <Button
              onClick={onAddCustomLink}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Lien personnalisé
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;
