import { registerAutoBlock } from '../registry';
import TwoColumns13Block from './component';
import TwoColumns13BlockEditor from './editor';

registerAutoBlock({
  type: 'two-columns-13',
  component: TwoColumns13Block,
  editor: TwoColumns13BlockEditor,
  label: 'Deux colonnes 1/3 - 2/3',
  icon: '↔️',
  category: 'layout',
  description: 'Disposition 2 colonnes avec ratio 1/3 - 2/3',
  defaultData: {
    title: '',
    leftColumn: [],
    rightColumn: [],
    gap: 'medium',
    alignment: 'top',
    theme: 'auto'
  }
});

