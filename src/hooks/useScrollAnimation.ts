"use client";
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import type { ScrollAnimationType } from '@/app/admin/components/sections/ScrollAnimationsSection';

gsap.registerPlugin(ScrollTrigger, SplitText);

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
  /** Si true, applique l'animation uniquement sur les enfants directs, pas sur le wrapper (utile pour les blocs avec pin) */
  animateChildrenOnly?: boolean;
}

/**
 * Hook pour appliquer des animations de scroll GSAP aux éléments
 * Utilise la configuration depuis metadata.scrollAnimations
 */
export function useScrollAnimation(
  elementRef: React.RefObject<HTMLElement>,
  options: UseScrollAnimationOptions = {}
) {
  const { config, blockType, enabled = true, content, animateChildrenOnly = false } = options;
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const elementSnapshot = useRef<HTMLElement | null>(null);
  const splitTextRef = useRef<any>(null); // ← AJOUT : Stocker l'instance SplitText
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useGSAP(() => {
    if (!enabled || !elementRef.current) {
      console.log('⏭️ [useScrollAnimation] Skipped - enabled:', enabled, 'hasElement:', !!elementRef.current);
      return;
    }

    const elementInfo = elementRef.current.className || elementRef.current.tagName || 'unknown';
    console.log(`🎬 [useScrollAnimation] useGSAP démarré pour: ${elementInfo} (blockType: ${blockType})`);

    // ⚠️ IMPORTANT : Nettoyer les ScrollTriggers existants AVANT de créer les nouveaux
    // Ceci est critique quand les configurations changent depuis l'admin
    if (elementSnapshot.current || elementRef.current) {
      try {
        const element = elementSnapshot.current || elementRef.current;
        const triggers = ScrollTrigger.getAll();
        let cleaned = 0;
        
        console.log(`🧹 [useScrollAnimation] Vérification de ${triggers.length} triggers existants`);
        
        triggers.forEach(trigger => {
          try {
            const triggerElement = trigger.vars?.trigger || trigger.trigger;
            if (triggerElement === element) {
              trigger.kill(true);
              cleaned++;
              console.log(`  ✅ Trigger nettoyé pour: ${elementInfo}`);
            }
          } catch (e) {
            console.error(`  ❌ Erreur nettoyage trigger:`, e);
          }
        });
        
        if (cleaned > 0) {
          console.log(`🧹 [useScrollAnimation] ${cleaned} triggers nettoyés pour: ${elementInfo}`);
        }
      } catch (e) {
        console.error('🧹 [useScrollAnimation] Erreur lors du nettoyage:', e);
      }
    }

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
      if (!isMountedRef.current) {
        console.log('⏭️ [useScrollAnimation] createScrollAnimation skipped - not mounted');
        return;
      }
      if (!elementRef.current) {
        console.log('⏭️ [useScrollAnimation] createScrollAnimation skipped - no element');
        return;
      }
      
      const element = elementRef.current;
      const elementInfo = element.className || element.tagName || 'unknown';
      console.log(`🎨 [useScrollAnimation] createScrollAnimation pour: ${elementInfo}`);
      
      // Sauvegarder une référence à l'élément pour le cleanup ultérieur
      elementSnapshot.current = element;
      
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

    if (!animationConfig || animationConfig.type === 'none') {
      console.log('⏭️ [useScrollAnimation] Pas d\'animation configurée');
      return;
    }
    
    console.log(`🎯 [useScrollAnimation] Animation: ${animationConfig.type} pour ${blockType || 'element'}`);


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

    // Pour les blocs avec pin, animer uniquement les enfants directs (pas le wrapper)
    // pour éviter les conflits avec le ScrollTrigger du pin
    const getTargetElements = (): HTMLElement[] => {
      if (animateChildrenOnly) {
        // Récupérer les enfants directs (pas les descendants)
        // ScrollAnimated enveloppe dans un <div>, donc element.children = [<section>]
        const children = Array.from(element.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement
        );
        
        if (children.length > 0) {
          const section = children[0];
          
          // Pour les blocs avec pin, on ne peut PAS animer l'élément qui est pinné
          // car GSAP contrôle cet élément avec le pin. Il faut animer le CONTENU à l'intérieur.
          // Structure : section > div (pinRef, pinné par GSAP) > div (gridRef, contenu)
          const sectionChildren = Array.from(section.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement
          );
          
          // Chercher le div qui n'est PAS un pin-spacer (c'est le div original avec pinRef)
          const pinElement = sectionChildren.find(
            (child) => !child.classList.contains('pin-spacer') && child.tagName === 'DIV'
          ) || sectionChildren[0];
          
          if (pinElement) {
            // Animer les enfants du div pinné (le contenu à l'intérieur), pas le div lui-même
            const contentChildren = Array.from(pinElement.children).filter(
              (child): child is HTMLElement => child instanceof HTMLElement
            );
            
            if (contentChildren.length > 0) {
              // Animer le premier enfant du div pinné (généralement le div avec gridRef)
              const contentElement = contentChildren[0];
              
              // IMPORTANT: Pour les blocs avec pin, on anime le conteneur (gridRef), pas les items
              // car les items sont déjà animés par le bloc lui-même via ScrollTrigger
              // Animer les items créerait un conflit avec l'animation locale du bloc
              if (process.env.NODE_ENV === 'development') {
                console.log(`📌 [useScrollAnimation] Animation sur le conteneur du pin (bloc avec pin):`, contentElement.tagName, contentElement.className);
              }
              return [contentElement];
            } else {
              // Fallback : animer le div pinné lui-même (mais ça peut casser le pin)
              if (process.env.NODE_ENV === 'development') {
                console.log(`📌 [useScrollAnimation] Animation sur le div pin (fallback, peut casser le pin):`, pinElement.tagName);
              }
              return [pinElement];
            }
          } else {
            // Fallback : animer la section si pas trouvé
            if (process.env.NODE_ENV === 'development') {
              console.log(`📌 [useScrollAnimation] Animation sur la section (fallback):`, section.tagName);
            }
            return [section];
          }
        }
      }
      // Par défaut, animer l'élément wrapper
      return [element];
    };

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

    const targetElements = getTargetElements();
    const triggerElement = animateChildrenOnly ? element : (targetElements[0] || element);

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [useScrollAnimation] Vérification animateChildrenOnly:', {
        animateChildrenOnly,
        targetElementsLength: targetElements.length,
        targetElements: targetElements.map(el => el.tagName),
        blockType
      });
    }

    // Pour les blocs avec pin, utiliser IntersectionObserver au lieu de ScrollTrigger
    // pour éviter les conflits avec le pin qui utilise ScrollTrigger
    if (animateChildrenOnly && targetElements.length > 0) {
      // Déterminer les propriétés d'animation selon le type
      // IMPORTANT: Pour les blocs avec pin, on convertit toutes les animations qui utilisent
      // transform (x, y, scale) en fade-in simple (opacity uniquement) pour éviter les conflits
      // avec le pin de ScrollTrigger qui contrôle aussi le transform
      const getAnimationProps = () => {
        // Vérifier si l'animation utilise transform (x, y, scale)
        const usesTransform = ['fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right', 
                               'scale-in', 'scale-in-up', 'slide-up', 'slide-down', 'slide-left', 'slide-right'].includes(type);
        
        // Si l'animation utilise transform, utiliser uniquement opacity pour éviter les conflits
        if (usesTransform && type !== 'fade-in') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`📌 [useScrollAnimation] Animation "${type}" convertie en "fade-in" pour éviter les conflits avec le pin`);
          }
          return { from: { opacity: 0 }, to: { opacity: 1 } };
        }
        
        // Sinon, utiliser l'animation normale
        switch (type) {
          case 'fade-in':
            return { from: { opacity: 0 }, to: { opacity: 1 } };
          case 'blur-in':
            // blur-in utilise filter, pas transform, donc pas de conflit avec le pin
            return { from: { opacity: 0, filter: 'blur(10px)' }, to: { opacity: 1, filter: 'blur(0px)' } };
          case 'fade-in-up':
            return { from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } };
          case 'fade-in-down':
            return { from: { opacity: 0, y: -60 }, to: { opacity: 1, y: 0 } };
          case 'fade-in-left':
            return { from: { opacity: 0, x: -60 }, to: { opacity: 1, x: 0 } };
          case 'fade-in-right':
            return { from: { opacity: 0, x: 60 }, to: { opacity: 1, x: 0 } };
          case 'scale-in':
            return { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } };
          case 'scale-in-up':
            return { from: { opacity: 0, scale: 0.8, y: 60 }, to: { opacity: 1, scale: 1, y: 0 } };
          case 'slide-up':
            return { from: { y: 60 }, to: { y: 0 } };
          case 'slide-down':
            return { from: { y: -60 }, to: { y: 0 } };
          case 'slide-left':
            return { from: { x: -60 }, to: { x: 0 } };
          case 'slide-right':
            return { from: { x: 60 }, to: { x: 0 } };
          default:
            return { from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } };
        }
      };

      const animProps = getAnimationProps();
      
      // Vérifier d'abord si safeAnimate peut s'exécuter
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [useScrollAnimation] Avant safeAnimate:', {
          isMounted: isMountedRef.current,
          hasElementRef: !!elementRef.current,
          elementMatch: elementRef.current === element,
          hasDocumentBody: !!document.body,
          elementInBody: elementRef.current ? document.body?.contains(elementRef.current) : false
        });
      }
      
      safeAnimate(() => {
        // Observer l'élément à animer (le div avec pinRef, pas la section)
        const elementToObserve = targetElements[0] || element;
        
        // Pour l'observer, on observe la section parente (plus stable pour IntersectionObserver)
        const sectionToObserve = elementToObserve.parentElement || elementToObserve;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📌 [useScrollAnimation] Setup IntersectionObserver pour bloc avec pin:', {
            element: element.tagName,
            targetElements: targetElements.length,
            targetElementTag: targetElements[0]?.tagName,
            sectionToObserve: sectionToObserve.tagName,
            type,
            animProps
          });
        }
        
        // Initialiser les styles "from" immédiatement pour que l'animation soit visible
        // IMPORTANT: On anime le div avec pinRef, pas la section (pour ne pas casser le pin)
        // Utiliser force3D: false pour éviter les conflits avec le pin de ScrollTrigger
        // Attendre un peu pour que le pin soit créé avant d'appliquer l'animation
        setTimeout(() => {
          targetElements.forEach((targetEl) => {
            gsap.set(targetEl, {
              ...animProps.from,
              force3D: false, // Éviter les conflits avec le pin
              immediateRender: false,
            });
            if (process.env.NODE_ENV === 'development') {
              console.log('📌 [useScrollAnimation] Styles "from" appliqués sur:', targetEl.tagName, targetEl.className, animProps.from);
            }
          });
        }, 200); // Délai pour laisser le pin se créer
        
        // Fonction pour appliquer l'animation
        const applyAnimation = () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📌 [useScrollAnimation] Application de l\'animation:', {
              targetElements: targetElements.length,
              animPropsTo: animProps.to
            });
          }
          
          // Animer les éléments cibles avec force3D: false pour éviter les conflits avec le pin
          if (targetElements.length > 1) {
            gsap.to(targetElements,
              {
                ...animProps.to,
                duration,
                delay,
                stagger: stagger || 0,
                ease: easing,
                force3D: false, // Éviter les conflits avec le pin de ScrollTrigger
                immediateRender: false,
              }
            );
          } else {
            gsap.to(targetElements[0],
              {
                ...animProps.to,
                duration,
                delay,
                ease: easing,
                force3D: false, // Éviter les conflits avec le pin de ScrollTrigger
                immediateRender: false,
              }
            );
          }
        };
        
        // Vérifier si l'élément est déjà visible au chargement
        const rect = sectionToObserve.getBoundingClientRect();
        const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📌 [useScrollAnimation] Vérification visibilité:', {
            rectTop: rect.top,
            rectBottom: rect.bottom,
            windowHeight: window.innerHeight,
            isAlreadyVisible
          });
        }
        
        if (isAlreadyVisible) {
          // Si déjà visible, appliquer l'animation avec un délai pour laisser le pin se créer
          if (process.env.NODE_ENV === 'development') {
            console.log('📌 [useScrollAnimation] Élément déjà visible, animation avec délai pour laisser le pin se créer');
          }
          setTimeout(() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('📌 [useScrollAnimation] Exécution animation après timeout');
            }
            applyAnimation();
          }, 300); // Délai plus long pour laisser le pin se créer
        } else {
          // Sinon, utiliser IntersectionObserver
          if (process.env.NODE_ENV === 'development') {
            console.log('📌 [useScrollAnimation] Création IntersectionObserver');
          }
          
          // Utiliser un flag pour éviter les déclenchements multiples
          let hasAnimated = false;
          
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                // Ne déclencher que si l'élément entre dans la vue ET qu'on n'a pas déjà animé
                if (entry.isIntersecting && !hasAnimated) {
                  hasAnimated = true;
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log('📌 [useScrollAnimation] IntersectionObserver déclenché, animation appliquée', {
                      isIntersecting: entry.isIntersecting,
                      intersectionRatio: entry.intersectionRatio
                    });
                  }
                  
                  applyAnimation();
                  observer.disconnect(); // Une seule fois
                }
              });
            },
            { 
              threshold: 0.01, // Déclencher dès qu'1% est visible
              rootMargin: '0px'
            }
          );
          
          // Attendre un peu avant d'observer pour éviter les déclenchements prématurés
          setTimeout(() => {
            if (!hasAnimated && sectionToObserve) {
              observer.observe(sectionToObserve);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('📌 [useScrollAnimation] IntersectionObserver observe:', sectionToObserve.tagName);
              }
            }
          }, 100);
          
          // Stocker l'observer pour le cleanup
          intersectionObserverRef.current = observer;
        }
      });
      return; // Sortir tôt pour éviter le switch
    }

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

            // ⚠️ CRITIQUE : Stocker l'instance pour la nettoyer plus tard
            splitTextRef.current = split;

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

            // ⚠️ CRITIQUE : Stocker l'instance pour la nettoyer plus tard
            splitTextRef.current = split;

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
  }, { 
    scope: elementRef, 
    dependencies: [config, blockType, enabled, content],
    revertOnUpdate: true // ← CRITIQUE : Restaure le DOM avant mise à jour/démontage
  });

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    const elementInfo = elementRef.current?.className || elementRef.current?.tagName || 'unknown';
    console.log(`🟢 [useScrollAnimation] Composant monté: ${elementInfo} (${blockType})`);
    
    return () => {
      console.log(`🔴 [useScrollAnimation] Composant démonte: ${elementInfo} (${blockType})`);
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
      
      // 🔥 SOLUTION ULTIME : Tuer TOUTES les animations sur cet élément AVANT de nettoyer les triggers
      try {
        console.log(`🔥 [useScrollAnimation] Cleanup AGRESSIF pour: ${elementInfo}`);
        
        // 0. Nettoyer l'IntersectionObserver si présent
        if (intersectionObserverRef.current) {
          try {
            console.log(`  🔥 Disconnect IntersectionObserver...`);
            intersectionObserverRef.current.disconnect();
            intersectionObserverRef.current = null;
            console.log(`  ✅ IntersectionObserver nettoyé`);
          } catch (e) {
            console.error(`  ❌ Erreur cleanup IntersectionObserver:`, e);
          }
        }
        
        // 1. ⚠️ CRITIQUE : Nettoyer SplitText EN PREMIER (restaure le DOM)
        if (splitTextRef.current) {
          try {
            console.log(`  🔥 Revert SplitText...`);
            splitTextRef.current.revert(); // Restaure le DOM à son état initial
            splitTextRef.current = null;
            console.log(`  ✅ SplitText restauré`);
          } catch (e) {
            console.error(`  ❌ Erreur revert SplitText:`, e);
          }
        }
        
        // 1. Tuer TOUTES les animations GSAP sur cet élément spécifique
        if (elementSnapshot.current) {
          try {
            gsap.killTweensOf(elementSnapshot.current);
            console.log(`  🔥 Tweens tués pour snapshot`);
          } catch (e) {
            console.error(`  ❌ Erreur kill tweens snapshot:`, e);
          }
        }
        
        if (elementRef.current) {
          try {
            gsap.killTweensOf(elementRef.current);
            console.log(`  🔥 Tweens tués pour ref actuelle`);
          } catch (e) {
            console.error(`  ❌ Erreur kill tweens ref:`, e);
          }
        }
        
        // 2. Nettoyer les ScrollTriggers associés
        const triggers = ScrollTrigger.getAll();
        console.log(`🧹 [useScrollAnimation] ${triggers.length} triggers à vérifier`);
        
        let killed = 0;
        triggers.forEach((trigger, index) => {
          try {
            if (!trigger) return;
            
            const triggerElement = trigger.vars?.trigger || trigger.trigger;
            const shouldKill = 
              (elementSnapshot.current && triggerElement === elementSnapshot.current) ||
              (elementRef.current && triggerElement === elementRef.current);
            
            if (shouldKill) {
              console.log(`  ✅ Killing trigger ${index + 1}`);
              // kill(true) = immediate, pas de manipulation DOM
              trigger.kill(true);
              killed++;
            }
          } catch (e) {
            console.error(`  ❌ Erreur kill trigger ${index + 1}:`, e);
          }
        });
        
        console.log(`🧹 [useScrollAnimation] ${killed} triggers tués`);
        
        // 3. Nettoyer la snapshot
        elementSnapshot.current = null;
      } catch (e) {
        console.error('🧹 [useScrollAnimation] ERREUR cleanup:', e);
      }
    };
  }, []);
}

