import { Type, Heading2, AlignLeft, Image, Grid3x3, Grid3x2, Columns, Phone, GripHorizontal, List, Quote } from 'lucide-react';

// Fonction pour obtenir le label personnalisé d'un bloc
export const getBlockLabel = (blockType: string) => {
  const customLabels: Record<string, string> = {
    'contact': 'Contact',
    'content': 'Éditeur de texte',
    'four-columns': 'Quatre colonnes',
    'gallery-grid': 'Galerie Grid',
    'h2': 'Titre H2',
    'h3': 'Titre H3',
    'image': 'Image',
    'logos': 'Logos',
    'projects': 'Projets',
    'quote': 'Citation',
    'services': 'Liste titre/texte',
    'three-columns': 'Trois colonnes',
    'two-columns': 'Deux colonnes',
  };
  return customLabels[blockType] || blockType;
};

// Fonction pour créer une vignette avec icônes Lucide
export const renderBlockPreview = (blockType: string) => {
  const iconClass = "h-7 w-7 text-gray-600";
  
  switch (blockType) {
    case 'contact':
      return <Phone className={iconClass} />;
    case 'content':
      return <AlignLeft className={iconClass} />;
    case 'four-columns':
      return <Grid3x3 className={iconClass} />;
    case 'gallery-grid':
      return <Grid3x3 className={iconClass} />;
    case 'h2':
      return <Type className={iconClass} />;
    case 'h3':
      return <Heading2 className={iconClass} />;
    case 'image':
      return <Image className={iconClass} />;
    case 'logos':
      return <GripHorizontal className={iconClass} />;
    case 'projects':
      return <Grid3x3 className={iconClass} />;
    case 'quote':
      return <Quote className={iconClass} />;
    case 'services':
      return <List className={iconClass} />;
    case 'three-columns':
      return <Grid3x2 className={iconClass} />;
    case 'two-columns':
      return <Columns className={iconClass} />;
    default:
      return <AlignLeft className={iconClass} />;
  }
};

// Catégories de base (utilisées par l'éditeur global)
export const getBaseCategories = () => ({
  '📞 Contact': ['contact'],
  '📝 Textes': ['content', 'h2', 'h3', 'quote'],
  '🎨 Layout': ['four-columns', 'three-columns', 'two-columns'],
  '🖼️ Images': ['gallery-grid', 'image'],
  '🏢 Logos': ['logos'],
  '💼 Projets': ['projects'],
  '🛠️ Services': ['services'],
});

// Catégories pour les colonnes (exclut les blocs de layout)
export const getColumnCategories = () => {
  const baseCategories = getBaseCategories();
  const { '🎨 Layout': layout, ...columnCategories } = baseCategories;
  return columnCategories;
};

// Fonction pour grouper les blocs par catégorie (éditeur global)
export const getCategorizedBlocks = (filteredBlocks: any[]) => {
  const categories = getBaseCategories();
  const categorized: { [key: string]: any[] } = {};
  
  Object.entries(categories).forEach(([categoryName, blockTypes]) => {
    const categoryBlocks = filteredBlocks.filter(block => 
      blockTypes.includes(block.type)
    );
    if (categoryBlocks.length > 0) {
      categorized[categoryName] = categoryBlocks;
    }
  });

  // Ajouter les blocs non catégorisés
  const uncategorizedBlocks = filteredBlocks.filter(block => 
    !Object.values(categories).flat().includes(block.type)
  );
  if (uncategorizedBlocks.length > 0) {
    categorized['🔧 Autres'] = uncategorizedBlocks;
  }

  return categorized;
};

// Fonction pour grouper les blocs par catégorie (colonnes)
export const getCategorizedBlocksForColumns = () => {
  const categories = getColumnCategories();
  const categorized: { [key: string]: any[] } = {};
  
  Object.entries(categories).forEach(([categoryName, blockTypes]) => {
    const categoryBlocks = blockTypes.map(type => ({
      type,
      label: getBlockLabel(type),
      preview: renderBlockPreview(type)
    }));
    if (categoryBlocks.length > 0) {
      categorized[categoryName] = categoryBlocks;
    }
  });

  return categorized;
};
