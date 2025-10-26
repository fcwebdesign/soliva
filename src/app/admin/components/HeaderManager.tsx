"use client";
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trash2, ChevronUp, ChevronDown, UserPen, Menu, Plus, Link } from 'lucide-react';

interface HeaderManagerProps {
  content: any;
  onSave: (data: any) => void;
}

interface HeaderData {
  logo: string;
  logoImage: string;
  location: string;
  pages: string[];
  pageLabels: Record<string, any>;
}

interface AvailablePage {
  key: string;
  label: string;
  path: string;
  isCustom?: boolean;
}

declare global {
  interface Window {
    getCurrentHeaderData?: () => HeaderData;
  }
}

const HeaderManager: React.FC<HeaderManagerProps> = ({ content, onSave }) => {
  const [headerData, setHeaderData] = useState<HeaderData>({
    logo: content?.nav?.logo || 'soliva',
    logoImage: content?.nav?.logoImage || '',
    location: content?.nav?.location || 'paris, le havre',
    pages: content?.nav?.items || ['home', 'work', 'studio', 'blog', 'contact'],
    pageLabels: content?.nav?.pageLabels || {}
  });

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [logoType, setLogoType] = useState<'text' | 'image'>(content?.nav?.logoImage ? 'image' : 'text');
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Exposer les données actuelles via une fonction globale
  useEffect(() => {
    window.getCurrentHeaderData = () => headerData;
    return () => {
      delete window.getCurrentHeaderData;
    };
  }, [headerData]);

  // Pages disponibles pour sélection
  const availablePages: AvailablePage[] = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
    // Ajouter automatiquement les pages personnalisées
    ...(content?.pages?.pages || []).map((page: any) => ({
      key: page.slug || page.id,
      label: page.title || 'Page personnalisée',
      path: `/${page.slug || page.id}`,
      isCustom: true
    }))
  ];

  // Filtrer les pages selon le terme de recherche
  const filteredPages = availablePages.filter(page =>
    page.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mettre à jour les données quand le contenu change
  useEffect(() => {
    setHeaderData({
      logo: content?.nav?.logo || 'soliva',
      logoImage: content?.nav?.logoImage || '',
      location: content?.nav?.location || 'paris, le havre',
      pages: content?.nav?.items || ['home', 'work', 'studio', 'blog', 'contact'],
      pageLabels: content?.nav?.pageLabels || {}
    });
    setLogoType(content?.nav?.logoImage ? 'image' : 'text');
  }, [content]);



  const togglePage = (pageKey: string) => {
    setHeaderData(prev => {
      const newPages = prev.pages.includes(pageKey)
        ? prev.pages.filter(p => p !== pageKey)
        : [...prev.pages, pageKey];
      console.log('🔄 HeaderManager: Pages mises à jour:', newPages);
      const next = {
        ...prev,
        pages: newPages
      };
      return next;
    });
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    const newPages = [...headerData.pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    console.log('🔄 HeaderManager: Pages réorganisées:', newPages);
    setHeaderData(prev => ({ ...prev, pages: newPages }));
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const updatePageLabel = (pageKey: string, newLabel: string) => {
    setHeaderData(prev => {
      const newPageLabels = {
        ...prev.pageLabels,
        [pageKey]: newLabel
      };
      console.log('🔄 HeaderManager: Labels mis à jour:', newPageLabels);
      const next = {
        ...prev,
        pageLabels: newPageLabels
      };
      return next;
    });
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const updatePageUrl = (pageKey: string, newUrl: string) => {
    setHeaderData(prev => {
      const currentLabel = prev.pageLabels[pageKey];
      const newPageLabels = {
        ...prev.pageLabels,
        [pageKey]: {
          ...(typeof currentLabel === 'object' ? currentLabel : { title: currentLabel }),
          customUrl: newUrl
        }
      };
      return { ...prev, pageLabels: newPageLabels };
    });
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const updatePageTarget = (pageKey: string, newTarget: string) => {
    setHeaderData(prev => {
      const currentLabel = prev.pageLabels[pageKey];
      const newPageLabels = {
        ...prev.pageLabels,
        [pageKey]: {
          ...(typeof currentLabel === 'object' ? currentLabel : { title: currentLabel }),
          target: newTarget
        }
      };
      return { ...prev, pageLabels: newPageLabels };
    });
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const getPageLabel = (pageKey: string): string => {
    const defaultLabel = availablePages.find(p => p.key === pageKey)?.label || pageKey;
    const customLink = headerData.pageLabels[pageKey];
    if (customLink && typeof customLink === 'object') {
      return customLink.title || defaultLabel;
    }
    return customLink || defaultLabel;
  };

  const getPageUrl = (pageKey: string): string => {
    const customLink = headerData.pageLabels[pageKey];
    if (customLink && typeof customLink === 'object') {
      return customLink.customUrl || '';
    }
    return '';
  };

  const getPageTarget = (pageKey: string): string => {
    const customLink = headerData.pageLabels[pageKey];
    if (customLink && typeof customLink === 'object') {
      return customLink.target || '_blank';
    }
    return '_blank';
  };

  const addCustomNavLink = () => {
    const newLinkKey = `custom-${Date.now()}`;
    setHeaderData(prev => ({
      ...prev,
      pages: [...prev.pages, newLinkKey],
      pageLabels: {
        ...prev.pageLabels,
        [newLinkKey]: { title: 'Nouveau lien', url: 'custom', customUrl: '', target: '_blank' }
      }
    }));
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    setDragOverIndex(null);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      movePage(draggedItem, dropIndex);
    }
    setDraggedItem(null);
    setDragOverIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleSave = async () => {
    const newContent = {
      ...content,
      nav: {
        logo: headerData.logo,
        logoImage: headerData.logoImage,
        location: headerData.location,
        items: headerData.pages,
        pageLabels: headerData.pageLabels
      }
    };
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (!res.ok) throw new Error('save');
      onSave?.(newContent);
    } catch (e) {
      console.error('Erreur sauvegarde navigation:', e);
    }
  };

  return (
    <div>

      <div className="space-y-6">
        {/* Section : Identité */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            <UserPen className="w-6 h-6 inline mr-2 text-gray-600" />
            Identité
          </h3>
          {/* Logo - Texte et Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            
            {/* Type de logo */}
            <div className="mb-4">
              <RadioGroup
                value={logoType}
                onValueChange={(value: string) => {
                  setLogoType(value as 'text' | 'image');
                  if (value === 'text') {
                    setHeaderData(prev => ({ ...prev, logoImage: '' }));
                  } else {
                    setHeaderData(prev => ({ ...prev, logo: 'soliva' }));
                  }
                }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="text-sm">Logo texte</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="text-sm">Logo image</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Logo texte */}
            {logoType === 'text' && (
              <input
                type="text"
                value={headerData.logo}
                onChange={(e) => {
                  setHeaderData(prev => ({ ...prev, logo: e.target.value }));
                  window.dispatchEvent(new CustomEvent('navigation-changed'));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="soliva"
              />
            )}

            {/* Logo image */}
            {logoType === 'image' && (
              <div>
                <MediaUploader
                  currentUrl={headerData.logoImage}
                  onUpload={(url) => {
                    setHeaderData(prev => ({ ...prev, logoImage: url }));
                    window.dispatchEvent(new CustomEvent('navigation-changed'));
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés : JPG, PNG, SVG. Taille recommandée : 200x60px
                </p>
              </div>
            )}
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation
            </label>
            <input
              type="text"
              value={headerData.location}
              onChange={(e) => {
                setHeaderData(prev => ({ ...prev, location: e.target.value }));
                window.dispatchEvent(new CustomEvent('navigation-changed'));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="paris, le havre"
            />
          </div>
        </div>

        {/* Section : Navigation */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {filteredPages.map((page) => (
                  <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Checkbox
                      checked={headerData.pages.includes(page.key)}
                      onCheckedChange={() => togglePage(page.key)}
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
            
            {/* Pages sélectionnées (ordre) */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Ordre d'affichage :</h4>
              <div className="space-y-2">
                {headerData.pages.map((pageKey, index) => {
                  const page = availablePages.find(p => p.key === pageKey);
                  const isDragging = draggedItem === index;
                  const isDragOver = dragOverIndex === index;
                  
                  return (
                    <div 
                      key={pageKey} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
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
                          {editingPage === pageKey ? (
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={getPageLabel(pageKey)}
                                onChange={(e) => updatePageLabel(pageKey, e.target.value)}
                                className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={page?.label || pageKey}
                                autoFocus
                              />
                              {pageKey.startsWith('custom-') && (
                                <input
                                  type="text"
                                  value={getPageUrl(pageKey)}
                                  onChange={(e) => updatePageUrl(pageKey, e.target.value)}
                                  className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="https://exemple.com"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                {pageKey.startsWith('custom-') && (
                                  <select
                                    value={getPageTarget(pageKey)}
                                    onChange={(e) => updatePageTarget(pageKey, e.target.value)}
                                    className="text-xs bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="_self">Même onglet</option>
                                    <option value="_blank">Nouvel onglet</option>
                                  </select>
                                )}
                                <Button
                                  type="button"
                                  onClick={() => setEditingPage(null)}
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
                                  {getPageLabel(pageKey)}
                                </span>
                                {pageKey.startsWith('custom-') && getPageUrl(pageKey) && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {getPageUrl(pageKey)}
                                  </div>
                                )}
                                {pageKey.startsWith('custom-') && (
                                  <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Link className="w-3 h-3" />
                                    {getPageTarget(pageKey) === '_blank' ? 'Nouvel onglet' : 'Même onglet'}
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
                            onClick={() => movePage(index, index - 1)}
                            size="sm"
                            variant="ghost"
                            title="Déplacer vers le haut"
                          >
                            <ChevronUp className="w-3 h-3 mr-0" />
                          </Button>
                        )}
                        {index < headerData.pages.length - 1 && (
                          <Button
                            onClick={() => movePage(index, index + 1)}
                            size="sm"
                            variant="ghost"
                            title="Déplacer vers le bas"
                          >
                            <ChevronDown className="w-3 h-3 mr-0" />
                          </Button>
                        )}
                        {editingPage !== pageKey && (
                          <Button
                            type="button"
                            onClick={() => setEditingPage(pageKey)}
                            size="sm"
                            variant="secondary"
                          >
                            Éditer
                          </Button>
                        )}
                        <Button
                          onClick={() => togglePage(pageKey)}
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
                onClick={addCustomNavLink}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Lien personnalisé
              </Button>
            </div>
            </div>

          </div>
        </div>

        {/* Bouton de sauvegarde retiré: la barre en haut gère la sauvegarde */}
      </div>
    </div>
  );
};

export default HeaderManager; 
