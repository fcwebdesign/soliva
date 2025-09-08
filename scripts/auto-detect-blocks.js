#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AUTO_DECLARED_DIR = 'src/blocks/auto-declared';
const BLOCK_CONFIG_FILE = 'scripts/block-config.json';

// Configuration par défaut des blocs
const DEFAULT_BLOCK_CONFIG = {
  'ContactBlock': { type: 'contact', label: 'Contact', category: '📞 Contact', icon: 'Phone' },
  'ContentBlock': { type: 'content', label: 'Éditeur de texte', category: '📝 Textes', icon: 'AlignLeft' },
  'H2Block': { type: 'h2', label: 'Titre H2', category: '📝 Textes', icon: 'Type' },
  'H3Block': { type: 'h3', label: 'Titre H3', category: '📝 Textes', icon: 'Heading2' },
  'ImageBlock': { type: 'image', label: 'Image', category: '🖼️ Images', icon: 'Image' },
  'LogosBlock': { type: 'logos', label: 'Logos', category: '🏢 Logos', icon: 'GripHorizontal' },
  'ProjectsBlock': { type: 'projects', label: 'Projets', category: '💼 Projets', icon: 'Grid3x3' },
  'QuoteBlock': { type: 'quote', label: 'Citation', category: '📝 Textes', icon: 'Quote' },
  'ServicesBlock': { type: 'services', label: 'Liste titre/texte', category: '🛠️ Services', icon: 'List' },
  'ThreeColumnsBlock': { type: 'three-columns', label: 'Trois colonnes', category: '🎨 Layout', icon: 'Grid3x2' },
  'TwoColumnsBlock': { type: 'two-columns', label: 'Deux colonnes', category: '🎨 Layout', icon: 'Columns' }
};

// Icônes disponibles
const AVAILABLE_ICONS = [
  'FileText', 'Type', 'Heading2', 'AlignLeft', 'Image', 'Columns', 'Grid3x2', 'Grid3x3',
  'Phone', 'List', 'GripHorizontal', 'Quote', 'Target', 'Layout', 'Tag', 'Atom',
  'Trash2', 'Plus', 'Search', 'FolderOpen', 'Building2', 'ChevronDown', 'Lock',
  'Brain', 'AlertTriangle', 'X', 'Eye', 'Save', 'Rocket'
];

// Catégories disponibles
const AVAILABLE_CATEGORIES = [
  '📝 Textes', '🖼️ Images', '🎨 Layout', '📞 Contact', '🛠️ Services', 
  '💼 Projets', '🏢 Logos', '🔧 Outils', '📊 Données', '🎯 CTA'
];

function loadBlockConfig() {
  try {
    if (fs.existsSync(BLOCK_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(BLOCK_CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️ Erreur lors du chargement de la config, utilisation des valeurs par défaut');
  }
  return DEFAULT_BLOCK_CONFIG;
}

function saveBlockConfig(config) {
  try {
    fs.writeFileSync(BLOCK_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ Configuration sauvegardée dans ${BLOCK_CONFIG_FILE}`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la config:', error.message);
  }
}

function detectNewBlocks() {
  try {
    const items = fs.readdirSync(AUTO_DECLARED_DIR, { withFileTypes: true });
    const blockDirs = items
      .filter(item => item.isDirectory() && item.name !== 'node_modules')
      .map(item => item.name)
      .sort();
    
    return blockDirs;
  } catch (error) {
    console.error('❌ Erreur lors de la détection des blocs:', error.message);
    return [];
  }
}

function generateBlockType(blockName) {
  // Convertir "MyAwesomeBlock" en "my-awesome"
  return blockName
    .replace(/Block$/, '') // Enlever "Block" à la fin
    .replace(/([A-Z])/g, '-$1') // Ajouter des tirets avant les majuscules
    .toLowerCase()
    .replace(/^-/, ''); // Enlever le tiret du début
}

function generateBlockLabel(blockName) {
  // Convertir "MyAwesomeBlock" en "Mon Bloc Génial"
  return blockName
    .replace(/Block$/, '') // Enlever "Block" à la fin
    .replace(/([A-Z])/g, ' $1') // Ajouter des espaces avant les majuscules
    .trim()
    .toLowerCase()
    .replace(/^./, str => str.toUpperCase()); // Première lettre en majuscule
}

function suggestCategory(blockName) {
  const name = blockName.toLowerCase();
  
  if (name.includes('column') || name.includes('layout') || name.includes('grid')) {
    return '🎨 Layout';
  }
  if (name.includes('text') || name.includes('content') || name.includes('h1') || name.includes('h2') || name.includes('h3') || name.includes('quote')) {
    return '📝 Textes';
  }
  if (name.includes('image') || name.includes('photo') || name.includes('media')) {
    return '🖼️ Images';
  }
  if (name.includes('contact') || name.includes('form') || name.includes('email')) {
    return '📞 Contact';
  }
  if (name.includes('service') || name.includes('offering') || name.includes('feature')) {
    return '🛠️ Services';
  }
  if (name.includes('project') || name.includes('work') || name.includes('portfolio')) {
    return '💼 Projets';
  }
  if (name.includes('logo') || name.includes('client') || name.includes('brand')) {
    return '🏢 Logos';
  }
  
  return '🔧 Outils'; // Catégorie par défaut
}

function suggestIcon(blockName) {
  const name = blockName.toLowerCase();
  
  if (name.includes('column') || name.includes('layout')) {
    return name.includes('three') ? 'Grid3x2' : 'Columns';
  }
  if (name.includes('text') || name.includes('content')) {
    return 'AlignLeft';
  }
  if (name.includes('h2')) return 'Type';
  if (name.includes('h3')) return 'Heading2';
  if (name.includes('image')) return 'Image';
  if (name.includes('contact')) return 'Phone';
  if (name.includes('service')) return 'List';
  if (name.includes('project')) return 'Grid3x3';
  if (name.includes('logo')) return 'GripHorizontal';
  if (name.includes('quote')) return 'Quote';
  
  return 'FileText'; // Icône par défaut
}

function autoDetectBlocks() {
  console.log('🔍 Détection automatique des blocs...');
  
  const currentConfig = loadBlockConfig();
  const detectedBlocks = detectNewBlocks();
  
  let hasNewBlocks = false;
  const newBlocks = [];
  
  detectedBlocks.forEach(blockName => {
    if (!currentConfig[blockName]) {
      hasNewBlocks = true;
      
      const blockType = generateBlockType(blockName);
      const blockLabel = generateBlockLabel(blockName);
      const suggestedCategory = suggestCategory(blockName);
      const suggestedIcon = suggestIcon(blockName);
      
      const newBlockConfig = {
        type: blockType,
        label: blockLabel,
        category: suggestedCategory,
        icon: suggestedIcon
      };
      
      currentConfig[blockName] = newBlockConfig;
      newBlocks.push({ name: blockName, config: newBlockConfig });
      
      console.log(`🆕 Nouveau bloc détecté: ${blockName}`);
      console.log(`   Type: ${blockType}`);
      console.log(`   Label: ${blockLabel}`);
      console.log(`   Catégorie: ${suggestedCategory}`);
      console.log(`   Icône: ${suggestedIcon}`);
    }
  });
  
  if (hasNewBlocks) {
    saveBlockConfig(currentConfig);
    console.log(`\n✅ ${newBlocks.length} nouveau(x) bloc(s) ajouté(s) automatiquement !`);
    console.log('📝 Vous pouvez modifier la configuration dans scripts/block-config.json si nécessaire');
  } else {
    console.log('✅ Aucun nouveau bloc détecté');
  }
  
  return currentConfig;
}

// Exécuter si appelé directement
if (require.main === module) {
  autoDetectBlocks();
}

module.exports = { autoDetectBlocks, loadBlockConfig, saveBlockConfig };
