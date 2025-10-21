// Registry pour la compatibilité avec le système de templates
// Ce fichier est minimal et redirige vers les blocs auto-declared quand possible

import type { BlockComponent } from './types';

// Composants par défaut (legacy)
import Image from './defaults/Image';

// Minimaliste (templates)
import ContentMin from '../templates/minimaliste-premium/blocks/Content';
import ImageMin from '../templates/minimaliste-premium/blocks/Image';

export type BlockRegistry = Record<string, BlockComponent>;

export const defaultRegistry: BlockRegistry = {
  image: Image as BlockComponent,
};

export const registries: Record<string, BlockRegistry> = {
  default: defaultRegistry,
  'minimaliste-premium': {
    ...defaultRegistry,
    content: ContentMin as BlockComponent,
    image: ImageMin as BlockComponent,
  },
};

