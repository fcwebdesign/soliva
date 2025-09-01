import { registerAutoBlock } from '../registry';
import ServicesBlock from './component';
import ServicesBlockEditor from './editor';

// Enregistrer le bloc services scalable (même type que l'original)
registerAutoBlock({
  type: 'services',
  component: ServicesBlock,
  editor: ServicesBlockEditor,
  defaultData: {
    id: '',
    type: 'services',
    title: 'OUR CORE OFFERINGS',
    theme: 'auto',
    offerings: []
  }
});
