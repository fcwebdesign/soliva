'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTypographyConfig, getTypographyClasses, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';

interface InfiniteTextScrollData {
  text?: string;
  speed?: number; // 0-100 (vitesse de l'animation)
  fontSize?: number; // Taille de police en px (legacy)
  size?: 'normal' | 'large'; // Taille pré-définie
  position?: 'top' | 'center' | 'bottom'; // Position verticale
  positionOffset?: number; // Offset en px depuis la position
  color?: string; // Couleur du texte
  theme?: 'light' | 'dark' | 'auto';
  backgroundImage?: string; // Image de fond (optionnel)
}

export default function InfiniteTextScrollBlock({ data }: { data: InfiniteTextScrollData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const [fullContent, setFullContent] = useState<any>(null);
  const [containerMinHeight, setContainerMinHeight] = useState<number | null>(null);
  const [repeatCount, setRepeatCount] = useState<number>(2);
  const firstTextRef = useRef<HTMLParagraphElement>(null);
  const secondTextRef = useRef<HTMLParagraphElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  
  const xPercentRef = useRef(0);
  const directionRef = useRef(-1);
  const animationFrameRef = useRef<number | null>(null);

  const text = blockData.text || 'Freelance Developer -';
  const speed = typeof blockData.speed === 'number' ? blockData.speed : 50; // 0-100, par défaut 50
  // Taille : 2 presets (normal = H2, large = H1). Fallback sur l'ancien fontSize pour compat.
  const size: 'normal' | 'large' = blockData.size
    ? blockData.size
    : typeof blockData.fontSize === 'number' && blockData.fontSize >= 120
      ? 'large'
      : 'normal';
  const fontSizePx = size === 'large' ? 120 : 72; // Approx pour calculs internes (espacements)

  // Charger la config typographique globale (H1/H2)
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetchContentWithNoCache('/api/content/metadata');
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch {
        // silencieux
      }
    };
    loadContent();
  }, []);

  // Écouter les mises à jour de contenu (typo)
  useContentUpdate(() => {
    const reloadContent = async () => {
      try {
        const res = await fetchContentWithNoCache('/api/content/metadata');
        if (res.ok) {
          const json = await res.json();
          setFullContent(json);
        }
      } catch {
        // silencieux
      }
    };
    reloadContent();
  });

  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);

  const targetElement: 'h1' | 'h2' = size === 'large' ? 'h1' : 'h2';
  const targetDefault = targetElement === 'h1' ? defaultTypography.h1 : defaultTypography.h2;

  const textTypographyClasses = useMemo(() => {
    const safeConfig = (typoConfig as any)?.[targetElement] ? { [targetElement]: (typoConfig as any)[targetElement] } : {};
    const classes = getTypographyClasses(targetElement, safeConfig as any, targetDefault as any);
    // Retirer les classes de couleur pour laisser le contrôle au block (palette/couleur custom)
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig, targetElement, targetDefault]);

  // Mesurer la hauteur réelle du texte pour définir un min-height dynamique (évite la coupe quel que soit le thème/typo)
  useEffect(() => {
    const measure = () => {
      if (!firstTextRef.current) return;
      const h = firstTextRef.current.offsetHeight;
      if (h > 0) {
        setContainerMinHeight(h + 8); // petit buffer
      }
    };

    const handleResize = () => measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [textTypographyClasses, text, size, typoConfig]);

  // S'assurer que la bande de texte couvre la largeur (dupliquer si trop court)
  useEffect(() => {
    const measure = () => {
      if (!sectionRef.current || !firstTextRef.current) return;
      const containerWidth = sectionRef.current.clientWidth || 0;
      const textWidth = firstTextRef.current.offsetWidth || 0;
      if (containerWidth === 0 || textWidth === 0) return;
      // on vise au moins 2x la largeur du conteneur pour éviter les trous
      const needed = Math.max(2, Math.ceil((containerWidth * 2) / textWidth));
      setRepeatCount(needed);
    };

    const handleResize = () => measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [text, textTypographyClasses, size]);

  const position = blockData.position || 'bottom';
  const positionOffset = typeof blockData.positionOffset === 'number' ? blockData.positionOffset : 0;
  // Couleur du texte : auto utilise la palette, sinon la couleur spécifiée
  const getTextColor = () => {
    if (!blockData.color || blockData.color === 'auto') {
      return 'var(--foreground)';
    }
    return blockData.color;
  };
  const color = getTextColor();
  const backgroundImage = blockData.backgroundImage;
  const hasBackgroundImage = !!backgroundImage;
  const bottomGap = hasBackgroundImage ? fontSizePx * 0.2 : 0; // petit espace sécurité en bas si image

  // Déterminer la couleur de fond selon le thème uniquement
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

  // Calculer la position verticale + le transform associé
  const getVerticalPosition = () => {
    const offset = positionOffset || 0;

    if (hasBackgroundImage) {
      // On ancre réellement en haut/centre/bas du bloc image (même marge haut/bas)
      switch (position) {
        case 'top':
          return { top: `${offset}px`, bottom: undefined, transform: 'none', isAbsolute: true };
        case 'center':
          return { top: `calc(50% + ${offset}px)`, bottom: undefined, transform: 'translateY(-50%)', isAbsolute: true };
        case 'bottom':
          return { top: undefined, bottom: `${offset + bottomGap}px`, transform: 'none', isAbsolute: true };
        default:
          return { top: undefined, bottom: `${offset + bottomGap}px`, transform: 'none', isAbsolute: true };
      }
    } else {
      // Sans image : pas d'absolu, on laisse le flux normal (plus de coupure)
      return { top: undefined, bottom: undefined, transform: 'none', isAbsolute: false };
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!firstTextRef.current || !secondTextRef.current || !sliderRef.current) return;
    
    gsap.registerPlugin(ScrollTrigger);

    // Animation du slider basée sur le scroll (exactement comme la démo)
    const scrollTrigger = gsap.to(sliderRef.current, {
      scrollTrigger: {
        trigger: document.documentElement,
        scrub: 0.25,
        start: 0,
        end: window.innerHeight,
        onUpdate: (e: any) => {
          directionRef.current = e.direction * -1;
        }
      },
      x: "-500px",
    });

    // Animation continue du texte (exactement comme la démo)
    const animate = () => {
      // Logique exacte de la démo : reset transparent
      if (xPercentRef.current < -100) {
        xPercentRef.current = 0;
      } else if (xPercentRef.current > 0) {
        xPercentRef.current = -100;
      }
      
      if (sliderRef.current?.children?.length) {
        gsap.set(sliderRef.current.children, { xPercent: xPercentRef.current });
      }
      
      // Vitesse ajustable : speed 0-100, converti proportionnellement (démo originale = 0.1)
      const baseSpeed = 0.1;
      const animationSpeed = baseSpeed * (speed / 50);
      xPercentRef.current += animationSpeed * directionRef.current;
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scrollTrigger.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.trigger === document.documentElement) {
          trigger.kill();
        }
      });
    };
  }, [speed, text]);

  return (
    <section
      ref={sectionRef}
      className="infinite-text-scroll-block"
      data-block-type="infinite-text-scroll"
      data-block-theme={blockData.theme || 'auto'}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: hasBackgroundImage ? '100vh' : 'auto',
        minHeight: hasBackgroundImage ? '100vh' : 'auto',
        backgroundColor: getBackgroundColor(),
        overflowX: 'hidden', // pas de barre horizontale
        overflowY: hasBackgroundImage ? 'hidden' : 'visible', // laisser respirer verticalement sans image
        paddingTop: 0, // padding déjà géré ailleurs
        paddingBottom: hasBackgroundImage ? `${fontSizePx * 0.2}px` : 0, // petit espace en bas pour éviter que le texte touche l'image
      }}
    >
      {/* Image de fond comme dans la démo */}
      {hasBackgroundImage && (
        <Image
          src={backgroundImage}
          fill={true}
          alt=""
          style={{ objectFit: 'cover' }}
          priority
        />
      )}
      {(() => {
        const placement = getVerticalPosition();
        return (
          <div
            className="infinite-text-scroll__container"
            style={{
              position: placement.isAbsolute ? 'absolute' : 'relative',
              top: placement.top,
              bottom: placement.bottom,
              transform: placement.transform,
              width: '100%',
              minHeight: containerMinHeight ? `${containerMinHeight}px` : undefined, // éviter la coupe quelle que soit la typo
              overflow: 'visible', // Permettre au texte de dépasser sans être coupé
            }}
          >
            <div ref={sliderRef} className="infinite-text-scroll__slider">
              {Array.from({ length: repeatCount }).map((_, idx) => (
                <p
                  key={`${text}-${idx}`}
                  ref={idx === 0 ? firstTextRef : idx === 1 ? secondTextRef : null}
                  className={`infinite-text-scroll__text ${idx === 1 ? 'infinite-text-scroll__text--second' : ''} ${textTypographyClasses}`}
                  style={{
                    color,
                    lineHeight: 1,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        );
      })()}

      <style jsx>{`
        .infinite-text-scroll__slider {
          position: relative;
          display: inline-flex; /* shrink to text width so the second item sits right after the first */
          white-space: nowrap;
        }
        .infinite-text-scroll__text {
          position: relative;
          margin: 0px;
          padding-right: 50px;
          display: inline-block;
          line-height: 1; /* évite la coupure verticale */
        }
        .infinite-text-scroll__text--second {
          position: absolute;
          left: 100%;
          top: 0;
        }
        @media (max-width: 768px) {
          .infinite-text-scroll__text {
            font-size: clamp(60px, 20vw, 120px) !important;
          }
        }
      `}</style>
    </section>
  );
}
