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
    testimonial: 'Un témoignage client très positif sur votre travail...',
    author: 'Nom du client',
    company: 'Nom de l\'entreprise',
    role: 'Fonction',
    avatar: {
      src: '',
      alt: ''
    },
    rating: 5,
    theme: 'auto'
  }
});

