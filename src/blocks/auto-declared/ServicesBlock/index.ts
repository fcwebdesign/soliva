import { registerAutoBlock } from '../registry';
import ServicesBlock from './component';
import ServicesBlockEditor from './editor';

// Enregistrer le bloc services scalable (même type que l'original)
registerAutoBlock({
  type: 'services',
  component: ServicesBlock,
  editor: ServicesBlockEditor,
  defaultData: {
    title: 'OUR CORE OFFERINGS',
    theme: 'auto',
    offerings: []
  }
});
