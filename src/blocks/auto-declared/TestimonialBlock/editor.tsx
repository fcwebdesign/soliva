import React from 'react';
import MediaUploader from '@/app/admin/components/MediaUploader';

interface TestimonialData {
  testimonial: string;
  author: string;
  company: string;
  role?: string;
  avatar?: {
    src: string;
    alt: string;
  };
  rating?: number;
  theme: 'light' | 'dark' | 'auto';
}

export default function TestimonialBlockEditor({ 
  data, 
  onChange 
}: { 
  data: TestimonialData; 
  onChange: (data: TestimonialData) => void 
}) {
  // S'assurer que les valeurs ont des fallbacks
  const safeData = {
    testimonial: data.testimonial || '',
    author: data.author || '',
    company: data.company || '',
    role: data.role || '',
    avatar: data.avatar || { src: '', alt: '' },
    rating: data.rating || 0,
    theme: data.theme || 'auto'
  };

  const handleAvatarUpload = (src: string) => {
    onChange({ 
      ...data, 
      avatar: {
        ...safeData.avatar,
        src
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Testimonial Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Témoignage *
        </label>
        <textarea
          value={safeData.testimonial}
          onChange={(e) => onChange({ ...data, testimonial: e.target.value })}
          placeholder="Le témoignage du client..."
          rows={4}
          className="block-input"
        />
      </div>

      {/* Author Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du client *
          </label>
          <input
            type="text"
            value={safeData.author}
            onChange={(e) => onChange({ ...data, author: e.target.value })}
            placeholder="Jean Dupont"
            className="block-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entreprise *
          </label>
          <input
            type="text"
            value={safeData.company}
            onChange={(e) => onChange({ ...data, company: e.target.value })}
            placeholder="Nom de l'entreprise"
            className="block-input"
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fonction (optionnel)
        </label>
        <input
          type="text"
          value={safeData.role}
          onChange={(e) => onChange({ ...data, role: e.target.value })}
          placeholder="CEO, Directeur Marketing, etc."
          className="block-input"
        />
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo du client (optionnel)
        </label>
        <MediaUploader
          currentUrl={safeData.avatar?.src || ''}
          onUpload={handleAvatarUpload}
        />
        {safeData.avatar?.src && (
          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">
              Texte alternatif (pour l'accessibilité)
            </label>
            <input
              type="text"
              value={safeData.avatar.alt}
              onChange={(e) => onChange({ 
                ...data, 
                avatar: { ...safeData.avatar, alt: e.target.value } 
              })}
              placeholder="Description de la photo"
              className="block-input text-sm"
            />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Recommandé : format carré (ex: 200x200px)
        </p>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note (optionnel)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={safeData.rating}
            onChange={(e) => onChange({ ...data, rating: parseInt(e.target.value) })}
            className="flex-1"
          />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < safeData.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-600 min-w-[3rem]">
            {safeData.rating}/5
          </span>
        </div>
        <button
          onClick={() => onChange({ ...data, rating: 0 })}
          className="text-xs text-gray-500 hover:text-gray-700 mt-1"
        >
          Masquer la note
        </button>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thème
        </label>
        <select
          value={safeData.theme}
          onChange={(e) => onChange({ ...data, theme: e.target.value as 'light' | 'dark' | 'auto' })}
          className="block-input"
        >
          <option value="auto">Automatique (suit le thème global)</option>
          <option value="light">Thème clair forcé</option>
          <option value="dark">Thème sombre forcé</option>
        </select>
      </div>
    </div>
  );
}

