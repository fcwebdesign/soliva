"use client";
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';

const FooterManager = ({ content, onSave }) => {
  const [footerData, setFooterData] = useState({
    logo: content?.footer?.logo || 'soliva',
    logoImage: content?.footer?.logoImage || '',
    description: content?.footer?.description || '',
    links: content?.footer?.links || [],
    socialLinks: content?.footer?.socialLinks || [],
    copyright: content?.footer?.copyright || '© 2024 Soliva. Tous droits réservés.',
    bottomLinks: content?.footer?.bottomLinks || [],
    legalPageLabels: content?.footer?.legalPageLabels || {}
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [logoType, setLogoType] = useState(content?.footer?.logoImage ? 'image' : 'text');
  const [editingLink, setEditingLink] = useState(null);
  const [editingLegalPage, setEditingLegalPage] = useState(null);


  // Exposer les données actuelles via une fonction globale
  useEffect(() => {
    window.getCurrentFooterData = () => footerData;
    return () => {
      delete window.getCurrentFooterData;
    };
  }, [footerData]);

  // Mettre à jour les données quand le contenu change
  useEffect(() => {
    setFooterData({
      logo: content?.footer?.logo || 'soliva',
      logoImage: content?.footer?.logoImage || '',
      description: content?.footer?.description || '',
      links: content?.footer?.links || [],
      socialLinks: content?.footer?.socialLinks || [],
      copyright: content?.footer?.copyright || '© 2024 Soliva. Tous droits réservés.',
      bottomLinks: content?.footer?.bottomLinks || [],
      legalPageLabels: content?.footer?.legalPageLabels || {}
    });
    setLogoType(content?.footer?.logoImage ? 'image' : 'text');
    // Réinitialiser l'état d'édition après sauvegarde
    if (isEditing) {
      setIsEditing(false);
    }
  }, [content]);

  // Pages disponibles pour sélection
  const availablePages = [
    { key: 'home', label: 'Accueil', path: 'home' },
    { key: 'work', label: 'Réalisations', path: 'work' },
    { key: 'studio', label: 'Studio', path: 'studio' },
    { key: 'blog', label: 'Journal', path: 'blog' },
    { key: 'contact', label: 'Contact', path: 'contact' }
  ];

  // Pages disponibles pour les liens légaux (même que navigation)
  const availableLegalPages = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' }
  ];

  // Réseaux sociaux disponibles
  const [availableSocials, setAvailableSocials] = useState([
    { key: 'facebook', label: 'Facebook', icon: '📘' },
    { key: 'twitter', label: 'Twitter', icon: '🐦' },
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'youtube', label: 'YouTube', icon: '📺' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'snapchat', label: 'Snapchat', icon: '👻' },
    { key: 'pinterest', label: 'Pinterest', icon: '📌' },
    { key: 'medium', label: 'Medium', icon: '📝' },
    { key: 'discord', label: 'Discord', icon: '🎮' },
    { key: 'twitch', label: 'Twitch', icon: '🎬' },
    { key: 'github', label: 'GitHub', icon: '💻' },
    { key: 'behance', label: 'Behance', icon: '🎨' },
    { key: 'dribbble', label: 'Dribbble', icon: '🏀' },
    { key: 'spotify', label: 'Spotify', icon: '🎧' },
    { key: 'soundcloud', label: 'SoundCloud', icon: '🎤' },
    { key: 'vimeo', label: 'Vimeo', icon: '🎥' },
    { key: 'reddit', label: 'Reddit', icon: '🤖' },
    { key: 'telegram', label: 'Telegram', icon: '✈️' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { key: 'slack', label: 'Slack', icon: '💡' },
    { key: 'mastodon', label: 'Mastodon', icon: '🐘' }
  ]);

  // Charger les réseaux sociaux depuis l'API
  useEffect(() => {
    const loadSocialNetworks = async () => {
      try {
        const response = await fetch('/api/admin/social-networks');
        if (response.ok) {
          const data = await response.json();
          // Vérifier que data est un tableau avant de l'assigner
          if (Array.isArray(data)) {
            setAvailableSocials(data);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réseaux sociaux:', error);
        // En cas d'erreur, garder les valeurs par défaut
      }
    };
    loadSocialNetworks();
  }, []);

  const toggleLink = (pageKey) => {
    setFooterData(prev => {
      const existingLink = prev.links.find(link => link.url === pageKey);
      if (existingLink) {
        // Retirer le lien
        return {
          ...prev,
          links: prev.links.filter(link => link.url !== pageKey)
        };
      } else {
        // Ajouter le lien
        const page = availablePages.find(p => p.key === pageKey);
        return {
          ...prev,
          links: [...prev.links, { title: page?.label || pageKey, url: pageKey, customUrl: '', target: '_self' }]
        };
      }
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const addCustomLink = () => {
    setFooterData(prev => ({
      ...prev,
      links: [...prev.links, { title: 'Nouveau lien', url: 'custom', customUrl: '', target: '_blank' }]
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLinkUrl = (index, newUrl) => {
    setFooterData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], customUrl: newUrl };
      return { ...prev, links: newLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLinkTarget = (index, newTarget) => {
    setFooterData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], target: newTarget };
      return { ...prev, links: newLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const moveLink = (fromIndex, toIndex) => {
    const newLinks = [...footerData.links];
    const [movedLink] = newLinks.splice(fromIndex, 1);
    newLinks.splice(toIndex, 0, movedLink);
    setFooterData(prev => ({ ...prev, links: newLinks }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLinkTitle = (index, newTitle) => {
    setFooterData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], title: newTitle };
      return { ...prev, links: newLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const addSocialLink = () => {
    setFooterData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };



  const updateSocialLink = (index, field, value) => {
    setFooterData(prev => {
      const newSocialLinks = [...prev.socialLinks];
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
      return { ...prev, socialLinks: newSocialLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const removeSocialLink = (index) => {
    setFooterData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  // Fonctions pour les liens légaux (bottomLinks)
  const addBottomLink = () => {
    setFooterData(prev => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, { title: 'Nouveau lien légal', url: '' }]
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateBottomLink = (index, field, value) => {
    setFooterData(prev => {
      const newBottomLinks = [...prev.bottomLinks];
      newBottomLinks[index] = { ...newBottomLinks[index], [field]: value };
      return { ...prev, bottomLinks: newBottomLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const removeBottomLink = (pageKey) => {
    setFooterData(prev => ({
      ...prev,
      bottomLinks: prev.bottomLinks.filter(p => p !== pageKey)
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const toggleLegalPage = (pageKey) => {
    setFooterData(prev => {
      const newBottomLinks = prev.bottomLinks.includes(pageKey)
        ? prev.bottomLinks.filter(p => p !== pageKey)
        : [...prev.bottomLinks, pageKey];
      console.log('🔄 FooterManager: Liens légaux mis à jour:', newBottomLinks);
      return {
        ...prev,
        bottomLinks: newBottomLinks
      };
    });
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const moveBottomLink = (fromIndex, toIndex) => {
    const newBottomLinks = [...footerData.bottomLinks];
    const [movedPage] = newBottomLinks.splice(fromIndex, 1);
    newBottomLinks.splice(toIndex, 0, movedPage);
    console.log('🔄 FooterManager: Liens légaux réorganisés:', newBottomLinks);
    setFooterData(prev => ({ ...prev, bottomLinks: newBottomLinks }));
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const getLegalPageLabel = (pageKey) => {
    const defaultLabel = availableLegalPages.find(p => p.key === pageKey)?.label || pageKey;
    return footerData.legalPageLabels?.[pageKey] || defaultLabel;
  };

  const updateLegalPageLabel = (pageKey, newLabel) => {
    setFooterData(prev => {
      const newLegalPageLabels = {
        ...prev.legalPageLabels,
        [pageKey]: newLabel
      };
      console.log('🔄 FooterManager: Labels légaux mis à jour:', newLegalPageLabels);
      return {
        ...prev,
        legalPageLabels: newLegalPageLabels
      };
    });
    // Déclencher hasUnsavedChanges
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  // Drag & Drop handlers pour les liens
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    setDragOverIndex(null);
    e.dataTransfer.effectAllowed = 'move';
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
      if (draggedItem.startsWith('bottom-')) {
        // Gestion des liens légaux
        const draggedIndex = parseInt(draggedItem.replace('bottom-', ''));
        const dropIndexNum = parseInt(dropIndex.replace('bottom-', ''));
        moveBottomLink(draggedIndex, dropIndexNum);
      } else {
        // Gestion des liens normaux
        moveLink(draggedItem, dropIndex);
      }
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Configuration du Footer
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
          {/* Section : Identité */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              🏢 Identité
            </h3>
            
            {/* Logo - Texte et Image */}
            <div className="mb-6">
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
                      setFooterData(prev => ({ ...prev, logoImage: '' }));
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
                      setFooterData(prev => ({ ...prev, logo: 'soliva' }));
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
                value={footerData.logo}
                onChange={(e) => {
                  setFooterData(prev => ({ ...prev, logo: e.target.value }));
                  window.dispatchEvent(new CustomEvent('footer-changed'));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="soliva"
              />
            )}

            {/* Logo image */}
            {logoType === 'image' && (
              <div>
                <MediaUploader
                  currentUrl={footerData.logoImage}
                  onUpload={(url) => {
                    setFooterData(prev => ({ ...prev, logoImage: url }));
                    window.dispatchEvent(new CustomEvent('footer-changed'));
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés : JPG, PNG, SVG. Taille recommandée : 200x60px
                </p>
              </div>
            )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={footerData.description}
                onChange={(e) => {
                  setFooterData(prev => ({ ...prev, description: e.target.value }));
                  window.dispatchEvent(new CustomEvent('footer-changed'));
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description du footer..."
              />
            </div>
          </div>

          {/* Section : Navigation */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              🔗 Navigation
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Liens
              </label>
            <p className="text-sm text-gray-600 mb-3">Utilisez les boutons "Modifier" pour personnaliser les noms des liens</p>
            
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
                          {editingLink === index ? (
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => updateLinkTitle(index, e.target.value)}
                                className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nom du lien"
                                autoFocus
                              />
                              {link.url === 'custom' && (
                                <input
                                  type="text"
                                  value={link.customUrl}
                                  onChange={(e) => updateLinkUrl(index, e.target.value)}
                                  className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="https://exemple.com"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                {link.url === 'custom' && (
                                  <select
                                    value={link.target || '_blank'}
                                    onChange={(e) => updateLinkTarget(index, e.target.value)}
                                    className="text-xs bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="_self">Même onglet</option>
                                    <option value="_blank">Nouvel onglet</option>
                                  </select>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingLink(null)}
                                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {link.title}
                                </span>
                                {link.url === 'custom' && link.customUrl && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {link.customUrl}
                                  </div>
                                )}
                                {link.url === 'custom' && (
                                  <div className="text-xs text-gray-400">
                                    {link.target === '_blank' ? '🔗 Nouvel onglet' : '📄 Même onglet'}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingLink(index)}
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
                          onClick={() => toggleLink(link.url)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                          title="Retirer ce lien"
                        >
                          ✕
                        </button>
                        {index > 0 && (
                          <button
                            onClick={() => moveLink(index, index - 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            title="Déplacer vers le haut"
                          >
                            ↑
                          </button>
                        )}
                        {index < footerData.links.length - 1 && (
                          <button
                            onClick={() => moveLink(index, index + 1)}
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

            {/* Liens disponibles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Liens disponibles :</h4>
                <button
                  onClick={addCustomLink}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  + Lien personnalisé
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availablePages.map((page) => (
                  <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={footerData.links.some(link => link.url === page.key)}
                      onChange={() => toggleLink(page.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{page.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

          {/* Section : Réseaux sociaux */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              📱 Réseaux sociaux
            </h3>
            
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={addSocialLink}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-2">
              {footerData.socialLinks.map((social, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={social.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un réseau</option>
                      {Array.isArray(availableSocials) && availableSocials.map(socialOption => (
                        <option key={socialOption.key} value={socialOption.key}>
                          {socialOption.icon} {socialOption.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={social.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="URL du profil"
                      />
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                        title="Supprimer ce réseau social"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section : Légal */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              ⚖️ Légal
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
                  onChange={(e) => {
                    setFooterData(prev => ({ ...prev, copyright: e.target.value }));
                    window.dispatchEvent(new CustomEvent('footer-changed'));
                  }}
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
                
                {/* Liens sélectionnés (ordre) */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Ordre d'affichage :</h4>
                  <div className="space-y-2">
                    {footerData.bottomLinks.map((pageKey, index) => {
                      const page = availableLegalPages.find(p => p.key === pageKey);
                      const isDragging = draggedItem === `bottom-${index}`;
                      const isDragOver = dragOverIndex === `bottom-${index}`;
                      
                      return (
                        <div 
                          key={pageKey} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, `bottom-${index}`)}
                          onDragOver={(e) => handleDragOver(e, `bottom-${index}`)}
                          onDrop={(e) => handleDrop(e, `bottom-${index}`)}
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
                              {editingLegalPage === pageKey ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={getLegalPageLabel(pageKey)}
                                    onChange={(e) => updateLegalPageLabel(pageKey, e.target.value)}
                                    className="flex-1 text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={page?.label || pageKey}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingLegalPage(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingLegalPage(null);
                                      }
                                    }}
                                    onBlur={() => setEditingLegalPage(null)}
                                  />
                                </div>
                              ) : (
                                <>
                                  <span className="flex-1 text-sm font-medium text-gray-700">
                                    {getLegalPageLabel(pageKey)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingLegalPage(pageKey)}
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
                              onClick={() => removeBottomLink(pageKey)}
                              className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                              title="Retirer cette page"
                            >
                              ✕
                            </button>
                            {index > 0 && (
                              <button
                                onClick={() => moveBottomLink(index, index - 1)}
                                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                title="Déplacer vers le haut"
                              >
                                ↑
                              </button>
                            )}
                            {index < footerData.bottomLinks.length - 1 && (
                              <button
                                onClick={() => moveBottomLink(index, index + 1)}
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
                    {availableLegalPages.map((page) => (
                      <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={footerData.bottomLinks.includes(page.key)}
                          onChange={() => toggleLegalPage(page.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{page.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aperçu */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu du footer :</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">
                  {logoType === 'image' && footerData.logoImage ? (
                    <img src={footerData.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
                  ) : (
                    footerData.logo
                  )}
                </div>
              </div>
              {footerData.description && (
                <p className="text-sm text-gray-600">{footerData.description}</p>
              )}
              {footerData.links.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {footerData.links.map((link, index) => (
                    <span key={index}>{link.title}</span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500">{footerData.copyright}</div>
              {footerData.bottomLinks.length > 0 && (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {footerData.bottomLinks.map((pageKey, index) => (
                    <span key={index}>{getLegalPageLabel(pageKey)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="text-sm text-gray-600">
            <p><strong>Logo :</strong> {logoType === 'image' ? 'Image' : footerData.logo}</p>
            <p><strong>Description :</strong> {footerData.description || 'Aucune'}</p>
            <p><strong>Liens :</strong> {footerData.links.length} lien(s)</p>
            <p><strong>Réseaux sociaux :</strong> {footerData.socialLinks.length} réseau(x)</p>
            <p><strong>Liens légaux :</strong> {footerData.bottomLinks.length} lien(s)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterManager; 