import { registerAutoBlock } from '../registry';
import ServicesSpotlightBlock from './component';
import ServicesSpotlightEditor from './editor';

registerAutoBlock({
  type: 'services-spotlight',
  label: 'Services Spotlight (Camera Work)',
  icon: '🎥',
  category: 'interactive',
  description: 'Liste de services avec image révélée et indicateur mobile inspiré de Negative Films.',
  component: ServicesSpotlightBlock,
  editor: ServicesSpotlightEditor,
  defaultData: {
    kicker: '[ Discover ]',
    title: 'Inside The Studio',
    showIndicator: true,
    items: [
      { title: 'Camera Work', indicator: '[ Framing ]', image: { src: '/blocks/services-spotlight/spotlight-1.jpg', alt: 'Camera work' } },
      { title: 'Visual Direction', indicator: '[ Vision ]', image: { src: '/blocks/services-spotlight/spotlight-2.jpg', alt: 'Visual direction' } },
      { title: 'Sound Design', indicator: '[ Resonance ]', image: { src: '/blocks/services-spotlight/spotlight-3.jpg', alt: 'Sound design' } },
      { title: 'Film Editing', indicator: '[ Sequence ]', image: { src: '/blocks/services-spotlight/spotlight-4.jpg', alt: 'Film editing' } },
    ],
  },
});
