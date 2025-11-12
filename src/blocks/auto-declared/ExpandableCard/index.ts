import { registerAutoBlock } from '../registry';
import dynamic from 'next/dynamic';

// Lazy-load pour réduire le JS/CSS initial des pages qui n'utilisent pas ce bloc
// Important: ssr: false pour éviter que le CSS du bloc soit injecté dans le chemin critique
const ExpandableCard = dynamic(() => import('./component'), { ssr: false, loading: () => null });
const ExpandableCardEditor = dynamic(() => import('./editor'), { ssr: false, loading: () => null });

registerAutoBlock({
  type: 'expandable-card',
  component: ExpandableCard,
  editor: ExpandableCardEditor,
  defaultData: { 
    title: '',
    cards: [] 
  }
});
