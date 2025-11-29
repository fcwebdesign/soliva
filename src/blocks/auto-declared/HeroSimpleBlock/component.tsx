'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { getTypographyConfig, getTypographyClasses, defaultTypography } from '@/utils/typography';
import { fetchContentWithNoCache, useContentUpdate } from '@/hooks/useContentUpdate';

interface HeroSimpleData {
  supertitle?: string; // Surtitre au-dessus du titre
  title?: string;
  subtitle?: string;
  buttonText?: string; // Texte du bouton
  buttonLink?: string; // Lien du bouton (page, article, projet)
  backgroundImage?: string;
  contentPosition?: 'top' | 'center' | 'bottom'; // Position verticale du contenu
  contentAlignment?: 'start' | 'center' | 'end'; // Alignement horizontal du contenu
  theme?: 'light' | 'dark' | 'auto';
  transparentHeader?: boolean;
  parallax?: {
    enabled?: boolean;
    speed?: number; // 0-1
  };
  isFirstHeading?: boolean; // Si true, utilise H1, sinon H2 (SEO: un seul H1 par page)
}

export default function HeroSimpleBlock({ data }: { data: HeroSimpleData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [headerInfo, setHeaderInfo] = useState<{ height: number; position: string }>({ height: 0, position: 'static' });
  const [isFirstBlock, setIsFirstBlock] = useState(false);
  const parallaxStartRef = useRef<number | null>(null);

  const supertitle = blockData.supertitle?.trim() || '';
  const title = blockData.title?.trim() || '';
  const subtitle = blockData.subtitle?.trim() || '';
  const backgroundImage = blockData.backgroundImage;
  const contentPosition = blockData.contentPosition || 'center';
  const contentAlignment = blockData.contentAlignment || 'center';
  const parallaxEnabled = !!blockData.parallax?.enabled;
  const parallaxSpeed = typeof blockData.parallax?.speed === 'number' ? blockData.parallax.speed : 0.25;

  // Déterminer si on utilise H1 ou H2 (SEO: un seul H1 par page)
  const isFirstHeading = (data as any).isFirstHeading !== false; // Par défaut true si non spécifié
  const HeadingTag = isFirstHeading ? 'h1' : 'h2';

  // Charger le contenu pour accéder à la typographie et au layout
  const [fullContent, setFullContent] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement
      }
    };
    loadContent();
  }, []);

  useContentUpdate(() => {
    const loadContent = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        if (response.ok) {
          const data = await response.json();
          setFullContent(data);
        }
      } catch (error) {
        // Ignorer silencieusement
      }
    };
    loadContent();
  });

  // Récupérer la largeur max du site selon le layout
  const getSiteMaxWidth = useMemo(() => {
    const layout = fullContent?.metadata?.layout || 'standard';
    switch (layout) {
      case 'compact':
        return 1280; // max-w-7xl
      case 'wide':
        return 1920; // max-w-custom-1920
      case 'standard':
      default:
        return 1536; // max-w-screen-2xl
    }
  }, [fullContent]);

  // Récupérer la config typographie
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);

  // Classes typographiques pour h1 (ou h2 si pas le premier)
  const headingClasses = useMemo(() => {
    const targetElement: 'h1' | 'h2' = isFirstHeading ? 'h1' : 'h2';
    const safeTypoConfig = typoConfig?.[targetElement] ? { [targetElement]: typoConfig[targetElement] } : {};
    const classes = getTypographyClasses(targetElement, safeTypoConfig, defaultTypography[targetElement]);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig, isFirstHeading]);

  // Classes typographiques pour h2 (pour le sous-titre)
  const h2Classes = useMemo(() => {
    const safeTypoConfig = typoConfig?.h2 ? { h2: typoConfig.h2 } : {};
    const classes = getTypographyClasses('h2', safeTypoConfig, defaultTypography.h2);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  // Classes typographiques pour h3 (pour le surtitre)
  const h3Classes = useMemo(() => {
    const safeTypoConfig = typoConfig?.h3 ? { h3: typoConfig.h3 } : {};
    const classes = getTypographyClasses('h3', safeTypoConfig, defaultTypography.h3);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  // Détecter si le bloc est le premier rendu (pour compenser la hauteur du header sticky)
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const container = sectionEl.closest('.blocks-container');
    if (!container) return;

    const firstSection = container.querySelector('section[data-block-type]');
    setIsFirstBlock(firstSection === sectionEl);
  }, [blockData]);

  // Mesurer la hauteur du header quand il est sticky
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const header = document.querySelector('header');
    if (!header) return;

    const headerElement = header as HTMLElement;
    const updateHeaderInfo = () => {
      const style = window.getComputedStyle(headerElement);
      setHeaderInfo({
        height: headerElement.getBoundingClientRect().height || 0,
        position: style.position || 'static',
      });
    };

    updateHeaderInfo();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHeaderInfo) : null;
    if (resizeObserver) resizeObserver.observe(headerElement);
    window.addEventListener('resize', updateHeaderInfo);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderInfo);
    };
  }, []);

  const headerOffset =
    isFirstBlock && headerInfo.position !== 'fixed' && headerInfo.position !== 'absolute'
      ? headerInfo.height
      : 0;

  const sectionHeight = headerOffset ? `calc(100vh + ${headerOffset}px)` : '100vh';

  // Calculer le transform de base pour le positionnement
  const baseTransform = useMemo(() => {
    let transformY = '';
    // Pour center, on n'utilise plus translateX, on utilise text-align à la place
    // Donc on ne met translateX que si ce n'est pas center
    let transformX = '';

    // Position verticale
    if (contentPosition === 'center') {
      transformY = 'translateY(-50%)';
    }

    // Alignement horizontal : on n'utilise plus translateX pour center
    // (on utilise text-align à la place dans les styles)

    // Combiner les transforms
    if (transformY && transformX) {
      return `${transformX} ${transformY}`;
    } else if (transformY) {
      return transformY;
    } else if (transformX) {
      return transformX;
    }
    return '';
  }, [contentPosition, contentAlignment]);

  // Parallax sur scroll
  useEffect(() => {
    if (!parallaxEnabled || !backgroundImage || !contentRef.current) {
      // Réinitialiser le transform si le parallax est désactivé
      if (contentRef.current) {
        contentRef.current.style.transform = baseTransform;
      }
      return;
    }

    const updateParallax = () => {
      if (!sectionRef.current || !contentRef.current) return;
      
      if (parallaxStartRef.current === null) {
        parallaxStartRef.current = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      }
      
      const delta = window.scrollY - parallaxStartRef.current;
      const parallaxOffset = delta * parallaxSpeed;
      
      // Ajouter le parallax au transform de base
      contentRef.current.style.transform = baseTransform 
        ? `${baseTransform} translateY(${parallaxOffset}px)`
        : `translateY(${parallaxOffset}px)`;
    };

    const handleResize = () => {
      parallaxStartRef.current = null;
      updateParallax();
    };

    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', handleResize);
    };
  }, [parallaxEnabled, parallaxSpeed, backgroundImage, baseTransform]);

  // Déterminer la couleur de fond selon le thème
  const getBackgroundColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') {
      return '#ffffff';
    } else if (theme === 'dark') {
      return '#050505';
    } else {
      return 'var(--background)';
    }
  };

  const getTextColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') {
      return '#000000';
    } else if (theme === 'dark') {
      return '#ffffff';
    } else {
      return 'var(--foreground)';
    }
  };

  // Styles pour le positionnement du contenu
  const getContentStyles = () => {
    const horizontalPadding = 'clamp(1rem, 2vw, 2rem)'; // px-4 sm:px-6 lg:px-8
    
    const styles: React.CSSProperties = {
      position: 'absolute',
      paddingTop: 0,
      paddingBottom: 'clamp(2rem, 4vw, 4rem)', // Marge en bas pour éviter que ce soit trop collé
      color: getTextColor(),
      zIndex: 2,
      transform: baseTransform, // Utiliser le transform de base calculé
      // Variables CSS pour les transforms (desktop uniquement via media query)
      '--supertitle-transform': supertitle && title ? 'translateY(-1rem)' : 'none',
      '--subtitle-transform': title && supertitle ? 'translateY(-1rem)' : 'none',
    } as React.CSSProperties;

    // Position verticale
    switch (contentPosition) {
      case 'top':
        styles.top = 'clamp(2rem, 5vw, 4rem)';
        styles.bottom = undefined;
        break;
      case 'center':
        styles.top = 'calc(50% - 2rem)'; // Remonter un peu le centre
        styles.bottom = undefined;
        break;
      case 'bottom':
        styles.bottom = 'clamp(2rem, 5vw, 4rem)'; // Ajouter un offset depuis le bas
        styles.top = undefined;
        break;
    }

    // Alignement horizontal simple
    // Sur mobile, le container prend toute la largeur avec padding
    // Sur desktop, le container est centré avec max-width
    switch (contentAlignment) {
      case 'start':
        // Collé à gauche : même position que le contenu des autres blocs
        // Sur mobile: juste le padding, sur desktop: (100% - maxWidth) / 2 + padding
        styles.left = `max(${horizontalPadding}, calc((100% - ${getSiteMaxWidth}px) / 2 + ${horizontalPadding}))`;
        styles.right = undefined;
        styles.paddingLeft = 0;
        styles.paddingRight = 0;
        styles.width = 'auto';
        styles.maxWidth = `${getSiteMaxWidth}px`;
        break;
      case 'center':
        // Centré : simple avec left/right et text-align center
        styles.left = `max(${horizontalPadding}, calc((100% - ${getSiteMaxWidth}px) / 2 + ${horizontalPadding}))`;
        styles.right = `max(${horizontalPadding}, calc((100% - ${getSiteMaxWidth}px) / 2 + ${horizontalPadding}))`;
        styles.paddingLeft = 0;
        styles.paddingRight = 0;
        styles.width = 'auto';
        styles.maxWidth = `${getSiteMaxWidth}px`;
        styles.textAlign = 'center';
        break;
      case 'end':
        // Collé à droite : même position que le contenu des autres blocs
        styles.right = `max(${horizontalPadding}, calc((100% - ${getSiteMaxWidth}px) / 2 + ${horizontalPadding}))`;
        styles.left = undefined;
        styles.paddingLeft = 0;
        styles.paddingRight = 0;
        styles.width = 'auto';
        styles.maxWidth = `${getSiteMaxWidth}px`;
        break;
    }

    return styles;
  };

  const sectionBaseStyle = {
    width: '100vw',
    height: sectionHeight,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    backgroundColor: getBackgroundColor(),
    color: getTextColor(),
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    marginTop: headerOffset ? -headerOffset : 0,
    marginBottom: 0,
    paddingTop: 0,
    top: 0,
    zIndex: 30,
  };

  return (
    <section
      ref={sectionRef}
      className="hero-simple-block"
      data-block-type="hero-simple"
      data-block-theme={blockData.theme || 'auto'}
      data-transparent-header={blockData.transparentHeader ? 'true' : 'false'}
      style={sectionBaseStyle}
    >
      {/* Image de fond */}
      {backgroundImage && (
        <div className="hero-simple__background">
          <Image
            src={backgroundImage}
            fill={true}
            alt=""
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      )}

      {/* Contenu (titre et sous-titre) */}
      <div
        ref={contentRef}
        className="hero-simple__content"
        style={getContentStyles()}
      >
        {supertitle && (
          <p 
            className={`hero-simple__supertitle ${h3Classes}`}
            style={{ 
              color: getTextColor(),
              opacity: 0.8,
              textAlign: contentAlignment === 'center' ? 'center' : 'left',
              marginLeft: contentAlignment === 'center' ? 'auto' : 0,
              marginRight: contentAlignment === 'center' ? 'auto' : 0,
              marginBottom: 0,
            }}
          >
            {supertitle}
          </p>
        )}
        {title && (
          <HeadingTag 
            className={`hero-simple__title ${headingClasses}`}
            style={{ 
              color: getTextColor(),
            }}
          >
            {title}
          </HeadingTag>
        )}
            {subtitle && (
              <h2 
                className={`hero-simple__subtitle ${h2Classes}`}
                style={{ 
                  color: getTextColor(), 
                  opacity: 0.8,
                  textAlign: contentAlignment === 'center' ? 'center' : 'left',
                  marginLeft: contentAlignment === 'center' ? 'auto' : 0,
                  marginRight: contentAlignment === 'center' ? 'auto' : 0,
                }}
              >
                {subtitle}
              </h2>
            )}
            {blockData.buttonText && blockData.buttonLink && (
              <div 
                className="hero-simple__button-wrapper"
                style={{
                  textAlign: contentAlignment === 'center' ? 'center' : 'left',
                  marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
                }}
              >
                <Link
                  href={blockData.buttonLink}
                  className="hero-simple__button"
                  style={{
                    display: 'inline-block',
                    padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                    backgroundColor: getTextColor(),
                    color: getBackgroundColor(),
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    fontWeight: 500,
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {blockData.buttonText}
                </Link>
              </div>
            )}
          </div>

      <style jsx>{`
        .hero-simple-block {
          /* Styles déjà dans sectionBaseStyle */
        }
        .hero-simple__background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .hero-simple__content {
          /* Styles déjà dans getContentStyles() */
        }
        .hero-simple__title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .hero-simple__supertitle {
          max-width: 65ch;
          margin-bottom: 0;
        }
        .hero-simple__subtitle {
          max-width: 65ch;
          margin: 0;
        }
        /* Desktop : rapprocher le surtitre du h1 avec transform */
        @media (min-width: 769px) {
          .hero-simple__supertitle {
            margin-bottom: 0;
          }
          .hero-simple__title {
            transform: var(--supertitle-transform, none);
          }
          .hero-simple__subtitle {
            transform: var(--subtitle-transform, none);
          }
        }
        /* Mobile : espacements normaux pour la lisibilité */
        @media (max-width: 768px) {
          .hero-simple__title {
            font-size: clamp(2rem, 8vw, 3rem);
            margin-top: 0.75rem;
            transform: none !important;
          }
          .hero-simple__supertitle {
            margin-bottom: 0.75rem;
          }
          .hero-simple__subtitle {
            margin-top: 1.25rem;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
