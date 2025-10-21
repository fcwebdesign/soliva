"use client";
import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Hook pour gérer les dialogues de confirmation de manière standardisée
 * Remplace les confirm() natifs par des AlertDialog shadcn/ui
 * 
 * @example
 * ```tsx
 * const { confirm, ConfirmDialog } = useConfirmDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Supprimer cette page ?',
 *     description: 'Cette action est irréversible.',
 *     variant: 'destructive'
 *   });
 *   
 *   if (confirmed) {
 *     // Supprimer
 *   }
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Supprimer</button>
 *     <ConfirmDialog />
 *   </>
 * );
 * ```
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmConfig>({
    title: '',
    description: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    variant: 'default'
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  /**
   * Ouvre le dialogue de confirmation et retourne une Promise
   */
  const confirm = useCallback((newConfig: ConfirmConfig): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        ...newConfig,
        confirmText: newConfig.confirmText || 'Confirmer',
        cancelText: newConfig.cancelText || 'Annuler',
        variant: newConfig.variant || 'default'
      });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  /**
   * Gère la confirmation
   */
  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  /**
   * Gère l'annulation
   */
  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  /**
   * Composant AlertDialog à inclure dans le JSX
   */
  const ConfirmDialog = useCallback(() => (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {config.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={config.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {config.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ), [isOpen, config, handleConfirm, handleCancel]);

  return {
    confirm,
    ConfirmDialog,
    isOpen
  };
}

