#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AUTO_DECLARED_DIR = 'src/blocks/auto-declared';
const BLOCK_EDITOR_FILE = 'src/app/admin/components/BlockEditor.tsx';

// Configuration des blocs
const BLOCK_CONFIG = {
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
  'FourColumnsBlock': { type: 'four-columns', label: 'Quatre colonnes', category: '🎨 Layout', icon: 'Grid3x3' },
  'GalleryGridBlock': { type: 'gallery-grid', label: 'Galerie Grid', category: '🖼️ Images', icon: 'Grid3x3' }
};

function detectBlocks() {
  try {
    const items = fs.readdirSync(AUTO_DECLARED_DIR, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory() && 
                     item.name !== 'node_modules' && 
                     item.name !== 'components' && 
                     item.name !== 'types')
      .map(item => item.name)
      .sort();
  } catch (error) {
    console.error('❌ Erreur lors de la détection des blocs:', error.message);
    return [];
  }
}

function updateBlockEditor(blockDirs) {
  try {
    if (!fs.existsSync(BLOCK_EDITOR_FILE)) {
      console.log('⚠️ Fichier BlockEditor.tsx non trouvé');
      return;
    }

    let content = fs.readFileSync(BLOCK_EDITOR_FILE, 'utf8');
    
    // 1. Mettre à jour les labels personnalisés
    const customLabelsEntries = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      '${config.type}': '${config.label}',`;
      })
      .join('\n');

    // Remplacer la section customLabels
    const customLabelsRegex = /(const customLabels: Record<string, string> = \{)([\s\S]*?)(\};)/;
    content = content.replace(customLabelsRegex, `$1\n${customLabelsEntries}\n    $3`);
    console.log('✅ Labels personnalisés mis à jour');

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

    const categoriesEntries = Object.entries(categories)
      .map(([categoryName, blockTypes]) => `      '${categoryName}': [${blockTypes.map(type => `'${type}'`).join(', ')}],`)
      .join('\n');

    // Remplacer la section categories
    const categoriesRegex = /(const categories = \{)([\s\S]*?)(\};)/;
    content = content.replace(categoriesRegex, `$1\n${categoriesEntries}\n    $3`);
    console.log('✅ Catégories mises à jour');

    // 3. Mettre à jour les icônes dans le switch
    const iconCases = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      case '${config.type}':\n        return <${config.icon} className={iconClass} />;`;
      })
      .join('\n');

    // Remplacer le contenu du switch (entre switch et default)
    const switchRegex = /(switch \(blockType\) \{)([\s\S]*?)(default:)/;
    content = content.replace(switchRegex, `$1\n${iconCases}\n      $3`);
    console.log('✅ Icônes mises à jour');

    // Écrire le fichier mis à jour
    fs.writeFileSync(BLOCK_EDITOR_FILE, content, 'utf8');
    
    console.log(`✅ Fichier BlockEditor.tsx mis à jour avec ${blockDirs.length} blocs`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du BlockEditor:', error.message);
  }
}

function generateImports() {
  try {
    const blockDirs = detectBlocks();
    const imports = blockDirs.map(dir => `import './${dir}';`).join('\n');
    const INDEX_FILE = path.join(AUTO_DECLARED_DIR, 'index.ts');
    
    const content = `// Auto-loader des blocs auto-déclarés
// Ce fichier est généré automatiquement par scripts/simple-block-updater.js
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
  console.log('🔧 Mise à jour simple des blocs...');
  
  // 1. Générer les imports
  const blockDirs = generateImports();
  
  // 2. Mettre à jour l'interface admin
  updateBlockEditor(blockDirs);
  
  console.log('🎉 Mise à jour simple terminée !');
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { generateImports, updateBlockEditor, main };
