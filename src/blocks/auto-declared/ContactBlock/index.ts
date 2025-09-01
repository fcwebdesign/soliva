import { registerAutoBlock } from '../registry';
import ContactBlock from './component';
import ContactBlockEditor from './editor';

registerAutoBlock({
  type: 'contact',
  component: ContactBlock,
  editor: ContactBlockEditor,
  defaultData: {
    title: '',
    ctaText: '',
    ctaLink: '',
    theme: 'auto'
  }
});
