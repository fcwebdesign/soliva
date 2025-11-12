'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogPortal } from '../../../components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../../../components/ui/button';
import { ZoomIn, Download } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useContentUpdate } from '../../../hooks/useContentUpdate';
import { cn } from '@/lib/utils';

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
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry-2' | 'masonry-3' | 'masonry-4';
  gap?: 'small' | 'medium' | 'large';
  showFilters?: boolean;
  showTitles?: boolean;
  showDescriptions?: boolean;
  enableLightbox?: boolean;
  enableDownload?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export default function GalleryGridBlock({ data }: { data: GalleryGridData | any }) {
  const { mounted } = useTheme();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [blockData, setBlockData] = useState<any>((data as any).data || data);
  
  // Extraire les données (peut être dans data directement ou dans data.data)
  const currentBlockData = (data as any).data || data;
  
  // Forcer la mise à jour des données quand le contenu change
  useEffect(() => {
    const newBlockData = (data as any).data || data;
    // Comparer les images pour détecter les changements
    const currentImages = JSON.stringify(blockData.images || []);
    const newImages = JSON.stringify(newBlockData.images || []);
    if (currentImages !== newImages) {
      setBlockData(newBlockData);
    }
  }, [data, blockData.images]);
  
  // Écouter les mises à jour de contenu pour forcer le rechargement
  useContentUpdate(() => {
    // Forcer la mise à jour en réextrayant les données
    const newBlockData = (data as any).data || data;
    setBlockData(newBlockData);
  });
  
  const images = blockData.images || [];
  const layout = blockData.layout || 'grid-3';
  const gap = blockData.gap || 'medium';
  const showFilters = blockData.showFilters !== false;
  const showTitles = blockData.showTitles !== false;
  const showDescriptions = blockData.showDescriptions !== false;
  const enableLightbox = blockData.enableLightbox !== false;
  const enableDownload = blockData.enableDownload !== false;
  const blockTheme = blockData.theme || 'auto';

  // Obtenir les catégories uniques
  const categories = ['all', ...Array.from(new Set(images.map(img => img.category).filter(Boolean) as string[]))];
  
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
    'masonry-2': 'columns-1 md:columns-2',
    'masonry-3': 'columns-1 md:columns-2 lg:columns-3',
    'masonry-4': 'columns-1 md:columns-2 lg:columns-3 xl:columns-4'
  };

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  const gridClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  const gapClass = gapClasses[gap] || 'gap-4';
  
  // Pour le masonry, utiliser columns au lieu de grid
  const isMasonry = layout?.startsWith('masonry');
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
      <div className="px-4">
        {/* Filtres */}
        {showFilters && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category: string) => (
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
              <div key={image.id} className={`group relative overflow-hidden rounded-lg ${isMasonry ? 'break-inside-avoid mb-4' : ''}`} style={{ backgroundColor: 'var(--muted)' }}>
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
                    <small className="absolute top-2 left-2 inline-block px-4 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-full whitespace-nowrap capitalize">
                      {image.category}
                    </small>
                  )}
                </div>

                {/* Titre et description */}
                {(showTitles || showDescriptions) && (image.title || image.description) && (
                  <div className="p-4">
                    {showTitles && image.title && (
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{image.title}</h3>
                    )}
                    {showDescriptions && image.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{image.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Aucune image</h3>
            <p style={{ color: 'var(--muted-foreground)' }}>Ajoutez des images à votre galerie depuis l'éditeur.</p>
          </div>
        )}

        {/* Lightbox */}
        {enableLightbox && selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogPortal>
              {/* Overlay personnalisé avec backdrop-blur */}
              <DialogPrimitive.Overlay
                className={cn(
                  "fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md"
                )}
                style={{
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                }}
              />
              <DialogPrimitive.Content
                className={cn(
                  "fixed left-[50%] top-[50%] z-[100000] max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0 shadow-none translate-x-[-50%] translate-y-[-50%]",
                  "bg-transparent",
                  "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                )}
                style={{ backgroundColor: 'transparent' }}
                onInteractOutside={(e) => {
                  setSelectedImage(null);
                }}
                onPointerDownOutside={(e) => {
                  setSelectedImage(null);
                }}
              >
                <DialogTitle className="sr-only">
                  {selectedImage.title || selectedImage.alt || 'Image de la galerie'}
                </DialogTitle>
                
                <div className="relative flex items-center justify-center">
                  <div className="relative max-w-[95vw] max-h-[95vh]">
                    <Image
                      src={selectedImage.src}
                      alt={selectedImage.alt}
                      width={1920}
                      height={1080}
                      className="object-contain w-auto h-auto max-w-full max-h-[95vh]"
                      sizes="95vw"
                      priority
                    />
                  </div>
                  
                  {(selectedImage.title || selectedImage.description) && (
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg p-4 max-w-2xl">
                      {selectedImage.title && (
                        <h3 className="text-xl font-semibold mb-2 text-white">
                          {selectedImage.title}
                        </h3>
                      )}
                      {selectedImage.description && (
                        <p className="text-white/90">{selectedImage.description}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full bg-black/50 hover:bg-black/70 text-white w-10 h-10 p-0 flex items-center justify-center opacity-100 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:pointer-events-none">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPortal>
          </Dialog>
        )}
      </div>
    </section>
  );
}
