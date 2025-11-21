import { registerAutoBlock } from '../registry';
import FourColumnsBlock from './component';
import FourColumnsBlockEditor from './editor';

registerAutoBlock({
  type: 'four-columns',
  component: FourColumnsBlock,
  editor: FourColumnsBlockEditor,
  label: 'Quatre colonnes',
  icon: '↔️',
  category: 'layout',
  description: 'Disposition 4 colonnes',
  defaultData: {
    title: '',
    column1: [],
    column2: [],
    column3: [],
    column4: [],
    layout: 'four-columns',
    gap: 'medium',
    alignment: 'top',
    theme: 'auto'
  }
});
