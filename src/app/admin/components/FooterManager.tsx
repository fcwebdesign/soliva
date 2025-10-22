"use client";
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trash2, ChevronUp, ChevronDown, Plus, UserPen, CircleFadingPlus, Scale, Menu, Link } from 'lucide-react';

// Étendre l'interface Window pour inclure getCurrentFooterData
declare global {
  interface Window {
    getCurrentFooterData?: () => FooterData;
  }
}

interface FooterManagerProps {
  content: any;
  onSave: (data: any) => void;
}

interface FooterData {
  logo: string;
  logoImage: string;
  description: string;
  links: Array<{
    id?: string;
    label?: string;
    title?: string;
    url: string;
    customUrl?: string;
    target: string;
  }>;
  socialLinks: Array<{
    id?: string;
    platform: string;
    url: string;
  }>;
  copyright: string;
  bottomLinks: Array<string | {
    id: string;
    label: string;
    url: string;
  }>;
  legalPageLabels: Record<string, string | {
    title: string;
    url: string;
    customUrl: string;
    target: string;
  }>;
}

const FooterManager = ({ content, onSave }: FooterManagerProps): React.JSX.Element => {
  const [footerData, setFooterData] = useState<FooterData>({
    logo: content?.footer?.logo || 'soliva',
    logoImage: content?.footer?.logoImage || '',
    description: content?.footer?.description || '',
    links: content?.footer?.links || [],
    socialLinks: content?.footer?.socialLinks || [],
    copyright: content?.footer?.copyright || '© 2024 Soliva. Tous droits réservés.',
    bottomLinks: content?.footer?.bottomLinks || [],
    legalPageLabels: content?.footer?.legalPageLabels || {}
  });

  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [logoType, setLogoType] = useState<'text' | 'image'>(content?.footer?.logoImage ? 'image' : 'text');
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editingLegalPage, setEditingLegalPage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [legalSearchTerm, setLegalSearchTerm] = useState<string>('');


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
    // Réinitialiser l'état après sauvegarde
  }, [content]);

  // Pages disponibles pour sélection (mise à jour dynamiquement)
  const availablePages = [
    { key: 'home', label: 'Accueil', path: 'home' },
    { key: 'work', label: 'Réalisations', path: 'work' },
    { key: 'studio', label: 'Studio', path: 'studio' },
    { key: 'blog', label: 'Journal', path: 'blog' },
    { key: 'contact', label: 'Contact', path: 'contact' },
    // Ajouter automatiquement les pages personnalisées
    ...(content?.pages?.pages || []).map(page => ({
      key: page.slug || page.id,
      label: page.title || 'Page personnalisée',
      path: page.slug || page.id,
      isCustom: true
    }))
  ];

  // Filtrer les pages selon le terme de recherche
  const filteredPages = availablePages.filter(page =>
    page.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pages disponibles pour les liens légaux (même que navigation)
  const availableLegalPages = [
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

  // Filtrer les pages légales selon le terme de recherche
  const filteredLegalPages = availableLegalPages.filter(page =>
    page.label.toLowerCase().includes(legalSearchTerm.toLowerCase())
  );

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
          links: [...prev.links, { id: `link-${Date.now()}`, label: page?.label || pageKey, title: page?.label || pageKey, url: pageKey, customUrl: '', target: '_self' }]
        };
      }
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const addCustomLink = () => {
    setFooterData(prev => ({
      ...prev,
      links: [...prev.links, { id: `link-${Date.now()}`, label: 'Nouveau lien', title: 'Nouveau lien', url: 'custom', customUrl: '', target: '_blank' }]
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const addCustomLegalLink = () => {
    const newLinkKey = `custom-${Date.now()}`;
    setFooterData(prev => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, newLinkKey],
      legalPageLabels: {
        ...prev.legalPageLabels,
        [newLinkKey]: { title: 'Nouveau lien', url: 'custom', customUrl: '', target: '_blank' }
      }
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLinkUrl = (index: number, newUrl: string) => {
    setFooterData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], customUrl: newUrl };
      return { ...prev, links: newLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLinkTarget = (index: number, newTarget: string) => {
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

  const updateLinkTitle = (index: number, newTitle: string) => {
    setFooterData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], title: newTitle, label: newTitle };
      return { ...prev, links: newLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const addSocialLink = () => {
    setFooterData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: `social-${Date.now()}`, platform: '', url: '' }]
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
      bottomLinks: [...prev.bottomLinks, { id: `bottom-${Date.now()}`, label: 'Nouveau lien légal', url: '' }]
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateBottomLink = (index: number, field: string, value: string) => {
    setFooterData(prev => {
      const newBottomLinks = [...prev.bottomLinks];
      const currentItem = newBottomLinks[index];
      if (typeof currentItem === 'object') {
        newBottomLinks[index] = { ...currentItem, [field]: value };
      }
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

  const getLegalPageLabel = (pageKey: string | { id: string; label: string; url: string; }): string => {
    const key = typeof pageKey === 'string' ? pageKey : pageKey.id;
    const defaultLabel = availableLegalPages.find(p => p.key === key)?.label || key;
    const customLink = footerData.legalPageLabels?.[key];
    if (customLink && typeof customLink === 'object') {
      return customLink.title || defaultLabel;
    }
    return (customLink as string) || defaultLabel;
  };

  const getLegalPageUrl = (pageKey: string | { id: string; label: string; url: string; }): string => {
    const key = typeof pageKey === 'string' ? pageKey : pageKey.id;
    const customLink = footerData.legalPageLabels?.[key];
    if (customLink && typeof customLink === 'object') {
      return customLink.customUrl || '';
    }
    return '';
  };

  const getLegalPageTarget = (pageKey: string | { id: string; label: string; url: string; }): string => {
    const key = typeof pageKey === 'string' ? pageKey : pageKey.id;
    const customLink = footerData.legalPageLabels?.[key];
    if (customLink && typeof customLink === 'object') {
      return customLink.target || '_blank';
    }
    return '_blank';
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

  const updateLegalPageUrl = (pageKey, newUrl) => {
    setFooterData(prev => {
      const currentLabel = prev.legalPageLabels[pageKey];
      const newLegalPageLabels = {
        ...prev.legalPageLabels,
        [pageKey]: {
          ...(typeof currentLabel === 'object' ? currentLabel : { title: currentLabel }),
          customUrl: newUrl
        }
      };
      return { ...prev, legalPageLabels: newLegalPageLabels };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLegalPageTarget = (pageKey, newTarget) => {
    setFooterData(prev => {
      const currentLabel = prev.legalPageLabels[pageKey];
      const newLegalPageLabels = {
        ...prev.legalPageLabels,
        [pageKey]: {
          ...(typeof currentLabel === 'object' ? currentLabel : { title: currentLabel }),
          target: newTarget
        }
      };
      return { ...prev, legalPageLabels: newLegalPageLabels };
    });
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
      if (typeof draggedItem === 'string' && draggedItem.startsWith('bottom-')) {
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
    <div>

      <div className="space-y-6">
          {/* Section : Identité */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              <UserPen className="w-6 h-6 inline mr-2 text-gray-600" />
              Identité
            </h3>
            
            {/* Logo - Texte et Image */}
            <div className="mb-6">
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
                    setFooterData(prev => ({ ...prev, logoImage: '' }));
                  } else {
                    setFooterData(prev => ({ ...prev, logo: 'soliva' }));
                  }
                }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="footer-text" />
                  <Label htmlFor="footer-text" className="text-sm">Logo texte</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="footer-image" />
                  <Label htmlFor="footer-image" className="text-sm">Logo image</Label>
                </div>
              </RadioGroup>
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
                        checked={footerData.links.some(link => link.url === page.path)}
                        onCheckedChange={() => toggleLink(page.path)}
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
                                value={link.title || link.label || ''}
                                onChange={(e) => updateLinkTitle(index, e.target.value)}
                                className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nom du lien"
                                autoFocus
                              />
                              {link.url === 'custom' && (
                                <input
                                  type="text"
                                  value={link.customUrl || ''}
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
                                <Button
                                  type="button"
                                  onClick={() => setEditingLink(null)}
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
                            onClick={() => moveLink(index, index - 1)}
                            size="sm"
                            variant="ghost"
                            title="Déplacer vers le haut"
                          >
                            <ChevronUp className="w-3 h-3 mr-0" />
                          </Button>
                        )}
                        {index < footerData.links.length - 1 && (
                          <Button
                            onClick={() => moveLink(index, index + 1)}
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
                            onClick={() => setEditingLink(index)}
                            size="sm"
                            variant="secondary"
                          >
                            Éditer
                          </Button>
                        )}
                        <Button
                          onClick={() => toggleLink(link.url)}
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
                  onClick={addCustomLink}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Lien personnalisé
                </Button>
              </div>
            </div>
          </div>
        </div>

          {/* Section : Réseaux sociaux */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              <CircleFadingPlus className="w-6 h-6 inline mr-2 text-gray-600" />
              Réseaux sociaux
            </h3>
            
            <div className="flex items-center justify-between mb-3">
              <Button
                onClick={addSocialLink}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
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
                      <Button
                        onClick={() => removeSocialLink(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Supprimer ce réseau social"
                      >
                        <Trash2 className="w-3 h-3 mr-0" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section : Légal */}
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
                        onChange={(e) => setLegalSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {filteredLegalPages.map((page) => (
                        <label key={page.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <Checkbox
                            checked={footerData.bottomLinks.includes(page.key)}
                            onCheckedChange={() => toggleLegalPage(page.key)}
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
                      const isDragging = draggedItem === `bottom-${index}`;
                      const isDragOver = dragOverIndex === index;
                      
                      return (
                        <div 
                          key={typeof pageKey === 'string' ? pageKey : pageKey.id} 
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
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={getLegalPageLabel(pageKey)}
                                    onChange={(e) => updateLegalPageLabel(pageKey, e.target.value)}
                                    className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={page?.label || pageKey}
                                    autoFocus
                                  />
                                  {typeof pageKey === 'string' && pageKey.startsWith('custom-') && (
                                    <input
                                      type="text"
                                      value={getLegalPageUrl(pageKey)}
                                      onChange={(e) => updateLegalPageUrl(pageKey, e.target.value)}
                                      className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="https://exemple.com"
                                    />
                                  )}
                                  <div className="flex items-center gap-2">
                                    {typeof pageKey === 'string' && pageKey.startsWith('custom-') && (
                                      <select
                                        value={getLegalPageTarget(pageKey)}
                                        onChange={(e) => updateLegalPageTarget(pageKey, e.target.value)}
                                        className="text-xs bg-white border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="_self">Même onglet</option>
                                        <option value="_blank">Nouvel onglet</option>
                                      </select>
                                    )}
                                    <Button
                                      type="button"
                                      onClick={() => setEditingLegalPage(null)}
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
                                      {getLegalPageLabel(pageKey)}
                                    </span>
                                    {typeof pageKey === 'string' && pageKey.startsWith('custom-') && getLegalPageUrl(pageKey) && (
                                      <div className="text-xs text-gray-500 truncate">
                                        {getLegalPageUrl(pageKey)}
                                      </div>
                                    )}
                                    {typeof pageKey === 'string' && pageKey.startsWith('custom-') && (
                                      <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <Link className="w-3 h-3" />
                                        {getLegalPageTarget(pageKey) === '_blank' ? 'Nouvel onglet' : 'Même onglet'}
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
                                onClick={() => moveBottomLink(index, index - 1)}
                                size="sm"
                                variant="ghost"
                                title="Déplacer vers le haut"
                              >
                                <ChevronUp className="w-3 h-3 mr-0" />
                              </Button>
                            )}
                            {index < footerData.bottomLinks.length - 1 && (
                              <Button
                                onClick={() => moveBottomLink(index, index + 1)}
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
                                onClick={() => setEditingLegalPage(pageKey)}
                                size="sm"
                                variant="secondary"
                              >
                                Éditer
                              </Button>
                            )}
                            <Button
                              onClick={() => removeBottomLink(pageKey)}
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
                        onClick={addCustomLegalLink}
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
        </div>
    </div>
  );
};

export default FooterManager; 