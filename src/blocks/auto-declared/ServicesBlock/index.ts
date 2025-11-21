import { registerAutoBlock } from '../registry';
import ServicesBlock from './component';
import ServicesBlockEditor from './editor';

// Enregistrer le bloc services scalable (même type que l'original)
registerAutoBlock({
  type: 'services',
  component: ServicesBlock,
  editor: ServicesBlockEditor,
  label: 'Services',
  icon: '🛠️',
  category: 'content',
  description: 'Liste de services avec titre/texte',
  defaultData: {
    title: 'OUR CORE OFFERINGS',
    theme: 'auto',
    offerings: []
  }
});
