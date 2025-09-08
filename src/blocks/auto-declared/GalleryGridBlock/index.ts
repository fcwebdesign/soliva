import { registerAutoBlock } from '../registry';
import GalleryGridBlock from './component';
import GalleryGridBlockEditor from './editor';

registerAutoBlock({
  type: 'gallery-grid',
  component: GalleryGridBlock,
  editor: GalleryGridBlockEditor,
  defaultData: {
    images: [],
    layout: 'grid-3',
    gap: 'medium',
    showFilters: true,
    showTitles: true,
    showDescriptions: true,
    enableLightbox: true,
    enableDownload: true,
    theme: 'auto'
  }
});
