// Registry pour la compatibilité avec le système de templates
// Ce fichier est minimal et redirige vers les blocs auto-declared quand possible

import type { BlockComponent } from './types';

// Composants par défaut (legacy)
// Note: image est maintenant géré par le système auto-déclaré (ImageBlock)
// import Image from './defaults/Image';

// Starter template
import ServicesStarter from '../templates/starter/blocks/Services';

export type BlockRegistry = Record<string, BlockComponent>;

export const defaultRegistry: BlockRegistry = {
  // image retiré : utilise maintenant le système auto-déclaré ImageBlock
  // image: Image as BlockComponent,
};

export const registries: Record<string, BlockRegistry> = {
  default: defaultRegistry,
  'starter': {
    ...defaultRegistry,
    services: ServicesStarter as BlockComponent,
  },
};
