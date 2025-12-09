import { registerAutoBlock } from '../registry';
import ServicesSpotlightBlockV2 from './component';
import ServicesSpotlightBlockV2Editor from './editor';

registerAutoBlock({
  type: 'services-spotlight-v2',
  label: 'Services Spotlight V2',
  icon: '🎯',
  category: 'interactive',
  description: 'Bloc services avec spotlight et indicateurs',
  component: ServicesSpotlightBlockV2,
  editor: ServicesSpotlightBlockV2Editor,
  defaultData: {
    title: 'Services',
    indicatorLabel: 'Specialization',
    showIndicator: true,
    headingVariant: 'medium',
    itemHeadingVariant: 'medium',
    theme: 'auto',
    items: [
      { id: 'service-1', title: 'Camera Work', indicator: '[ Framing ]', image: { src: '/blocks/services-spotlight/spotlight-1.jpg', alt: 'Camera work' } },
      { id: 'service-2', title: 'Visual Direction', indicator: '[ Vision ]', image: { src: '/blocks/services-spotlight/spotlight-2.jpg', alt: 'Visual direction' } },
      { id: 'service-3', title: 'Sound Design', indicator: '[ Resonance ]', image: { src: '/blocks/services-spotlight/spotlight-3.jpg', alt: 'Sound design' } },
      { id: 'service-4', title: 'Film Editing', indicator: '[ Sequence ]', image: { src: '/blocks/services-spotlight/spotlight-4.jpg', alt: 'Film editing' } },
    ],
  }
});
