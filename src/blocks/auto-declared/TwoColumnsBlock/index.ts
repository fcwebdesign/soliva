import { registerAutoBlock } from '../registry';
import TwoColumnsBlock from './component';
import TwoColumnsBlockEditor from './editor';

registerAutoBlock({
  type: 'two-columns',
  component: TwoColumnsBlock,
  editor: TwoColumnsBlockEditor,
  label: 'Deux colonnes',
  icon: '↔️',
  category: 'layout',
  description: 'Disposition 2 colonnes configurable',
  defaultData: {
    title: '',
    leftColumn: [],
    rightColumn: [],
    layout: 'left-right',
    gap: 'medium',
    alignment: 'top',
    theme: 'auto'
  }
});
