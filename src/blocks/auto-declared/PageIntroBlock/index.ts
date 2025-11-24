import { registerAutoBlock } from '../registry';
import PageIntroBlock from './component';
import PageIntroBlockEditor from './editor';

registerAutoBlock({
  type: 'page-intro',
  component: PageIntroBlock,
  editor: PageIntroBlockEditor,
  label: 'Intro Page',
  icon: '📄',
  category: 'content',
  description: 'Titre et description de la page (lit automatiquement les métadonnées)',
  defaultData: {
    title: '',
    description: '',
    layout: 'default'
  }
});

