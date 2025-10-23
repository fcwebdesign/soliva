#!/usr/bin/env node

/**
 * Script Lighthouse rapide et simple
 * Usage: npm run lighthouse:quick
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { name: 'Accueil', url: '/' },
  { name: 'Work', url: '/work' },
  { name: 'Blog', url: '/blog' }
];

function runLighthouse(page) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `lighthouse-${page.name.toLowerCase()}-${timestamp}.html`;
    const filepath = path.join(process.cwd(), filename);
    
    console.log(`\n🔍 Test de la page ${page.name}...`);
    console.log(`⏱️  Temps estimé: 2-3 minutes`);
    
    const startTime = Date.now();
    const command = `lighthouse "http://localhost:3001${page.url}" --output html --output-path "${filepath}" --quiet`;
    
    // Timer pour afficher le temps écoulé
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r⏳ ${page.name} en cours... ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
    }, 1000);
    
    exec(command, (error, stdout, stderr) => {
      clearInterval(timer);
      
      if (error) {
        console.error(`\n❌ Erreur pour ${page.name}:`, error.message);
        reject(error);
        return;
      }
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(`\n✅ ${page.name} terminé en ${Math.floor(elapsed / 60)}m ${elapsed % 60}s: ${filename}`);
      resolve({ page: page.name, file: filename, time: elapsed });
    });
  });
}

async function runQuickTests() {
  console.log('🚀 Tests Lighthouse rapides\n');
  console.log('📋 3 pages à tester (version rapide)');
  console.log('⏱️  Temps total estimé: 6-9 minutes\n');
  
  const results = [];
  const totalStartTime = Date.now();
  
  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    try {
      console.log(`\n📊 Progression: ${i + 1}/${PAGES.length}`);
      const result = await runLighthouse(page);
      results.push(result);
    } catch (error) {
      console.error(`❌ Échec du test pour ${page.name}`);
    }
  }
  
  const totalTime = Math.floor((Date.now() - totalStartTime) / 1000);
  
  console.log('\n🎉 Tests terminés !');
  console.log(`⏱️  Temps total: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`);
  console.log(`📊 ${results.length}/${PAGES.length} pages testées avec succès\n`);
  
  console.log('📊 Résumé des tests:');
  results.forEach(result => {
    console.log(`   ✅ ${result.page}: ${result.file}`);
  });
  
  console.log('\n🎯 Pour analyser les résultats:');
  console.log('   1. Ouvre les fichiers HTML générés');
  console.log('   2. Regarde les scores de performance');
  console.log('   3. Suis les recommandations');
}

// Exécuter les tests
runQuickTests().catch(console.error);
