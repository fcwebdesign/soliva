'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../../../components/ui/dialog';
import MediaUploader from '../../../app/admin/components/MediaUploader';
import { Plus, Trash2, Edit3, Image as ImageIcon, Upload, X } from 'lucide-react';

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
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const addMultipleImages = (urls: string[]) => {
    const newImages: GalleryImage[] = urls.map((url, index) => ({
      id: `image-${Date.now()}-${index}`,
      src: url,
      alt: '',
      title: '',
      description: '',
      category: ''
    }));
    
    const currentImages = data.images || [];
    updateField('images', [...currentImages, ...newImages]);
  };

  const handleMultipleUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return result.url;
      });
      
      const urls = await Promise.all(uploadPromises);
      addMultipleImages(urls);
    } catch (error) {
      console.error('Erreur upload multiple:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
    }
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
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
                className="hidden"
                id="multiple-upload"
              />
              <label htmlFor="multiple-upload">
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-2 cursor-pointer"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Upload...' : 'Upload multiple'}
                </Button>
              </label>
              <Button onClick={addImage} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une image
              </Button>
            </div>
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

          {/* Grille compacte d'images */}
          <div className="grid grid-cols-6 gap-3">
            {(data.images || []).length === 0 ? (
              <div className="col-span-6 text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">Aucune image pour le moment</p>
                <p className="text-xs text-gray-400 mt-1">Utilisez "Upload multiple" ou "Ajouter une image"</p>
              </div>
            ) : (
              (data.images || []).map((image, index) => (
                <div 
                  key={image.id} 
                  className={`relative group border border-gray-200 rounded-lg overflow-hidden ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    dragOverIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Aperçu de l'image */}
                  <div className="aspect-square relative">
                    {image.src ? (
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay avec actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingImage(image)}
                          className="bg-white/90 hover:bg-white text-black h-8 w-8 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => removeImage(index)}
                          className="bg-red-500/90 hover:bg-red-600 text-white h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Indicateur d'édition */}
                    <div className="absolute top-1 left-1">
                      <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>

                    {/* Drag handle */}
                    <div 
                      className="absolute top-1 right-1 cursor-grab active:cursor-grabbing p-1 bg-white/80 hover:bg-white rounded"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-0.5"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-0.5"></div>
                    </div>
                  </div>

                  {/* Infos compactes */}
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600 truncate">
                      {image.title || image.alt || 'Sans titre'}
                    </p>
                    {image.category && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                        {image.category}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal d'édition d'image */}
      <Dialog open={Boolean(editingImage)} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent className="!max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-semibold">Éditer l'image</DialogTitle>
          </DialogHeader>
          
          {editingImage && (
            <div className="space-y-2">
              {/* Aperçu de l'image - très petit */}
              <div className="w-20 h-20 relative bg-gray-100 rounded overflow-hidden mx-auto">
                {editingImage.src ? (
                  <img 
                    src={editingImage.src} 
                    alt={editingImage.alt} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Formulaire d'édition - très compact */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Alt *</Label>
                  <Input
                    value={editingImage.alt}
                    onChange={(e) => {
                      const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                      if (index !== -1) {
                        updateImage(index, { alt: e.target.value });
                        setEditingImage({ ...editingImage, alt: e.target.value });
                      }
                    }}
                    placeholder="Description"
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Titre</Label>
                  <Input
                    value={editingImage.title || ''}
                    onChange={(e) => {
                      const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                      if (index !== -1) {
                        updateImage(index, { title: e.target.value });
                        setEditingImage({ ...editingImage, title: e.target.value });
                      }
                    }}
                    placeholder="Titre"
                    className="text-xs h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-700">Catégorie</Label>
                  <Input
                    value={editingImage.category || ''}
                    onChange={(e) => {
                      const index = (data.images || []).findIndex(img => img.id === editingImage.id);
                      if (index !== -1) {
                        updateImage(index, { category: e.target.value });
                        setEditingImage({ ...editingImage, category: e.target.value });
                      }
                    }}
                    placeholder="nature, portrait..."
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1 pt-1">
                <Button variant="outline" size="sm" onClick={() => setEditingImage(null)} className="h-7 px-2 text-xs">
                  Fermer
                </Button>
                <Button size="sm" onClick={() => setEditingImage(null)} className="h-7 px-2 text-xs">
                  OK
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
