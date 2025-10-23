"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Copy, Trash2, EyeOff, Circle, CircleDot } from 'lucide-react';

interface ActionButtonsProps {
  /**
   * Callback pour éditer
   */
  onEdit?: () => void;
  
  /**
   * Callback pour aperçu
   */
  onPreview?: () => void;
  
  /**
   * Callback pour dupliquer
   */
  onDuplicate?: () => void;
  
  /**
   * Callback pour supprimer
   */
  onDelete?: () => void;
  
  /**
   * Taille des boutons
   * @default "sm"
   */
  size?: 'sm' | 'default' | 'lg';
  
  /**
   * Désactiver tous les boutons
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Labels personnalisés pour les boutons
   */
  labels?: {
    edit?: string;
    preview?: string;
    duplicate?: string;
    delete?: string;
  };
  /** Désactiver uniquement le bouton Supprimer */
  disableDelete?: boolean;
  /** Icône du bouton Supprimer (par défaut: trash) */
  deleteIcon?: 'trash' | 'eye-off' | 'circle' | 'circle-dot' | 'none';
  /** Classes pour styler le bouton Supprimer (ex: succès) */
  deleteClassName?: string;
  
  /**
   * Masquer les icônes
   * @default false
   */
  hideIcons?: boolean;
  
  /**
   * Mode compact (icônes seules sans texte)
   * @default false
   */
  compact?: boolean;
}

/**
 * Composant standardisé pour les actions communes (Éditer, Aperçu, Dupliquer, Supprimer)
 * 
 * Utilise les variants shadcn/ui pour une cohérence visuelle parfaite.
 * Affiche uniquement les boutons dont les callbacks sont fournis.
 * 
 * @example
 * ```tsx
 * <ActionButtons
 *   onEdit={() => router.push('/admin/edit')}
 *   onPreview={() => window.open('/preview')}
 *   onDuplicate={() => handleDuplicate()}
 *   onDelete={() => handleDelete()}
 *   size="sm"
 * />
 * ```
 * 
 * @example Mode compact
 * ```tsx
 * <ActionButtons
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   compact
 * />
 * ```
 */
export default function ActionButtons({
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  size = 'sm',
  disabled = false,
  disableDelete = false,
  deleteIcon = 'trash',
  deleteClassName,
  labels,
  hideIcons = false,
  compact = false
}: ActionButtonsProps) {
  
  // Labels par défaut
  const defaultLabels = {
    edit: 'Éditer',
    preview: 'Aperçu',
    duplicate: 'Dupliquer',
    delete: 'Supprimer'
  };
  
  const finalLabels = { ...defaultLabels, ...labels };
  
  return (
    <div className="flex space-x-2">
      {/* Bouton Éditer */}
      {onEdit && (
        <Button
          onClick={onEdit}
          size={size}
          disabled={disabled}
          variant="ghost"
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          title={finalLabels.edit}
        >
          {!hideIcons && <Edit className={compact ? "w-4 h-4" : "w-4 h-4 mr-1"} />}
          {!compact && finalLabels.edit}
        </Button>
      )}
      
      {/* Bouton Aperçu */}
      {onPreview && (
        <Button
          onClick={onPreview}
          size={size}
          disabled={disabled}
          variant="ghost"
          className="bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-800"
          title={finalLabels.preview}
        >
          {!hideIcons && <Eye className={compact ? "w-4 h-4" : "w-4 h-4 mr-1"} />}
          {!compact && finalLabels.preview}
        </Button>
      )}
      
      {/* Bouton Dupliquer */}
      {onDuplicate && (
        <Button
          onClick={onDuplicate}
          size={size}
          disabled={disabled}
          variant="ghost"
          className="bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
          title={finalLabels.duplicate}
        >
          {!hideIcons && <Copy className={compact ? "w-4 h-4" : "w-4 h-4 mr-1"} />}
          {!compact && finalLabels.duplicate}
        </Button>
      )}
      
      {/* Bouton Supprimer */}
      {onDelete && (
        <Button
          onClick={onDelete}
          size={size}
          disabled={disabled || disableDelete}
          variant="ghost"
          className={deleteClassName ?? 'bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800'}
          title={finalLabels.delete}
        >
          {!hideIcons && deleteIcon !== 'none' && (
            deleteIcon === 'eye-off' ? (
              <EyeOff className={compact ? 'w-4 h-4' : 'w-4 h-4 mr-1'} />
            ) : deleteIcon === 'circle' ? (
              <Circle className={compact ? 'w-4 h-4' : 'w-4 h-4 mr-1'} />
            ) : deleteIcon === 'circle-dot' ? (
              <CircleDot className={compact ? 'w-4 h-4' : 'w-4 h-4 mr-1'} />
            ) : (
              <Trash2 className={compact ? 'w-4 h-4' : 'w-4 h-4 mr-1'} />
            )
          )}
          {!compact && finalLabels.delete}
        </Button>
      )}
    </div>
  );
}
