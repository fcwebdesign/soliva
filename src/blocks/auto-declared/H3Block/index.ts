import { registerAutoBlock } from '../registry';
import H3Block from './component';
import H3BlockEditor from './editor';

registerAutoBlock({
  type: 'h3',
  component: H3Block,
  editor: H3BlockEditor,
  defaultData: {
    content: ''
  }
});
