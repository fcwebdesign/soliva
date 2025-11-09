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

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    let raf = 0;
    let tl: gsap.core.Timeline | null = null;

    const init = () => {
      // Créer l'easing personnalisé
      CustomEase.create("hop", "0.9, 0, 0.1, 1");

      // CACHER le logo du header au début de l'animation
      const headerLogo = document.querySelector('.vt-brand') as HTMLElement;
      if (headerLogo) {
        gsap.set(headerLogo, {
          opacity: 0,
          visibility: "hidden",
        });
      }

      const createSplit = (selector: string, type: "lines" | "words" | "chars", className: string) => {
        return SplitText.create(selector, {
          type: type,
          [type + "Class"]: className,
          mask: type,
        });
      };

      const splitPreloaderCopy = createSplit(".preloader-copy p", "lines", "line");

      const lines = splitPreloaderCopy.lines;

      // IMPORTANT: Sortir le texte du preloader TRÈS TÔT pour qu'il reste visible
      // même quand le clipPath du preloader se ferme
      const textContainer = document.querySelector('.preloader-copy') as HTMLElement;
      const preloader = document.querySelector('.preloader');
      if (preloader && textContainer && textContainer.parentElement === preloader) {
        // Sortir le texte du preloader immédiatement
        document.body.appendChild(textContainer);
        // Le texte est centré par défaut dans le CSS, pas besoin de classe
        // S'assurer qu'il garde ses styles
        gsap.set(textContainer, {
          position: "fixed",
          zIndex: 10000,
          visibility: "visible",
          opacity: 1,
        });
      }

      // États initiaux
      gsap.set(lines, { yPercent: 100 });

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
        ".preloader-images",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "hop",
        },
        "-=1.5"
      );

      // NE PAS faire disparaître le texte avec y: "-125%"
      // Le texte doit rester en place pour être animé vers le header
      // On saute cette animation pour les lignes du texte qui vont aller au header
      
      // Animation finale : déplacer le texte vers le logo du header
      // IMPORTANT : faire cette animation AVANT de fermer le preloader
      // Le texte doit déjà être sorti du preloader pour rester visible
      tl.call(() => {
        const findAndAnimate = (retryCount = 0) => {
          // Le logo dans le header a la classe .vt-brand (soit img soit span)
          const headerLogo = document.querySelector('.vt-brand') as HTMLElement;
          // Utiliser le sélecteur au lieu du ref car le texte a été déplacé dans le DOM
          const textContainer = document.querySelector('.preloader-copy') as HTMLElement;
          
          // Réinitialiser les lignes si elles ont été déplacées par une animation précédente
          if (lines && lines.length > 0) {
            gsap.set(lines, { 
              clearProps: "y,transform", // Nettoyer toutes les transformations précédentes
              y: 0,
              yPercent: 0,
              x: 0
            });
          }
          
          if (headerLogo && textContainer) {
            // headerLogo EST déjà le bon élément (img.vt-brand ou span.vt-brand)
            // Pas besoin de chercher un enfant, le logo lui-même est ciblé
            const headerLogoRect = headerLogo.getBoundingClientRect();
            const headerLogoStyles = window.getComputedStyle(headerLogo);
            const textRect = textContainer.getBoundingClientRect();
            
            console.log('🔵 [RevealAnimation] Position actuelle du texte:', {
              left: textRect.left,
              top: textRect.top,
              width: textRect.width,
              height: textRect.height
            });
            
            console.log('🔵 [RevealAnimation] Position du logo header:', {
              left: headerLogoRect.left,
              top: headerLogoRect.top,
              width: headerLogoRect.width,
              height: headerLogoRect.height,
              tagName: headerLogo.tagName
            });
            
            // IMPORTANT: Appliquer les styles AVANT de calculer le déplacement
            // pour que le texte ait déjà sa largeur finale
            const isImage = headerLogo.tagName === 'IMG';
            
            if (!isImage) {
              // Ajouter la classe "aligned-left" pour aligner à gauche (le CSS gère le reste)
              textContainer.classList.add('aligned-left');
              
              // Forcer l'alignement à gauche avec style inline dès maintenant
              const pElementStart = textContainer.querySelector('p');
              if (pElementStart) {
                (pElementStart as HTMLElement).style.textAlign = 'left';
              }
              
              // Appliquer les styles (mais PAS la largeur tout de suite pour éviter le coupage)
              gsap.set(".preloader-copy p", {
                fontSize: headerLogoStyles.fontSize,
                fontWeight: headerLogoStyles.fontWeight,
                lineHeight: headerLogoStyles.lineHeight,
                textAlign: "left", // Forcer à gauche dès maintenant
                // Ne pas forcer la largeur ici, on le fera pendant l'animation
                overflow: "visible",
                whiteSpace: "nowrap",
              });
              
              // Attendre un tick pour que les styles soient appliqués
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // IMPORTANT: Avant de calculer quoi que ce soit, on doit ANNULER le centrage
                  // pour avoir la position réelle du début du texte
                  
                  // D'abord, mesurer la largeur NATURELLE du texte avec les nouveaux styles
                  const tempSpan = document.createElement('span');
                  tempSpan.style.position = 'absolute';
                  tempSpan.style.visibility = 'hidden';
                  tempSpan.style.whiteSpace = 'nowrap';
                  tempSpan.style.fontSize = headerLogoStyles.fontSize;
                  tempSpan.style.fontWeight = headerLogoStyles.fontWeight;
                  tempSpan.textContent = textContainer.querySelector('p')?.textContent || '';
                  document.body.appendChild(tempSpan);
                  const naturalTextWidth = tempSpan.getBoundingClientRect().width;
                  document.body.removeChild(tempSpan);
                  
                  // Maintenant, annuler le centrage pour avoir la vraie position
                  // Le texte est actuellement avec left: 50% et transform: translateX(-50%)
                  // On veut savoir où est vraiment le début du texte
                  const currentRect = textContainer.getBoundingClientRect();
                  
                  // Le centre du texte est à left: 50% de la fenêtre
                  // Mais avec translateX(-50%), le début réel est à: centerX - (width/2)
                  const viewportCenterX = window.innerWidth / 2;
                  const textWidth = currentRect.width;
                  const currentTextStartX = viewportCenterX - (textWidth / 2);
                  
                  console.log('🔵 [RevealAnimation] Calcul position initiale:', {
                    viewportCenterX,
                    textWidth: currentRect.width,
                    currentTextStartX,
                    rectLeft: currentRect.left,
                    targetLeft: headerLogoRect.left
                  });
                  
                  // Calculer le déplacement DIRECT vers la position finale
                  // On veut que le début du texte aille à headerLogoRect.left
                  const deltaX = headerLogoRect.left - currentTextStartX;
                  const deltaY = headerLogoRect.top - currentRect.top;
                  
                  const finalWidth = headerLogoRect.width;
                  
                  // Utiliser la plus grande largeur entre le logo et le texte naturel
                  // Ajouter un peu de padding pour éviter tout coupage à la fin
                  const padding = 10; // 10px de marge de sécurité
                  const safeWidth = Math.max(finalWidth, naturalTextWidth) + padding;
                  
                  console.log('🟢 [RevealAnimation] Calcul animation:', {
                    currentTextStartX,
                    targetLeft: headerLogoRect.left,
                    deltaX,
                    deltaY,
                    naturalTextWidth,
                    safeWidth
                  });
                  
                  // Animation simple et directe : on commence par annuler le centrage
                  // puis on anime directement vers la position finale
                  
                  // Étape 1: Annuler le centrage (left: 50% + translateX(-50%))
                  // en mettant left à la position réelle du début du texte
                  gsap.set(textContainer, {
                    left: `${currentTextStartX}px`,
                    xPercent: 0,
                    transformOrigin: "left top",
                    overflow: "visible",
                  });
                  
                  // Attendre un tick pour que le changement de position soit appliqué
                  requestAnimationFrame(() => {
                    // Attendre encore un frame pour être sûr que la position est stabilisée
                    requestAnimationFrame(() => {
                      // Vérifier la position réelle après annulation du centrage
                      const actualRect = textContainer.getBoundingClientRect();
                      const actualDeltaX = headerLogoRect.left - actualRect.left;
                      
                      console.log('🔵 [RevealAnimation] Position après annulation centrage:', {
                        actualLeft: actualRect.left,
                        targetLeft: headerLogoRect.left,
                        deltaXCalculé: deltaX,
                        deltaXRéel: actualDeltaX,
                        différence: actualDeltaX - deltaX
                      });
                      
                      // Utiliser le deltaX réel mesuré pour une précision maximale
                      const preciseDeltaX = actualDeltaX;
                      const preciseDeltaY = headerLogoRect.top - actualRect.top;
                      
                      // Maintenant on peut animer directement vers la position finale
                      gsap.to(
                        textContainer,
                        {
                          x: preciseDeltaX,
                          y: preciseDeltaY,
                          width: `${safeWidth}px`,
                          duration: 1.2,
                          ease: "power3.inOut",
                          onStart: () => {
                            gsap.set(".preloader-copy p", {
                              overflow: "visible",
                              whiteSpace: "nowrap",
                            });
                          },
                          onComplete: () => {
                            console.log('🔴 [DEBUG] onComplete appelé');
                            
                            // Recalculer la position du logo au moment exact de la transition
                            // pour éviter tout décalage dû à un scroll ou resize entre-temps
                            const currentHeaderLogo = document.querySelector('.vt-brand') as HTMLElement;
                            if (!currentHeaderLogo) return;
                            
                            const updatedHeaderLogoRect = currentHeaderLogo.getBoundingClientRect();
                            
                            // FORCER l'alignement à gauche IMMÉDIATEMENT avec style inline !important
                            const pElement = textContainer.querySelector('p');
                            if (pElement) {
                              (pElement as HTMLElement).style.setProperty('text-align', 'left', 'important');
                            }
                            
                            // Fixer la position finale directement à la position du logo
                            const textElement = textContainer.querySelector('p');
                            const actualTextWidth = textElement ? textElement.getBoundingClientRect().width : naturalTextWidth;
                            const padding = 10;
                            const finalSafeWidth = Math.max(actualTextWidth, naturalTextWidth, updatedHeaderLogoRect.width) + padding;
                            
                            // Récupérer la position visuelle actuelle (avec transform appliqué)
                            const currentRect = textContainer.getBoundingClientRect();
                            const computedStyle = window.getComputedStyle(textContainer);
                            const transformBefore = computedStyle.transform;
                            const leftBefore = computedStyle.left;
                            const topBefore = computedStyle.top;
                            
                            console.log('🔴 [DEBUG] AVANT correction:', {
                              rect: { left: currentRect.left, top: currentRect.top },
                              css: { left: leftBefore, top: topBefore },
                              transform: transformBefore,
                              target: { left: updatedHeaderLogoRect.left, top: updatedHeaderLogoRect.top }
                            });
                            
                            // Position finale souhaitée
                            const targetLeft = updatedHeaderLogoRect.left;
                            const targetTop = updatedHeaderLogoRect.top;
                            
                            // Si la position actuelle est déjà très proche de la cible, on applique directement
                            // Sinon, on corrige d'abord avec transform puis on passe à left/top
                            const deltaX = targetLeft - currentRect.left;
                            const deltaY = targetTop - currentRect.top;
                            
                            if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
                              console.log('🔴 [DEBUG] Correction nécessaire:', { deltaX, deltaY });
                              
                              // Corriger la position avec transform d'abord
                              gsap.set(textContainer, {
                                x: `+=${deltaX}`,
                                y: `+=${deltaY}`,
                              });
                              
                              // Attendre que le transform soit appliqué
                              requestAnimationFrame(() => {
                                // Maintenant récupérer la nouvelle position visuelle
                                const correctedRect = textContainer.getBoundingClientRect();
                                const computedAfterCorrection = window.getComputedStyle(textContainer);
                                
                                console.log('🔴 [DEBUG] APRÈS correction transform:', {
                                  rect: { left: correctedRect.left, top: correctedRect.top },
                                  transform: computedAfterCorrection.transform,
                                  left: computedAfterCorrection.left,
                                  top: computedAfterCorrection.top
                                });
                                
                                // IMPORTANT: Forcer le transform à 0 avant de passer à left/top
                                // pour éviter que clearProps ne supprime pas complètement le transform
                                gsap.set(textContainer, {
                                  x: 0,
                                  y: 0,
                                  immediateRender: true,
                                });
                                
                                // Attendre un frame pour que le transform soit vraiment à 0
                              requestAnimationFrame(() => {
                                // Recalculer la position du logo une dernière fois pour être sûr
                                const finalHeaderLogoRect = currentHeaderLogo.getBoundingClientRect();
                                
                                // Ajouter la classe "aligned-left" pour aligner à gauche
                                textContainer.classList.add('aligned-left');
                                
                                // Utiliser DIRECTEMENT la position cible du logo (pas la position actuelle du texte)
                                // pour éviter tout arrondi ou décalage
                                
                                // S'assurer que le container n'a plus le transform qui le centre
                                gsap.set(textContainer, {
                                  left: `${finalHeaderLogoRect.left}px`,
                                  top: `${finalHeaderLogoRect.top}px`,
                                  x: 0,
                                  xPercent: 0,
                                  transform: "none", // Forcer explicitement à none
                                  overflow: "visible",
                                  width: `${finalSafeWidth}px`,
                                });
                                
                                // Forcer aussi via style inline sur le container pour être sûr
                                textContainer.style.setProperty('transform', 'none', 'important');
                                textContainer.style.setProperty('left', `${finalHeaderLogoRect.left}px`, 'important');
                                textContainer.style.setProperty('top', `${finalHeaderLogoRect.top}px`, 'important');
                                
                                // Vérifier immédiatement après et corriger si nécessaire
                                requestAnimationFrame(() => {
                                  const afterClearRect = textContainer.getBoundingClientRect();
                                  const computedAfterClear = window.getComputedStyle(textContainer);
                                  
                                  // Micro-correction finale si nécessaire (arrondis du navigateur)
                                  const microDiffX = finalHeaderLogoRect.left - afterClearRect.left;
                                  const microDiffY = finalHeaderLogoRect.top - afterClearRect.top;
                                  
                                  if (Math.abs(microDiffX) > 0.1 || Math.abs(microDiffY) > 0.1) {
                                    // Appliquer une micro-correction
                                    gsap.set(textContainer, {
                                      left: `${finalHeaderLogoRect.left}px`,
                                      top: `${finalHeaderLogoRect.top}px`,
                                    });
                                    textContainer.style.setProperty('left', `${finalHeaderLogoRect.left}px`, 'important');
                                    textContainer.style.setProperty('top', `${finalHeaderLogoRect.top}px`, 'important');
                                  }
                                  
                                  console.log('🔴 [DEBUG] APRÈS clearProps:', {
                                    rect: { left: afterClearRect.left, top: afterClearRect.top },
                                    css: { left: computedAfterClear.left, top: computedAfterClear.top },
                                    transform: computedAfterClear.transform,
                                    target: { left: finalHeaderLogoRect.left, top: finalHeaderLogoRect.top },
                                    diff: {
                                      x: afterClearRect.left - finalHeaderLogoRect.left,
                                      y: afterClearRect.top - finalHeaderLogoRect.top
                                    },
                                    microCorrection: { x: microDiffX, y: microDiffY }
                                  });
                                });
                                });
                              });
                            } else {
                              console.log('🔴 [DEBUG] Pas de correction nécessaire, passage direct à left/top');
                              
                              // Position déjà correcte, on peut passer directement à left/top
                              // IMPORTANT: Forcer le transform à 0 avant de passer à left/top
                              // pour éviter que clearProps ne supprime pas complètement le transform
                              gsap.set(textContainer, {
                                x: 0,
                                y: 0,
                                immediateRender: true,
                              });
                              
                              // Attendre un frame pour que le transform soit vraiment à 0
                              requestAnimationFrame(() => {
                                // Recalculer la position du logo une dernière fois pour être sûr
                                const finalHeaderLogoRect = currentHeaderLogo.getBoundingClientRect();
                                
                                // Ajouter la classe "aligned-left" pour aligner à gauche
                                textContainer.classList.add('aligned-left');
                                
                                // Utiliser DIRECTEMENT la position cible du logo (pas la position actuelle du texte)
                                // pour éviter tout arrondi ou décalage
                                
                                // S'assurer que le container n'a plus le transform qui le centre
                                gsap.set(textContainer, {
                                  left: `${finalHeaderLogoRect.left}px`,
                                  top: `${finalHeaderLogoRect.top}px`,
                                  x: 0,
                                  xPercent: 0,
                                  transform: "none", // Forcer explicitement à none
                                  overflow: "visible",
                                  width: `${finalSafeWidth}px`,
                                });
                                
                                // Forcer aussi via style inline sur le container pour être sûr
                                textContainer.style.setProperty('transform', 'none', 'important');
                                textContainer.style.setProperty('left', `${finalHeaderLogoRect.left}px`, 'important');
                                textContainer.style.setProperty('top', `${finalHeaderLogoRect.top}px`, 'important');
                                
                                // Vérifier immédiatement après et corriger si nécessaire
                                requestAnimationFrame(() => {
                                  const afterClearRect = textContainer.getBoundingClientRect();
                                  const computedAfterClear = window.getComputedStyle(textContainer);
                                  
                                  // Micro-correction finale si nécessaire (arrondis du navigateur)
                                  const microDiffX = finalHeaderLogoRect.left - afterClearRect.left;
                                  const microDiffY = finalHeaderLogoRect.top - afterClearRect.top;
                                  
                                  if (Math.abs(microDiffX) > 0.1 || Math.abs(microDiffY) > 0.1) {
                                    // Appliquer une micro-correction
                                    gsap.set(textContainer, {
                                      left: `${finalHeaderLogoRect.left}px`,
                                      top: `${finalHeaderLogoRect.top}px`,
                                    });
                                    textContainer.style.setProperty('left', `${finalHeaderLogoRect.left}px`, 'important');
                                    textContainer.style.setProperty('top', `${finalHeaderLogoRect.top}px`, 'important');
                                  }
                                  
                                  console.log('🔴 [DEBUG] APRÈS clearProps (pas de correction):', {
                                    rect: { left: afterClearRect.left, top: afterClearRect.top },
                                    css: { left: computedAfterClear.left, top: computedAfterClear.top },
                                    transform: computedAfterClear.transform,
                                    target: { left: finalHeaderLogoRect.left, top: finalHeaderLogoRect.top },
                                    diff: {
                                      x: afterClearRect.left - finalHeaderLogoRect.left,
                                      y: afterClearRect.top - finalHeaderLogoRect.top
                                    },
                                    microCorrection: { x: microDiffX, y: microDiffY }
                                  });
                                });
                              });
                            }
                            
                            // Copier les styles du logo au texte pour qu'ils soient identiques
                            const logoStyles = window.getComputedStyle(currentHeaderLogo);
                            const isImage = currentHeaderLogo.tagName === 'IMG';
                            
                            if (!isImage) {
                              // Pour les spans (texte), copier les styles typographiques
                              gsap.set(".preloader-copy p", {
                                fontSize: logoStyles.fontSize,
                                fontWeight: logoStyles.fontWeight,
                                lineHeight: logoStyles.lineHeight,
                                fontFamily: logoStyles.fontFamily,
                                color: logoStyles.color,
                                // textAlign est déjà à gauche par défaut dans le CSS
                                overflow: "visible",
                                whiteSpace: "nowrap",
                              });
                            } else {
                              // Pour les images, juste s'assurer que le texte est visible
                              gsap.set(".preloader-copy p", {
                                // textAlign est déjà à gauche par défaut dans le CSS
                                overflow: "visible",
                                whiteSpace: "nowrap",
                                color: "#111827",
                              });
                            }
                            
                            // Animation de la couleur du texte (si ce n'est pas déjà fait)
                            if (!isImage) {
                              gsap.to(
                                ".preloader-copy p",
                                {
                                  color: logoStyles.color,
                                  duration: 0.3,
                                  ease: "power2.out",
                                }
                              );
                            } else {
                              gsap.to(
                                ".preloader-copy p",
                                {
                                  color: "#111827",
                                  duration: 0.3,
                                  ease: "power2.out",
                                }
                              );
                            }
                            
                            // S'assurer que le logo reste caché
                            gsap.set(currentHeaderLogo, {
                              opacity: 0,
                              visibility: "hidden",
                            });
                            
                            // S'assurer que le texte reste visible et au-dessus
                            gsap.set(textContainer, {
                              opacity: 1,
                              visibility: "visible",
                              zIndex: 99999,
                              pointerEvents: "none", // Ne pas bloquer les clics
                            });
                            
                            // Ajouter la classe "aligned-left" pour aligner à gauche
                            textContainer.classList.add('aligned-left');
                            
                            // Forcer aussi avec style inline pour être sûr
                            const finalPElement = textContainer.querySelector('p');
                            if (finalPElement) {
                              (finalPElement as HTMLElement).style.textAlign = 'left';
                              console.log('🟢 [DEBUG] Alignement à gauche appliqué:', {
                                hasClass: textContainer.classList.contains('aligned-left'),
                                styleInline: (finalPElement as HTMLElement).style.textAlign,
                                computed: window.getComputedStyle(finalPElement).textAlign
                              });
                            }
                          }
                        }
                      );
                    });
                  });
                });
              });
              
              return; // Sortir, l'animation sera lancée dans le requestAnimationFrame
            }
            
            // Pour les images, utiliser l'ancien code
            let deltaX: number;
            let deltaY: number;
            
            const currentCenterX = textRect.left + textRect.width / 2;
            const currentCenterY = textRect.top + textRect.height / 2;
            const logoCenterX = headerLogoRect.left + headerLogoRect.width / 2;
            const logoCenterY = headerLogoRect.top + headerLogoRect.height / 2;
            deltaX = logoCenterX - currentCenterX;
            deltaY = logoCenterY - currentCenterY;
            
            console.log('🟢 [RevealAnimation] Image - Déplacement:', { deltaX, deltaY });
            
            // Vérifier que le texte n'est plus dans le preloader et le sortir si nécessaire
            const parent = textContainer.parentElement;
            if (parent && (parent.classList.contains('preloader') || parent.classList.contains('fixed'))) {
              document.body.appendChild(textContainer);
            }
            
            // Forcer la visibilité et s'assurer que le texte est au-dessus de TOUT
            gsap.set(textContainer, {
              visibility: "visible",
              opacity: 1,
              zIndex: 99999,
              pointerEvents: "none",
              position: "fixed",
            });
            
            // Pour les images uniquement (le texte span est géré dans le if précédent)
            gsap.to(
              textContainer,
              {
                x: deltaX,
                y: deltaY,
                width: 'auto',
                duration: 1.2,
                ease: "power3.inOut",
                onComplete: () => {
                  // Copier les styles du logo au texte
                  const logoStyles = window.getComputedStyle(headerLogo);
                  const isImage = headerLogo.tagName === 'IMG';
                  
                  if (!isImage) {
                    // Pour les spans (texte), copier les styles typographiques
                    gsap.set(".preloader-copy p", {
                      fontSize: logoStyles.fontSize,
                      fontWeight: logoStyles.fontWeight,
                      lineHeight: logoStyles.lineHeight,
                      fontFamily: logoStyles.fontFamily,
                      color: logoStyles.color,
                      textAlign: "left", // FORCER l'alignement à gauche à la fin
                      overflow: "visible",
                      whiteSpace: "nowrap",
                    });
                  }
                  
                  gsap.to(
                    ".preloader-copy p",
                    {
                      color: isImage ? "#111827" : logoStyles.color,
                      duration: 0.3,
                      ease: "power2.out",
                    }
                  );
                  
                  // S'assurer que le logo reste caché
                  gsap.set(headerLogo, {
                    opacity: 0,
                    visibility: "hidden",
                  });
                  
                  // S'assurer que le texte reste visible
                  gsap.set(textContainer, {
                    opacity: 1,
                    visibility: "visible",
                    zIndex: 99999,
                    pointerEvents: "none",
                  });
                  
                  // Retirer la classe "centered" si elle existe encore (le texte est déjà à gauche par défaut)
                  textContainer.classList.remove('centered');
                }
              }
            );
          } else if (retryCount < 10) {
            // Retry après un court délai si le header n'est pas encore rendu (max 10 tentatives)
            setTimeout(() => findAndAnimate(retryCount + 1), 50);
          }
        };
        setTimeout(() => findAndAnimate(), 100);
      }, null, "-=1.5");

      // Attendre que l'animation du texte soit complètement terminée (1.2s + marge)
      tl.to(
        {},
        {
          duration: 1.5, // Durée de l'animation du texte vers le header (1.2s) + marge
        },
        "-=1.5"
      );

      // Fermer le preloader APRÈS que le texte soit complètement arrivé au header
      // Le texte doit rester visible pendant tout ce temps car il est hors du preloader
      // On utilise un délai plus long pour être sûr que le texte est bien arrivé et reste visible
      tl.to(
        ".preloader",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.75,
          ease: "hop",
        },
        "+=1" // Délai plus long pour que le texte soit bien arrivé et reste visible
      );

      // NE PAS cacher le texte - il doit rester visible pour remplacer le logo du header
      // Le texte reste visible et prend la place du logo qui est caché
      // tl.to(
      //   ".preloader-copy",
      //   {
      //     opacity: 0,
      //     duration: 0.3,
      //     ease: "power2.out",
      //   },
      //   "-=0.3"
      // );

      tl.call(onComplete);
    };

    raf = window.requestAnimationFrame(init);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (tl) tl.kill();
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
        <p 
          className="text-xl font-bold tracking-tight"
          style={{ color: config.colors.text }}
        >
          {config.text.subtitle}
        </p>
      </div>
    </div>
  );
}
