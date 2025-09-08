import { registerAutoBlock } from '../registry';
import ThreeColumnsBlock from './component';
import ThreeColumnsBlockEditor from './editor';

registerAutoBlock({
  type: 'three-columns',
  component: ThreeColumnsBlock,
  editor: ThreeColumnsBlockEditor,
  defaultData: {
    leftColumn: [],
    middleColumn: [],
    rightColumn: [],
    layout: 'left-middle-right',
    gap: 'medium',
    alignment: 'top',
    theme: 'auto'
  }
});
