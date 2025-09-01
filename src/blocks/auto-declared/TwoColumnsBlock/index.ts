import { registerAutoBlock } from '../registry';
import TwoColumnsBlock from './component';
import TwoColumnsBlockEditor from './editor';

registerAutoBlock({
  type: 'two-columns',
  component: TwoColumnsBlock,
  editor: TwoColumnsBlockEditor,
  defaultData: {
    leftColumn: [],
    rightColumn: [],
    layout: 'left-right',
    gap: 'medium',
    alignment: 'top',
    theme: 'auto'
  }
});
