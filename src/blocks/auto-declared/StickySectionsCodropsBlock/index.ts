import { registerAutoBlock } from '../registry';
import StickySectionsCodropsBlock from './component';
import StickySectionsCodropsEditor from './editor';

registerAutoBlock({
  type: 'sticky-sections-codrops',
  label: 'Sticky Sections Codrops',
  icon: '🧲',
  category: 'interactive',
  description: 'Copie simple de la démo Sticky Sections #1 (Codrops) : sections sticky, filtres et image qui rotate/translate au scroll.',
  component: StickySectionsCodropsBlock,
  editor: StickySectionsCodropsEditor,
  defaultData: {
    headingTitle: 'Sticky Sections',
    headingSubtitle: 'An exploration of the Synthetic Era.',
    introText: 'As data conglomerates reveled in the opulence of cognitive wealth, a silent underclass manifested, condemned to the digital periphery.',
    outroText: 'Lost in perpetual dependency, inhabitants of the Synthetic Era found solace in cryptic simulations, where pain ebbed and cognitive loads momentarily lightened.',
    items: [],
  },
});
