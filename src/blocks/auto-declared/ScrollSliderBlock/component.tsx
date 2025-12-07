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
  const debugId = (data as any).id || (blockData as any).id;

  const slides = useMemo(() => {
    const source = Array.isArray(blockData?.slides) && blockData.slides.length > 0 ? blockData.slides : FALLBACK_SLIDES;
    return source
      .map((item, idx) => {
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

  const previewIndex = typeof blockData?.previewIndex === 'number'
    ? Math.max(0, Math.min(slides.length - 1, blockData.previewIndex))
    : 0;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[ScrollSliderBlock] previewIndex applied', { previewIndex, slides: slides.length, blockData });
  }

  useLayoutEffect(() => {
    if (!sliderRef.current || !imagesRef.current || !titleRef.current || !indicesRef.current || !progressRef.current) {
      return () => {};
    }
    const sliderEl = sliderRef.current;
    const imagesEl = imagesRef.current;
    const titleEl = titleRef.current;
    const indicesEl = indicesRef.current;
    const progressEl = progressRef.current;

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
      let activeSlide = Math.max(0, previewIndex);
      let currentSplit: any = null;
      let initialized = false;

      const renderIndicators = () => {
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
      animateSlide(Math.max(0, previewIndex));

      gsap.set(progressEl, { scaleY: 0 });

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
        onUpdate: (self) => {
          // Ignorer le premier onUpdate déclenché lors de l'init pour ne pas sauter de slide
          if (!initialized) {
            initialized = true;
            return;
          }

          gsap.set(progressEl, { scaleY: self.progress });
          const current = Math.min(slides.length - 1, Math.floor(self.progress * slides.length));
          if (current !== activeSlide && current < slides.length) {
            activeSlide = current;
            animateSlide(activeSlide);
          }
        },
      });

      // Positionner la preview directement sur le slide sélectionné en admin
      if (slides.length > 0) {
        const targetProgress = slides.length > 1 ? previewIndex / slides.length : 0;
        try {
          trigger.progress(targetProgress, false);
          activeSlide = previewIndex;
          animateSlide(activeSlide);
        } catch (e) {
          // ignorer
        }
      }

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
    };
  }, [slides, previewIndex]);

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
        <div ref={imagesRef} className="scroll-slider__images" aria-hidden="true" />

        <div ref={titleRef} className="scroll-slider__title" />

        <div className="scroll-slider__indicator">
          <div ref={indicesRef} className="scroll-slider__indices" aria-hidden="true" />
          <div className="scroll-slider__progress-bar" aria-hidden="true">
            <div ref={progressRef} className="scroll-slider__progress" />
          </div>
        </div>
      </div>
    </section>
  );
}
