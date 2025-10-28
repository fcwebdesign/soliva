"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import CustomEase from 'gsap/CustomEase';

// Enregistrer les plugins GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, SplitText);
}

interface RevealAnimationProps {
  config: {
    duration: number;
    images: string[];
    text: {
      title: string;
      subtitle: string;
      author: string;
    };
    colors: {
      background: string;
      text: string;
      progress: string;
    };
    easing: string;
  };
  onComplete: () => void;
}

export default function RevealAnimation({ config, onComplete }: RevealAnimationProps) {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    // Créer l'easing personnalisé
    CustomEase.create("hop", "0.9, 0, 0.1, 1");

    // Fonction pour créer les splits de texte
    const createSplit = (selector: string, type: "lines" | "words" | "chars", className: string) => {
      return SplitText.create(selector, {
        type: type,
        [type + "Class"]: className,
        mask: type,
      });
    };

    // Créer les splits
    const splitPreloaderHeader = createSplit(".preloader-header a", "chars", "char");
    const splitPreloaderCopy = createSplit(".preloader-copy p", "lines", "line");
    const splitHeader = createSplit(".header-row h1", "lines", "line");

    const chars = splitPreloaderHeader.chars;
    const lines = splitPreloaderCopy.lines;
    const headerLines = splitHeader.lines;
    const initialChar = chars[0];
    const lastChar = chars[chars.length - 1];

    // Config initiale identique à la démo CodeGrid
    chars.forEach((char: any, index: number) => {
      gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 100 });
    });
    gsap.set(lines, { yPercent: 100 });
    gsap.set(headerLines, { yPercent: 100 });

    const preloaderImages = gsap.utils.toArray(".preloader-images .img");
    const preloaderImagesInner = gsap.utils.toArray(".preloader-images .img img");

    // Debug (optionnel)
    // console.log('🎬 Debug animation:', { chars: chars.length, lines: lines.length, preloaderImages: preloaderImages.length });

    // Timeline principale
    const tl = gsap.timeline({ delay: 0.25 });

    // Barre de progression
    tl.to(".progress-bar", {
      scaleX: 1,
      duration: config.duration / 1000,
      ease: "power3.inOut",
    })
    .set(".progress-bar", { transformOrigin: "right" })
    .to(".progress-bar", {
      scaleX: 0,
      duration: 1,
      ease: "power3.in",
    });

    // Animation des images (cartes qui se chevauchent)
    preloaderImages.forEach((preloaderImg: any, index: number) => {
      tl.to(
        preloaderImg,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "hop",
          delay: index * 0.75,
        },
        "-=5"
      );
    });

    preloaderImagesInner.forEach((preloaderImageInner: any, index: number) => {
      tl.to(
        preloaderImageInner,
        {
          scale: 1,
          duration: 1.5,
          ease: "hop",
          delay: index * 0.75,
        },
        "-=5.25"
      );
    });

    // Animation du texte (comme la démo CodeGrid)
    tl.to(
      lines,
      {
        yPercent: 0,
        duration: 2,
        ease: "hop",
        stagger: 0.1,
      },
      "-=5.5"
    );

    tl.to(
      chars,
      {
        yPercent: 0,
        duration: 1,
        ease: "hop",
        stagger: 0.025,
      },
      "-=5"
    );

    // Transition finale
    tl.to(
      ".preloader-images",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "hop",
      },
      "-=1.5"
    );

    tl.to(
      lines,
      {
        y: "-125%",
        duration: 2,
        ease: "hop",
        stagger: 0.1,
      },
      "-=2"
    );

    tl.to(
      chars,
      {
        yPercent: (index: number) => {
          if (index === 0 || index === chars.length - 1) {
            return 0;
          }
          return index % 2 === 0 ? 100 : -100;
        },
        duration: 1,
        ease: "hop",
        stagger: 0.025,
        delay: 0.5,
        onStart: () => {
          const initialCharMask = initialChar.parentElement;
          const lastCharMask = lastChar.parentElement;

          if (initialCharMask && initialCharMask.classList.contains("char-mask")) {
            initialCharMask.style.overflow = "visible";
          }

          if (lastCharMask && lastCharMask.classList.contains("char-mask")) {
            lastCharMask.style.overflow = "visible";
          }

          const viewportWidth = window.innerWidth;
          const centerX = viewportWidth / 2;
          const initialCharRect = initialChar.getBoundingClientRect();
          const lastCharRect = lastChar.getBoundingClientRect();

          gsap.to([initialChar, lastChar], {
            duration: 1,
            ease: "hop",
            delay: 0.5,
            x: (i: number) => {
              if (i === 0) {
                return centerX - initialCharRect.left - initialCharRect.width;
              } else {
                return centerX - lastCharRect.left;
              }
            },
            onComplete: () => {
              gsap.set(".preloader-header", { mixBlendMode: "difference" });
              gsap.to(".preloader-header", {
                y: "2rem",
                scale: 0.35,
                duration: 1.75,
                ease: "hop",
              });
            },
          });
        },
      },
      "-=2.5"
    );

    // Fermeture du preloader
    tl.to(
      ".preloader",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.75,
        ease: "hop",
      },
      "-=0.5"
    );

    // Animation du contenu principal (titre + divider)
    tl.to(
      headerLines,
      {
        yPercent: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.08,
      },
      '>-0.25'
    );

    tl.to(
      '.divider',
      {
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out'
      },
      '<'
    );

    // Appeler onComplete à la fin
    tl.call(onComplete);

    return () => {
      // Cleanup
      tl.kill();
    };
  }, [config, onComplete]);

  return (
    <div className="preloader" ref={preloaderRef} style={{ backgroundColor: config.colors.background }}>
      <div 
        className="progress-bar" 
        ref={progressBarRef}
        style={{ backgroundColor: config.colors.progress }}
      />

      <div className="preloader-images" ref={imagesRef}>
        {config.images.map((image, index) => (
          <div key={index} className="img">
            <img src={image} alt="" />
          </div>
        ))}
      </div>

      <div className="preloader-copy" ref={textRef}>
        <p style={{ color: config.colors.text }}>
          {config.text.subtitle}
        </p>
      </div>

      <div className="preloader-header" ref={headerRef}>
        <a href="#" style={{ color: config.colors.text }}>
          {config.text.author}
        </a>
      </div>

      {/* Hero header visible dès le départ (masqué par yPercent, révélé par l'anim) */}
      <section className="hero">
        <div className="header-row">
          <h1 style={{ color: config.colors.text }}>{config.text.title}</h1>
        </div>
        <div className="divider" />
      </section>
    </div>
  );
}
