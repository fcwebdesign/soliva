import { registerAutoBlock } from '../registry';
import HeroFloatingGalleryBlock from './HeroFloatingGalleryBlock';
import HeroFloatingGalleryEditor from './HeroFloatingGalleryEditor';

registerAutoBlock({
  type: 'hero-floating-gallery',
  label: 'Hero Floating Gallery',
  icon: '🪁',
  category: 'media',
  description: 'Hero avec images flottantes qui suivent le curseur. Fullscreen bord à bord.',
  component: HeroFloatingGalleryBlock,
  editor: HeroFloatingGalleryEditor,
  defaultData: {
    title: 'Hero Floating Gallery',
    subtitle: 'Les images suivent subtilement votre curseur.',
    intensity: 50,
    theme: 'auto',
    transparentHeader: false,
    images: [],
  },
});
