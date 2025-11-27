import { registerAutoBlock } from '../registry';
import HoverClientsBlock from './component';
import HoverClientsBlockEditor from './editor';

registerAutoBlock({
  type: 'hover-clients',
  component: HoverClientsBlock,
  editor: HoverClientsBlockEditor,
  label: 'Hover clients',
  icon: '🖱️',
  category: 'interactive',
  description: 'Liste de clients avec révélation d’image au survol (inspiré Codegrid)',
  defaultData: {
    title: 'Trusted us',
    subtitle: 'Selected clients',
    backgroundColor: '#0d0d10',
    textColor: '#ffffff',
    mutedColor: '#b3b3b3',
    accentColor: '#ffffff',
    theme: 'auto',
    items: [
      { id: 'client-1', name: 'Native Instruments', image: { src: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1400&q=80', alt: 'Native Instruments' } },
      { id: 'client-2', name: 'Oura', image: { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80', alt: 'Oura' } },
      { id: 'client-3', name: 'Hender Scheme', image: { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80', alt: 'Hender Scheme' } },
      { id: 'client-4', name: 'Bang & Olufsen', image: { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80', alt: 'Bang & Olufsen' } },
      { id: 'client-5', name: 'Gentle Monster', image: { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80', alt: 'Gentle Monster' } },
      { id: 'client-6', name: 'Polestar', image: { src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80', alt: 'Polestar' } },
      { id: 'client-7', name: 'Fragment Design', image: { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1400&q=80', alt: 'Fragment Design' } },
      { id: 'client-8', name: 'Sonos', image: { src: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1400&q=80', alt: 'Sonos' } },
    ],
  }
});
