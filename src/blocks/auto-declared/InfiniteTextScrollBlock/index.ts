import { registerAutoBlock } from '../registry';
import InfiniteTextScrollBlock from './component';
import InfiniteTextScrollEditor from './editor';

registerAutoBlock({
  type: 'infinite-text-scroll',
  label: 'Texte infini défilant',
  icon: '♾️',
  category: 'interactive',
  component: InfiniteTextScrollBlock,
  editor: InfiniteTextScrollEditor,
  description: 'Texte qui défile horizontalement de manière infinie, direction contrôlée par le scroll',
  defaultData: {
    text: 'Freelance Developer -',
    speed: 50,
    size: 'normal',
    position: 'bottom',
    positionOffset: 0,
    color: 'auto', // Auto utilise la palette
    theme: 'auto',
  },
});
