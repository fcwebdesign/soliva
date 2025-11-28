import { registerAutoBlock } from '../registry';
import TwoImagesBlock from './component';
import TwoImagesBlockEditor from './editor';

registerAutoBlock({
  type: 'two-images',
  component: TwoImagesBlock,
  editor: TwoImagesBlockEditor,
  label: 'Deux Images',
  icon: '🖼️🖼️',
  category: 'media',
  description: 'Deux images côte à côte : petite à gauche, grande à droite',
  defaultData: {
    id: '',
    type: 'two-images',
    reversed: false,
    leftImage: {
      aspectRatio: 'auto',
      alignHorizontal: 'left',
      alignVertical: 'center',
    },
    rightImage: {
      aspectRatio: 'auto',
      alignHorizontal: 'center',
      alignVertical: 'center',
    },
    theme: 'auto',
  }
});

