import { registerAutoBlock } from '../registry';
import H2Block from './component';
import H2BlockEditor from './editor';

registerAutoBlock({
  type: 'h2',
  component: H2Block,
  editor: H2BlockEditor,
  defaultData: {
    content: ''
  }
});
