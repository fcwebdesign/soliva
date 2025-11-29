'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTheme } from '../../../hooks/useTheme';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import useEmblaCarousel from 'embla-carousel-react';

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
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: true,
    dragFree: false,
    slidesToScroll: 1,
  });
  const [hasScroll, setHasScroll] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [fullContent, setFullContent] = useState<any>(null);
  
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

  // Synchroniser l'état de navigation avec Embla
  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setHasScroll(emblaApi.canScrollNext() || emblaApi.canScrollPrev());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    update();
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  // Réinitialiser Embla quand la liste ou la config change
  useEffect(() => {
    emblaApi?.reInit();
  }, [items, columns, emblaApi]);
  
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

  const needsNavigation = hasScroll;

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
        <div className="flex justify-between items-center mb-12">
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
                onClick={() => emblaApi?.scrollPrev()}
                className={`w-[42px] h-[42px] rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  !canPrev ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: !canPrev ? 'var(--muted)' : 'var(--primary)',
                  color: !canPrev ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: !canPrev ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (canPrev) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1)';
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
                onClick={() => emblaApi?.scrollNext()}
                className={`w-[42px] h-[42px] rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  !canNext ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: !canNext ? 'var(--muted)' : 'var(--primary)',
                  color: !canNext ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: !canNext ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (canNext) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1)';
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

        {/* Carousel Embla */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div
              className="flex gap-8"
              style={{
                paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                paddingRight: 'clamp(1rem, 2vw, 2rem)',
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex-none w-full ${
                    columns === 2 ? 'md:w-1/2 lg:w-1/2' :
                    columns === 4 ? 'md:w-1/2 lg:w-1/4' :
                    'md:w-1/2 lg:w-1/3'
                  }`}
                >
                  {renderTestimonial(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
