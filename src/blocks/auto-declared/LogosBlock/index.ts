import { registerAutoBlock } from '../registry';
import LogosBlock from './component';
import LogosBlockEditor from './editor';

registerAutoBlock({
  type: 'logos',
  component: LogosBlock,
  editor: LogosBlockEditor,
  label: 'Logos / clients',
  icon: '🏢',
  category: 'media',
  description: 'Grille de logos',
  defaultData: {
    title: 'NOS CLIENTS',
    theme: 'auto',
    logos: []
  }
});
