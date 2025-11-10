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
    logoImage?: string; // Logo en image depuis le backoffice
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

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    let raf = 0;
    let tl: gsap.core.Timeline | null = null;

    const init = () => {
      // Créer l'easing personnalisé
      CustomEase.create("hop", "0.9, 0, 0.1, 1");

      const createSplit = (selector: string, type: "lines" | "words" | "chars", className: string) => {
        return SplitText.create(selector, {
          type: type,
          [type + "Class"]: className,
          mask: type,
        });
      };

      // Vérifier si c'est une image ou du texte
      const isImage = !!config.logoImage;
      
      let lines: any[] = [];
      if (!isImage) {
        const splitPreloaderCopy = createSplit(".preloader-copy p", "lines", "line");
        lines = splitPreloaderCopy.lines;
      }

      // États initiaux - cacher le contenu au début pour éviter le flash
      gsap.set(".preloader-copy", {
        opacity: 0,
        visibility: "hidden",
      });
      
      if (!isImage && lines.length > 0) {
        gsap.set(lines, { yPercent: 100 });
      } else if (isImage) {
        // Masquer l'image plus bas pour mieux voir l'animation de révélation
        gsap.set(".preloader-copy img, .preloader-logo-image", { 
          yPercent: 150, // Partir de plus bas (150% au lieu de 100%)
          overflow: "hidden"
        });
      }

      const preloaderImages = gsap.utils.toArray(".preloader-images .img");
      const preloaderImagesInner = gsap.utils.toArray(".preloader-images .img img");

      tl = gsap.timeline({ delay: 0.25 });

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

      preloaderImages.forEach((preloaderImg: any, index: number) => {
        tl!.to(
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
        tl!.to(
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

      // D'abord rendre le contenu visible juste avant l'animation
      tl.set(".preloader-copy", {
        opacity: 1,
        visibility: "visible",
      }, "-=5.5");
      
      if (!isImage && lines.length > 0) {
        // Animation du texte ligne par ligne
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
      } else if (isImage) {
        // Animation de l'image (même style que le texte)
        tl.to(
          ".preloader-copy img, .preloader-logo-image",
          {
            yPercent: 0,
            duration: 2,
            ease: "hop",
          },
          "-=5.5"
        );
      }

      tl.to(
        ".preloader-images",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "hop",
        },
        "-=1.5"
      );

      // Faire disparaître le contenu
      if (!isImage && lines.length > 0) {
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
      } else if (isImage) {
        tl.to(
          ".preloader-copy img, .preloader-logo-image",
          {
            y: "-125%",
            duration: 2,
            ease: "hop",
          },
          "-=2"
        );
      }

      // Fermer le preloader et l'overlay (rideau)
      tl.to(
        [".preloader", document.getElementById("reveal-overlay")].filter(Boolean),
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.75,
          ease: "hop",
        },
        "-=0.5"
      );

      // S'assurer que le logo du header est visible à la fin
      tl.call(() => {
        const headerLogo = document.querySelector('.vt-brand') as HTMLElement;
        if (headerLogo) {
          gsap.set(headerLogo, {
            opacity: 1,
            visibility: "visible",
          });
        }
      }, null, "+=0.1");
      
      tl.call(onComplete);
    };

    raf = window.requestAnimationFrame(init);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (tl) tl.kill();
    };
  }, [config, onComplete]);

  return (
    <>
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
        {config.logoImage ? (
          <img 
            src={config.logoImage} 
            alt="Logo" 
            className="preloader-logo-image"
          />
        ) : (
          <p 
            className="text-xl font-bold tracking-tight"
            style={{ color: config.colors.text }}
          >
            {config.text.subtitle}
          </p>
        )}
      </div>
    </div>
    </>
  );
}
