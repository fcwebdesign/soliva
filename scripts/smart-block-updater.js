#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AUTO_DECLARED_DIR = 'src/blocks/auto-declared';
const BLOCK_EDITOR_FILE = 'src/app/admin/components/BlockEditor.tsx';
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
  'TwoColumnsBlock': { type: 'two-columns', label: 'Deux colonnes', category: '🎨 Layout', icon: 'Columns' },
  'FourColumnsBlock': { type: 'four-columns', label: 'Quatre colonnes', category: '🎨 Layout', icon: 'Grid3x3' }
};

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

function updateBlockEditorSafely(blockDirs) {
  try {
    if (!fs.existsSync(BLOCK_EDITOR_FILE)) {
      console.log('⚠️ Fichier BlockEditor.tsx non trouvé');
      return;
    }

    const BLOCK_CONFIG = loadBlockConfig();
    let content = fs.readFileSync(BLOCK_EDITOR_FILE, 'utf8');
    
    // 1. Mettre à jour les labels personnalisés - approche plus sûre
    const customLabelsSection = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      '${config.type}': '${config.label}',`;
      })
      .join('\n');

    // Trouver et remplacer la section customLabels de manière plus précise
    const customLabelsRegex = /(const customLabels: Record<string, string> = \{)([\s\S]*?)(\};)/;
    const customLabelsMatch = content.match(customLabelsRegex);
    
    if (customLabelsMatch) {
      const newCustomLabels = `${customLabelsMatch[1]}\n${customLabelsSection}\n    ${customLabelsMatch[3]}`;
      content = content.replace(customLabelsRegex, newCustomLabels);
      console.log('✅ Labels personnalisés mis à jour');
    } else {
      console.log('⚠️ Section customLabels non trouvée, ajout manuel nécessaire');
    }

    // 2. Mettre à jour les catégories - approche plus sûre
    const categories = {};
    blockDirs.forEach(dir => {
      if (BLOCK_CONFIG[dir]) {
        const config = BLOCK_CONFIG[dir];
        if (!categories[config.category]) {
          categories[config.category] = [];
        }
        categories[config.category].push(config.type);
      }
    });

    const categoriesSection = Object.entries(categories)
      .map(([categoryName, blockTypes]) => `      '${categoryName}': [${blockTypes.map(type => `'${type}'`).join(', ')}],`)
      .join('\n');

    // Trouver et remplacer la section categories de manière plus précise
    const categoriesRegex = /(const categories = \{)([\s\S]*?)(\};)/;
    const categoriesMatch = content.match(categoriesRegex);
    
    if (categoriesMatch) {
      const newCategories = `${categoriesMatch[1]}\n${categoriesSection}\n    ${categoriesMatch[3]}`;
      content = content.replace(categoriesRegex, newCategories);
      console.log('✅ Catégories mises à jour');
    } else {
      console.log('⚠️ Section categories non trouvée, ajout manuel nécessaire');
    }

    // 3. Mettre à jour les icônes - approche plus sûre
    const iconCases = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      case '${config.type}':\n        return <${config.icon} className={iconClass} />;`;
      })
      .join('\n');

    // Trouver le switch statement de manière plus précise
    const switchRegex = /(switch \(blockType\) \{)([\s\S]*?)(default:\s*return <FileText className=\{iconClass\} \/>;\s*\})/;
    const switchMatch = content.match(switchRegex);
    
    if (switchMatch) {
      const newSwitch = `${switchMatch[1]}\n${iconCases}\n      ${switchMatch[3]}`;
      content = content.replace(switchRegex, newSwitch);
      console.log('✅ Icônes mises à jour');
    } else {
      console.log('⚠️ Section switch non trouvée, ajout manuel nécessaire');
    }

    // Écrire le fichier mis à jour
    fs.writeFileSync(BLOCK_EDITOR_FILE, content, 'utf8');
    
    console.log(`✅ Fichier BlockEditor.tsx mis à jour avec ${blockDirs.length} blocs`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du BlockEditor:', error.message);
    console.error('💡 Conseil: Vérifiez que le fichier BlockEditor.tsx a la structure attendue');
  }
}

function generateImports() {
  try {
    const items = fs.readdirSync(AUTO_DECLARED_DIR, { withFileTypes: true });
    const blockDirs = items
      .filter(item => item.isDirectory() && item.name !== 'node_modules')
      .map(item => item.name)
      .sort();
    
    const imports = blockDirs.map(dir => `import './${dir}';`).join('\n');
    const INDEX_FILE = path.join(AUTO_DECLARED_DIR, 'index.ts');
    
    const content = `// Auto-loader des blocs auto-déclarés
// Ce fichier est généré automatiquement par scripts/smart-block-updater.js
// Ne pas modifier manuellement !

${imports}

// Pour ajouter un nouveau bloc :
// 1. Créer un dossier src/blocks/auto-declared/MonBloc/
// 2. Exécuter: npm run generate-blocks
// 3. C'est tout !

console.log('🚀 Blocs auto-déclarés chargés (${blockDirs.length} blocs)');
`;

    fs.writeFileSync(INDEX_FILE, content, 'utf8');
    
    console.log(`✅ Fichier ${INDEX_FILE} généré avec ${blockDirs.length} blocs:`);
    blockDirs.forEach(dir => console.log(`   - ${dir}`));
    
    return blockDirs;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

function main() {
  console.log('🔍 Détection et mise à jour intelligente des blocs...');
  
  // 1. Générer les imports
  const blockDirs = generateImports();
  
  // 2. Mettre à jour l'interface admin de manière sûre
  updateBlockEditorSafely(blockDirs);
  
  console.log('🎉 Mise à jour intelligente terminée !');
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { generateImports, updateBlockEditorSafely, main };
