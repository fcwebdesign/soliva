"use client";
import { Link } from "next-view-transitions";
import type { LinkProps } from "next/link";

/**
 * Wrapper simple pour les Link de next-view-transitions
 * 
 * STRATÉGIE ULTRA-SIMPLIFIÉE :
 * - Laisser next-view-transitions gérer TOUT (y compris la prévention des doubles clics)
 * - L'interception globale dans transitionLock.ts gère déjà les transitions multiples
 * - Pas de vérification supplémentaire qui pourrait créer de la latence
 */
export default function SafeLink({ href, onClick, ...props }: LinkProps) {
  return <Link href={href} onClick={onClick} {...props} />;
}

