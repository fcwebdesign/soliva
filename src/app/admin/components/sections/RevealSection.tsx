"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, Image, Palette, Type } from 'lucide-react';
import MediaUploader from '../MediaUploader';

interface RevealSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const RevealSection: React.FC<RevealSectionProps> = ({ localData, updateField }) => {
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [progressColor, setProgressColor] = useState('#ffffff');
  const [images, setImages] = useState<string[]>([]);
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium');

  const [isInitialized, setIsInitialized] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Charger la configuration actuelle
  useEffect(() => {
    const revealConfig = localData.metadata?.reveal || {};
    setBackgroundColor(revealConfig.backgroundColor || '#000000');
    setTextColor(revealConfig.textColor || '#ffffff');
    setProgressColor(revealConfig.progressColor || '#ffffff');
    setImages(revealConfig.images || ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg']);
    setLogoSize(revealConfig.logoSize || 'medium');
    setIsInitialized(true);
  }, [localData]);

  // Sauvegarder automatiquement quand les valeurs changent (après l'initialisation)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Éviter de sauvegarder si les valeurs sont identiques à celles chargées
    const currentConfig = localData.metadata?.reveal || {};
    const hasChanges = 
      backgroundColor !== (currentConfig.backgroundColor || '#000000') ||
      textColor !== (currentConfig.textColor || '#ffffff') ||
      progressColor !== (currentConfig.progressColor || '#ffffff') ||
      JSON.stringify(images) !== JSON.stringify(currentConfig.images || ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg']) ||
      logoSize !== (currentConfig.logoSize || 'medium');
    
    if (!hasChanges) return;
    
    const revealConfig = {
      backgroundColor,
      textColor,
      progressColor,
      images,
      logoSize,
    };
    updateField('metadata.reveal', revealConfig);
  }, [backgroundColor, textColor, progressColor, images, logoSize, isInitialized, localData, updateField]);

  const handleImageAdd = (url: string) => {
    setImages([...images, url]);
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setDragOverIndex(null);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newImages = [...images];
      const [removed] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, removed);
      setImages(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    document.body.classList.remove('dragging');
  };

  const logoSizeOptions = [
    { value: 'small', label: 'Petit', maxWidth: '200px', maxHeight: '60px' },
    { value: 'medium', label: 'Moyen', maxWidth: '300px', maxHeight: '80px' },
    { value: 'large', label: 'Grand', maxWidth: '400px', maxHeight: '100px' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Animation de Révélation (Preloader)</h3>
      </div>
      
      <div className="space-y-6">
        {/* Couleurs */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Couleurs
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fond
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barre de progression
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={progressColor}
                  onChange={(e) => setProgressColor(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={progressColor}
                  onChange={(e) => setProgressColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images du preloader */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Images du preloader
            </h4>
            <MediaUploader
              currentUrl=""
              onUpload={handleImageAdd}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => {
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;
              
              return (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group cursor-move transition-all duration-200 ${
                    isDragging
                      ? 'opacity-50 scale-95'
                      : isDragOver
                      ? 'scale-105'
                      : ''
                  }`}
                >
                  <div className={`aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : isDragOver
                      ? 'border-green-400 bg-green-50 border-dashed'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <img
                      src={image}
                      alt={`Preloader ${index + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageRemove(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="mt-1 text-xs text-gray-500 text-center">
                    Image {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
          
          {images.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucune image. Ajoutez des images pour le preloader.
            </p>
          )}
        </div>

        {/* Taille du logo */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Taille du logo
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            {logoSizeOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  logoSize === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="logoSize"
                  value={option.value}
                  checked={logoSize === option.value}
                  onChange={(e) => setLogoSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="sr-only"
                />
                <div className="font-medium text-sm mb-1">{option.label}</div>
                <div className="text-xs text-gray-500">
                  {option.maxWidth} × {option.maxHeight}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Note de sauvegarde automatique */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>✓ Sauvegarde automatique :</strong> Les modifications sont sauvegardées automatiquement. 
            N'oubliez pas de cliquer sur "Sauvegarder" dans la barre supérieure pour finaliser.
          </p>
        </div>

        {/* Note d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Cette configuration s'applique uniquement au template Pearl. 
            L'animation de révélation apparaît au premier chargement de la page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevealSection;

