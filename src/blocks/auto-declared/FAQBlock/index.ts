import { registerAutoBlock } from '../registry';
import FAQBlock from './component';
import FAQBlockEditor from './editor';

registerAutoBlock({
  type: 'faq',
  component: FAQBlock,
  editor: FAQBlockEditor,
  defaultData: {
    items: [],
    theme: 'auto'
  }
});

