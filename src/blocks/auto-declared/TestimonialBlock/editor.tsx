'use client';

import React from 'react';
import MediaUploader from '@/app/admin/components/MediaUploader';

interface TestimonialItem {
  id: string;
  testimonial: string;
  author: string;
  company: string;
  role?: string;
  avatar?: {
    src: string;
    alt: string;
  };
  rating?: number;
}

interface TestimonialData {
  title?: string;
  items?: TestimonialItem[];
  theme?: 'light' | 'dark' | 'auto';
  columns?: number;
}

export default function TestimonialBlockEditor({ 
  data, 
  onChange 
}: { 
  data: TestimonialData; 
  onChange: (data: TestimonialData) => void 
}) {
  const title = data.title || '';
  const items = data.items || [];
  const theme = data.theme || 'auto';

  const addItem = () => {
    const newItem: TestimonialItem = {
      id: `testimonial-${Date.now()}`,
      testimonial: 'Un témoignage client très positif sur votre travail...',
      author: 'Nom du client',
      company: 'Nom de l\'entreprise',
      role: 'Fonction',
      avatar: {
        src: '',
        alt: ''
      },
      rating: 5
    };
    
    onChange({
      ...data,
      items: [...items, newItem]
    });
  };

  const updateItem = (id: string, field: keyof TestimonialItem, value: any) => {
    onChange({
      ...data,
      items: items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeItem = (id: string) => {
    onChange({
      ...data,
      items: items.filter(item => item.id !== id)
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    onChange({
      ...data,
      items: newItems
    });
  };

  const handleAvatarUpload = (id: string, src: string) => {
    updateItem(id, 'avatar', {
      ...items.find(item => item.id === id)?.avatar,
      src
    });
  };

  return (
    <div className="block-editor">
      <div className="space-y-4">
        {/* Titre de la section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la section
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Ex: Témoignages clients"
            className="block-input"
          />
        </div>

        {/* Nombre de colonnes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de colonnes
          </label>
          <select
            value={data.columns || 3}
            onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value, 10) })}
            className="block-input"
          >
            <option value={2}>2 colonnes</option>
            <option value={3}>3 colonnes (par défaut)</option>
            <option value={4}>4 colonnes</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choisissez le nombre de colonnes pour l'affichage de la grille de témoignages.
          </p>
        </div>

        {/* Sélecteur de thème */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={theme}
            onChange={(e) => onChange({ ...data, theme: e.target.value as 'light' | 'dark' | 'auto' })}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>

        {/* Liste des témoignages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Témoignages ({items.length})
          </label>
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                Aucun témoignage. Cliquez sur "Ajouter un témoignage" pour commencer.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {/* En-tête avec contrôles */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      Témoignage {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Boutons de réorganisation */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Descendre"
                      >
                        ↓
                      </button>
                      
                      {/* Bouton supprimer */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Témoignage *
                    </label>
                    <textarea
                      value={item.testimonial}
                      onChange={(e) => updateItem(item.id, 'testimonial', e.target.value)}
                      placeholder="Le témoignage du client..."
                      rows={3}
                      className="block-input text-sm"
                    />
                  </div>

                  {/* Author Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nom du client *
                      </label>
                      <input
                        type="text"
                        value={item.author}
                        onChange={(e) => updateItem(item.id, 'author', e.target.value)}
                        placeholder="Jean Dupont"
                        className="block-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Entreprise *
                      </label>
                      <input
                        type="text"
                        value={item.company}
                        onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                        placeholder="Nom de l'entreprise"
                        className="block-input text-sm"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fonction (optionnel)
                    </label>
                    <input
                      type="text"
                      value={item.role || ''}
                      onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                      placeholder="CEO, Directeur Marketing, etc."
                      className="block-input text-sm"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Photo du client (optionnel)
                    </label>
                    <MediaUploader
                      currentUrl={item.avatar?.src || ''}
                      onUpload={(src) => handleAvatarUpload(item.id, src)}
                    />
                    {item.avatar?.src && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Texte alternatif (pour l'accessibilité)
                        </label>
                        <input
                          type="text"
                          value={item.avatar.alt || ''}
                          onChange={(e) => updateItem(item.id, 'avatar', { ...item.avatar, alt: e.target.value })}
                          placeholder="Description de la photo"
                          className="block-input text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Note (optionnel)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={item.rating || 0}
                        onChange={(e) => updateItem(item.id, 'rating', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < (item.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 min-w-[2.5rem]">
                        {item.rating || 0}/5
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, 'rating', 0)}
                      className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                    >
                      Masquer la note
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Bouton Ajouter standardisé */}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Ajouter un témoignage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
