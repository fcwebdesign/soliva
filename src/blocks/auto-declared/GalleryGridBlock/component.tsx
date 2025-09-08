'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { X, ZoomIn, Download } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

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

export default function GalleryGridBlock({ data }: { data: GalleryGridData }) {
  const { mounted } = useTheme();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const images = data.images || [];
  const layout = data.layout || 'grid-3';
  const gap = data.gap || 'medium';
  const showFilters = data.showFilters !== false;
  const showTitles = data.showTitles !== false;
  const showDescriptions = data.showDescriptions !== false;
  const enableLightbox = data.enableLightbox !== false;
  const enableDownload = data.enableDownload !== false;
  const blockTheme = data.theme || 'auto';

  // Obtenir les catégories uniques
  const categories = ['all', ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))];
  
  // Filtrer les images
  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  // Utiliser les images dans l'ordre défini dans l'admin
  const displayImages = filteredImages;

  // Classes CSS pour le layout
  const layoutClasses = {
    'grid-2': 'grid-cols-1 md:grid-cols-2',
    'grid-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    'masonry': 'columns-1 md:columns-2 lg:columns-3 xl:columns-4'
  };

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  const gridClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  const gapClass = gapClasses[gap] || 'gap-4';
  
  // Pour le masonry, utiliser columns au lieu de grid
  const isMasonry = layout === 'masonry';
  const containerClass = isMasonry ? `${gridClass} ${gapClass}` : `grid ${gridClass} ${gapClass}`;

  // Fonction pour télécharger une image
  const downloadImage = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="gallery-grid-section py-28" data-block-type="gallery-grid" data-block-theme={blockTheme}>
      <div className="container mx-auto px-4">
        {/* Filtres */}
        {showFilters && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <Button
                key={category}
                variant={activeFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(category)}
                className="capitalize"
              >
                {category === 'all' ? 'Tous' : category}
              </Button>
            ))}
          </div>
        )}

        {/* Grille d'images */}
        {displayImages.length > 0 ? (
          <div className={containerClass}>
            {displayImages.map((image) => (
              <div key={image.id} className={`group relative overflow-hidden rounded-lg bg-gray-100 ${isMasonry ? 'break-inside-avoid mb-4' : ''}`}>
                {/* Image */}
                <div className={`${isMasonry ? 'relative' : 'aspect-square relative'} overflow-hidden`}>
                  {isMasonry ? (
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  )}
                  
                  {/* Overlay avec actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {enableLightbox && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedImage(image)}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      )}
                      {enableDownload && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image)}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Badge catégorie */}
                  {image.category && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 bg-white/90 text-black capitalize"
                    >
                      {image.category}
                    </Badge>
                  )}
                </div>

                {/* Titre et description */}
                {(showTitles || showDescriptions) && (image.title || image.description) && (
                  <div className="p-4">
                    {showTitles && image.title && (
                      <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                    )}
                    {showDescriptions && image.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune image</h3>
            <p className="text-gray-600">Ajoutez des images à votre galerie depuis l'éditeur.</p>
          </div>
        )}

        {/* Lightbox */}
        {enableLightbox && selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogTitle className="sr-only">
                {selectedImage.title || selectedImage.alt || 'Image de la galerie'}
              </DialogTitle>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="relative aspect-video">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
                
                {(selectedImage.title || selectedImage.description) && (
                  <div className="p-6 bg-white">
                    {selectedImage.title && (
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedImage.title}
                      </h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-gray-600">{selectedImage.description}</p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}
