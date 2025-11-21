import { registerAutoBlock } from '../registry';
import ContactBlock from './component';
import ContactBlockEditor from './editor';

registerAutoBlock({
  type: 'contact',
  component: ContactBlock,
  editor: ContactBlockEditor,
  label: 'Contact',
  icon: '✉️',
  category: 'content',
  description: 'Bloc CTA contact',
  defaultData: {
    title: '',
    ctaText: '',
    ctaLink: '',
    theme: 'auto'
  }
});
