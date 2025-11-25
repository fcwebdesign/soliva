'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown } from 'lucide-react';
import { getCategorizedBlocksForColumns, getCategorizedBlocksAll } from '@/utils/blockCategories';

interface BlockSelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlock: (blockType: string) => void;
  title?: string;
  excludeLayouts?: boolean; // Si true, exclut les blocs de layout (pour les colonnes)
}

export default function BlockSelectorSheet({ 
  open, 
  onOpenChange, 
  onSelectBlock,
  title = 'Choisir un type de bloc',
  excludeLayouts = false
}: BlockSelectorSheetProps) {
  const [blockSearchTerm, setBlockSearchTerm] = useState('');
  const [openBlockGroups, setOpenBlockGroups] = useState<{ [key: string]: boolean }>({});

  // Réinitialiser la recherche à la fermeture
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setBlockSearchTerm('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px] p-0 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <SheetTitle className="text-sm font-semibold text-gray-900">{title}</SheetTitle>
            <button
              onClick={() => handleOpenChange(false)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          {/* Champ de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher les blocs..."
              value={blockSearchTerm}
              onChange={(e) => setBlockSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Liste des blocs */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            // Si excludeLayouts est false, utiliser tous les blocs (y compris layouts)
            // Sinon, utiliser getCategorizedBlocksForColumns qui exclut les layouts
            const categorizedBlocks = excludeLayouts 
              ? getCategorizedBlocksForColumns()
              : getCategorizedBlocksAll();
            const filteredCategorized = Object.entries(categorizedBlocks).map(([categoryName, categoryBlocks]) => {
              const filtered = categoryBlocks.filter((block: any) => {
                const searchLower = blockSearchTerm.toLowerCase();
                return block.label?.toLowerCase().includes(searchLower) || 
                       block.type?.toLowerCase().includes(searchLower) ||
                       categoryName.toLowerCase().includes(searchLower);
              });
              return { categoryName, blocks: filtered };
            }).filter(({ blocks }) => blocks.length > 0);

            if (filteredCategorized.length === 0) {
              return (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucun bloc trouvé pour "{blockSearchTerm}"
                </div>
              );
            }

            return (
              <div className="py-2">
                {filteredCategorized.map(({ categoryName, blocks }) => (
                  <div key={categoryName} className="mb-1">
                    {/* Header de catégorie */}
                    <button
                      onClick={() => setOpenBlockGroups(prev => ({ ...prev, [categoryName]: !prev[categoryName] }))}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>{categoryName}</span>
                      <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${openBlockGroups[categoryName] ? "rotate-180" : "rotate-0"}`} />
                    </button>
                    
                    {/* Liste compacte des blocs */}
                    {openBlockGroups[categoryName] && (
                      <div className="border-t border-gray-100">
                        {blocks.map((block: any) => (
                          <button
                            key={block.type}
                            onClick={() => {
                              onSelectBlock(block.type);
                              handleOpenChange(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <span className="w-3 h-3 flex-shrink-0 flex items-center justify-center">{block.preview}</span>
                            <span className="flex-1 text-left truncate">{block.label || block.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

