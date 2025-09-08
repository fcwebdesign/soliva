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

function updateBlockEditorIntelligently(blockDirs) {
  try {
    if (!fs.existsSync(BLOCK_EDITOR_FILE)) {
      console.log('⚠️ Fichier BlockEditor.tsx non trouvé');
      return;
    }

    const BLOCK_CONFIG = loadBlockConfig();
    let content = fs.readFileSync(BLOCK_EDITOR_FILE, 'utf8');
    
    // 1. Mettre à jour les labels personnalisés - approche par lignes
    const customLabelsLines = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      '${config.type}': '${config.label}',`;
      });

    // Trouver la section customLabels et la remplacer
    const customLabelsStart = content.indexOf('const customLabels: Record<string, string> = {');
    const customLabelsEnd = content.indexOf('    };', customLabelsStart) + 5;
    
    if (customLabelsStart !== -1 && customLabelsEnd !== -1) {
      const beforeCustomLabels = content.substring(0, customLabelsStart);
      const afterCustomLabels = content.substring(customLabelsEnd);
      const newCustomLabels = `const customLabels: Record<string, string> = {\n${customLabelsLines.join('\n')}\n    };`;
      
      content = beforeCustomLabels + newCustomLabels + afterCustomLabels;
      console.log('✅ Labels personnalisés mis à jour');
    } else {
      console.log('⚠️ Section customLabels non trouvée');
    }

    // 2. Mettre à jour les catégories
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

    const categoriesLines = Object.entries(categories)
      .map(([categoryName, blockTypes]) => `      '${categoryName}': [${blockTypes.map(type => `'${type}'`).join(', ')}],`);

    // Trouver la section categories et la remplacer
    const categoriesStart = content.indexOf('const categories = {');
    const categoriesEnd = content.indexOf('    };', categoriesStart) + 5;
    
    if (categoriesStart !== -1 && categoriesEnd !== -1) {
      const beforeCategories = content.substring(0, categoriesStart);
      const afterCategories = content.substring(categoriesEnd);
      const newCategories = `const categories = {\n${categoriesLines.join('\n')}\n    };`;
      
      content = beforeCategories + newCategories + afterCategories;
      console.log('✅ Catégories mises à jour');
    } else {
      console.log('⚠️ Section categories non trouvée');
    }

    // 3. Mettre à jour les icônes dans le switch
    const iconCases = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      case '${config.type}':\n        return <${config.icon} className={iconClass} />;`;
      });

    // Trouver le switch statement et le remplacer
    const switchStart = content.indexOf('switch (blockType) {');
    const defaultCaseStart = content.indexOf('default:', switchStart);
    const defaultCaseEnd = content.indexOf('}', defaultCaseStart) + 1;
    
    if (switchStart !== -1 && defaultCaseStart !== -1 && defaultCaseEnd !== -1) {
      const beforeSwitch = content.substring(0, switchStart + 20); // +20 pour inclure "switch (blockType) {"
      const afterSwitch = content.substring(defaultCaseStart);
      
      const newSwitch = `switch (blockType) {\n${iconCases.join('\n')}\n      ${afterSwitch}`;
      
      content = beforeSwitch + newSwitch;
      console.log('✅ Icônes mises à jour');
    } else {
      console.log('⚠️ Section switch non trouvée');
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
// Ce fichier est généré automatiquement par scripts/intelligent-block-updater.js
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
  console.log('🧠 Mise à jour intelligente des blocs...');
  
  // 1. Générer les imports
  const blockDirs = generateImports();
  
  // 2. Mettre à jour l'interface admin de manière intelligente
  updateBlockEditorIntelligently(blockDirs);
  
  console.log('🎉 Mise à jour intelligente terminée !');
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { generateImports, updateBlockEditorIntelligently, main };
