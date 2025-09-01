import type { BlockComponent } from './types';

// Composants par défaut
import H2 from './defaults/H2';
import H3 from './defaults/H3';
import Content from './defaults/Content';
import Image from './defaults/Image';
import Cta from './defaults/Cta';
import Contact from './defaults/Contact';
import About from './defaults/About';
import Projects from './defaults/Projects';
import Logos from './defaults/Logos';
import TwoColumns from './defaults/TwoColumns';

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
  contact: Contact as BlockComponent,
  about: About as BlockComponent,
  'projects': Projects as BlockComponent,
  'logos': Logos as BlockComponent,
  'two-columns': TwoColumns as BlockComponent,
};

export const registries: Record<string, BlockRegistry> = {
  default: defaultRegistry,
  'minimaliste-premium': {
    ...defaultRegistry,
    h2: H2Min as BlockComponent,
    h3: H3Min as BlockComponent,
    content: ContentMin as BlockComponent,
    image: ImageMin as BlockComponent,
    contact: Contact as BlockComponent,
  },
};
