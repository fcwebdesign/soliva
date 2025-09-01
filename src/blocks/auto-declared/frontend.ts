import { getAutoDeclaredBlocks } from './registry';

// Fonction pour obtenir les composants de rendu des blocs auto-déclarés
export function getAutoDeclaredComponents() {
  const autoBlocks = getAutoDeclaredBlocks();
  const components: Record<string, any> = {};
  
  autoBlocks.forEach(block => {
    components[block.type] = block.component;
  });
  
  return components;
}
