import { registerAutoBlock } from '../registry';
import ContentBlock from './component';
import ContentBlockEditor from './editor';

registerAutoBlock({
  type: 'content',
  component: ContentBlock,
  editor: ContentBlockEditor,
  label: 'Texte riche',
  icon: '📝',
  category: 'text',
  description: 'Paragraphe ou bloc HTML',
  defaultData: {
    content: ''
  }
});
