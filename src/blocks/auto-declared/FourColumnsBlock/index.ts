import { registerAutoBlock } from '../registry';
import FourColumnsBlock from './component';
import FourColumnsBlockEditor from './editor';

registerAutoBlock({
  type: 'four-columns',
  component: FourColumnsBlock,
  editor: FourColumnsBlockEditor,
  defaultData: {
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
