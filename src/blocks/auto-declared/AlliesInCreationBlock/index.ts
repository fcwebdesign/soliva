import { registerAutoBlock } from '../registry';
import AlliesInCreationBlock from './component';
import AlliesInCreationEditor from './editor';

registerAutoBlock({
  type: 'collaborations-grid',
  label: 'Collaborations Grid',
  icon: '🤝',
  category: 'content',
  description: 'Grille de collaborations (titre + items cliquables, highlight selon la palette).',
  component: AlliesInCreationBlock,
  editor: AlliesInCreationEditor,
  defaultData: {
    title: 'Allies in creation',
    subtitle: '[ selected collaborations ]',
    items: [
      { id: 'ally-1', label: 'Blackline Studio', link: '/', featured: true },
      { id: 'ally-2', label: 'North Axis', link: '/work' },
      { id: 'ally-3', label: 'Vanta Works', link: '/studio' },
      { id: 'ally-4', label: 'Oblique Films', link: '/blog' },
      { id: 'ally-5', label: 'Hollow Syndicate', link: '/contact' },
      { id: 'ally-6', label: 'Ferrotype', link: '/work' },
      { id: 'ally-7', label: 'Glasshaus', link: '/work' },
      { id: 'ally-8', label: 'Orbit Division', link: '/work' },
    ],
  },
});
