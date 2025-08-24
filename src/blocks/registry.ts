import type { BlockComponent } from './types';

// Composants par défaut
import H2 from './defaults/H2';
import H3 from './defaults/H3';
import Content from './defaults/Content';
import Image from './defaults/Image';
import Cta from './defaults/Cta';
import About from './defaults/About';
import ServiceOffering from './defaults/ServiceOffering';
import ServiceOfferings from './defaults/ServiceOfferings';

// Minimaliste
import H2Min from '../templates/minimaliste-premium/blocks/H2';
import H3Min from '../templates/minimaliste-premium/blocks/H3';
import ContentMin from '../templates/minimaliste-premium/blocks/Content';
import ImageMin from '../templates/minimaliste-premium/blocks/Image';

export type BlockRegistry = Record<string, BlockComponent>;

export const defaultRegistry: BlockRegistry = {
  h2: H2 as BlockComponent,
  h3: H3 as BlockComponent,
  content: Content as BlockComponent,
  image: Image as BlockComponent,
  cta: Cta as BlockComponent,
  about: About as BlockComponent,
  'service-offering': ServiceOffering as BlockComponent,
  'service-offerings': ServiceOfferings as BlockComponent,
};

export const registries: Record<string, BlockRegistry> = {
  default: defaultRegistry,
  'minimaliste-premium': {
    ...defaultRegistry,
    h2: H2Min as BlockComponent,
    h3: H3Min as BlockComponent,
    content: ContentMin as BlockComponent,
    image: ImageMin as BlockComponent,
  },
}; 