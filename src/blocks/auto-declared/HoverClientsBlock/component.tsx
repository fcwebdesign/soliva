'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { fetchContentWithNoCache, useContentUpdate } from '@/hooks/useContentUpdate';
import './styles.css';

interface HoverClientItem {
  id?: string;
  name?: string;
  image?: {
    src?: string;
    alt?: string;
  };
  hidden?: boolean;
}

interface HoverClientsData {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  items?: HoverClientItem[];
}

export default function HoverClientsBlock({ data }: { data: HoverClientsData }) {
  const blockData = (data as any)?.data || data || {};
  const {
    title = 'Trusted us',
    subtitle = 'Selected clients',
    backgroundColor: rawBackgroundColor,
    textColor: rawTextColor,
    mutedColor: rawMutedColor,
    accentColor: rawAccentColor,
    theme = 'auto',
    items: rawItems = [],
  } = blockData;

  // Ignorer les anciennes valeurs par défaut pour utiliser le thème
  const backgroundColor = rawBackgroundColor && rawBackgroundColor !== '#0d0d10' ? rawBackgroundColor : undefined;
  const textColor = rawTextColor && rawTextColor !== '#ffffff' ? rawTextColor : undefined;
  const mutedColor = rawMutedColor && rawMutedColor !== '#b3b3b3' ? rawMutedColor : undefined;
  const accentColor = rawAccentColor && rawAccentColor !== '#ffffff' ? rawAccentColor : undefined;

  const items = useMemo(
    () => (rawItems || []).filter((item) => item && !item.hidden && (item.name || item.image?.src)),
    [rawItems]
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  // Classes typographiques pour h2 (sans la couleur pour la gérer via style)
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

  // Couleur pour h2 : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const h2Color = useMemo(() => {
    const customColor = getCustomColor('h2', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);

  // Classes typographiques pour h3 (sans la couleur pour la gérer via style)
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

  // Couleur pour h3 : hex personnalisée ou var(--foreground) pour s'adapter aux palettes
  const h3Color = useMemo(() => {
    const customColor = getCustomColor('h3', typoConfig);
    if (customColor) return customColor;
    return 'var(--foreground)';
  }, [typoConfig]);

  // Classes typographiques pour le kicker/subtitle
  const kickerClasses = useMemo(() => {
    const safeTypoConfig = typoConfig?.kicker ? { kicker: typoConfig.kicker } : {};
    const classes = getTypographyClasses('kicker', safeTypoConfig, defaultTypography.kicker);
    return classes
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)-\d+\b/g, '')
      .replace(/\btext-(gray|black|white|red|blue|green|yellow|purple|pink|indigo|orange)\b/g, '')
      .replace(/\btext-foreground\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [typoConfig]);

  // Couleur pour le kicker : hex personnalisée ou var(--muted-foreground) pour s'adapter aux palettes
  const kickerColor = useMemo(() => {
    const customColor = getCustomColor('kicker', typoConfig);
    if (customColor) return customColor;
    return 'var(--muted-foreground)';
  }, [typoConfig]);

  useEffect(() => {
    if (!previewRef.current || !listRef.current || items.length === 0) return;
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(CustomEase);
    try {
      CustomEase.create(
        'hop',
        'M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1'
      );
    } catch (e) {
      // ignore duplicate ease creation
    }

    const clientsPreview = previewRef.current;
    const clientNames = Array.from(listRef.current.querySelectorAll<HTMLElement>('[data-client-item]'));

    let activeClientIndex = -1;

    const cleanups: Array<() => void> = [];

    clientNames.forEach((client, index) => {
      let activeClientImgWrapper: HTMLDivElement | null = null;
      let activeClientImg: HTMLImageElement | null = null;

      const handleMouseOver = () => {
        if (activeClientIndex === index) return;

        if (activeClientIndex !== -1) {
          const previousClient = clientNames[activeClientIndex];
          const mouseoutEvent = new Event('mouseout');
          previousClient.dispatchEvent(mouseoutEvent);
        }

        activeClientIndex = index;
        const item = items[index];
        if (!item?.image?.src) return;

        const clientImgWrapper = document.createElement('div');
        clientImgWrapper.className = 'hover-client-img-wrapper';
        
        // S'assurer que le wrapper est bien positionné et invisible au départ
        clientImgWrapper.style.position = 'absolute';
        clientImgWrapper.style.top = '0';
        clientImgWrapper.style.left = '0';
        clientImgWrapper.style.width = '100%';
        clientImgWrapper.style.height = '100%';
        clientImgWrapper.style.clipPath = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)';
        clientImgWrapper.style.overflow = 'hidden';

        const clientImg = document.createElement('img');
        clientImg.src = item.image.src || '';
        clientImg.alt = item.image.alt || item.name || 'Client';
        
        // S'assurer que l'image est bien positionnée et invisible au départ
        clientImg.style.position = 'absolute';
        clientImg.style.top = '0';
        clientImg.style.left = '0';
        clientImg.style.width = '100%';
        clientImg.style.height = '100%';
        clientImg.style.objectFit = 'cover';
        clientImg.style.opacity = '0';
        clientImg.style.transform = 'scale(1.25)';
        clientImg.style.transformOrigin = 'center center';

        clientImgWrapper.appendChild(clientImg);
        clientsPreview.appendChild(clientImgWrapper);
        
        // Maintenant on peut utiliser GSAP pour les animations
        gsap.set(clientImgWrapper, {
          clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        });
        gsap.set(clientImg, { 
          scale: 1.25, 
          opacity: 0,
        });

        activeClientImgWrapper = clientImgWrapper;
        activeClientImg = clientImg;

        gsap.to(clientImgWrapper, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 0.5,
          ease: 'hop',
        });

        gsap.to(clientImg, {
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
        });

        gsap.to(clientImg, {
          scale: 1,
          duration: 1.25,
          ease: 'hop',
        });
      };

      const handleMouseOut = (event: Event) => {
        const mouseEvent = event as MouseEvent;
        if (mouseEvent.relatedTarget && client.contains(mouseEvent.relatedTarget as Node)) {
          return;
        }

        if (activeClientIndex === index) {
          activeClientIndex = -1;
        }

        if (activeClientImg && activeClientImgWrapper) {
          const clientImgToRemove = activeClientImg;
          const clientImgWrapperToRemove = activeClientImgWrapper;

          activeClientImg = null;
          activeClientImgWrapper = null;

          gsap.to(clientImgToRemove, {
            opacity: 0,
            duration: 0.5,
            ease: 'power1.out',
            onComplete: () => {
              clientImgWrapperToRemove.remove();
            },
          });
        }
      };

      client.addEventListener('mouseover', handleMouseOver);
      client.addEventListener('mouseout', handleMouseOut);

      cleanups.push(() => {
        client.removeEventListener('mouseover', handleMouseOver);
        client.removeEventListener('mouseout', handleMouseOut);
        if (activeClientImg) {
          gsap.killTweensOf(activeClientImg);
        }
        if (activeClientImgWrapper) {
          gsap.killTweensOf(activeClientImgWrapper);
          activeClientImgWrapper.remove();
        }
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      activeClientIndex = -1;
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="hover-clients-section"
      data-block-type="hover-clients"
      data-block-theme={theme}
      style={
        (() => {
          const styles: React.CSSProperties = {};
          if (backgroundColor) {
            styles.backgroundColor = backgroundColor;
          }
          if (textColor) {
            (styles as any)['--hc-text'] = textColor;
          }
          if (mutedColor) {
            (styles as any)['--hc-muted'] = mutedColor;
          }
          if (accentColor) {
            (styles as any)['--hc-accent'] = accentColor;
          }
          return Object.keys(styles).length > 0 ? styles : undefined;
        })()
      }
    >
      <div className="hover-clients-preview" ref={previewRef} aria-hidden />

      <div className="hover-clients-header">
        {subtitle && (
          <span 
            className={`hover-clients-kicker ${kickerClasses}`}
            style={{ color: mutedColor || kickerColor }}
          >
            {subtitle}
          </span>
        )}
        {title && (
          <h2 
            className={`hover-clients-title ${h2Classes}`}
            style={{ color: textColor || h2Color }}
          >
            {title}
          </h2>
        )}
      </div>

      <div className="hover-clients-list" ref={listRef}>
        {items.map((item, idx) => (
          <div
            key={item.id || `${item.name}-${idx}`}
            data-client-item
            className="hover-client-name"
            role="button"
            tabIndex={0}
          >
            <h3 
              className={h3Classes}
              style={{ color: textColor || h3Color }}
            >
              {item.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
