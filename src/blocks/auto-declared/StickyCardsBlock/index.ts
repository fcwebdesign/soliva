import { registerAutoBlock } from '../registry';
import StickyCardsBlock from './component';
import StickyCardsEditor from './editor';

registerAutoBlock({
  type: 'sticky-cards',
  label: 'Sticky Cards',
  icon: '🃏',
  category: 'interactive',
  description: 'Cartes superposées avec effet sticky et animations de scale/rotation.',
  component: StickyCardsBlock,
  editor: StickyCardsEditor,
  defaultData: {
    theme: 'auto',
    cards: [
      {
        id: 'card-1',
        index: '01',
        title: 'Modularity',
        image: { src: '/sticky-cards/card_1.jpg', alt: 'Modularity' },
        copyTitle: '(About the state)',
        description: 'Every element is built to snap into place. We design modular systems where clarity, structure, and reuse come first—no clutter, no excess.',
      },
      {
        id: 'card-2',
        index: '02',
        title: 'Materials',
        image: { src: '/sticky-cards/card_2.jpg', alt: 'Materials' },
        copyTitle: '(About the state)',
        description: 'From soft gradients to hard edges, our design language draws from real-world materials—elevating interfaces that feel both digital and tangible.',
      },
      {
        id: 'card-3',
        index: '03',
        title: 'Precision',
        image: { src: '/sticky-cards/card_3.jpg', alt: 'Precision' },
        copyTitle: '(About the state)',
        description: 'Details matter. We work with intention—aligning pixels, calibrating contrast, and obsessing over every edge until it just feels right.',
      },
      {
        id: 'card-4',
        index: '04',
        title: 'Character',
        image: { src: '/sticky-cards/card_4.jpg', alt: 'Character' },
        copyTitle: '(About the state)',
        description: 'Interfaces should have personality. We embed small moments of play and irregularity to bring warmth, charm, and a human feel to the digital.',
      },
    ],
  },
});

