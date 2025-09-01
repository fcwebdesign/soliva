import type { BlockComponent } from './types';

// Composants par défaut
import Image from './defaults/Image';
// import TwoColumns from './defaults/TwoColumns'; // SUPPRIMÉ

// Minimaliste
import ContentMin from '../templates/minimaliste-premium/blocks/Content';
import ImageMin from '../templates/minimaliste-premium/blocks/Image';

export type BlockRegistry = Record<string, BlockComponent>;

export const defaultRegistry: BlockRegistry = {
  image: Image as BlockComponent,
  // 'two-columns': TwoColumns as BlockComponent, // SUPPRIMÉ
};

export const registries: Record<string, BlockRegistry> = {
  default: defaultRegistry,
  'minimaliste-premium': {
    ...defaultRegistry,
    content: ContentMin as BlockComponent,
    image: ImageMin as BlockComponent,
  },
};
