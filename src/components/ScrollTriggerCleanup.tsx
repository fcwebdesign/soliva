"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

/**
 * Composant pour nettoyer tous les ScrollTriggers lors des changements de route,
 * de contenu depuis l'admin, ou avant le rafraîchissement de la page.
 * Cela évite les erreurs "Node.removeChild" lors du rafraîchissement des pages.
 * 
 * Ce composant agit comme un filet de sécurité pour attraper les ScrollTriggers
 * qui n'auraient pas été nettoyés correctement par leurs composants respectifs.
 */
export default function ScrollTriggerCleanup() {
  const pathname = usePathname();

  // Nettoyage AVANT le rafraîchissement de la page (critique!)
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔴 [ScrollTriggerCleanup] BEFORE UNLOAD détecté - nettoyage d\'urgence!');
      // Nettoyer IMMÉDIATEMENT tous les ScrollTriggers avant le rafraîchissement
      cleanupScrollTriggers('before unload', true);
    };

    console.log('🟢 [ScrollTriggerCleanup] Composant monté - installation des listeners');
    
    // Écouter l'événement AVANT le déchargement de la page
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Également écouter l'événement pagehide (pour Safari)
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      console.log('🔴 [ScrollTriggerCleanup] Composant démonté - nettoyage des listeners');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  // Nettoyage lors des changements de route
  useEffect(() => {
    console.log('🟡 [ScrollTriggerCleanup] Route changée:', pathname);
    return () => {
      console.log('🟡 [ScrollTriggerCleanup] Route va changer - nettoyage');
      cleanupScrollTriggers('route change');
    };
  }, [pathname]);

  // Nettoyage lors des changements de contenu depuis l'admin
  useEffect(() => {
    const handleContentUpdate = () => {
      console.log('🔵 [ScrollTriggerCleanup] Contenu mis à jour depuis l\'admin');
      cleanupScrollTriggers('content update');
      
      // Rafraîchir après un court délai pour recalculer les positions
      setTimeout(() => {
        try {
          ScrollTrigger.refresh();
          console.log('🔵 [ScrollTriggerCleanup] ScrollTrigger.refresh() appelé');
        } catch (e) {
          console.error('🔵 [ScrollTriggerCleanup] Erreur lors du refresh:', e);
        }
      }, 100);
    };

    // Écouter l'événement de mise à jour du contenu
    window.addEventListener('content-updated', handleContentUpdate);

    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
    };
  }, []);

  return null;
}

/**
 * Fonction utilitaire pour nettoyer tous les ScrollTriggers
 * @param reason - Raison du nettoyage (pour debug)
 * @param immediate - Si true, utilise une méthode encore plus agressive
 */
function cleanupScrollTriggers(reason: string, immediate: boolean = false) {
  try {
    console.log(`🧹 [ScrollTriggerCleanup] Début nettoyage (${reason}${immediate ? ' - IMMEDIATE' : ''})`);
    
    // 🔥 CRITIQUE : Tuer TOUTES les animations GSAP actives AVANT les ScrollTriggers
    try {
      console.log('🔥 [ScrollTriggerCleanup] Arrêt de toutes les animations GSAP...');
      gsap.killTweensOf("*"); // Tue toutes les animations
      
      // Également tuer tous les tweens globaux
      const allTweens = gsap.globalTimeline.getChildren();
      console.log(`🔥 [ScrollTriggerCleanup] ${allTweens.length} tweens trouvés`);
      allTweens.forEach((tween: any) => {
        try {
          tween.kill();
        } catch (e) {
          // Ignorer
        }
      });
      console.log('✅ [ScrollTriggerCleanup] Toutes les animations GSAP tuées');
    } catch (e) {
      console.error('❌ [ScrollTriggerCleanup] Erreur lors du kill des tweens:', e);
    }
    
    // Récupérer tous les ScrollTriggers actifs
    const triggers = ScrollTrigger.getAll();
    console.log(`🧹 [ScrollTriggerCleanup] ${triggers.length} ScrollTriggers trouvés`);
    
    if (triggers.length > 0) {
      // Log des triggers avant nettoyage
      triggers.forEach((trigger, index) => {
        try {
          const triggerElement = trigger.vars?.trigger || trigger.trigger;
          let elementInfo = 'no element';
          if (triggerElement) {
            if (typeof triggerElement === 'string') {
              elementInfo = triggerElement;
            } else if (triggerElement instanceof Element) {
              elementInfo = (triggerElement as HTMLElement).className || triggerElement.tagName || 'unknown';
            } else {
              elementInfo = 'complex element';
            }
          }
          console.log(`  - Trigger ${index + 1}: ${elementInfo}`);
        } catch (e) {
          console.log(`  - Trigger ${index + 1}: error reading info`);
        }
      });
      
      if (immediate) {
        console.log('🧹 [ScrollTriggerCleanup] Mode IMMEDIATE activé');
        // Méthode ultra-agressive pour le beforeunload
        let killed = 0;
        triggers.forEach((trigger, index) => {
          try {
            trigger.kill(true);
            killed++;
            console.log(`  ✅ Trigger ${index + 1} tué`);
          } catch (e) {
            console.error(`  ❌ Trigger ${index + 1} erreur:`, e);
          }
        });
        
        console.log(`🧹 [ScrollTriggerCleanup] ${killed}/${triggers.length} triggers tués`);
        
        // Double sécurité
        try {
          const remainingTriggers = ScrollTrigger.getAll();
          if (remainingTriggers.length > 0) {
            console.log(`⚠️ [ScrollTriggerCleanup] ${remainingTriggers.length} triggers restants! Deuxième passage...`);
            remainingTriggers.forEach(t => {
              try {
                t.kill(true);
              } catch (e) {
                // Ignorer
              }
            });
            const finalCheck = ScrollTrigger.getAll();
            console.log(`🧹 [ScrollTriggerCleanup] Après 2ème passage: ${finalCheck.length} triggers restants`);
          }
        } catch (e) {
          console.error('🧹 [ScrollTriggerCleanup] Erreur double sécurité:', e);
        }
      } else {
        // Méthode normale
        let killed = 0;
        triggers.forEach((trigger, index) => {
          try {
            trigger.kill(true);
            killed++;
          } catch (e) {
            console.error(`  ❌ Trigger ${index + 1} erreur:`, e);
          }
        });
        console.log(`🧹 [ScrollTriggerCleanup] ${killed}/${triggers.length} triggers nettoyés`);
      }
    } else {
      console.log('🧹 [ScrollTriggerCleanup] Aucun trigger à nettoyer');
    }
  } catch (e) {
    console.error('🧹 [ScrollTriggerCleanup] ERREUR CRITIQUE:', e);
  }
}

