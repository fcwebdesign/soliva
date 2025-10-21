"use client";
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'published' | 'draft' | 'archived' | 'pending';

interface StatusBadgeProps {
  /**
   * Type de statut à afficher
   */
  status: StatusType;
  
  /**
   * Label personnalisé (sinon utilise le label par défaut du statut)
   */
  label?: string;
  
  /**
   * Taille du badge
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg';
  
  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

/**
 * Badge de statut standardisé pour afficher les états (publié, brouillon, etc.)
 * 
 * Utilise des couleurs cohérentes selon le statut :
 * - published: vert (succès)
 * - draft: jaune (attention)
 * - archived: gris (neutre)
 * - pending: bleu (info)
 * 
 * @example
 * ```tsx
 * <StatusBadge status="published" />
 * <StatusBadge status="draft" label="En cours" />
 * <StatusBadge status="archived" size="sm" />
 * ```
 */
export default function StatusBadge({
  status,
  label,
  size = 'default',
  className
}: StatusBadgeProps) {
  
  // Configuration des statuts
  const statusConfig: Record<StatusType, { label: string; className: string }> = {
    published: {
      label: 'Publié',
      className: 'bg-green-100 text-green-800 hover:bg-green-200'
    },
    draft: {
      label: 'Brouillon',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    },
    archived: {
      label: 'Archivé',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    },
    pending: {
      label: 'En attente',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    }
  };
  
  const config = statusConfig[status];
  const displayLabel = label || config.label;
  
  // Classes de taille
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1'
  };
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        config.className,
        sizeClasses[size],
        'font-medium border-0',
        className
      )}
    >
      {displayLabel}
    </Badge>
  );
}

