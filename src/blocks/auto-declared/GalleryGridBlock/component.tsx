'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogPortal } from '../../../components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../../../components/ui/button';
import { ZoomIn, Download } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useContentUpdate } from '../../../hooks/useContentUpdate';
import { cn } from '@/lib/utils';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { fetchContentWithNoCache } from '@/hooks/useContentUpdate';

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
  sectionTitle?: string;
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
  const sectionTitle = blockData.sectionTitle || '';
  const showFilters = blockData.showFilters !== false;
  const showTitles = blockData.showTitles !== false;
  const showDescriptions = blockData.showDescriptions !== false;
  const enableLightbox = blockData.enableLightbox !== false;
  const enableDownload = blockData.enableDownload !== false;
  const blockTheme = blockData.theme || 'auto';

  // Charger le contenu global pour la typographie (comme le bloc Logos)
  const [fullContent, setFullContent] = useState<any>(null);
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const json = await response.json();
          setFullContent(json);
        }
      } catch {}
    };
    loadContent();
  }, []);

  // Recharger quand le contenu change
  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const json = await response.json();
          setFullContent(json);
        }
      } catch {}
    };
    loadContent();
  });

  // Config et classes typo dynamiques pour H2
  const typoConfig = useMemo(() => (fullContent ? getTypographyConfig(fullContent) : {}), [fullContent]);
  const h2Classes = useMemo(() => {
    const classes = getTypographyClasses('h2', typoConfig, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  const h2Color = useMemo(() => getCustomColor('h2', typoConfig) || 'var(--foreground)', [typoConfig]);

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

  const gridClass = layoutClasses[layout] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  // Gap géré via variable CSS exposée par le BO; on mappe l'option de bloc vers la variable locale
  const localGapVar = gap === 'small' ? 'var(--gap-sm)' : gap === 'large' ? 'var(--gap-lg)' : 'var(--gap-md)';
  
  // Pour le masonry, on évite CSS columns (qui change l'ordre visuel)
  // et on utilise une grille avec N colonnes fixes pour préserver l'ordre gauche->droite
  const isMasonry = layout?.startsWith('masonry');
  const masonryColumns = isMasonry
    ? Math.max(2, Math.min(4, parseInt(layout.split('-')[1] || '3', 10) || 3))
    : 0;
  const containerClass = isMasonry
    ? `grid gap-[var(--gap)] ${
        masonryColumns === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : masonryColumns === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`
    : `grid ${gridClass} gap-[var(--gap)]`;

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
    <section className="gallery-grid-section" data-block-type="gallery-grid" data-block-theme={blockTheme}>
      <div className="px-4">
        {/* Titre de section */}
        {sectionTitle && (
          <div className="mb-12">
            <h2 className={h2Classes} style={{ color: h2Color }} data-block-type="h2">{sectionTitle}</h2>
          </div>
        )}
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
          <div className={containerClass} style={{ ['--gap' as any]: localGapVar }}>
            {isMasonry
              ? // Masonry rendu en colonnes contrôlées pour préserver l'ordre gauche->droite
                Array.from({ length: masonryColumns }).map((_, colIndex) => (
                  <div key={`masonry-col-${colIndex}`} className={cn('flex flex-col', 'gap-[var(--gap)]')}>
                    {displayImages
                      .filter((_, idx) => idx % masonryColumns === colIndex)
                      .map((image) => (
                        <div
                          key={image.id}
                          className={`group relative overflow-hidden rounded-lg`}
                          style={{ backgroundColor: 'var(--muted)' }}
                        >
                          {/* Image */}
                          <div className={`relative overflow-hidden`}>
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            
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
                ))
              : displayImages.map((image) => (
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
