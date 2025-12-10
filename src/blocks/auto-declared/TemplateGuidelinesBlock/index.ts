import { registerAutoBlock } from '../registry';
import TemplateGuidelinesBlock from './component';
import TemplateGuidelinesEditor from './editor';

registerAutoBlock({
  type: 'template-guidelines',
  label: 'Template Guidelines',
  icon: '📐',
  category: 'content',
  description: 'Bloc de référence pour tester toutes les options admin (titre, image, CTA, items, thème).',
  component: TemplateGuidelinesBlock,
  editor: TemplateGuidelinesEditor,
  defaultData: {
    theme: 'auto',
    layout: 'split',
    title: '',
    subtitle: '',
    description: '',
    ctaText: '',
    ctaHref: '',
    image: { src: '', alt: 'Placeholder', aspectRatio: '16:9' },
  },
});
