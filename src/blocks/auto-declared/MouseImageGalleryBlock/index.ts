import { registerAutoBlock } from '../registry';
import MouseImageGalleryBlock from './component';
import MouseImageGalleryEditor from './editor';

registerAutoBlock({
  type: 'mouse-image-gallery',
  label: 'Mouse Image Gallery',
  icon: '🖱️',
  category: 'hero',
  component: MouseImageGalleryBlock,
  editor: MouseImageGalleryEditor,
  description: 'Galerie qui suit la souris (inspirée Olivier Larose)',
  defaultData: {
    title: 'Mouse Image Gallery',
    subtitle: 'Passe la souris pour révéler les visuels.',
    speed: 60,
    theme: 'auto',
    transparentHeader: true,
    images: [],
  },
});
