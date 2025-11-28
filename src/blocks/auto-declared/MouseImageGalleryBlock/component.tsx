'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';

interface GalleryImage {
  id?: string;
  src: string;
  alt?: string;
  hidden?: boolean;
  aspectRatio?: string; // 'auto' | '1:1' | '1:2' | '2:3' | '3:4' | '4:5' | '9:16' | '3:2' | '4:3' | '5:4' | '16:9' | '2:1' | '4:1' | '8:1' | 'stretch'
}

interface MouseImageGalleryData {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  theme?: 'light' | 'dark' | 'auto';
  transparentHeader?: boolean;
  speed?: number; // 0-100 (plus haut = plus réactif)
  maxImages?: number; // Nombre max d'images visibles
  initialImages?: number; // Nombre d'images affichées au chargement (0-10)
  parallax?: {
    enabled?: boolean;
    speed?: number; // 0-1
  };
}

export default function MouseImageGalleryBlock({ data }: { data: MouseImageGalleryData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const images = useMemo(
    () => (blockData.images || []).filter((img: GalleryImage) => img?.src && !img.hidden),
    [blockData]
  );

  const maxNumberOfImages = useMemo(() => {
    return typeof blockData.maxImages === 'number' ? blockData.maxImages : 8;
  }, [blockData.maxImages]);
  const stepThreshold = 150; // Seuil de pas avant de changer d'image
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [headerInfo, setHeaderInfo] = useState<{ height: number; position: string }>({ height: 0, position: 'static' });
  const [isFirstBlock, setIsFirstBlock] = useState(false);
  
  // Variables pour suivre l'état (comme dans la démo originale)
  const stepsRef = useRef(0);
  const currentIndexRef = useRef(0);
  const nbOfImagesRef = useRef(0);

  // Créer les refs pour chaque image - utiliser useMemo pour s'assurer qu'elles sont créées
  const imageRefs = useMemo(() => {
    return images.map(() => React.createRef<HTMLImageElement>());
  }, [images.length]);

  // Détecter si le bloc est le premier rendu (pour compenser la hauteur du header sticky)
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const container = sectionEl.closest('.blocks-container');
    if (!container) return;

    const firstSection = container.querySelector('section[data-block-type]');
    setIsFirstBlock(firstSection === sectionEl);
  }, [images.length, blockData]);

  // Mesurer la hauteur du header quand il est sticky (position différente de fixed/absolute)
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
  
  // Parallax
  const parallaxEnabled = !!blockData.parallax?.enabled;
  const parallaxSpeed = typeof blockData.parallax?.speed === 'number' ? blockData.parallax.speed : 0.25;
  const parallaxStartRef = useRef<number | null>(null);

  // Parallax sur scroll : appliquer un décalage Y aux images visibles
  useEffect(() => {
    if (!parallaxEnabled) {
      // Réinitialiser les transforms si le parallax est désactivé
      imageRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.style.transform = `translateX(-50%) translateY(-50%)`;
        }
      });
      return;
    }

    const updateParallax = () => {
      if (!sectionRef.current) return;

      if (parallaxStartRef.current === null) {
        parallaxStartRef.current = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      }
      
      const delta = window.scrollY - parallaxStartRef.current;
      const parallaxOffset = delta * parallaxSpeed;
      
      // Appliquer le décalage parallax à toutes les images visibles
      imageRefs.forEach((ref) => {
        if (ref.current && ref.current.style.display === 'block') {
          // Appliquer le parallax en additionnant au translateY existant
          ref.current.style.transform = `translateX(-50%) translateY(calc(-50% + ${parallaxOffset}px))`;
        }
      });
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
  }, [parallaxEnabled, parallaxSpeed, imageRefs]);

  // Afficher les images initiales au chargement pour habiller la page
  useEffect(() => {
    if (images.length === 0) return;
    if (typeof window === 'undefined') return;

    // Réinitialiser toutes les images d'abord
    imageRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.style.display = 'none';
      }
    });
    nbOfImagesRef.current = 0;

    const showInitialImages = () => {
      if (!stageRef.current) return;

      // Utiliser la valeur configurée ou 3 par défaut
      const configuredInitial = typeof blockData.initialImages === 'number' ? blockData.initialImages : 3;
      const numInitialImages = Math.min(Math.max(0, configuredInitial), images.length);
      
      // Si 0, ne rien afficher
      if (numInitialImages === 0) {
        currentIndexRef.current = 0;
        return;
      }

      const initialIndices = [...Array(numInitialImages).keys()]; // Les N premières : 0, 1, 2, ...

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      initialIndices.forEach((imgIndex, idx) => {
        const imageRef = imageRefs[imgIndex];
        if (!imageRef?.current) return;

        // Position aléatoire dans le viewport (éviter les bords)
        const margin = 150; // Marge pour éviter les bords
        const randomX = margin + Math.random() * (viewportWidth - margin * 2);
        const randomY = margin + Math.random() * (viewportHeight - margin * 2);

        // Positionner l'image
        imageRef.current.style.left = randomX + 'px';
        imageRef.current.style.top = randomY + 'px';
        imageRef.current.style.display = 'block';
        imageRef.current.style.zIndex = idx.toString();

        // Mettre à jour les compteurs pour suivre les images visibles
        nbOfImagesRef.current++;
      });

      // Initialiser currentIndexRef pour continuer après les images initiales
      // On commence après le dernier index utilisé pour éviter les conflits
      currentIndexRef.current = numInitialImages % images.length;
    };

    // Attendre un peu pour que le layout soit prêt
    const timeout = setTimeout(showInitialImages, 100);
    return () => clearTimeout(timeout);
  }, [images.length, imageRefs, blockData.initialImages]);

  const manageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, movementX, movementY } = e;

    stepsRef.current += Math.abs(movementX) + Math.abs(movementY);

    if (stepsRef.current >= currentIndexRef.current * stepThreshold) {
      // Utiliser clientX et clientY directement comme dans la démo originale
      moveImage(clientX, clientY);

      // Utiliser la valeur à jour de maxNumberOfImages
      const currentMaxImages = typeof blockData.maxImages === 'number' ? blockData.maxImages : 8;
      if (nbOfImagesRef.current === currentMaxImages) {
        removeImage();
      }
    }

    if (currentIndexRef.current === imageRefs.length) {
      currentIndexRef.current = 0;
      stepsRef.current = -stepThreshold;
    }
  };

  const moveImage = (x: number, y: number) => {
    const currentImage = imageRefs[currentIndexRef.current]?.current;
    if (!currentImage) return;

    // Positionner directement avec clientX/clientY comme dans la démo
    currentImage.style.left = x + 'px';
    currentImage.style.top = y + 'px';
    currentImage.style.display = 'block';
    currentIndexRef.current++;
    nbOfImagesRef.current++;
    setZIndex();
  };

  const setZIndex = () => {
    const visibleImages = getCurrentImages();
    for (let i = 0; i < visibleImages.length; i++) {
      if (visibleImages[i]) {
        visibleImages[i].style.zIndex = i.toString();
      }
    }
  };

  const removeImage = () => {
    const visibleImages = getCurrentImages();
    if (visibleImages[0]) {
      visibleImages[0].style.display = 'none';
      nbOfImagesRef.current--;
    }
  };

  const getCurrentImages = (): (HTMLImageElement | null)[] => {
    const images: (HTMLImageElement | null)[] = [];
    const indexOfFirst = currentIndexRef.current - nbOfImagesRef.current;
    for (let i = indexOfFirst; i < currentIndexRef.current; i++) {
      let targetIndex = i;
      if (targetIndex < 0) targetIndex += imageRefs.length;
      images.push(imageRefs[targetIndex]?.current || null);
    }
    return images;
  };

  // Déterminer la couleur de fond selon le thème
  const getBackgroundColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') {
      return '#ffffff';
    } else if (theme === 'dark') {
      return '#050505';
    } else {
      // Auto : utiliser la variable CSS de la palette
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
      // Auto : utiliser la variable CSS de la palette
      return 'var(--foreground)';
    }
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
    cursor: 'none',
  };

  if (images.length === 0) {
    return (
      <section
        ref={sectionRef}
        className="mouse-gallery-block"
        data-block-type="mouse-image-gallery"
        data-block-theme={blockData.theme || 'auto'}
        data-transparent-header={blockData.transparentHeader ? 'true' : 'false'}
        style={{
          ...sectionBaseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="mouse-gallery__empty">Ajoutez des images pour activer la galerie.</div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="mouse-gallery-block"
      data-block-type="mouse-image-gallery"
      data-block-theme={blockData.theme || 'auto'}
      data-transparent-header={blockData.transparentHeader ? 'true' : 'false'}
      style={sectionBaseStyle}
    >
      <div className="mouse-gallery__header" style={{ color: getTextColor() }}>
        {blockData.title && <h1 className="mouse-gallery__title">{blockData.title}</h1>}
        {blockData.subtitle && <p className="mouse-gallery__subtitle">{blockData.subtitle}</p>}
      </div>

      <div
        ref={stageRef}
        onMouseMove={manageMouseMove}
        className="mouse-gallery__stage"
      >
        {images.map((img, idx) => {
          // Calculer le style selon le ratio d'aspect (comme HeroFloatingGalleryBlock)
          const getImageStyle = () => {
            if (!img.aspectRatio || img.aspectRatio === 'auto') {
              return {
                width: '30vw',
                height: 'auto',
                objectFit: 'contain' as const,
                objectPosition: 'center' as const,
              };
            }
            // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
            const ratio = img.aspectRatio.replace(':', '/');
            return {
              width: '30vw',
              aspectRatio: ratio,
              objectFit: 'cover' as const,
              objectPosition: 'center' as const,
            };
          };
          
          return (
            <img
            key={img.id || `mouse-image-${idx}`}
              ref={imageRefs[idx]}
              src={img.src}
              alt={img.alt || ''}
              loading="lazy"
            className="mouse-gallery__item"
              style={getImageStyle()}
            />
          );
        })}
      </div>

      <style jsx>{`
        .mouse-gallery-block {
          /* Les styles sont maintenant dans sectionBaseStyle */
        }
        .mouse-gallery__header {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(2rem, 5vw, 4rem);
          pointer-events: none;
        }
        .mouse-gallery__title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 1rem;
        }
        .mouse-gallery__subtitle {
          max-width: 65ch;
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          opacity: 0.7;
          line-height: 1.6;
          margin: 0;
          font-weight: 300;
        }
        .mouse-gallery__stage {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .mouse-gallery__item {
          position: absolute;
          display: none;
          transform: translateX(-50%) translateY(-50%);
          pointer-events: none;
          max-width: 30vw;
        }
        .mouse-gallery__empty {
          padding: 4rem 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.125rem;
        }
        @media (max-width: 768px) {
          .mouse-gallery-block {
            cursor: default;
          }
          .mouse-gallery__item {
            width: 40vw;
          }
        }
      `}</style>
    </section>
  );
}
