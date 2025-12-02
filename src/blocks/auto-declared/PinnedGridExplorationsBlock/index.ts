import { registerAutoBlock } from '../registry';
import PinnedGridExplorationsBlock from './component';
import PinnedGridExplorationsEditor from './editor';

registerAutoBlock({
  type: 'pinned-grid-explorations',
  label: 'Pinned Grid Explorations',
  icon: '📌',
  category: 'interactive',
  description: 'Reprise exacte de l’animation “Explorations” (pin + reveal 3D) du pack Codrops.',
  component: PinnedGridExplorationsBlock,
  editor: PinnedGridExplorationsEditor,
  defaultData: {
    duration: 150, // court par défaut
    colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
    images: [],
  },
});
