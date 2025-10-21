import { registerAutoBlock } from '../registry';
import ExpandableCard from './component';
import ExpandableCardEditor from './editor';

registerAutoBlock({
  type: 'expandable-card',
  component: ExpandableCard,
  editor: ExpandableCardEditor,
  defaultData: { cards: [] }
});
