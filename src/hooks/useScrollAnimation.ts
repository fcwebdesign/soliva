"use client";
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import type { ScrollAnimationType } from '@/app/admin/components/sections/ScrollAnimationsSection';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Désactiver les markers de debug de ScrollTrigger pour éviter les erreurs DOM
if (typeof window !== 'undefined') {
  ScrollTrigger.config({ markers: false });
}

export interface AnimationConfig {
  type: ScrollAnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  threshold?: number;
}

interface UseScrollAnimationOptions {
  config?: AnimationConfig;
  blockType?: string;
  enabled?: boolean;
  content?: any;
}

/**
 * Hook pour appliquer des animations de scroll GSAP aux éléments
 * Utilise la configuration depuis metadata.scrollAnimations
 */
export function useScrollAnimation(
  elementRef: React.RefObject<HTMLElement>,
  options: UseScrollAnimationOptions = {}
) {
  const { config, blockType, enabled = true, content } = options;
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useGSAP(() => {
    if (!enabled || !elementRef.current) return;

    // Récupérer la configuration depuis le contenu
    const scrollAnimations = content?.metadata?.scrollAnimations;
    
    // Debug en développement
    if (process.env.NODE_ENV === 'development') {
      if (!content) {
        console.log('🎬 [ScrollAnimation] Contenu non disponible');
        return;
      }
      if (!scrollAnimations) {
        console.log('🎬 [ScrollAnimation] scrollAnimations non trouvé dans metadata');
        return;
      }
      if (!scrollAnimations.enabled) {
        console.log('🎬 [ScrollAnimation] Animations désactivées');
        return;
      }
    }
    
    if (!scrollAnimations?.enabled) return;

    // Attendre que l'élément soit vraiment dans le DOM et visible
    // Utiliser requestAnimationFrame pour s'assurer que le layout est calculé
    const setupAnimation = () => {
      if (!isMountedRef.current || !elementRef.current) return;
      
      // Vérifier que l'élément est dans le DOM
      if (!document.body.contains(elementRef.current)) {
        // Réessayer après un court délai si l'élément n'est pas encore dans le DOM
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            setupAnimation();
          }
        }, 100);
        timeoutRefs.current.push(timeoutId);
        return;
      }
      
      // Continuer avec la création de l'animation...
      createScrollAnimation();
    };

    const createScrollAnimation = () => {
      // Vérifications multiples avant de créer l'animation
      if (!isMountedRef.current) return;
      if (!elementRef.current) return;
      
      const element = elementRef.current;
      
      // Vérifier que l'élément existe toujours dans le DOM
      if (!document.body || !document.body.contains(element)) {
        return;
      }
      
      // Vérifier que l'élément a une taille (n'est pas caché)
      if (element.offsetHeight === 0 && element.offsetWidth === 0) {
        // Réessayer après un court délai si l'élément n'a pas encore de taille
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current && elementRef.current === element && document.body.contains(element)) {
            createScrollAnimation();
          }
        }, 100);
        timeoutRefs.current.push(timeoutId);
        return;
      }

    // Déterminer quelle animation utiliser
    let animationConfig: AnimationConfig | null = null;

    if (config) {
      // Configuration explicite passée en paramètre
      animationConfig = config;
    } else if (blockType && scrollAnimations.blocks?.[blockType]) {
      // Configuration spécifique pour ce type de bloc
      animationConfig = scrollAnimations.blocks[blockType];
    } else if (scrollAnimations.global) {
      // Configuration globale par défaut
      animationConfig = scrollAnimations.global;
    }

    if (!animationConfig || animationConfig.type === 'none') return;

    const {
      type,
      duration = 1,
      delay = 0,
      stagger = 0,
      easing = 'power3.out',
      threshold = 0.2
    } = animationConfig;

    // Nettoyer les animations précédentes
    if (animationRef.current) {
      try {
        animationRef.current.kill();
      } catch (e) {
        // Ignorer
      }
      animationRef.current = null;
    }
    
    // Vérifier une dernière fois que l'élément existe toujours
    if (!isMountedRef.current || !elementRef.current || elementRef.current !== element) {
      return;
    }
    
    if (!document.body.contains(element)) {
      return;
    }
    
    // Calcul de la position de déclenchement
    // Utiliser "top" comme référence pour garantir que l'élément est visible
    // threshold = 0.0 → "top bottom" (dès l'entrée dans la vue - très tôt)
    // threshold = 0.2 → "top 80%" (quand le haut atteint 80% depuis le haut - tôt mais visible)
    // threshold = 0.5 → "top center" (quand le haut atteint le centre - milieu)
    // threshold = 1.0 → "top top" (quand le haut atteint le haut - tard)
    let startPosition: string;
    if (threshold === 0) {
      startPosition = 'top bottom'; // Dès que l'élément entre dans la vue
    } else {
      // Convertir le threshold en pourcentage depuis le haut
      // threshold 0.2 = 80% depuis le haut = "top 80%"
      const percentageFromTop = (1 - threshold) * 100;
      startPosition = `top ${percentageFromTop}%`;
    }

    // Fonction helper pour vérifier que l'élément existe avant d'animer
    const safeAnimate = (animationFn: () => void) => {
      if (!isMountedRef.current || !elementRef.current || elementRef.current !== element) {
        return;
      }
      if (!document.body || !document.body.contains(element)) {
        return;
      }
      try {
        animationFn();
      } catch (e) {
        // Ignorer les erreurs GSAP si l'élément n'existe plus
        if (process.env.NODE_ENV === 'development') {
          console.warn('🎬 [ScrollAnimation] Erreur animation GSAP:', e);
        }
      }
    };

    switch (type) {
      case 'fade-in':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0 },
            {
              opacity: 1,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'fade-in-up':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'fade-in-down':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, y: -60 },
            {
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'fade-in-left':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, x: -60 },
            {
              opacity: 1,
              x: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'fade-in-right':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, x: 60 },
            {
              opacity: 1,
              x: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'scale-in':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'scale-in-up':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, scale: 0.8, y: 60 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'rotate-in':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, rotation: -5, scale: 0.95 },
            {
              opacity: 1,
              rotation: 0,
              scale: 1,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'blur-in':
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, filter: 'blur(10px)' },
            {
              opacity: 1,
              filter: 'blur(0px)',
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'slide-up':
        safeAnimate(() => {
          gsap.fromTo(element,
            { y: 100 },
            {
              y: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'slide-down':
        safeAnimate(() => {
          gsap.fromTo(element,
            { y: -100 },
            {
              y: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'slide-left':
        safeAnimate(() => {
          gsap.fromTo(element,
            { x: 100 },
            {
              x: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'slide-right':
        safeAnimate(() => {
          gsap.fromTo(element,
            { x: -100 },
            {
              x: 0,
              duration,
              delay,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            }
          );
        });
        break;

      case 'split-text-up':
        // Pour les titres avec SplitText
        safeAnimate(() => {
          try {
            const split = SplitText.create(element, {
              type: 'lines, words',
              linesClass: 'line',
              wordsClass: 'word'
            });

            gsap.set(split.words, { y: '100%', opacity: 0 });
            
            gsap.to(split.words, {
              y: '0%',
              opacity: 1,
              duration,
              delay,
              stagger: stagger || 0.1,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            });
          } catch (e) {
            // Fallback sur fade-in-up si SplitText échoue
            gsap.fromTo(element,
              { opacity: 0, y: 60 },
              {
                opacity: 1,
                y: 0,
                duration,
                delay,
                ease: easing,
                scrollTrigger: {
                  trigger: element,
                  start: startPosition,
                  once: true
                }
              }
            );
          }
        });
        break;

      case 'split-text-down':
        safeAnimate(() => {
          try {
            const split = SplitText.create(element, {
              type: 'lines, words',
              linesClass: 'line',
              wordsClass: 'word'
            });

            gsap.set(split.words, { y: '-100%', opacity: 0 });
            
            gsap.to(split.words, {
              y: '0%',
              opacity: 1,
              duration,
              delay,
              stagger: stagger || 0.1,
              ease: easing,
              scrollTrigger: {
                trigger: element,
                start: startPosition,
                once: true
              }
            });
          } catch (e) {
            gsap.fromTo(element,
              { opacity: 0, y: -60 },
              {
                opacity: 1,
                y: 0,
                duration,
                delay,
                ease: easing,
                scrollTrigger: {
                  trigger: element,
                  start: startPosition,
                  once: true
                }
              }
            );
          }
        });
        break;

      case 'parallax':
        safeAnimate(() => {
          gsap.to(element, {
            y: -100,
            ease: easing || 'power1.out',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        });
        break;

      default:
        // Par défaut, fade-in-up
        safeAnimate(() => {
          gsap.fromTo(element,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: '80% bottom',
                once: true
              }
            }
          );
        });
    }

    // Refresh ScrollTrigger après un court délai pour s'assurer que tous les éléments sont dans le DOM
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current || !elementRef.current) return;
      try {
        ScrollTrigger.refresh();
      } catch (e) {
        // Ignorer les erreurs si ScrollTrigger n'est pas disponible
      }
    }, 200);
    timeoutRefs.current.push(timeoutId);
    };

    // Démarrer la création de l'animation
    rafRef.current = requestAnimationFrame(() => {
      if (isMountedRef.current) {
        setupAnimation();
      }
    });
  }, { scope: elementRef, dependencies: [config, blockType, enabled, content] });

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Nettoyer le requestAnimationFrame
      if (rafRef.current !== null) {
        try {
          cancelAnimationFrame(rafRef.current);
        } catch (e) {
          // Ignorer
        }
        rafRef.current = null;
      }
      
      // Nettoyer tous les timeouts
      timeoutRefs.current.forEach(timeoutId => {
        try {
          clearTimeout(timeoutId);
        } catch (e) {
          // Ignorer
        }
      });
      timeoutRefs.current = [];
      
      // Nettoyer l'animation GSAP si elle existe
      if (animationRef.current) {
        try {
          animationRef.current.kill();
        } catch (e) {
          // Ignorer les erreurs si l'animation a déjà été tuée
        }
        animationRef.current = null;
      }
      
      // Nettoyer les ScrollTriggers associés à cet élément
      // Utiliser un try/catch global pour éviter toute erreur
      try {
        if (elementRef.current) {
          const element = elementRef.current;
          // Vérifier que l'élément existe toujours dans le DOM avant de nettoyer
          if (document.body && document.body.contains(element)) {
            const triggers = ScrollTrigger.getAll();
            triggers.forEach(trigger => {
              try {
                // Vérifier que le trigger existe encore
                if (!trigger || !trigger.vars) return;
                
                const triggerElement = trigger.vars?.trigger || trigger.trigger;
                if (triggerElement === element) {
                  // Vérifier que l'élément existe toujours avant de tuer
                  if (document.body.contains(element)) {
                    trigger.kill();
                  }
                }
              } catch (e) {
                // Ignorer silencieusement toutes les erreurs
              }
            });
          }
        }
      } catch (e) {
        // Ignorer silencieusement toutes les erreurs de cleanup
      }
    };
  }, []);
}

