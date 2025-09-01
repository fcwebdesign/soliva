#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AUTO_DECLARED_DIR = 'src/blocks/auto-declared';
const INDEX_FILE = path.join(AUTO_DECLARED_DIR, 'index.ts');

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
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  generateImports();
}

module.exports = { generateImports };
