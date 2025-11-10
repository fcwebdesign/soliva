#!/usr/bin/env node
/**
 * Script de vérification de la santé de typography dans content.json
 * Exécuter avec: node scripts/check-typography-health.js
 */

const { readFileSync } = require('fs');
const { join } = require('path');

// Fonctions simplifiées pour la vérification
function isValidTypography(typo) {
  if (!typo || typeof typo !== 'object') return false;
  
  // Les clés valides de typography (nav est valide ici, c'est pour le style de navigation)
  const validKeys = ['h1', 'h2', 'h3', 'h4', 'h1Single', 'p', 'nav', 'footer'];
  const keys = Object.keys(typo);
  
  // Vérifier qu'il n'y a pas de clés suspectes (qui ne devraient pas être dans typography)
  const suspiciousKeys = ['_template', 'metadata', 'home', 'site', 'work', 'blog', 'contact', 'studio'];
  const hasSuspicious = suspiciousKeys.some(key => key in typo);
  if (hasSuspicious) return false;
  
  // Vérifier que toutes les clés sont valides (ou au moins qu'il n'y a pas de clés invalides)
  const invalidKeys = keys.filter(key => !validKeys.includes(key));
  if (invalidKeys.length > 0) {
    // Si les clés invalides sont suspectes, c'est corrompu
    const hasSuspiciousInvalid = invalidKeys.some(key => suspiciousKeys.includes(key));
    if (hasSuspiciousInvalid) return false;
  }
  
  return true;
}

const contentPath = join(process.cwd(), 'data', 'content.json');

console.log('🔍 Vérification de la santé de typography...\n');

try {
  const content = JSON.parse(readFileSync(contentPath, 'utf-8'));
  
  // Vérifier metadata.typography
  const metadataTypo = content.metadata?.typography;
  if (metadataTypo) {
    const isValid = isValidTypography(metadataTypo);
    const size = JSON.stringify(metadataTypo).length;
    const sizeMB = size / (1024 * 1024);
    
    console.log('📊 metadata.typography:');
    console.log(`   Taille: ${sizeMB.toFixed(2)} Mo`);
    console.log(`   Valide: ${isValid ? '✅ OUI' : '❌ NON (CORROMPU !)'}`);
    
    if (!isValid) {
      console.log('   ⚠️  CORRUPTION DÉTECTÉE !');
      console.log('   🔧 Nettoyage recommandé...');
      
      // Vérifier les clés suspectes
      const suspiciousKeys = ['_template', 'metadata', 'home', 'nav', 'site', 'work', 'blog'];
      const foundSuspicious = suspiciousKeys.filter(key => key in metadataTypo);
      if (foundSuspicious.length > 0) {
        console.log(`   🚨 Clés suspectes trouvées: ${foundSuspicious.join(', ')}`);
      }
    }
    
    if (sizeMB > 1) {
      console.log(`   ⚠️  TAILLE SUSPECTE (>1Mo) ! Typography ne devrait faire que quelques Ko`);
    }
  } else {
    console.log('📊 metadata.typography: ❌ Absent');
  }
  
  // Vérifier reveal.typography
  const revealTypo = content.metadata?.reveal?.typography;
  if (revealTypo) {
    console.log('\n📊 metadata.reveal.typography:');
    console.log('   ⚠️  Typography trouvé dans reveal (ne devrait pas être là)');
    const isValid = isValidTypography(revealTypo);
    console.log(`   Valide: ${isValid ? '✅ OUI' : '❌ NON (CORROMPU !)'}`);
    
    if (!isValid) {
      console.log('   🚨 CORRUPTION DÉTECTÉE dans reveal.typography !');
    }
  }
  
  // Compter toutes les occurrences de typography
  const contentStr = JSON.stringify(content);
  const typographyCount = (contentStr.match(/"typography"/g) || []).length;
  console.log(`\n📊 Occurrences totales de "typography": ${typographyCount}`);
  
  if (typographyCount > 10) {
    console.log('   ⚠️  TROP D\'OCCURRENCES ! (devrait être ~1-2)');
    console.log('   🚨 CORRUPTION PROBABLE !');
  }
  
  // Vérifier la taille totale du fichier
  const fileSize = readFileSync(contentPath).length;
  const fileSizeMB = fileSize / (1024 * 1024);
  console.log(`\n📊 Taille totale du fichier: ${fileSizeMB.toFixed(2)} Mo`);
  
  if (fileSizeMB > 10) {
    console.log('   ⚠️  FICHIER TROP GROS ! (devrait être <1Mo)');
    console.log('   🚨 CORRUPTION PROBABLE !');
  }
  
  // Résumé
  console.log('\n📋 Résumé:');
  const hasIssues = (!metadataTypo || !isValidTypography(metadataTypo)) || 
                    revealTypo || 
                    typographyCount > 10 || 
                    fileSizeMB > 10;
  
  if (hasIssues) {
    console.log('   ❌ PROBLÈMES DÉTECTÉS !');
    console.log('   💡 Le système devrait nettoyer automatiquement, mais vérifiez les logs');
  } else {
    console.log('   ✅ Tout semble correct !');
  }
  
  process.exit(hasIssues ? 1 : 0);
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

