#!/usr/bin/env ts-node
/**
 * Script de vérification de la santé de typography dans content.json
 * Exécuter avec: npx ts-node scripts/check-typography-health.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { isValidTypography, cleanTypographyRecursive } from '../src/utils/clean-typography';

const contentPath = join(process.cwd(), 'data', 'content.json');

console.log('🔍 Vérification de la santé de typography...\n');

try {
  const content = JSON.parse(readFileSync(contentPath, 'utf-8'));
  
  // Vérifier metadata.typography
  const metadataTypo = (content.metadata as any)?.typography;
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
  const revealTypo = (content.metadata as any)?.reveal?.typography;
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
    console.log('   💡 Exécutez le nettoyage avec: python3 scripts/clean-content.py');
  } else {
    console.log('   ✅ Tout semble correct !');
  }
  
} catch (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}

