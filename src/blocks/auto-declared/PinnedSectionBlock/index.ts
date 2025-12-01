import { registerAutoBlock } from '../registry';
import PinnedSectionBlock from './component';
import PinnedSectionEditor from './editor';

registerAutoBlock({
  type: 'pinned-section',
  label: 'Section pinée',
  icon: '📌',
  category: 'interactive',
  description: 'Une section simple fixée au scroll avec ScrollTrigger pour des tests rapides',
  component: PinnedSectionBlock,
  editor: PinnedSectionEditor,
  defaultData: {
    kicker: 'Pinned block',
    title: 'Section pinée simple',
    description: "Cette section reste fixée pendant le scroll pour tester rapidement l'effet pin de GSAP.",
    background: 'linear-gradient(135deg, #0f172a, #111827)',
    textColor: '#f8fafc',
    pinDuration: 180,
    paddingY: 96,
    theme: 'auto',
  },
});
