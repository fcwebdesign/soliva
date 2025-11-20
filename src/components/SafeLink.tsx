"use client";
import { Link } from "next-view-transitions";
import type { LinkProps } from "next/link";
import { useCallback } from "react";
import { isTransitionInProgress } from "@/utils/transitionLock";

/**
 * Wrapper sécurisé pour les Link de next-view-transitions
 * 
 * STRATÉGIE SIMPLIFIÉE :
 * - Laisser next-view-transitions gérer TOUT
 * - Empêcher uniquement les clics si une transition est en cours
 * - Pas de prévention de clics complexe, pas de délais
 */
export default function SafeLink({ href, onClick, ...props }: LinkProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // ✅ SIMPLIFICATION : Empêcher uniquement si une transition est en cours
    // L'interception globale de startViewTransition() gère le reste
    if (isTransitionInProgress()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Appeler le onClick original s'il existe
    onClick?.(e);
  }, [onClick]);

  return <Link href={href} onClick={handleClick} {...props} />;
}

