import { registerAutoBlock } from '../registry';
import MouseImageGalleryBlock from './component';
import MouseImageGalleryEditor from './editor';

registerAutoBlock({
  type: 'mouse-image-gallery',
  label: 'Hero fixé - Mouse Image Gallery',
  icon: '🖱️',
  category: 'hero',
  component: MouseImageGalleryBlock,
  editor: MouseImageGalleryEditor,
  description: 'Hero fixé : galerie qui suit la souris (inspirée Olivier Larose). Toujours en première position.',
  defaultData: {
    title: 'Mouse Image Gallery',
    subtitle: 'Passe la souris pour révéler les visuels.',
    speed: 60,
    theme: 'auto',
    transparentHeader: true,
    images: [],
  },
});
