import { registerAutoBlock } from '../registry';
import ImageBlock from './component';
import ImageBlockEditor from './editor';

// Enregistrer le bloc image scalable (même type que l'original)
registerAutoBlock({
  type: 'image', // Même type que l'original !
  component: ImageBlock,
  editor: ImageBlockEditor,
  defaultData: {
    id: '',
    type: 'image',
    image: {
      src: '',
      alt: ''
    }
  }
});
