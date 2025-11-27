'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { fetchContentWithNoCache, useContentUpdate } from '@/hooks/useContentUpdate';

interface FloatingImage {
  id?: string;
  src: string;
  alt?: string;
  hidden?: boolean;
  aspectRatio?: string; // 'auto' | '1:1' | '1:2' | '2:3' | '3:4' | '4:5' | '9:16' | '3:2' | '4:3' | '5:4' | '16:9' | '2:1' | '4:1' | '8:1' | 'stretch'
}

interface FloatingGalleryData {
  title?: string;
  subtitle?: string;
  intensity?: number; // 0-100, contrôle la vitesse
  images?: FloatingImage[];
  theme?: 'light' | 'dark' | 'auto';
  transparentHeader?: boolean;
  parallax?: {
    enabled?: boolean;
    speed?: number; // 0-1
  };
}

export default function HeroFloatingGalleryBlock({ data }: { data: FloatingGalleryData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const images = useMemo(() => {
    // Limiter à 9 visuels max
    return (blockData.images || [])
      .filter((img: FloatingImage) => img?.src && !img.hidden)
      .slice(0, 9);
  }, [blockData]);

  const title = blockData.title?.trim() || '';
  const subtitle = blockData.subtitle?.trim() || '';
  const intensity = typeof blockData.intensity === 'number' ? blockData.intensity : 50;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [headerInfo, setHeaderInfo] = useState<{ height: number; position: string }>({ height: 0, position: 'static' });
  const [isFirstBlock, setIsFirstBlock] = useState(false);
  const parallaxOffsetsRef = useRef<{ p1: number; p2: number; p3: number }>({ p1: 0, p2: 0, p3: 0 });
  const lastParallaxRef = useRef<{ p1: number; p2: number; p3: number }>({ p1: 0, p2: 0, p3: 0 });
  const parallaxStartRef = useRef<number | null>(null);
  const parallaxRafRef = useRef<number | null>(null);

  // Charger le contenu pour accéder à la typographie (comme PageIntroBlock)
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

  // Écouter les mises à jour de contenu
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

  // Récupérer la config typographie
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);

  // Classes typographiques pour h1
  const headingClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.h1 ? { h1: typoConfig.h1 } : {};
    const classes = getTypographyClasses('h1', safeTypoConfig, defaultTypography.h1);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  // Couleur pour h1
  const h1Color = useMemo(() => {
    const customColor = getCustomColor('h1', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);

  // Classes typographiques pour h2
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

  // Couleur pour h2
  const h2Color = useMemo(() => {
    const customColor = getCustomColor('h2', typoConfig);
    if (customColor) return customColor;
    return 'var(--muted-foreground)';
  }, [typoConfig]);

  const plane1Ref = useRef<HTMLDivElement>(null);
  const plane2Ref = useRef<HTMLDivElement>(null);
  const plane3Ref = useRef<HTMLDivElement>(null);

  const requestIdRef = useRef<number | null>(null);
  const xForceRef = useRef(0);
  const yForceRef = useRef(0);

  // Positions exactes de la démo (3 plans) - responsive avec clamp
  const plane1Positions = [
    { left: '90%', top: '70%', width: 'clamp(120px, 15vw, 300px)' },
    { left: '5%', top: '65%', width: 'clamp(120px, 15vw, 300px)' },
    { left: '35%', top: '10%', width: 'clamp(100px, 12vw, 225px)' },
  ];
  const plane2Positions = [
    { left: '5%', top: '10%', width: 'clamp(100px, 12vw, 250px)' },
    { left: '90%', top: '30%', width: 'clamp(80px, 10vw, 200px)' },
    { left: '70%', top: '75%', width: 'clamp(100px, 12vw, 225px)' },
  ];
  const plane3Positions = [
    { left: '65%', top: '25%', width: 'clamp(60px, 8vw, 150px)' },
    { left: '40%', top: '90%', width: 'clamp(80px, 10vw, 200px)' },
    { left: '25%', top: '38%', width: 'clamp(70px, 9vw, 180px)' },
  ];

  // Répartition des images suivant le pattern original (9 visuels max)
  const planes = useMemo(() => {
    const p1: FloatingImage[] = [];
    const p2: FloatingImage[] = [];
    const p3: FloatingImage[] = [];
    const pattern = [
      { plane: 'p1', slot: 0 },
      { plane: 'p1', slot: 1 },
      { plane: 'p1', slot: 2 },
      { plane: 'p2', slot: 0 },
      { plane: 'p2', slot: 1 },
      { plane: 'p2', slot: 2 },
      { plane: 'p3', slot: 0 },
      { plane: 'p3', slot: 1 },
      { plane: 'p3', slot: 2 },
    ];

    images.forEach((img, idx) => {
      const target = pattern[idx % pattern.length];
      if (target.plane === 'p1') p1.push(img);
      if (target.plane === 'p2') p2.push(img);
      if (target.plane === 'p3') p3.push(img);
    });

    return { p1, p2, p3 };
  }, [images]);

  const easing = 0.08;
  const speed = (intensity / 100) * 0.02 || 0.01; // 0.01 = valeur du repo
  const lerp = (start: number, target: number, amount: number) => start * (1 - amount) + target * amount;

  const animate = () => {
    xForceRef.current = lerp(xForceRef.current, 0, easing);
    yForceRef.current = lerp(yForceRef.current, 0, easing);

    if (plane1Ref.current) {
      gsap.set(plane1Ref.current, { 
        x: `+=${xForceRef.current}`, 
        y: `+=${yForceRef.current}`,
        zIndex: 50 // Maintenir le z-index pendant l'animation
      });
    }
    if (plane2Ref.current) {
      gsap.set(plane2Ref.current, { 
        x: `+=${xForceRef.current * 0.5}`, 
        y: `+=${yForceRef.current * 0.5}`,
        zIndex: 50 // Maintenir le z-index pendant l'animation
      });
    }
    if (plane3Ref.current) {
      gsap.set(plane3Ref.current, { 
        x: `+=${xForceRef.current * 0.25}`, 
        y: `+=${yForceRef.current * 0.25}`,
        zIndex: 50 // Maintenir le z-index pendant l'animation
      });
    }

    if (Math.abs(xForceRef.current) < 0.01) xForceRef.current = 0;
    if (Math.abs(yForceRef.current) < 0.01) yForceRef.current = 0;

    if (xForceRef.current !== 0 || yForceRef.current !== 0) {
      requestAnimationFrame(animate);
    } else if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
  };

  const manageMouseMove = (event: React.MouseEvent) => {
    if (!images.length) return;
    const { movementX, movementY } = event;
    xForceRef.current += movementX * speed;
    yForceRef.current += movementY * speed;

    if (requestIdRef.current == null) {
      requestIdRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

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
  const centerOffset = headerOffset ? headerOffset / 2 : 0;
  const parallaxEnabled = !!blockData.parallax?.enabled;
  const parallaxSpeed = typeof blockData.parallax?.speed === 'number' ? blockData.parallax.speed : 0.25;

  // Parallax sur scroll (optionnel) : appliquer des deltas pour ne pas écraser le flottant
  useEffect(() => {
    const applyParallaxDelta = (next: { p1: number; p2: number; p3: number }) => {
      const last = lastParallaxRef.current;
      const delta1 = next.p1 - last.p1;
      const delta2 = next.p2 - last.p2;
      const delta3 = next.p3 - last.p3;
      if (plane1Ref.current && delta1 !== 0) gsap.set(plane1Ref.current, { y: `+=${delta1}` });
      if (plane2Ref.current && delta2 !== 0) gsap.set(plane2Ref.current, { y: `+=${delta2}` });
      if (plane3Ref.current && delta3 !== 0) gsap.set(plane3Ref.current, { y: `+=${delta3}` });
      lastParallaxRef.current = next;
    };

    if (!parallaxEnabled) {
      applyParallaxDelta({ p1: 0, p2: 0, p3: 0 });
      return;
    }

    const updateParallax = () => {
      if (!sectionRef.current) return;
      if (parallaxStartRef.current === null) {
        parallaxStartRef.current = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      }
      const delta = window.scrollY - parallaxStartRef.current;
      const base = delta * parallaxSpeed;
      const next = {
        p1: base,
        p2: base * 0.65,
        p3: base * 0.4,
      };
      applyParallaxDelta(next);
    };

    const handleResize = () => {
      parallaxStartRef.current = null;
      updateParallax();
    };

    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (parallaxRafRef.current) cancelAnimationFrame(parallaxRafRef.current);
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', handleResize);
    };
  }, [parallaxEnabled, parallaxSpeed]);

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
    zIndex: 30, // Laisser le header (z-40) au-dessus même quand on remonte le bloc
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[HeroFloatingGallery] layout', {
        isFirstBlock,
        headerOffset,
        headerHeight: headerInfo.height,
        headerPosition: headerInfo.position,
        sectionHeight
      });
    }
  }, [isFirstBlock, headerOffset, headerInfo.height, headerInfo.position, sectionHeight]);


  // Aucun visuel -> placeholder simple
  if (!images.length) {
    return (
      <section
        className="hero-floating-gallery-section"
        data-block-type="hero-floating-gallery"
        data-block-theme={blockData.theme || 'auto'}
        data-transparent-header={blockData.transparentHeader ? 'true' : 'false'}
        ref={sectionRef}
        style={{
          ...sectionBaseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>Ajoutez des images pour voir la galerie flottante.</div>
      </section>
    );
  }

  return (
    <section
      className="hero-floating-gallery-section"
      data-block-type="hero-floating-gallery"
      data-block-theme={blockData.theme || 'auto'}
      data-transparent-header={blockData.transparentHeader ? 'true' : 'false'}
      ref={sectionRef}
      style={sectionBaseStyle}
      onMouseMove={manageMouseMove}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 50, // S'assurer que les images passent devant le header
          isolation: 'isolate', // Créer un nouveau contexte de stacking pour maintenir le z-index
        }}
      >
        <div
          ref={plane1Ref}
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 50 }}
        >
          {planes.p1.map((img, idx) => {
            const pos = plane1Positions[idx % plane1Positions.length];
            // Calculer le style selon le ratio d'aspect (comme ImageBlock)
            const getImageStyle = () => {
              if (!img.aspectRatio || img.aspectRatio === 'auto') {
                return {
                  position: 'absolute' as const,
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  height: 'auto',
                  objectFit: 'contain' as const,
                  objectPosition: 'center' as const,
                  transform: 'translate(-50%, -50%)',
                };
              }
              // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
              const ratio = img.aspectRatio.replace(':', '/');
              return {
                position: 'absolute' as const,
                left: pos.left,
                top: pos.top,
                width: pos.width,
                aspectRatio: ratio,
                objectFit: 'cover' as const,
                objectPosition: 'center' as const,
                transform: 'translate(-50%, -50%)',
              };
            };
            return (
              <img
                key={img.id || `p1-${idx}`}
                src={img.src}
                alt={img.alt || ''}
                style={getImageStyle()}
              />
            );
          })}
        </div>

        <div
          ref={plane2Ref}
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 50 }}
        >
          {planes.p2.map((img, idx) => {
            const pos = plane2Positions[idx % plane2Positions.length];
            // Calculer le style selon le ratio d'aspect (comme ImageBlock)
            const getImageStyle = () => {
              if (!img.aspectRatio || img.aspectRatio === 'auto') {
                return {
                  position: 'absolute' as const,
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  height: 'auto',
                  objectFit: 'contain' as const,
                  objectPosition: 'center' as const,
                  transform: 'translate(-50%, -50%)',
                };
              }
              // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
              const ratio = img.aspectRatio.replace(':', '/');
              return {
                position: 'absolute' as const,
                left: pos.left,
                top: pos.top,
                width: pos.width,
                aspectRatio: ratio,
                objectFit: 'cover' as const,
                objectPosition: 'center' as const,
                transform: 'translate(-50%, -50%)',
              };
            };
            return (
              <img
                key={img.id || `p2-${idx}`}
                src={img.src}
                alt={img.alt || ''}
                style={getImageStyle()}
              />
            );
          })}
        </div>

        <div
          ref={plane3Ref}
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 50 }}
        >
          {planes.p3.map((img, idx) => {
            const pos = plane3Positions[idx % plane3Positions.length];
            // Calculer le style selon le ratio d'aspect (comme ImageBlock)
            const getImageStyle = () => {
              if (!img.aspectRatio || img.aspectRatio === 'auto') {
                return {
                  position: 'absolute' as const,
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  height: 'auto',
                  objectFit: 'contain' as const,
                  objectPosition: 'center' as const,
                  transform: 'translate(-50%, -50%)',
                };
              }
              // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
              const ratio = img.aspectRatio.replace(':', '/');
              return {
                position: 'absolute' as const,
                left: pos.left,
                top: pos.top,
                width: pos.width,
                aspectRatio: ratio,
                objectFit: 'cover' as const,
                objectPosition: 'center' as const,
                transform: 'translate(-50%, -50%)',
              };
            };
            return (
              <img
                key={img.id || `p3-${idx}`}
                src={img.src}
                alt={img.alt || ''}
                style={getImageStyle()}
              />
            );
          })}
        </div>
      </div>

      <div
        className="w-full max-w-[90vw] md:max-w-[70vw] px-8"
        style={{
          position: 'absolute',
          left: '50%',
          top: centerOffset ? `calc(45% + ${centerOffset}px)` : '45%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 60, // Au-dessus des images et du header (header z-40, images z-50)
        }}
      >
        {title && (
          <h1 
            className={headingClasses}
            style={{ margin: 0, color: h1Color }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 
            className={h2Classes}
            style={{ margin: 0, color: h2Color }}
          >
            {subtitle}
          </h2>
        )}
      </div>
    </section>
  );
}
