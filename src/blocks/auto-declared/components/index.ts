/**
 * Composants réutilisables pour les blocs auto-déclarés
 * 
 * Ces composants permettent de créer rapidement de nouveaux blocs
 * sans dupliquer le code d'upload, de gestion d'images, etc.
 */

// Hooks
export { useImageUpload } from './hooks/useImageUpload';

// Composants
export { default as ImageThumbnail } from './ImageThumbnail';
export { default as AspectRatioSelect } from './AspectRatioSelect';
export type { AspectRatioValue } from './AspectRatioSelect';
export { default as SortableImageItem } from './SortableImageItem';
export type { ImageItemData } from './SortableImageItem';
export { default as ImageListEditor } from './ImageListEditor';
