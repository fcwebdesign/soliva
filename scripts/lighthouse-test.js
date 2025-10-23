#!/usr/bin/env node

/**
 * Script automatisé pour tester les performances avec Lighthouse
 * Usage: node scripts/lighthouse-test.js
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function runLighthouse() {
  console.log('🔍 Test Lighthouse - Analyse des performances\n');
  
  try {
    // Lancer Chrome
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance'],
      port: chrome.port,
    };
    
    // Tester la page d'accueil
    console.log('1. Test de la page d\'accueil...');
    const homeResult = await lighthouse(`${BASE_URL}/`, options);
    
    // Tester la page work
    console.log('2. Test de la page work...');
    const workResult = await lighthouse(`${BASE_URL}/work`, options);
    
    // Tester la page blog
    console.log('3. Test de la page blog...');
    const blogResult = await lighthouse(`${BASE_URL}/blog`, options);
    
    // Fermer Chrome
    await chrome.kill();
    
    // Générer les rapports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportsDir = path.join(__dirname, '..', 'lighthouse-reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Sauvegarder les rapports
    fs.writeFileSync(
      path.join(reportsDir, `home-${timestamp}.html`), 
      homeResult.report
    );
    fs.writeFileSync(
      path.join(reportsDir, `work-${timestamp}.html`), 
      workResult.report
    );
    fs.writeFileSync(
      path.join(reportsDir, `blog-${timestamp}.html`), 
      blogResult.report
    );
    
    // Afficher les scores
    console.log('\n📊 Scores de performance:');
    console.log(`🏠 Page d'accueil: ${homeResult.lhr.categories.performance.score * 100}/100`);
    console.log(`💼 Page work: ${workResult.lhr.categories.performance.score * 100}/100`);
    console.log(`📝 Page blog: ${blogResult.lhr.categories.performance.score * 100}/100`);
    
    console.log('\n📁 Rapports sauvegardés dans:');
    console.log(`   ${reportsDir}/home-${timestamp}.html`);
    console.log(`   ${reportsDir}/work-${timestamp}.html`);
    console.log(`   ${reportsDir}/blog-${timestamp}.html`);
    
    // Ouvrir le premier rapport
    const { exec } = require('child_process');
    exec(`open ${path.join(reportsDir, `home-${timestamp}.html`)}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test Lighthouse:', error.message);
    console.log('\n💡 Assure-toi que:');
    console.log('   1. Le serveur de développement est démarré (npm run dev)');
    console.log('   2. Lighthouse est installé (npm install -g lighthouse)');
    console.log('   3. Chrome est installé sur le système');
  }
}

// Exécuter le test
runLighthouse();
