"use client";
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';

const HeaderManager = ({ content, onSave }) => {
  const [headerData, setHeaderData] = useState({
    logo: content?.nav?.logo || 'soliva',
    logoImage: content?.nav?.logoImage || '',
    location: content?.nav?.location || 'paris, le havre',
    pages: content?.nav?.items || ['home', 'work', 'studio', 'blog', 'contact'],
    pageLabels: content?.nav?.pageLabels || {}
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [logoType, setLogoType] = useState(content?.nav?.logoImage ? 'image' : 'text');
  const [editingPage, setEditingPage] = useState(null);

  // Exposer les données actuelles via une fonction globale
  useEffect(() => {
    window.getCurrentHeaderData = () => headerData;
    return () => {
      delete window.getCurrentHeaderData;
    };
  }, [headerData]);

  // Pages disponibles pour sélection
  const availablePages = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
    // Ajouter automatiquement les pages personnalisées
    ...(content?.pages?.pages || []).map(page => ({
      key: page.slug || page.id,
      label: page.title || 'Page personnalisée',
      path: `/${page.slug || page.id}`,
      isCustom: true
    }))
  ];

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
    // Réinitialiser l'état d'édition après sauvegarde
    if (isEditing) {
      setIsEditing(false);
    }
  }, [content]);



  const togglePage = (pageKey) => {
    setHeaderData(prev => {
      const newPages = prev.pages.includes(pageKey)
        ? prev.pages.filter(p => p !== pageKey)
        : [...prev.pages, pageKey];
      console.log('🔄 HeaderManager: Pages mises à jour:', newPages);
      return {
        ...prev,
        pages: newPages
      };
    });
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const movePage = (fromIndex, toIndex) => {
    const newPages = [...headerData.pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    console.log('🔄 HeaderManager: Pages réorganisées:', newPages);
    setHeaderData(prev => ({ ...prev, pages: newPages }));
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const updatePageLabel = (pageKey, newLabel) => {
    setHeaderData(prev => {
      const newPageLabels = {
        ...prev.pageLabels,
        [pageKey]: newLabel
      };
      console.log('🔄 HeaderManager: Labels mis à jour:', newPageLabels);
      return {
        ...prev,
        pageLabels: newPageLabels
      };
    });
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('navigation-changed'));
  };

  const getPageLabel = (pageKey) => {
    const defaultLabel = availablePages.find(p => p.key === pageKey)?.label || pageKey;
    return headerData.pageLabels[pageKey] || defaultLabel;
  };

  // Drag & Drop handlers améliorés
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    setDragOverIndex(null);
    e.dataTransfer.effectAllowed = 'move';
    
    // Ajouter une classe au body pour le style de drag
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, dropIndex) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Configuration du Header
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            {isEditing ? 'Fermer' : 'Modifier'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Logo - Texte et Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            
            {/* Type de logo */}
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="logoType"
                    value="text"
                    checked={logoType === 'text'}
                    onChange={() => {
                      setLogoType('text');
                      setHeaderData(prev => ({ ...prev, logoImage: '' }));
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Logo texte</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="logoType"
                    value="image"
                    checked={logoType === 'image'}
                    onChange={() => {
                      setLogoType('image');
                      setHeaderData(prev => ({ ...prev, logo: 'soliva' }));
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Logo image</span>
                </label>
              </div>
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

          {/* Pages de navigation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pages de navigation
            </label>
            <p className="text-sm text-gray-600 mb-3">Utilisez les boutons "Modifier" pour personnaliser les noms des pages</p>
            
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
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={getPageLabel(pageKey)}
                                onChange={(e) => updatePageLabel(pageKey, e.target.value)}
                                className="flex-1 text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={page?.label || pageKey}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingPage(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingPage(null);
                                  }
                                }}
                                onBlur={() => setEditingPage(null)}
                              />

                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-sm font-medium text-gray-700">
                                {getPageLabel(pageKey)}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingPage(pageKey)}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Modifier
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Glisser-déposer</span>
                          {isDragging && <span className="text-xs text-blue-600 font-medium">En cours...</span>}
                          {isDragOver && <span className="text-xs text-green-600 font-medium">Déposer ici</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePage(pageKey)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                          title="Retirer cette page"
                        >
                          ✕
                        </button>
                        {index > 0 && (
                          <button
                            onClick={() => movePage(index, index - 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            title="Déplacer vers le haut"
                          >
                            ↑
                          </button>
                        )}
                        {index < headerData.pages.length - 1 && (
                          <button
                            onClick={() => movePage(index, index + 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            title="Déplacer vers le bas"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pages disponibles */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Pages disponibles :</h4>
              <div className="grid grid-cols-2 gap-2">
                {availablePages.map((page) => (
                  <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headerData.pages.includes(page.key)}
                      onChange={() => togglePage(page.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{page.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aperçu */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu du header :</h4>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">
                {logoType === 'image' && headerData.logoImage ? (
                  <img src={headerData.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
                ) : (
                  headerData.logo
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {headerData.pages.map((pageKey) => (
                  <span key={pageKey}>{getPageLabel(pageKey)}</span>
                ))}
              </div>
              <div className="text-xs text-gray-500">{headerData.location}</div>
            </div>
          </div>

          {/* Informations */}
          <div className="text-sm text-gray-600">
            <p><strong>Logo :</strong> {logoType === 'image' ? 'Image' : headerData.logo}</p>
            <p><strong>Localisation :</strong> {headerData.location}</p>
            <p><strong>Pages :</strong> {headerData.pages.length} page(s) sélectionnée(s)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderManager; 