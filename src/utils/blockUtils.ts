// Système de blocs auto-déclarés scalable
import React from 'react';

// Types de base pour les champs d'édition
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'rich-text'
  | 'image'
  | 'select'
  | 'number'
  | 'toggle'
  | 'array'
  | 'color'
  | 'link';

// Configuration d'un champ d'édition
export interface FieldConfig {
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Pour les select
  min?: number; // Pour les number
  max?: number; // Pour les number
  arrayItemFields?: FieldConfig[]; // Pour les array
  defaultValue?: any;
}

// Métadonnées d'un bloc
export interface BlockMetadata {
  type: string;
  label: string;
  description: string;
  icon: string;
  category: 'content' | 'layout' | 'media' | 'interactive';
  fields: Record<string, FieldConfig>;
  preview?: string; // URL ou base64 d'une preview
}

// Interface pour un bloc auto-déclaré
export interface SelfDeclaringBlock {
  metadata: BlockMetadata;
  component: React.ComponentType<any>;
  createDefault: () => any; // Fonction pour créer une instance par défaut
}

// Registre global des blocs auto-déclarés
const blockRegistry = new Map<string, SelfDeclaringBlock>();

// Fonction pour enregistrer un bloc
export function registerBlock(block: SelfDeclaringBlock) {
  blockRegistry.set(block.metadata.type, block);
}

// Fonction pour récupérer tous les blocs disponibles
export function getAvailableBlocks(): SelfDeclaringBlock[] {
  return Array.from(blockRegistry.values());
}

// Fonction pour récupérer un bloc spécifique
export function getBlock(type: string): SelfDeclaringBlock | undefined {
  return blockRegistry.get(type);
}

// Fonction pour récupérer les métadonnées de tous les blocs
export function getAllBlockMetadata(): BlockMetadata[] {
  return Array.from(blockRegistry.values()).map(block => block.metadata);
}

// Fonction pour créer une instance par défaut d'un bloc
export function createBlockInstance(type: string, id?: string): any {
  const block = getBlock(type);
  if (!block) {
    throw new Error(`Bloc de type "${type}" non trouvé`);
  }
  
  const instance = block.createDefault();
  return {
    ...instance,
    id: id || `${type}-${Date.now()}`,
    type
  };
}
