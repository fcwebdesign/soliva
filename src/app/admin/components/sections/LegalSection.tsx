"use client";
import React from 'react';
import { Scale, Link, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface LegalSectionProps {
  footerData: {
    copyright: string;
    bottomLinks: Array<string | {
      id: string;
      label: string;
      url: string;
    }>;
  };
  availableLegalPages: Array<{
    key: string;
    label: string;
    path: string;
    isCustom?: boolean;
  }>;
  filteredLegalPages: Array<{
    key: string;
    label: string;
    path: string;
    isCustom?: boolean;
  }>;
  legalSearchTerm: string;
  onLegalSearchChange: (value: string) => void;
  onCopyrightChange: (value: string) => void;
  onToggleLegalPage: (pageKey: string) => void;
  onAddCustomLegalLink: () => void;
  onMoveBottomLink: (fromIndex: number, toIndex: number) => void;
  onRemoveBottomLink: (pageKey: string) => void;
  onUpdateLegalPageLabel: (pageKey: string, label: string) => void;
  onUpdateLegalPageUrl: (pageKey: string, url: string) => void;
  onUpdateLegalPageTarget: (pageKey: string, target: string) => void;
  onGetLegalPageLabel: (pageKey: string | { id: string; label: string; url: string; }) => string;
  onGetLegalPageUrl: (pageKey: string | { id: string; label: string; url: string; }) => string;
  onGetLegalPageTarget: (pageKey: string | { id: string; label: string; url: string; }) => string;
  editingLegalPage: string | null;
  onSetEditingLegalPage: (pageKey: string | null) => void;
  draggedItem: any;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const LegalSection: React.FC<LegalSectionProps> = ({
  footerData,
  availableLegalPages,
  filteredLegalPages,
  legalSearchTerm,
  onLegalSearchChange,
  onCopyrightChange,
  onToggleLegalPage,
  onAddCustomLegalLink,
  onMoveBottomLink,
  onRemoveBottomLink,
  onUpdateLegalPageLabel,
  onUpdateLegalPageUrl,
  onUpdateLegalPageTarget,
  onGetLegalPageLabel,
  onGetLegalPageUrl,
  onGetLegalPageTarget,
  editingLegalPage,
  onSetEditingLegalPage,
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
        <Scale className="w-6 h-6 inline mr-2 text-gray-600" />
        Légal
      </h3>
      
      <div className="space-y-6">
        {/* Copyright */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Copyright
          </label>
          <input
            type="text"
            value={footerData.copyright}
            onChange={(e) => onCopyrightChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="© 2024 Soliva. Tous droits réservés."
          />
        </div>

        {/* Liens légaux */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Liens légaux
          </label>
          <p className="text-sm text-gray-600 mb-3">Ces liens apparaîtront dans la colonne de droite du copyright</p>
          
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
                  value={legalSearchTerm}
                  onChange={(e) => onLegalSearchChange(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {filteredLegalPages.map((page) => (
                  <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Checkbox
                      checked={footerData.bottomLinks.includes(page.key)}
                      onCheckedChange={() => onToggleLegalPage(page.key)}
                      className="rounded-[3px]"
                    />
                    <span className="text-sm">{page.label}</span>
                  </label>
                ))}
                {filteredLegalPages.length === 0 && legalSearchTerm && (
                  <div className="text-center text-sm text-gray-500 py-4">
                    Aucune page trouvée pour "{legalSearchTerm}"
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - Pages légales (2/3) */}
            <div className="lg:col-span-2">
            
              {/* Liens sélectionnés (ordre) */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Ordre d'affichage :</h4>
                <div className="space-y-2">
                  {footerData.bottomLinks.map((pageKey, index) => {
                    const page = availableLegalPages.find(p => p.key === pageKey);
                      const isDragging = draggedItem === index;
                      const isDragOver = dragOverIndex === index;
                    
                    return (
                      <div 
                        key={typeof pageKey === 'string' ? pageKey : pageKey.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, `bottom-${index}` as any)}
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
                            {editingLegalPage === (typeof pageKey === 'string' ? pageKey : pageKey.id) ? (
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={onGetLegalPageLabel(pageKey)}
                                  onChange={(e) => onUpdateLegalPageLabel(typeof pageKey === 'string' ? pageKey : pageKey.id, e.target.value)}
                                  className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={page?.label || (typeof pageKey === 'string' ? pageKey : pageKey.id)}
                                  autoFocus
                                />
                                {typeof pageKey === 'string' && pageKey.startsWith('custom-') && (
                                  <input
                                    type="text"
                                    value={onGetLegalPageUrl(pageKey)}
                                    onChange={(e) => onUpdateLegalPageUrl(pageKey, e.target.value)}
                                    className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://exemple.com"
                                  />
                                )}
                                <div className="flex items-center gap-2">
                                  {typeof pageKey === 'string' && pageKey.startsWith('custom-') && (
                                    <select
                                      value={onGetLegalPageTarget(pageKey)}
                                      onChange={(e) => onUpdateLegalPageTarget(pageKey, e.target.value)}
                                      className="text-xs bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      <option value="_self">Même onglet</option>
                                      <option value="_blank">Nouvel onglet</option>
                                    </select>
                                  )}
                                  <Button
                                    type="button"
                                    onClick={() => onSetEditingLegalPage(null)}
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
                                    {onGetLegalPageLabel(pageKey)}
                                  </span>
                                  {typeof pageKey === 'string' && pageKey.startsWith('custom-') && onGetLegalPageUrl(pageKey) && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {onGetLegalPageUrl(pageKey)}
                                    </div>
                                  )}
                                  {typeof pageKey === 'string' && pageKey.startsWith('custom-') && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                      <Link className="w-3 h-3" />
                                      {onGetLegalPageTarget(pageKey) === '_blank' ? 'Nouvel onglet' : 'Même onglet'}
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
                              onClick={() => onMoveBottomLink(index, index - 1)}
                              size="sm"
                              variant="ghost"
                              title="Déplacer vers le haut"
                            >
                              <ChevronUp className="w-3 h-3 mr-0" />
                            </Button>
                          )}
                          {index < footerData.bottomLinks.length - 1 && (
                            <Button
                              onClick={() => onMoveBottomLink(index, index + 1)}
                              size="sm"
                              variant="ghost"
                              title="Déplacer vers le bas"
                            >
                              <ChevronDown className="w-3 h-3 mr-0" />
                            </Button>
                          )}
                            {editingLegalPage !== pageKey && (
                              <Button
                                type="button"
                                onClick={() => onSetEditingLegalPage(typeof pageKey === 'string' ? pageKey : pageKey.id)}
                                size="sm"
                                variant="secondary"
                              >
                                Éditer
                              </Button>
                            )}
                            <Button
                              onClick={() => onRemoveBottomLink(typeof pageKey === 'string' ? pageKey : pageKey.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Retirer cette page"
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
                  onClick={onAddCustomLegalLink}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Lien personnalisé
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalSection;
