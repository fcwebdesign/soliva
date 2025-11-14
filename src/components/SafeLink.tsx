"use client";
import { Link, LinkProps } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback } from "react";
import { isTransitionInProgress, startTransition, endTransition } from "@/utils/transitionLock";

/**
 * Wrapper sécurisé pour les Link de next-view-transitions
 * Empêche les transitions multiples en vérifiant le verrouillage global
 */
export default function SafeLink({ href, onClick, ...props }: LinkProps) {
  const router = useTransitionRouter();

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si une transition est déjà en cours, empêcher le clic
    if (isTransitionInProgress()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Vérifier si c'est un lien interne
    const isInternal = href.startsWith("/") || href.startsWith("#");
    const withMod = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

    // Pour les liens internes sans modificateur, utiliser le verrouillage
    if (isInternal && !withMod && !href.startsWith("#")) {
      // Démarrer la transition avant le clic
      if (!startTransition()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Appeler le onClick original s'il existe
      onClick?.(e);

      // Déverrouiller après un délai pour laisser la transition se terminer
      // Le Link de next-view-transitions gère la transition, on déverrouille après
      setTimeout(() => {
        endTransition();
      }, 2000); // Délai basé sur la durée moyenne des transitions
    } else {
      // Pour les liens externes ou avec modificateur, laisser passer
      onClick?.(e);
    }
  }, [href, onClick]);

  return <Link href={href} onClick={handleClick} {...props} />;
}

