"use client";
import { useTemplate } from "@/templates/context";
import { getTransitionConfig, TransitionType, DEFAULT_TRANSITION_CONFIG } from "./transition-config";
import { useEffect, useState } from "react";

export default function ThemeTransitions() {
  const { key } = useTemplate();
  const [contentConfig, setContentConfig] = useState<any>(null);
  
  // Charger la configuration depuis le contenu
  useEffect(() => {
    // Sur l'admin (key = 'soliva'), ne pas déclencher de polling réseau inutile
    if (key === 'soliva') {
      return;
    }
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('🎨 Configuration transitions chargée:', data._transitionConfig);
          setContentConfig(data);
        }
      } catch (error) {
        console.error('Erreur chargement configuration transitions:', error);
      }
    };
    
    fetchContent();
    
    // Recharger périodiquement pour détecter les changements
    const interval = setInterval(fetchContent, 2000);
    
    return () => clearInterval(interval);
  }, [key]);

  // Utiliser la config du contenu si disponible, sinon fallback sur la config statique
  const staticConfig = getTransitionConfig(key);
  const config = contentConfig?._transitionConfig || staticConfig;
  
  console.log('🎨 Transition config utilisée:', config);

  // Styles communs pour toutes les transitions
  const commonStyles = `
    html::view-transition-old(root),
    html::view-transition-new(root) {
      animation-duration: ${config.duration || 1500}ms;
      animation-timing-function: ${config.easing || 'cubic-bezier(0.87, 0, 0.13, 1)'};
    }
  `;

  // Définitions des différentes transitions
  const transitionStyles: Record<string, string> = {
    'slide-up': `
      html::view-transition-old(root) { animation-name: vt-slide-up-out; }
      html::view-transition-new(root) { animation-name: vt-slide-up-in; }

      @keyframes vt-slide-up-out { 
        from { 
          opacity: 1;
          transform: translateY(0);
        }
        to { 
          opacity: 0.2;
          transform: translateY(-35%);
        }
      }
      
      @keyframes vt-slide-up-in { 
        from { 
          clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
        }
        to { 
          clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%);
        }
      }
    `,
    
    'slide-down': `
      html::view-transition-old(root) { animation-name: vt-slide-down-out; }
      html::view-transition-new(root) { animation-name: vt-slide-down-in; }

      @keyframes vt-slide-down-out { 
        from { 
          opacity: 1;
          transform: translateY(0);
        }
        to { 
          opacity: 0.2;
          transform: translateY(35%);
        }
      }
      
      @keyframes vt-slide-down-in { 
        from { 
          clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
        }
        to { 
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
      }
    `,

    'slide-left': `
      html::view-transition-old(root) { animation-name: vt-slide-left-out; }
      html::view-transition-new(root) { animation-name: vt-slide-left-in; }

      @keyframes vt-slide-left-out {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0.2; transform: translateX(-35%); }
      }

      @keyframes vt-slide-left-in {
        from { transform: translateX(35%); }
        to   { transform: translateX(0); }
      }
    `,

    'slide-right': `
      html::view-transition-old(root) { animation-name: vt-slide-right-out; }
      html::view-transition-new(root) { animation-name: vt-slide-right-in; }

      @keyframes vt-slide-right-out {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0.2; transform: translateX(35%); }
      }

      @keyframes vt-slide-right-in {
        from { transform: translateX(-35%); }
        to   { transform: translateX(0); }
      }
    `,

    'fade': `
      html::view-transition-old(root) { animation-name: vt-fade-out; }
      html::view-transition-new(root) { animation-name: vt-fade-in; }

      @keyframes vt-fade-out { 
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes vt-fade-in { 
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,

    'fade-blur': `
      html::view-transition-old(root) { animation-name: vt-fade-blur-out; }
      html::view-transition-new(root) { animation-name: vt-fade-blur-in; }

      @keyframes vt-fade-blur-out {
        from { opacity: 1; filter: blur(0px); }
        to   { opacity: 0; filter: blur(8px); }
      }
      
      @keyframes vt-fade-blur-in {
        from { opacity: 0; filter: blur(8px); }
        to   { opacity: 1; filter: blur(0px); }
      }
    `,

    'zoom': `
      html::view-transition-old(root) { animation-name: vt-zoom-out; }
      html::view-transition-new(root) { animation-name: vt-zoom-in; }

      @keyframes vt-zoom-out { 
        from { 
          opacity: 1;
          transform: scale(1);
        }
        to { 
          opacity: 0;
          transform: scale(1.1);
        }
      }
      
      @keyframes vt-zoom-in { 
        from { 
          opacity: 0;
          transform: scale(0.9);
        }
        to { 
          opacity: 1;
          transform: scale(1);
        }
      }
    `,

    'zoom-out-in': `
      html::view-transition-old(root) { animation-name: vt-zoom2-out; }
      html::view-transition-new(root) { animation-name: vt-zoom2-in; }

      @keyframes vt-zoom2-out {
        from { opacity: 1; transform: scale(1); }
        to   { opacity: 0; transform: scale(1.08); }
      }
      
      @keyframes vt-zoom2-in {
        from { opacity: 0; transform: scale(0.92); }
        to   { opacity: 1; transform: scale(1); }
      }
    `,

    'flip': `
      html::view-transition-old(root) { animation-name: vt-flip-out; }
      html::view-transition-new(root) { animation-name: vt-flip-in; }

      @keyframes vt-flip-out { 
        from { 
          opacity: 1;
          transform: rotateY(0deg);
        }
        to { 
          opacity: 0;
          transform: rotateY(-90deg);
        }
      }
      
      @keyframes vt-flip-in { 
        from { 
          opacity: 0;
          transform: rotateY(90deg);
        }
        to { 
          opacity: 1;
          transform: rotateY(0deg);
        }
      }
    `,

    'rotate': `
      html::view-transition-old(root) { animation-name: vt-rotate-out; transform-origin: 50% 50%; }
      html::view-transition-new(root) { animation-name: vt-rotate-in; transform-origin: 50% 50%; }

      @keyframes vt-rotate-out {
        from { opacity: 1; transform: rotateZ(0deg) scale(1); }
        to   { opacity: 0; transform: rotateZ(-5deg) scale(1.02); }
      }
      @keyframes vt-rotate-in {
        from { opacity: 0; transform: rotateZ(5deg) scale(0.98); }
        to   { opacity: 1; transform: rotateZ(0deg) scale(1); }
      }
    `,

    'curtain': `
      html::view-transition-old(root) { animation-name: vt-curtain-out; }
      html::view-transition-new(root) { animation-name: vt-curtain-in; }

      @keyframes vt-curtain-out { 
        from { 
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        to { 
          clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
        }
      }
      
      @keyframes vt-curtain-in { 
        from { 
          clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
        }
        to { 
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
      }
    `
    ,

    'reveal-left': `
      html::view-transition-old(root) { animation-name: vt-reveal-left-out; }
      html::view-transition-new(root) { animation-name: vt-reveal-left-in; }

      @keyframes vt-reveal-left-out {
        from { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
        to   { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }
      }
      @keyframes vt-reveal-left-in {
        from { clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%); }
        to   { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
      }
    `,

    'reveal-right': `
      html::view-transition-old(root) { animation-name: vt-reveal-right-out; }
      html::view-transition-new(root) { animation-name: vt-reveal-right-in; }

      @keyframes vt-reveal-right-out {
        from { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
        to   { clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%); }
      }
      @keyframes vt-reveal-right-in {
        from { clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%); }
        to   { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
      }
    `,
  };

  return (
    <style jsx global>{`
      ${commonStyles}
      ${transitionStyles[config.type]}
      ${config.customStyles || ''}
    `}</style>
  );
}
