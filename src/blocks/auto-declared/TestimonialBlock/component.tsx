'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTheme } from '../../../hooks/useTheme';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

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

export default function TestimonialBlock({ data }: { data: TestimonialData | any }) {
  const { mounted } = useTheme();
  
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = (data as any).data || data;
  const title = blockData.title;
  const items = (blockData.items || []).filter((item: any) => !item.hidden);
  const theme = blockData.theme || 'auto';
  const columns = blockData.columns || 3;
  
  // Générer un ID unique pour le carousel
  const carouselId = blockData.id || `testimonials-${Math.random().toString(36).substr(2, 9)}`;
  
  // États pour la navigation du carousel
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [fullContent, setFullContent] = useState<any>(null);
  
  // Mettre à jour la largeur de la fenêtre
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Charger le contenu pour accéder à la typographie
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
  }, []);
  
  // Écouter les mises à jour de contenu pour recharger la typographie
  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement si erreur
      }
    };
    loadContent();
  });
  
  // Récupérer la config typographie
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);
  
  // Classes typographiques pour h2 (sans la couleur pour la gérer via style)
  const h2Classes = useMemo(() => {
    const classes = getTypographyClasses('h2', typoConfig, defaultTypography.h2);
    // Retirer uniquement les classes de couleur Tailwind
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);
  
  // Couleur pour h2 : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const h2Color = useMemo(() => {
    const customColor = getCustomColor('h2', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);
  
  // Classes typographiques pour paragraphe (témoignage)
  const pClasses = useMemo(() => {
    const classes = getTypographyClasses('p', typoConfig, defaultTypography.p);
    // Retirer uniquement les classes de couleur Tailwind
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  if (!mounted) {
    return <div className="min-h-[200px]" />;
  }

  // Génération des étoiles
  const renderStars = (rating: number) => {
    if (!rating || rating <= 0) return null;
    
    return (
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="text-lg"
            style={{
              color: i < rating ? 'var(--primary)' : 'var(--muted-foreground)'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-12 px-4 text-center opacity-50">
        <p>Aucun témoignage pour le moment.</p>
      </div>
    );
  }

  const actualCount = items.length;
  
  // Calculer le nombre de témoignages par page selon la largeur et le nombre de colonnes
  let itemsPerPage;
  if (actualCount === 1) {
    itemsPerPage = 1;
  } else if (actualCount === 2) {
    itemsPerPage = windowWidth < 768 ? 1 : 2;
  } else {
    // Utiliser le nombre de colonnes configuré
    if (columns === 2) {
      itemsPerPage = windowWidth < 768 ? 1 : 2;
    } else if (columns === 4) {
      itemsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 4;
    } else {
      // 3 colonnes par défaut
      itemsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3;
    }
  }
  
  // Le carousel est nécessaire si on a plus de témoignages que ce qui peut être affiché sur une page
  const needsNavigation = actualCount > itemsPerPage;
  
  const maxPages = Math.ceil(items.length / itemsPerPage);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === maxPages - 1;

  // Fonction pour rendre un témoignage
  const renderTestimonial = (item: TestimonialItem) => (
    <div
      key={item.id}
      className="border rounded-lg p-8 transition-colors h-full"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Rating */}
      {renderStars(item.rating || 0)}

      {/* Testimonial Text */}
      <div 
        className={`${pClasses} mb-6`}
        style={{ color: 'var(--foreground)' }}
      >
        {item.testimonial}
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        {item.avatar?.src && (
          <div 
            className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: '2px solid var(--border)'
            }}
          >
            <Image
              src={item.avatar.src}
              alt={item.avatar.alt || item.author}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div>
          <div 
            className="font-semibold text-lg"
            style={{ color: 'var(--foreground)' }}
          >
            {item.author}
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {item.role && `${item.role}, `}{item.company}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section 
      className="testimonial-block"
      data-block-type="testimonial"
      data-block-theme={theme}
    >
      <div className="space-y-8">
        {/* Titre de la section et navigation du carousel */}
        <div className="flex justify-between items-center">
          {title && (
            <div>
              <h2 
                className={h2Classes}
                style={{ color: h2Color }}
                data-block-type="h2"
              >
                {title}
              </h2>
            </div>
          )}
          
          {/* Navigation - sur la même ligne que le titre */}
          {needsNavigation && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (!isFirstPage) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    
                    const carousel = document.getElementById(`carousel-${carouselId}`);
                    if (carousel) {
                      // Calculer la translation en pixels pour plus de précision
                      const firstItem = carousel.querySelector('div');
                      if (firstItem) {
                        const itemWidth = firstItem.offsetWidth;
                        const gap = 32; // 2rem = 32px
                        const translateX = -(newPage * (itemWidth + gap));
                        carousel.style.transform = `translateX(${translateX}px)`;
                      }
                    }
                  }
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  isFirstPage ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: isFirstPage ? 'var(--muted)' : 'var(--primary)',
                  color: isFirstPage ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: isFirstPage ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isFirstPage) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFirstPage) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M10.5303 5.46967C10.8232 5.76256 10.8232 6.23744 10.5303 6.53033L5.81066 11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H5.81066L10.5303 17.4697C10.8232 17.7626 10.8232 18.2374 10.5303 18.5303C10.2374 18.8232 9.76256 18.8232 9.46967 18.5303L3.46967 12.5303C3.17678 12.2374 3.17678 11.7626 3.46967 11.4697L9.46967 5.46967C9.76256 5.17678 10.2374 5.17678 10.5303 5.46967Z" 
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (!isLastPage) {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    
                    const carousel = document.getElementById(`carousel-${carouselId}`);
                    if (carousel) {
                      // Calculer la translation en pixels pour plus de précision
                      const firstItem = carousel.querySelector('div');
                      if (firstItem) {
                        const itemWidth = firstItem.offsetWidth;
                        const gap = 32; // 2rem = 32px
                        const translateX = -(newPage * (itemWidth + gap));
                        carousel.style.transform = `translateX(${translateX}px)`;
                      }
                    }
                  }
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  isLastPage ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: isLastPage ? 'var(--muted)' : 'var(--primary)',
                  color: isLastPage ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: isLastPage ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isLastPage) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLastPage) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M13.4697 5.46967C13.7626 5.17678 14.2374 5.17678 14.5303 5.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L14.5303 18.5303C14.2374 18.8232 13.7626 18.8232 13.4697 18.5303C13.1768 18.2374 13.1768 17.7626 13.4697 17.4697L18.1893 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H18.1893L13.4697 6.53033C13.1768 6.23744 13.1768 5.76256 13.4697 5.46967Z" 
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Grille des témoignages avec carousel si nécessaire */}
        {needsNavigation ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out gap-8" 
                id={`carousel-${carouselId}`} 
                style={{ transform: 'translateX(0%)' }}
              >
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex-shrink-0 ${
                      actualCount === 1 ? 'w-full' :
                      actualCount === 2 ? 'w-full md:w-[calc(50%-1rem)]' :
                      columns === 2 ? 'w-full md:w-[calc(50%-1rem)]' :
                      columns === 4 ? 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]' :
                      'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]' // 3 colonnes par défaut
                    }`}
                  >
                    {renderTestimonial(item)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
            columns === 2 ? 'lg:grid-cols-2' :
            columns === 4 ? 'lg:grid-cols-4' :
            'lg:grid-cols-3' // Par défaut 3 colonnes
          }`}>
            {items.map(item => renderTestimonial(item))}
          </div>
        )}
      </div>
    </section>
  );
}
