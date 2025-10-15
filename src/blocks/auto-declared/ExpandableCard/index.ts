import { registerAutoBlock } from '../registry';
import ExpandableCard from './component';
import ExpandableCardEditor from './editor';

registerAutoBlock({
  type: 'expandable-card',
  component: ExpandableCard,
  editor: ExpandableCardEditor,
  defaultData: {
    title: 'Titre de la carte',
    label: 'Label',
    summary: 'Résumé de la carte',
    content: 'Contenu de la carte qui s\'affiche quand elle est étendue.',
    media: {
      src: '',
      alt: ''
    },
    theme: 'automation',
    isExpanded: false
  }
});
