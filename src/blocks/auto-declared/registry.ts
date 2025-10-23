// Système de blocs auto-déclarés HMR-safe
import React from 'react';
import { z } from 'zod';

// Types améliorés
export type BlockType = string;

export interface BlockBase<TData = unknown> {
  id: string;
  type: BlockType;
  data: TData;
}

export interface BlockModule<TData = unknown> {
  type: BlockType;
  component: React.ComponentType<{ data: TData }>;
  editor: React.ComponentType<{ data: TData; onChange: (next: TData) => void }>;
  schema?: z.ZodType<TData>;
  defaultData: TData; // Pas d'id/type ici
  label?: string;
  icon?: string;
}

// Registre global HMR-safe
declare global {
  // eslint-disable-next-line no-var
  var __AUTO_BLOCKS__: Map<string, BlockModule<any>> | undefined;
}

const REGISTRY: Map<string, BlockModule<any>> =
  globalThis.__AUTO_BLOCKS__ ?? (globalThis.__AUTO_BLOCKS__ = new Map());

// Exposer le registre globalement côté client
if (typeof window !== 'undefined') {
  (window as any).__AUTO_BLOCKS__ = REGISTRY;
  (window as any).getAutoDeclaredBlock = getAutoDeclaredBlock;
  (window as any).getBlockMetadata = getBlockMetadata;
  (window as any).getAvailableBlockTypes = getAvailableBlockTypes;
}

// Fonction d'enregistrement améliorée
export function registerAutoBlock<T>(mod: BlockModule<T>) {
  if (!mod?.type) throw new Error('registerAutoBlock: type manquant');
  
  const exists = REGISTRY.get(mod.type);
  if (exists && process.env.NODE_ENV !== 'production') {
    console.warn(`[blocks] remplacement du bloc '${mod.type}' (HMR)`);
  }
  
  REGISTRY.set(mod.type, mod);
}

// Fonctions de récupération
export function getAutoDeclaredBlock(type: string) {
  return REGISTRY.get(type);
}

export function getAllAutoDeclared() {
  return Array.from(REGISTRY.values());
}

// Fonction pour créer une instance par défaut d'un bloc
export function createAutoBlockInstance(type: string, id?: string): any {
  const block = getAutoDeclaredBlock(type);
  if (!block) {
    throw new Error(`Bloc auto-déclaré "${type}" non trouvé`);
  }
  
  return {
    id: id || `${type}-${Date.now()}`,
    type,
    data: block.defaultData
  };
}

// Fonction pour obtenir la liste des types disponibles
export function getAvailableBlockTypes(): string[] {
  return Array.from(REGISTRY.keys());
}

// Fonction pour obtenir les métadonnées des blocs
export function getBlockMetadata(): Array<{type: string, label: string, icon: string}> {
  return Array.from(REGISTRY.values()).map(block => ({
    type: block.type,
    label: block.label || block.type,
    icon: block.icon || '📦'
  }));
}

// Alias pour compatibilité
export const getAutoDeclaredBlocks = getAllAutoDeclared;
