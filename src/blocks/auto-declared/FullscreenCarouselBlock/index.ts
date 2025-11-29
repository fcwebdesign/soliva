import { registerAutoBlock } from '../registry';
import FullscreenCarouselBlock from './component';
import FullscreenCarouselEditor from './editor';

registerAutoBlock({
  type: 'fullscreen-carousel',
  label: 'Carousel plein écran',
  icon: '🖼️',
  category: 'media',
  component: FullscreenCarouselBlock,
  editor: FullscreenCarouselEditor,
  description: 'Carousel d’images bord à bord, avec drag souris et flèches',
  defaultData: {
    title: 'More on this campaign',
    images: [
      { src: 'https://images.unsplash.com/photo-1503000387592-9c1a9d0b3756?auto=format&fit=crop&w=1200&q=80', alt: 'Image 1' },
      { src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', alt: 'Image 2' },
      { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', alt: 'Image 3' },
      { src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80', alt: 'Image 4' },
    ],
    theme: 'auto',
    gap: 'medium',
    fullscreen: false,
  },
});
