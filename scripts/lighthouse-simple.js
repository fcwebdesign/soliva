#!/usr/bin/env node

/**
 * Script Lighthouse simplifié avec barre de progression
 * Usage: npm run lighthouse:all
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Fonction pour créer une barre de progression
function createProgressBar(current, total, width = 30) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage}% (${current}/${total})`;
}

// Fonction pour afficher le temps écoulé
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

// Détecter le port automatiquement
function getBaseUrl() {
  return new Promise((resolve) => {
    // Essayer les ports courants un par un
    const ports = [3000, 3001, 3002, 3003, 3004, 3005];
    const { exec } = require('child_process');
    
    let currentPort = 0;
    
    function testPort() {
      if (currentPort >= ports.length) {
        // Aucun port trouvé, utiliser le port par défaut
        const port = process.env.PORT || process.env.NEXT_PORT || 3000;
        resolve(`http://localhost:${port}`);
        return;
      }
      
      const port = ports[currentPort];
      exec(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}`, (error, stdout) => {
        if (!error && stdout.trim() === '200') {
          resolve(`http://localhost:${port}`);
        } else {
          currentPort++;
          testPort();
        }
      });
    }
    
    testPort();
  });
}

const PAGES = [
  { name: 'Accueil', url: '/' },
  { name: 'Work', url: '/work' },
  { name: 'Blog', url: '/blog' },
  { name: 'Studio', url: '/studio' },
  { name: 'Contact', url: '/contact' }
];

function runLighthouse(page, currentIndex, totalPages) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `lighthouse-${page.name.toLowerCase()}-${timestamp}.html`;
    const filepath = path.join(process.cwd(), filename);
    
    const startTime = Date.now();
    
    console.log(`\n🔍 Test de la page ${page.name}...`);
    console.log(`📊 Progression: ${createProgressBar(currentIndex, totalPages)}`);
    console.log(`⏱️  Temps estimé: 2-3 minutes par page`);
    
    const command = `lighthouse "${BASE_URL}${page.url}" --output html --output-path "${filepath}" --quiet`;
    
    // Timer pour afficher le temps écoulé
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r⏳ ${page.name} en cours... ${formatTime(elapsed)}`);
    }, 1000);
    
    exec(command, (error, stdout, stderr) => {
      clearInterval(timer);
      
      if (error) {
        console.error(`\n❌ Erreur pour ${page.name}:`, error.message);
        reject(error);
        return;
      }
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(`\n✅ ${page.name} terminé en ${formatTime(elapsed)}: ${filename}`);
      resolve({ page: page.name, file: filename, time: elapsed });
    });
  });
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests Lighthouse\n');
  
  // Détecter le port automatiquement
  console.log('🔍 Détection du port...');
  const BASE_URL = await getBaseUrl();
  console.log(`📍 URL détectée: ${BASE_URL}`);
  
  // Vérifier que le serveur est démarré
  console.log('🔍 Vérification du serveur...');
  try {
    const { exec } = require('child_process');
    const response = await new Promise((resolve, reject) => {
      exec(`curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
    
    if (response !== '200') {
      throw new Error(`Serveur répond avec code ${response}`);
    }
    console.log('✅ Serveur accessible');
  } catch (error) {
    console.error('❌ Erreur: Le serveur n\'est pas démarré');
    console.log('💡 Démarre d\'abord le serveur avec: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Serveur accessible, démarrage des tests...\n');
  console.log(`📋 ${PAGES.length} pages à tester:`);
  PAGES.forEach((page, index) => {
    console.log(`   ${index + 1}. ${page.name} (${BASE_URL}${page.url})`);
  });
  console.log(`\n⏱️  Temps total estimé: ${PAGES.length * 2}-${PAGES.length * 3} minutes\n`);
  
  const results = [];
  const totalStartTime = Date.now();
  
  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    try {
      const result = await runLighthouse(page, i + 1, PAGES.length);
      results.push(result);
    } catch (error) {
      console.error(`❌ Échec du test pour ${page.name}`);
    }
  }
  
  const totalTime = Math.floor((Date.now() - totalStartTime) / 1000);
  
  console.log('\n🎉 Tests terminés !');
  console.log(`⏱️  Temps total: ${formatTime(totalTime)}`);
  console.log(`📊 ${results.length}/${PAGES.length} pages testées avec succès\n`);
  
  console.log('📊 Résumé des tests:');
  results.forEach(result => {
    console.log(`   ✅ ${result.page}: ${result.file} (${formatTime(result.time)})`);
  });
  
  console.log('\n🎯 Pour analyser les résultats:');
  console.log('   1. Ouvre les fichiers HTML générés');
  console.log('   2. Regarde les scores de performance');
  console.log('   3. Suis les recommandations');
  
  console.log('\n💡 Commandes utiles:');
  console.log('   npm run lighthouse        # Test page d\'accueil seulement');
  console.log('   npm run lighthouse:work  # Test page work seulement');
  console.log('   npm run lighthouse:blog  # Test page blog seulement');
}

// Exécuter les tests
runAllTests().catch(console.error);
