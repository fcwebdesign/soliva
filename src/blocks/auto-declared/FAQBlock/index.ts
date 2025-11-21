import { registerAutoBlock } from '../registry';
import FAQBlock from './component';
import FAQBlockEditor from './editor';

registerAutoBlock({
  type: 'faq',
  component: FAQBlock,
  editor: FAQBlockEditor,
  label: 'FAQ',
  icon: '❓',
  category: 'content',
  description: 'Questions/réponses accordéon',
  defaultData: {
    title: '',
    items: [],
    theme: 'auto'
  }
});
