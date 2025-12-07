import { registerAutoBlock } from '../registry';
import ScrollSliderBlock from './component';
import ScrollSliderEditor from './editor';

registerAutoBlock({
  type: 'scroll-slider',
  label: 'Scroll Slider (OVA)',
  icon: '🖼️',
  category: 'interactive',
  description: 'Slider vertical pin + scrub inspiré de la démo OVA (Codegrid).',
  component: ScrollSliderBlock,
  editor: ScrollSliderEditor,
  defaultData: {
    // Minimal fallback : un seul slide pour éviter de précharger 7 items à l'ajout
    slides: [
      {
        title:
          'Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.',
        image: { src: '/blocks/scroll-slider/slider_img_1.jpg', alt: 'Slide 1' },
      },
    ],
  },
});
