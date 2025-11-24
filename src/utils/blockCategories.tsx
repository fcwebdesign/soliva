import React from 'react';
import {
  Type,
  Heading2,
  AlignLeft,
  Image,
  Grid3x3,
  Grid3x2,
  Columns,
  Phone,
  GripHorizontal,
  List,
  Quote,
  FileText,
  LayoutPanelTop
} from 'lucide-react';
import { getBlockMetadata } from '@/blocks/auto-declared/registry';
import '@/blocks/auto-declared'; // side-effect to populate registry

type LucideIcon = React.ComponentType<{ className?: string }>;

// Mapping type -> icône Lucide (fallback AlignLeft)
const iconMap: Record<string, LucideIcon> = {
  contact: Phone,
  content: AlignLeft,
  'four-columns': Grid3x3,
  'three-columns': Grid3x2,
  'two-columns': Columns,
  'gallery-grid': Grid3x3,
  h2: Type,
  h3: Heading2,
  image: Image,
  logos: GripHorizontal,
  projects: Grid3x3,
  quote: Quote,
  services: List,
  testimonial: Quote,
  faq: List,
  'expandable-card': List,
  'page-intro': FileText,
};

const iconClass = "h-7 w-7 text-gray-600";

const renderLucideIcon = (blockType: string) => {
  const Icon = iconMap[blockType] || AlignLeft;
  return <Icon className={iconClass} />;
};

// Catégorie lisible depuis le registre -> libellé palette
const categoryLabels: Record<string, string> = {
  text: '📝 Textes',
  layout: '🎨 Layout',
  media: '🖼️ Media',
  content: '📚 Contenu',
  interactive: '⚡ Interactive',
  data: '🗂️ Data',
};

// Fallback si pas de catégorie
const defaultCategory = '🔧 Autres';

// Récupérer les blocs depuis le registre, sinon fallback statique
const getBlocksFromRegistry = () => {
  try {
    const meta = getBlockMetadata();
    if (!meta || meta.length === 0) return null;
    return meta.map(m => ({
      type: m.type,
      label: m.label || m.type,
      description: m.description,
      category: m.category,
      // On force l’icône Lucide, sans utiliser l’emoji du registre
      preview: renderLucideIcon(m.type),
    }));
  } catch (e) {
    return null;
  }
};

// Fallback statique (ancien comportement)
const staticBlocks = [
  { type: 'contact', label: 'Contact', category: 'content', preview: renderLucideIcon('contact') },
  { type: 'content', label: 'Éditeur de texte', category: 'text', preview: renderLucideIcon('content') },
  { type: 'four-columns', label: 'Quatre colonnes', category: 'layout', preview: renderLucideIcon('four-columns') },
  { type: 'gallery-grid', label: 'Galerie Grid', category: 'media', preview: renderLucideIcon('gallery-grid') },
  { type: 'h2', label: 'Titre H2', category: 'text', preview: renderLucideIcon('h2') },
  { type: 'h3', label: 'Titre H3', category: 'text', preview: renderLucideIcon('h3') },
  { type: 'image', label: 'Image', category: 'media', preview: renderLucideIcon('image') },
  { type: 'logos', label: 'Logos', category: 'media', preview: renderLucideIcon('logos') },
  { type: 'projects', label: 'Projets', category: 'content', preview: renderLucideIcon('projects') },
  { type: 'quote', label: 'Citation', category: 'text', preview: renderLucideIcon('quote') },
  { type: 'services', label: 'Liste titre/texte', category: 'content', preview: renderLucideIcon('services') },
  { type: 'three-columns', label: 'Trois colonnes', category: 'layout', preview: renderLucideIcon('three-columns') },
  { type: 'two-columns', label: 'Deux colonnes', category: 'layout', preview: renderLucideIcon('two-columns') },
];

const getEffectiveBlocks = () => getBlocksFromRegistry() || staticBlocks;

// Fonction pour grouper les blocs par catégorie (éditeur global)
export const getCategorizedBlocks = (filteredBlocks: any[]) => {
  const allBlocks = getEffectiveBlocks().filter(b => filteredBlocks.some((f: any) => f.type === b.type));

  const categorized: { [key: string]: any[] } = {};
  allBlocks.forEach(block => {
    const catLabel = block.category && categoryLabels[block.category] ? categoryLabels[block.category] : defaultCategory;
    if (!categorized[catLabel]) categorized[catLabel] = [];
    categorized[catLabel].push(block);
  });
  return categorized;
};

// Fonction pour grouper les blocs par catégorie (colonnes)
export const getCategorizedBlocksForColumns = () => {
  const allBlocks = getEffectiveBlocks().filter(b => b.category !== 'layout'); // on exclut les layouts dans les colonnes
  const categorized: { [key: string]: any[] } = {};
  allBlocks.forEach(block => {
    const catLabel = block.category && categoryLabels[block.category] ? categoryLabels[block.category] : defaultCategory;
    if (!categorized[catLabel]) categorized[catLabel] = [];
    categorized[catLabel].push(block);
  });
  return categorized;
};

// Exposé pour compatibilité (labels individuels)
export const getBlockLabel = (blockType: string) => {
  const block = getEffectiveBlocks().find(b => b.type === blockType);
  return block?.label || blockType;
};

export const renderBlockPreview = (blockType: string) => renderLucideIcon(blockType);
