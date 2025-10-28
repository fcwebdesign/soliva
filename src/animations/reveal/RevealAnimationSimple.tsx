"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    const tl = gsap.timeline();

    // Animation simple : fade in du contenu puis fade out
    tl.fromTo(containerRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    )
    .to(containerRef.current, 
      { opacity: 0, duration: 0.5 },
      `+=${config.duration / 1000 - 1}`
    )
    .call(onComplete);

    return () => {
      tl.kill();
    };
  }, [config, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      {/* Barre de progression */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-out"
          style={{ 
            backgroundColor: config.colors.progress,
            width: '0%',
            animation: 'progress 4s linear forwards'
          }}
        />
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {config.images.map((image, index) => (
          <div key={index} className="w-32 h-32 overflow-hidden rounded-lg">
            <img 
              src={image} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Texte */}
      <div className="text-center">
        <h1 
          className="text-6xl font-bold mb-4"
          style={{ color: config.colors.text }}
        >
          {config.text.title}
        </h1>
        <p 
          className="text-xl mb-8"
          style={{ color: config.colors.text }}
        >
          {config.text.subtitle}
        </p>
        <p 
          className="text-sm uppercase tracking-wider"
          style={{ color: config.colors.text }}
        >
          {config.text.author}
        </p>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
