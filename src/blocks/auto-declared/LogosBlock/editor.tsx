import React, { useState } from 'react';
import { LogoUploader } from '../../../app/admin/components/MediaUploader';

interface LogosData {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  logos: Array<{
    src?: string;
    image?: string;
    alt?: string;
    name?: string;
  }>;
}

export default function LogosBlockEditor({ data, onChange }: { data: LogosData; onChange: (data: LogosData) => void }) {
  const [draggedLogoIndex, setDraggedLogoIndex] = useState<number | null>(null);
  const [dragOverLogoIndex, setDragOverLogoIndex] = useState<number | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateLogo = (index: number, field: string, value: any) => {
    const logos = [...(data.logos || [])];
    logos[index] = {
      ...logos[index],
      [field]: value
    };
    updateField('logos', logos);
  };

  const addLogo = () => {
    const newLogos = [...(data.logos || []), { src: '', alt: '' }];
    updateField('logos', newLogos);
    
    // Ajouter une animation d'apparition au nouveau logo
    setTimeout(() => {
      const newLogoElement = document.querySelector(`[data-logo-index="${newLogos.length - 1}"]`);
      if (newLogoElement) {
        newLogoElement.classList.add('logo-item-enter');
      }
    }, 100);
  };

  const removeLogo = (index: number) => {
    const logos = [...(data.logos || [])];
    logos.splice(index, 1);
    updateField('logos', logos);
  };

  // Drag & drop natif pour les logos
  const handleLogoDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedLogoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    document.body.classList.add('dragging');
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleLogoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedLogoIndex !== null && draggedLogoIndex !== index) {
      setDragOverLogoIndex(index);
    }
  };

  const handleLogoDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedLogoIndex === null || draggedLogoIndex === dropIndex) return;

    const logos = [...(data.logos || [])];
    const [draggedLogo] = logos.splice(draggedLogoIndex, 1);
    logos.splice(dropIndex, 0, draggedLogo);
    
    updateField('logos', logos);
    
    setDraggedLogoIndex(null);
    setDragOverLogoIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleLogoDragEnd = () => {
    document.querySelectorAll('.logo-drag-item.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    setDraggedLogoIndex(null);
    setDragOverLogoIndex(null);
    document.body.classList.remove('dragging');
  };

  return (
    <div className="block-editor">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la section
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ex: NOS CLIENTS"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logos clients
          </label>
          <div className="logos-grid-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {(data.logos || []).map((logo, index) => (
              <div 
                key={index} 
                data-logo-index={index}
                className={`logo-drop-zone p-3 border border-gray-200 rounded-lg transition-all duration-200 ${
                  draggedLogoIndex === index ? 'dragging' : ''
                } ${
                  dragOverLogoIndex === index && draggedLogoIndex !== index 
                    ? 'drag-over' 
                    : ''
                }`}
                onDragOver={(e) => handleLogoDragOver(e, index)}
                onDrop={(e) => handleLogoDrop(e, index)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverLogoIndex(null);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="logo-drag-item flex items-center gap-2"
                    draggable
                    onDragStart={(e) => handleLogoDragStart(e, index)}
                    onDragEnd={handleLogoDragEnd}
                  >
                    <span className="logo-drag-handle text-xs">⋮⋮</span>
                    <span className="text-xs font-medium text-gray-600">Logo {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeLogo(index)}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                    title="Supprimer ce logo"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="logo-drop-indicator">
                  Déposer ici
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Image
                    </label>
                    <LogoUploader
                      currentUrl={logo.src || logo.image || ''}
                      onUpload={(src) => updateLogo(index, 'src', src)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nom du client
                    </label>
                    <input
                      type="text"
                      value={logo.alt || logo.name || ''}
                      onChange={(e) => updateLogo(index, 'alt', e.target.value)}
                      placeholder="Ex: Apple"
                      className="block-input text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addLogo}
              className="w-full py-2 px-3 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors hover:bg-gray-50"
            >
              + Ajouter un logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
