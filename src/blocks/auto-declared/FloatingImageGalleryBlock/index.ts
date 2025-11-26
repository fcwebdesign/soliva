import { registerAutoBlock } from '../registry';
import FloatingImageGalleryBlock from './component';
import FloatingImageGalleryEditor from './editor';

registerAutoBlock({
  type: 'floating-gallery',
  label: 'Floating Gallery',
  icon: '🪁',
  category: 'media',
  description: 'Images qui suivent subtilement le curseur avec un effet flottant.',
  component: FloatingImageGalleryBlock,
  editor: FloatingImageGalleryEditor,
  defaultData: {
    title: 'Floating Image Gallery',
    subtitle: 'Les images suivent subtilement votre curseur.',
    intensity: 50,
    theme: 'auto',
    images: [],
  },
});
