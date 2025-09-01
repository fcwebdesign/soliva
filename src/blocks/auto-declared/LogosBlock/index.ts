import { registerAutoBlock } from '../registry';
import LogosBlock from './component';
import LogosBlockEditor from './editor';

registerAutoBlock({
  type: 'logos',
  component: LogosBlock,
  editor: LogosBlockEditor,
  defaultData: {
    title: 'NOS CLIENTS',
    theme: 'auto',
    logos: []
  }
});
