"use client";
import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface HeroSignatureProps {
  block: {
    subtitle?: string;
    title?: string;
    ctaText?: string;
    image?: {
      src?: string;
      alt?: string;
    };
  };
}

const HeroSignature: React.FC<HeroSignatureProps> = ({ block }) => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const splitTextRef = useRef<any>(null); // ← Stocker l'instance SplitText

  useGSAP(() => {
    if (!heroRef.current) {
      return () => {}; // Retourner une fonction vide pour satisfaire TypeScript
    }

    // Animation du titre avec SplitText
    if (titleRef.current) {
      const splitTitle = new SplitText(titleRef.current, {
        type: "chars, words",
        charsClass: "char"
      });

      // ⚠️ Stocker pour le cleanup
      splitTextRef.current = splitTitle;

      gsap.fromTo(splitTitle.chars, 
        { 
          y: 40, 
          rotate: -2, 
          opacity: 0 
        },
        { 
          y: 0, 
          rotate: 0, 
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: "back.out(1.7)"
        }
      );
    }

    // Animation de l'image au scroll
    if (imageRef.current) {
      const tween = gsap.to(imageRef.current, {
        y: -80,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });

      // Stocker la référence au ScrollTrigger créé
      if (tween.scrollTrigger) {
        triggersRef.current.push(tween.scrollTrigger);
      }
    }

    setIsLoaded(true);

    // Fonction de nettoyage
    return () => {
      // 0. ⚠️ CRITIQUE : Nettoyer SplitText EN PREMIER (restaure le DOM)
      if (splitTextRef.current) {
        try {
          splitTextRef.current.revert();
          splitTextRef.current = null;
        } catch (e) {
          // Ignorer
        }
      }
      
      // 1. Nettoyer tous les ScrollTriggers créés par ce composant
      triggersRef.current.forEach(trigger => {
        try {
          trigger.kill(true);
        } catch (e) {
          // Ignorer les erreurs
        }
      });
      triggersRef.current = [];
    };
  }, { 
    scope: heroRef,
    revertOnUpdate: true // Restaure le DOM avant démontage
  });

  // Curseur custom
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'fixed pointer-events-none z-[999] w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference';
    document.body.appendChild(cursor);

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor);
      }
    };
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-[rgb(8,8,10)] text-white">
      {/* Noise overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2"/></filter><rect width="120" height="120" filter="url(%23n)" opacity="1"/></svg>')`,
          backgroundRepeat: 'repeat'
        }}
        aria-hidden
      />

      <div className="container mx-auto px-5 py-24 md:py-36 max-w-6xl">
        {/* Subtitle */}
        <p className="text-sm text-white/60 mb-4">
          {block.subtitle || "Creative Dev — Paris / Remote"}
        </p>

        {/* Main title */}
        <h1 
          ref={titleRef}
          className="text-[clamp(42px,8vw,120px)] leading-[0.92] font-semibold tracking-tight mb-6"
        >
          {block.title || "WE MAKE\nMOTION FEEL\nLIKE DESIGN."}
        </h1>

        {/* Description */}
        <p className="max-w-[60ch] text-[15px] md:text-base text-white/70 mb-10">
          Interfaces rapides, typographies vivantes, transitions nettes. L'esthétique sert l'usage, jamais l'inverse.
        </p>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <button className="relative inline-flex items-center justify-center px-6 py-3 bg-[rgb(0,178,255)] text-black text-sm font-medium hover:bg-[rgb(0,158,235)] transition-colors">
            {block.ctaText || "Voir les projets"}
          </button>
          <a href="#work" className="text-sm underline underline-offset-4 text-white/80 hover:text-white">
            ou scroller
          </a>
        </div>
      </div>

      {/* Hero image with scroll effect */}
      <div className="container mx-auto px-5 max-w-6xl">
        <div 
          ref={imageRef}
          className="mt-16 border border-white/10 overflow-hidden"
        >
          <Image 
            src={block.image?.src || "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=2400&auto=format&fit=crop"}
            alt={block.image?.alt || "Hero visual"}
            width={2400}
            height={1600}
            className="w-full h-full object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSignature;
