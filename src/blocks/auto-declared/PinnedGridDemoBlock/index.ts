import { registerAutoBlock } from '../registry';
import PinnedGridDemoBlock from './component';
import PinnedGridDemoEditor from './editor';

registerAutoBlock({
  type: 'pinned-grid-demo',
  label: 'Pinned Grid Demo',
  icon: '📌',
  category: 'interactive',
  description: 'Démo pin + animation locale inspirée Codrops (grid qui se révèle en scroll).',
  component: PinnedGridDemoBlock,
  editor: PinnedGridDemoEditor,
  defaultData: {
    title: 'Explorations',
    kicker: '',
    description: '',
    colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
    duration: 250,
  },
});
