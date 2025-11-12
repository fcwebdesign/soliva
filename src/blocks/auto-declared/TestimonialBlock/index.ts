import { registerAutoBlock } from '../registry';
import TestimonialBlock from './component';
import TestimonialBlockEditor from './editor';

registerAutoBlock({
  type: 'testimonial',
  component: TestimonialBlock,
  editor: TestimonialBlockEditor,
  label: 'Témoignage',
  icon: '⭐',
  defaultData: {
    title: '',
    items: [],
    theme: 'auto',
    columns: 3
  }
});

