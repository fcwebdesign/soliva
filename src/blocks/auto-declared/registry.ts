// Système de blocs auto-déclarés pour votre admin existant
import React from 'react';

// Interface pour un bloc auto-déclaré
export interface AutoDeclaredBlock {
  type: string;
  label?: string;
  icon?: string;
  component: React.ComponentType<any>;
  editor?: React.ComponentType<any>;
  defaultData: any;
}

// Registre global des blocs auto-déclarés
const autoDeclaredBlocks = new Map<string, AutoDeclaredBlock>();

// Fonction pour enregistrer un bloc auto-déclaré
export function registerAutoBlock(block: AutoDeclaredBlock): AutoDeclaredBlock {
  autoDeclaredBlocks.set(block.type, block);
  console.log(`✅ Bloc auto-déclaré enregistré: ${block.type} (${block.label})`);
  return block;
}

// Fonction pour récupérer tous les blocs auto-déclarés
export function getAutoDeclaredBlocks(): AutoDeclaredBlock[] {
  return Array.from(autoDeclaredBlocks.values());
}

// Fonction pour récupérer un bloc spécifique
export function getAutoDeclaredBlock(type: string): AutoDeclaredBlock | undefined {
  return autoDeclaredBlocks.get(type);
}

// Fonction pour créer une instance par défaut d'un bloc
export function createAutoBlockInstance(type: string, id?: string): any {
  const block = getAutoDeclaredBlock(type);
  if (!block) {
    throw new Error(`Bloc auto-déclaré "${type}" non trouvé`);
  }
  
  return {
    ...block.defaultData,
    id: id || `${type}-${Date.now()}`,
    type
  };
}

// Fonction pour obtenir la liste des types disponibles (pour votre admin existant)
export function getAvailableBlockTypes(): string[] {
  return Array.from(autoDeclaredBlocks.keys());
}

// Fonction pour obtenir les métadonnées des blocs (pour l'interface d'ajout)
export function getBlockMetadata(): Array<{type: string, label: string, icon: string}> {
  return Array.from(autoDeclaredBlocks.values()).map(block => ({
    type: block.type,
    label: block.label,
    icon: block.icon
  }));
}
