import { registerAutoBlock } from '../registry';
import QuoteBlock from './component';
import QuoteBlockEditor from './editor';

registerAutoBlock({
  type: 'quote',
  component: QuoteBlock,
  editor: QuoteBlockEditor,
  label: 'Citation',
  icon: '💬',
  defaultData: {
    quote: 'Une citation inspirante pour votre contenu...',
    author: 'Nom de l\'auteur',
    role: 'Fonction',
    theme: 'auto'
  }
});