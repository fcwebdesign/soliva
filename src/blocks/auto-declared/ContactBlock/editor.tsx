import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactData {
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContactBlockEditor({ data, onChange, compact = false }: { data: ContactData; onChange: (data: ContactData) => void; compact?: boolean }) {
  const [availablePages, setAvailablePages] = useState<Array<{ key: string; label: string; path: string }>>([]);
  const [linkType, setLinkType] = useState<'page' | 'email'>('page');

  useEffect(() => {
    // Charger les pages disponibles
    fetch('/api/admin/content')
      .then(res => res.json())
      .then(content => {
        const pages = [
          { key: 'home', label: 'Accueil', path: '/' },
          { key: 'work', label: 'Réalisations', path: '/work' },
          { key: 'studio', label: 'Studio', path: '/studio' },
          { key: 'blog', label: 'Journal', path: '/blog' },
          { key: 'contact', label: 'Contact', path: '/contact' },
          ...(content?.pages?.pages || []).map((page: any) => ({
            key: page.slug || page.id,
            label: page.title || 'Page personnalisée',
            path: `/${page.slug || page.id}`,
          }))
        ];
        setAvailablePages(pages);
      })
      .catch(err => console.error('Erreur chargement pages:', err));

    // Détecter le type de lien actuel
    if (data.ctaLink?.startsWith('mailto:')) {
      setLinkType('email');
    }
  }, []);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleLinkTypeChange = (type: 'page' | 'email') => {
    setLinkType(type);
    if (type === 'email') {
      updateField('ctaLink', 'mailto:');
    } else {
      updateField('ctaLink', '/contact');
    }
  };

  const handleEmailChange = (email: string) => {
    updateField('ctaLink', `mailto:${email}`);
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    const currentEmail = data.ctaLink?.startsWith('mailto:') 
      ? data.ctaLink.replace('mailto:', '') 
      : '';

    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Question/Titre</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Would you like to see a demo?"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Texte du bouton</label>
            <input
              type="text"
              value={data.ctaText || ''}
              onChange={(e) => updateField('ctaText', e.target.value)}
              placeholder="Yes, sign me up"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Type de lien</label>
            <Select value={linkType} onValueChange={(value) => handleLinkTypeChange(value as 'page' | 'email')}>
              <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border rounded">
                <SelectItem value="page">Page du site</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {linkType === 'email' ? (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Adresse email</label>
              <input
                type="email"
                value={currentEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Page de destination</label>
              <Select value={data.ctaLink || '/contact'} onValueChange={(value) => updateField('ctaLink', value)}>
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  {availablePages.map(page => (
                    <SelectItem key={page.key} value={page.path}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question/Titre
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ex: Would you like to see a demo?"
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte du bouton
          </label>
          <input
            type="text"
            value={data.ctaText || ''}
            onChange={(e) => updateField('ctaText', e.target.value)}
            placeholder="Ex: Yes, sign me up"
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lien du bouton
          </label>
          <input
            type="text"
            value={data.ctaLink || ''}
            onChange={(e) => updateField('ctaLink', e.target.value)}
            placeholder="Ex: /contact ou https://..."
            className="block-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={data.theme || 'auto'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>
      </div>
    </div>
  );
}
