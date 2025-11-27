import { useState, useEffect } from 'react';

// Étendre l'interface Window pour inclure getCurrentFooterData
declare global {
  interface Window {
    getCurrentFooterData?: () => FooterData;
  }
}

export interface FooterData {
  logo: string;
  logoImage: string;
  description: string;
  variant?: string;
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
  stickyFooter?: {
    enabled?: boolean;
    height?: number;
  };
}

export const useFooterManager = (content: any) => {
  const [footerData, setFooterData] = useState<FooterData>({
    logo: content?.footer?.logo || 'soliva',
    logoImage: content?.footer?.logoImage || '',
    description: content?.footer?.description || '',
    variant: content?.footer?.footerVariant || 'classic',
    links: content?.footer?.links || [],
    socialLinks: content?.footer?.socialLinks || [],
    copyright: content?.footer?.copyright || '© 2024 Soliva. Tous droits réservés.',
    bottomLinks: content?.footer?.bottomLinks || [],
    legalPageLabels: content?.footer?.legalPageLabels || {},
    stickyFooter: content?.footer?.stickyFooter || { enabled: false, height: 800 }
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
      variant: content?.footer?.footerVariant || 'classic',
      links: content?.footer?.links || [],
      socialLinks: content?.footer?.socialLinks || [],
      copyright: content?.footer?.copyright || '© 2024 Soliva. Tous droits réservés.',
      bottomLinks: content?.footer?.bottomLinks || [],
      legalPageLabels: content?.footer?.legalPageLabels || {},
      stickyFooter: content?.footer?.stickyFooter || { enabled: false, height: 800 }
    });
    setLogoType(content?.footer?.logoImage ? 'image' : 'text');
  }, [content]);

  // Pages disponibles pour sélection
  const availablePages = [
    { key: 'home', label: 'Accueil', path: 'home' },
    { key: 'work', label: 'Réalisations', path: 'work' },
    { key: 'studio', label: 'Studio', path: 'studio' },
    { key: 'blog', label: 'Journal', path: 'blog' },
    { key: 'contact', label: 'Contact', path: 'contact' },
    ...(content?.pages?.pages || []).map(page => ({
      key: page.slug || page.id,
      label: page.title || 'Page personnalisée',
      path: page.slug || page.id,
      isCustom: true
    }))
  ];

  // Pages disponibles pour les liens légaux
  const availableLegalPages = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
    ...(content?.pages?.pages || []).map(page => ({
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
          if (Array.isArray(data)) {
            setAvailableSocials(data);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réseaux sociaux:', error);
      }
    };
    loadSocialNetworks();
  }, []);

  // Fonctions de gestion des liens
  const toggleLink = (pageKey: string) => {
    setFooterData(prev => {
      const existingLink = prev.links.find(link => link.url === pageKey);
      if (existingLink) {
        return {
          ...prev,
          links: prev.links.filter(link => link.url !== pageKey)
        };
      } else {
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

  const moveLink = (fromIndex: number, toIndex: number) => {
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

  // Fonctions de gestion des réseaux sociaux
  const addSocialLink = () => {
    setFooterData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: `social-${Date.now()}`, platform: '', url: '' }]
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    setFooterData(prev => {
      const newSocialLinks = [...prev.socialLinks];
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
      return { ...prev, socialLinks: newSocialLinks };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const removeSocialLink = (index: number) => {
    setFooterData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  // Fonctions pour les liens légaux
  const addBottomLink = () => {
    setFooterData(prev => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, { id: `bottom-${Date.now()}`, label: 'Nouveau lien légal', url: '' }]
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

  const removeBottomLink = (pageKey: string) => {
    setFooterData(prev => ({
      ...prev,
      bottomLinks: prev.bottomLinks.filter(p => p !== pageKey)
    }));
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const toggleLegalPage = (pageKey: string) => {
    setFooterData(prev => {
      const newBottomLinks = prev.bottomLinks.includes(pageKey)
        ? prev.bottomLinks.filter(p => p !== pageKey)
        : [...prev.bottomLinks, pageKey];
      return {
        ...prev,
        bottomLinks: newBottomLinks
      };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const moveBottomLink = (fromIndex: number, toIndex: number) => {
    const newBottomLinks = [...footerData.bottomLinks];
    const [movedPage] = newBottomLinks.splice(fromIndex, 1);
    newBottomLinks.splice(toIndex, 0, movedPage);
    setFooterData(prev => ({ ...prev, bottomLinks: newBottomLinks }));
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

  const updateLegalPageLabel = (pageKey: string, newLabel: string) => {
    setFooterData(prev => {
      const newLegalPageLabels = {
        ...prev.legalPageLabels,
        [pageKey]: newLabel
      };
      return {
        ...prev,
        legalPageLabels: newLegalPageLabels
      };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLegalPageUrl = (pageKey: string, newUrl: string) => {
    setFooterData(prev => {
      const currentLabel = prev.legalPageLabels[pageKey];
      const newLegalPageLabels = {
        ...prev.legalPageLabels,
        [pageKey]: {
          ...(typeof currentLabel === 'object' ? currentLabel : { title: currentLabel, url: '', customUrl: '', target: '_blank' }),
          customUrl: newUrl
        }
      };
      return { ...prev, legalPageLabels: newLegalPageLabels };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
  };

  const updateLegalPageTarget = (pageKey: string, newTarget: string) => {
    setFooterData(prev => {
      const currentLabel = prev.legalPageLabels[pageKey];
      const newLegalPageLabels = {
        ...prev.legalPageLabels,
        [pageKey]: {
          ...(typeof currentLabel === 'object' ? currentLabel : { title: currentLabel, url: '', customUrl: '', target: '_blank' }),
          target: newTarget
        }
      };
      return { ...prev, legalPageLabels: newLegalPageLabels };
    });
    window.dispatchEvent(new CustomEvent('footer-changed'));
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
      if (typeof draggedItem === 'string' && draggedItem.startsWith('bottom-')) {
        const draggedIndex = parseInt(draggedItem.replace('bottom-', ''));
        const dropIndexNum = parseInt(dropIndex.toString().replace('bottom-', ''));
        moveBottomLink(draggedIndex, dropIndexNum);
      } else {
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

  return {
    // State
    footerData,
    setFooterData,
    draggedItem,
    dragOverIndex,
    logoType,
    setLogoType,
    editingLink,
    setEditingLink,
    editingLegalPage,
    setEditingLegalPage,
    searchTerm,
    setSearchTerm,
    legalSearchTerm,
    setLegalSearchTerm,
    availableSocials,
    
    // Data
    availablePages,
    availableLegalPages,
    filteredPages,
    filteredLegalPages,
    
    // Link functions
    toggleLink,
    addCustomLink,
    updateLinkUrl,
    updateLinkTarget,
    moveLink,
    updateLinkTitle,
    
    // Social functions
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    
    // Legal functions
    addBottomLink,
    addCustomLegalLink,
    updateBottomLink,
    removeBottomLink,
    toggleLegalPage,
    moveBottomLink,
    getLegalPageLabel,
    getLegalPageUrl,
    getLegalPageTarget,
    updateLegalPageLabel,
    updateLegalPageUrl,
    updateLegalPageTarget,
    
    // Drag & Drop
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
