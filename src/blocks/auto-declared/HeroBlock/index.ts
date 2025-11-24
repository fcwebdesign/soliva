import { registerAutoBlock } from '../registry';
import HeroBlock from './component';
import HeroBlockEditor from './editor';

registerAutoBlock({
  type: 'hero',
  component: HeroBlock,
  editor: HeroBlockEditor,
  label: 'Hero',
  icon: '🌅',
  category: 'content',
  description: 'Hero éditable (titre, sous-titre, CTA, image de fond)',
  defaultData: {
    eyebrow: '',
    title: 'Titre principal',
    subtitle: 'Sous-titre ou description du hero.',
    ctaLabel: 'Découvrir',
    ctaHref: '#',
    align: 'left',
    theme: 'auto',
    backgroundImage: {
      src: '',
      alt: ''
    }
  }
});
