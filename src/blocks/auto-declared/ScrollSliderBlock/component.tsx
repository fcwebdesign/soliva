'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import './styles.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

type SlideInput =
  | string
  | {
      id?: string;
      title?: string;
      image?: { src?: string; alt?: string; aspectRatio?: string };
      src?: string;
      alt?: string;
    };

interface ScrollSliderData {
  slides?: SlideInput[];
  previewIndex?: number; // index sélectionné dans l'admin pour la prévisualisation
  showIndicators?: boolean;
  showProgressBar?: boolean;
  showText?: boolean;
   showOverlay?: boolean;
}

export const FALLBACK_SLIDES: SlideInput[] = [
  {
    title:
      'Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.',
    src: '/blocks/scroll-slider/slider_img_1.jpg',
  },
  {
    title: 'A car slices through the desert, shadow chasing the wind as clouds of dust rise behind, blurring the horizon into gold and thunder.',
    src: '/blocks/scroll-slider/slider_img_2.jpg',
  },
  {
    title: 'Reflections ripple across mirrored faces, each one a fragment of identity, caught between defiance, doubt, and the silence of thought.',
    src: '/blocks/scroll-slider/slider_img_3.jpg',
  },
  {
    title: 'Soft light spills through the café windows as morning settles into wood and metal, capturing the rhythm of quiet human routine.',
    src: '/blocks/scroll-slider/slider_img_4.jpg',
  },
  {
    title: 'Every serve becomes a battle between focus and instinct, movement flowing like rhythm as the court blurs beneath the sunlight.',
    src: '/blocks/scroll-slider/slider_img_5.jpg',
  },
  {
    title: 'Amber light spills over the stage as guitars cry into smoke and shadow, where music and motion merge into pure energy.',
    src: '/blocks/scroll-slider/slider_img_6.jpg',
  },
  {
    title: 'Dust erupts beneath his stride as sweat glints under floodlights, every step pushing closer to victory, grit, and pure determination.',
    src: '/blocks/scroll-slider/slider_img_7.jpg',
  },
];

export default function ScrollSliderBlock({ data }: { data: ScrollSliderData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const sliderRef = useRef<HTMLElement | null>(null);
  const imagesRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const indicesRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const desiredIndexRef = useRef<number>(0);
  const debugId = (data as any).id || (blockData as any).id;
  const initializedRef = useRef<boolean>(false);

  const slides = useMemo(() => {
    // Minimum 1 slide : fallback si liste absente ou vide
    const source =
      Array.isArray(blockData?.slides) && blockData.slides.length > 0 ? blockData.slides : [FALLBACK_SLIDES[0]];
    return source
      .map((item, idx) => {
        // Respecter le flag hidden pour l'oeil dans l'éditeur
        if ((item as any)?.hidden) return null;
        if (typeof item === 'string') {
          return {
            id: `slide-${idx}`,
            title: `Slide ${idx + 1}`,
            src: item,
            alt: `Slide ${idx + 1}`,
          };
        }
        const src = item?.image?.src || item?.src || '';
        if (!src) return null;
        return {
          id: item?.id || `slide-${idx}`,
          title: item?.title || `Slide ${idx + 1}`,
          src,
          alt: item?.alt || item?.image?.alt || item?.title || `Slide ${idx + 1}`,
        };
      })
      .filter(Boolean) as { id?: string; title: string; src: string; alt?: string }[];
  }, [blockData?.slides]);

  // Déterminer si on est en mode admin/preview
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const hasPreviewParams = typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).has('preview') ||
     window.location.pathname.includes('/admin/preview'));

  // Mode admin uniquement pour l'iframe ou /admin/preview
  const isAdminMode = isInIframe || hasPreviewParams;

  // En admin, utiliser previewIndex pour montrer le slide sélectionné
  // En front, toujours commencer par le slide 0
  const startIndex = isAdminMode && typeof blockData?.previewIndex === 'number'
    ? Math.max(0, Math.min(slides.length - 1, blockData.previewIndex))
    : 0;

  const showIndicators = blockData?.showIndicators !== false;
  const showProgressBar = blockData?.showProgressBar !== false;
  const showText = blockData?.showText !== false;
  // showOverlay doit être true si l'utilisateur a coché "Fond sombre"
  // On priorise la valeur portée par data (admin) puis data.data, sinon fallback true
  const rawShowOverlay = (data as any)?.showOverlay ?? (data as any)?.data?.showOverlay ?? blockData?.showOverlay;
  const showOverlay = rawShowOverlay !== false &&
                     rawShowOverlay !== 'false' &&
                     rawShowOverlay !== 0 &&
                     rawShowOverlay !== '0';
  desiredIndexRef.current = startIndex;
  const hideOverlay = showOverlay === false;

  useLayoutEffect(() => {
    // Protection contre les multiples initialisations
    if (initializedRef.current) {
      return () => {};
    }
    if (
      !sliderRef.current ||
      !imagesRef.current ||
      (showText && !titleRef.current) ||
      (showIndicators && !indicesRef.current) ||
      (showProgressBar && !progressRef.current)
    ) {
      return () => {};
    }
    const sliderEl = sliderRef.current;
    const imagesEl = imagesRef.current;
    const titleEl = showText ? titleRef.current : null;
    const indicesEl = showIndicators ? indicesRef.current : null;
    const progressEl = showProgressBar ? progressRef.current : null;

      // Nettoyage d'un éventuel ancien pin (pin-spacer + triggers)
    try {
      const parent = sliderEl.parentElement;
      if (parent?.classList.contains('pin-spacer')) {
        parent.parentElement?.insertBefore(sliderEl, parent);
        parent.parentElement?.removeChild(parent);
      }
      ScrollTrigger.getAll().forEach((trigger) => {
        const target = (trigger as any).vars?.trigger || (trigger as any).trigger;
        if (target === sliderEl || (target instanceof Element && target.contains(sliderEl))) {
          trigger.kill(true);
        }
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [ScrollSliderBlock] Erreur cleanup pré-pin:', e);
      }
    }

    const ctx = gsap.context(() => {
      let activeSlide = Math.max(0, startIndex);
      desiredIndexRef.current = activeSlide;
      let currentSplit: any = null;
      let initialized = false;
      let triggerRef: ScrollTrigger | null = null;

      const renderIndicators = () => {
        if (!indicesEl) return;
        indicesEl.innerHTML = '';
        slides.forEach((_, index) => {
          const indexNum = (index + 1).toString().padStart(2, '0');
          const p = document.createElement('p');
          p.dataset.index = index.toString();
          p.className = 'scroll-slider__indicator-line';

          const marker = document.createElement('span');
          marker.className = 'scroll-slider__marker';

          const indexEl = document.createElement('span');
          indexEl.className = 'scroll-slider__index';
          indexEl.textContent = indexNum;

          p.appendChild(marker);
          p.appendChild(indexEl);
          indicesEl.appendChild(p);

          // Styles init
          if (index === 0) {
            gsap.set(indexEl, { opacity: 1 });
            gsap.set(marker, { scaleX: 1 });
          } else {
            gsap.set(indexEl, { opacity: 0.35 });
            gsap.set(marker, { scaleX: 0 });
          }
        });
      };

      const animateIndicators = (index: number) => {
        if (!indicesEl) return;
        const indicators = indicesEl.querySelectorAll('p');
        indicators.forEach((indicator, i) => {
          const marker = indicator.querySelector('.scroll-slider__marker');
          const idx = indicator.querySelector('.scroll-slider__index');

          if (i === index) {
            gsap.to(idx, { opacity: 1, duration: 0.3, ease: 'power2.out' });
            gsap.to(marker, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
          } else {
            gsap.to(idx, { opacity: 0.5, duration: 0.3, ease: 'power2.out' });
            gsap.to(marker, { scaleX: 0, duration: 0.3, ease: 'power2.out' });
          }
        });
      };

      const animateTitle = (index: number) => {
        if (!showText || !titleEl) return;

        currentSplit?.revert();
        titleEl.innerHTML = '';
        const heading = document.createElement('h2');
        heading.textContent = slides[index]?.title || '';
        titleEl.appendChild(heading);

        currentSplit = new SplitText(heading, {
          type: 'lines',
          linesClass: 'scroll-slider__line',
          mask: 'lines',
        });

        gsap.set(currentSplit.lines, { yPercent: 100, opacity: 0 });
        gsap.to(currentSplit.lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power3.out',
        });
      };

      const animateSlide = (index: number) => {
        const slide = slides[index];
        if (!slide) return;

        const img = document.createElement('img');
        img.src = slide.src;
        img.alt = slide.alt || slide.title;

        gsap.set(img, { opacity: 0, scale: 1.08 });
        imagesEl.appendChild(img);

        gsap.to(img, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        gsap.to(img, { scale: 1, duration: 1, ease: 'power2.out' });

        const allImages = imagesEl.querySelectorAll('img');
        if (allImages.length > 3) {
          const removeCount = allImages.length - 3;
          for (let i = 0; i < removeCount; i++) {
            imagesEl.removeChild(allImages[i]);
          }
        }

        animateTitle(index);
        animateIndicators(index);
      };

      renderIndicators();

      // Nettoyer les images existantes avant d'animer le slide initial
      const existingImages = imagesEl.querySelectorAll('img');
      existingImages.forEach(img => imagesEl.removeChild(img));

      animateSlide(Math.max(0, startIndex));

      if (progressEl) {
        gsap.set(progressEl, { scaleY: 0 });
      }

      const setProgressToIndex = (index: number) => {
        if (!triggerRef) return;
        const segments = Math.max(1, slides.length - 1);
        const targetProgress = slides.length > 1 ? index / segments : 0;
        try {
          // Ne pas forcer le progress si on est déjà sur la bonne slide
          if (activeSlide !== index) {
            triggerRef.progress(targetProgress, false);
            activeSlide = index;
            desiredIndexRef.current = index;
            if (progressEl) {
              gsap.set(progressEl, { scaleY: triggerRef.progress() });
            }
            animateSlide(index);
          }
        } catch (e) {
          // silent
        }
      };


      const trigger = ScrollTrigger.create({
        trigger: sliderEl,
        start: 'top top',
        end: () => `+=${Math.max(1, slides.length) * window.innerHeight}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 0.5,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onStart: () => {
          // Nettoyer puis forcer le slide initial
          const existingImages = imagesEl.querySelectorAll('img');
          existingImages.forEach(img => imagesEl.removeChild(img));
          activeSlide = startIndex;
          animateSlide(startIndex);
          if (progressEl) gsap.set(progressEl, { scaleY: 0 });
        },
        onUpdate: (self) => {
          if (!initialized) {
            initialized = true;
            return;
          }

          if (progressEl) {
            gsap.set(progressEl, { scaleY: self.progress });
          }
          const current = Math.min(slides.length - 1, Math.floor(self.progress * slides.length));
          if (current !== activeSlide && current < slides.length) {
            activeSlide = current;
            desiredIndexRef.current = current;
            animateSlide(activeSlide);
          }
        },
        onRefresh: () => {
          setProgressToIndex(desiredIndexRef.current);
        },
      });
      triggerRef = trigger;


      // Marquer comme initialisé
      initializedRef.current = true;

      // Pour la preview, on anime directement la slide souhaitée sans forcer le ScrollTrigger
      // Cela évite les conflits lors du premier scroll de l'utilisateur

      return () => {
        trigger.kill();
        currentSplit?.revert();
      };
    }, sliderEl);

    const refreshTimeout = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [ScrollSliderBlock] Erreur refresh ScrollTrigger:', e);
        }
      }
    }, 120);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
      // Reset le flag lors du cleanup
      initializedRef.current = false;
    };
  }, [slides.length, startIndex, showIndicators, showProgressBar, showText]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      data-block-type="scroll-slider"
      data-block-theme="dark"
      {...(debugId ? { 'data-block-id': debugId } : {})}
      className="scroll-slider-block"
      style={{ marginTop: 'var(--section)' }}
    >
      <div ref={sliderRef} className="scroll-slider__pin">
        <div
          ref={imagesRef}
          className={`scroll-slider__images${hideOverlay ? ' no-overlay' : ''}`}
          aria-hidden="true"
        />

        {showText && <div ref={titleRef} className="scroll-slider__title" />}

        {(showIndicators || showProgressBar) && (
          <div className="scroll-slider__indicator">
            {showIndicators && <div ref={indicesRef} className="scroll-slider__indices" aria-hidden="true" />}
            {showProgressBar && (
              <div className="scroll-slider__progress-bar" aria-hidden="true">
                <div ref={progressRef} className="scroll-slider__progress" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
