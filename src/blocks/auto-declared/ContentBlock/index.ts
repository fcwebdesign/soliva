import { registerAutoBlock } from '../registry';
import ContentBlock from './component';
import ContentBlockEditor from './editor';

registerAutoBlock({
  type: 'content',
  component: ContentBlock,
  editor: ContentBlockEditor,
  defaultData: {
    content: ''
  }
});
