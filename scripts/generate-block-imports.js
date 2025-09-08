#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AUTO_DECLARED_DIR = 'src/blocks/auto-declared';
const INDEX_FILE = path.join(AUTO_DECLARED_DIR, 'index.ts');
const BLOCK_EDITOR_FILE = 'src/app/admin/components/BlockEditor.tsx';

// Importer la mise à jour simple
const { main } = require('./simple-block-updater');

function generateImports() {
  try {
    // Lire le contenu du dossier auto-declared
    const items = fs.readdirSync(AUTO_DECLARED_DIR, { withFileTypes: true });
    
    // Filtrer seulement les dossiers (blocs)
    const blockDirs = items
      .filter(item => item.isDirectory() && item.name !== 'node_modules')
      .map(item => item.name)
      .sort(); // Tri alphabétique pour un ordre prévisible
    
    // Générer le contenu du fichier index.ts
    const imports = blockDirs.map(dir => `import './${dir}';`).join('\n');
    
    const content = `// Auto-loader des blocs auto-déclarés
// Ce fichier est généré automatiquement par scripts/generate-block-imports.js
// Ne pas modifier manuellement !

${imports}

// Pour ajouter un nouveau bloc :
// 1. Créer un dossier src/blocks/auto-declared/MonBloc/
// 2. Exécuter: npm run generate-blocks
// 3. C'est tout !

console.log('🚀 Blocs auto-déclarés chargés (${blockDirs.length} blocs)');
`;

    // Écrire le fichier
    fs.writeFileSync(INDEX_FILE, content, 'utf8');
    
    console.log(`✅ Fichier ${INDEX_FILE} généré avec ${blockDirs.length} blocs:`);
    blockDirs.forEach(dir => console.log(`   - ${dir}`));
    
    return blockDirs;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

function updateBlockEditor(blockDirs) {
  try {
    if (!fs.existsSync(BLOCK_EDITOR_FILE)) {
      console.log('⚠️ Fichier BlockEditor.tsx non trouvé, skip de la mise à jour');
      return;
    }

    // Charger la configuration des blocs
    const BLOCK_CONFIG = loadBlockConfig();
    
    let content = fs.readFileSync(BLOCK_EDITOR_FILE, 'utf8');
    
    // Mettre à jour les labels personnalisés
    const customLabels = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      '${config.type}': '${config.label}',`;
      })
      .join('\n');

    // Remplacer la section des labels personnalisés
    const labelsRegex = /const customLabels: Record<string, string> = \{([^}]+)\};/s;
    if (labelsRegex.test(content)) {
      content = content.replace(labelsRegex, `const customLabels: Record<string, string> = {\n${customLabels}\n    };`);
    }

    // Mettre à jour les catégories
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

    const categoriesString = Object.entries(categories)
      .map(([categoryName, blockTypes]) => `      '${categoryName}': [${blockTypes.map(type => `'${type}'`).join(', ')}],`)
      .join('\n');

    // Remplacer la section des catégories
    const categoriesRegex = /const categories = \{([^}]+)\};/s;
    if (categoriesRegex.test(content)) {
      content = content.replace(categoriesRegex, `const categories = {\n${categoriesString}\n    };`);
    }

    // Mettre à jour les icônes
    const iconCases = blockDirs
      .filter(dir => BLOCK_CONFIG[dir])
      .map(dir => {
        const config = BLOCK_CONFIG[dir];
        return `      case '${config.type}':\n        return <${config.icon} className={iconClass} />;`;
      })
      .join('\n');

    // Remplacer la section des icônes (plus complexe car c'est dans un switch)
    const switchRegex = /switch \(blockType\) \{([^}]+)\}/s;
    if (switchRegex.test(content)) {
      const switchContent = `switch (blockType) {\n${iconCases}\n      default:\n        return <FileText className={iconClass} />;\n    }`;
      content = content.replace(switchRegex, switchContent);
    }

    // Écrire le fichier mis à jour
    fs.writeFileSync(BLOCK_EDITOR_FILE, content, 'utf8');
    
    console.log(`✅ Fichier BlockEditor.tsx mis à jour avec ${blockDirs.length} blocs`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du BlockEditor:', error.message);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  // Utiliser la mise à jour intelligente
  main();
}

module.exports = { generateImports, updateBlockEditor };
