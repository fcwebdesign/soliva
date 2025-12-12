import { registerAutoBlock } from '../registry';
import HeroSimpleBlock from './component';
import HeroSimpleEditor from './editor';

registerAutoBlock({
  type: 'hero-simple',
  label: 'Hero fixé - Simple',
  icon: '🖼️',
  category: 'layout',
  component: HeroSimpleBlock,
  editor: HeroSimpleEditor,
  description: 'Hero fixé : image fullscreen avec titre et sous-titre. Toujours en première position.',
  defaultData: {
    supertitle: '',
    title: 'Titre hero',
    subtitle: 'Sous-titre hero',
    buttonText: '',
    buttonLink: '',
    backgroundImage: '',
    contentPosition: 'center',
    contentAlignment: 'center',
    theme: 'auto',
    transparentHeader: true,
    parallax: {
      enabled: false,
      speed: 0.25,
    },
  },
});
