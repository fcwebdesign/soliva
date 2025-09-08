'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
  width?: number;
  height?: number;
}

interface GalleryGridData {
  images?: GalleryImage[];
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry';
  gap?: 'small' | 'medium' | 'large';
  showFilters?: boolean;
  showTitles?: boolean;
  showDescriptions?: boolean;
  enableLightbox?: boolean;
  enableDownload?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export default function GalleryGridBlockEditor({ data, onChange }: { data: GalleryGridData; onChange: (data: GalleryGridData) => void }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addImage = () => {
    const newImage: GalleryImage = {
      id: `image-${Date.now()}`,
      src: '',
      alt: '',
      title: '',
      description: '',
      category: ''
    };
    
    const currentImages = data.images || [];
    updateField('images', [...currentImages, newImage]);
  };

  const removeImage = (index: number) => {
    const currentImages = data.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateField('images', newImages);
  };

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    const currentImages = data.images || [];
    const newImages = [...currentImages];
    newImages[index] = { ...newImages[index], ...updates };
    updateField('images', newImages);
  };

  // Drag & drop natif
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const currentImages = data.images || [];
    if (draggedIndex === dropIndex) return;

    const newImages = [...currentImages];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    updateField('images', newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Obtenir les catégories uniques
  const categories = Array.from(new Set((data.images || []).map(img => img.category).filter(Boolean)));

  return (
    <div className="block-editor">
      <div className="space-y-6">
        {/* Configuration générale */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </Label>
            <Select
              value={data.layout || 'grid-3'}
              onValueChange={(value) => updateField('layout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid-2">2 colonnes</SelectItem>
                <SelectItem value="grid-3">3 colonnes</SelectItem>
                <SelectItem value="grid-4">4 colonnes</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Espacement
            </Label>
            <Select
              value={data.gap || 'medium'}
              onValueChange={(value) => updateField('gap', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petit</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="large">Grand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options d'affichage */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Options d'affichage</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showFilters"
                checked={data.showFilters !== false}
                onCheckedChange={(checked) => updateField('showFilters', checked)}
              />
              <Label htmlFor="showFilters" className="text-sm">Afficher les filtres</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showTitles"
                checked={data.showTitles !== false}
                onCheckedChange={(checked) => updateField('showTitles', checked)}
              />
              <Label htmlFor="showTitles" className="text-sm">Afficher les titres</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="showDescriptions"
                checked={data.showDescriptions !== false}
                onCheckedChange={(checked) => updateField('showDescriptions', checked)}
              />
              <Label htmlFor="showDescriptions" className="text-sm">Afficher les descriptions</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableLightbox"
                checked={data.enableLightbox !== false}
                onCheckedChange={(checked) => updateField('enableLightbox', checked)}
              />
              <Label htmlFor="enableLightbox" className="text-sm">Lightbox</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableDownload"
                checked={data.enableDownload !== false}
                onCheckedChange={(checked) => updateField('enableDownload', checked)}
              />
              <Label htmlFor="enableDownload" className="text-sm">Téléchargement</Label>
            </div>
          </div>
        </div>

        {/* Thème */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </Label>
          <Select
            value={data.theme || 'auto'}
            onValueChange={(value) => updateField('theme', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automatique (suit le thème global)</SelectItem>
              <SelectItem value="light">Thème clair forcé</SelectItem>
              <SelectItem value="dark">Thème sombre forcé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gestion des images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Images de la galerie</h4>
            <Button onClick={addImage} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une image
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Catégories détectées :</p>
              <div className="flex flex-wrap gap-1">
                {categories.map(category => (
                  <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(data.images || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">Aucune image pour le moment</p>
                <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter une image" pour commencer</p>
              </div>
            ) : (
              (data.images || []).map((image, index) => (
                <div 
                  key={image.id} 
                  className={`border border-gray-200 rounded-lg p-4 ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    dragOverIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="space-y-3">
                    {/* Header avec drag handle */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-500">Image {index + 1}</span>
                    </div>

                    {/* Formulaire d'édition */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Image</Label>
                          <MediaUploader
                            currentUrl={image.src}
                            onUpload={(src) => updateImage(index, { src })}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600">Texte alternatif</Label>
                          <Input
                            value={image.alt}
                            onChange={(e) => updateImage(index, { alt: e.target.value })}
                            placeholder="Description de l'image"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Titre (optionnel)</Label>
                          <Input
                            value={image.title || ''}
                            onChange={(e) => updateImage(index, { title: e.target.value })}
                            placeholder="Titre de l'image"
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600">Catégorie (optionnel)</Label>
                          <Input
                            value={image.category || ''}
                            onChange={(e) => updateImage(index, { category: e.target.value })}
                            placeholder="ex: nature, portrait, paysage"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Description (optionnel)</Label>
                        <Textarea
                          value={image.description || ''}
                          onChange={(e) => updateImage(index, { description: e.target.value })}
                          placeholder="Description détaillée de l'image"
                          className="text-sm"
                          rows={2}
                        />
                      </div>

                      {/* Bouton supprimer */}
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
