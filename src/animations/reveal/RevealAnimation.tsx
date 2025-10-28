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
    const splitPreloaderHeader = createSplit(".reveal-preloader-header a", "chars", "char");
    const splitPreloaderCopy = createSplit(".reveal-preloader-copy p", "lines", "line");
    const splitHeader = createSplit(".reveal-header-row h1", "lines", "line");

    const chars = splitPreloaderHeader.chars;
    const lines = splitPreloaderCopy.lines;
    const headerLines = splitHeader.lines;
    const initialChar = chars[0];
    const lastChar = chars[chars.length - 1];

    // Configuration initiale
    chars.forEach((char: any, index: number) => {
      gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 100 });
    });

    gsap.set(lines, { yPercent: 100 });
    gsap.set(headerLines, { yPercent: 100 });

    const preloaderImages = gsap.utils.toArray(".reveal-preloader-images .img");
    const preloaderImagesInner = gsap.utils.toArray(".reveal-preloader-images .img img");

    // Timeline principale
    const tl = gsap.timeline({ delay: 0.25 });

    // Barre de progression
    tl.to(".reveal-progress-bar", {
      scaleX: 1,
      duration: config.duration / 1000,
      ease: "power3.inOut",
    })
    .set(".reveal-progress-bar", { transformOrigin: "right" })
    .to(".reveal-progress-bar", {
      scaleX: 0,
      duration: 1,
      ease: "power3.in",
    });

    // Animation des images
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

    // Animation du texte
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
      ".reveal-preloader-images",
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
      ".reveal-preloader",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.75,
        ease: "hop",
      },
      "-=0.5"
    );

    // Animation du contenu principal
    tl.to(
      ".reveal-header-row .line",
      {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      },
      "-=0.75"
    );

    tl.to(
      ".reveal-divider",
      {
        scaleX: 1,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      },
      "<"
    );

    // Appeler onComplete à la fin
    tl.call(onComplete);

    return () => {
      // Cleanup
      tl.kill();
    };
  }, [config, onComplete]);

  return (
    <div className="reveal-preloader" ref={preloaderRef} style={{ backgroundColor: config.colors.background }}>
      <div 
        className="reveal-progress-bar" 
        ref={progressBarRef}
        style={{ backgroundColor: config.colors.progress }}
      />

      <div className="reveal-preloader-images" ref={imagesRef}>
        {config.images.map((image, index) => (
          <div key={index} className="img">
            <img src={image} alt="" />
          </div>
        ))}
      </div>

      <div className="reveal-preloader-copy" ref={textRef}>
        <p style={{ color: config.colors.text }}>
          {config.text.subtitle}
        </p>
      </div>

      <div className="reveal-preloader-header" ref={headerRef}>
        <a href="#" style={{ color: config.colors.text }}>
          {config.text.author}
        </a>
      </div>
    </div>
  );
}
