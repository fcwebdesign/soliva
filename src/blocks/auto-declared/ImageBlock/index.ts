import { registerAutoBlock } from '../registry';
import ImageBlock from './component';
import ImageBlockEditor from './editor';

// Enregistrer le bloc image scalable (même type que l'original)
registerAutoBlock({
  type: 'image', // Même type que l'original !
  component: ImageBlock,
  editor: ImageBlockEditor,
  label: 'Image',
  icon: '🖼️',
  category: 'media',
  description: 'Image pleine largeur',
  defaultData: {
    id: '',
    type: 'image',
    image: {
      src: '',
      alt: ''
    }
  }
});
