import { registerAutoBlock } from '../registry';
import H3Block from './component';
import H3BlockEditor from './editor';

registerAutoBlock({
  type: 'h3',
  component: H3Block,
  editor: H3BlockEditor,
  label: 'Titre H3',
  icon: '🔡',
  category: 'text',
  description: 'Sous-titre ou accroche',
  defaultData: {
    content: ''
  }
});
