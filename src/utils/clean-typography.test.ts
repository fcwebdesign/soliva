/**
 * Tests pour valider que les protections typography fonctionnent
 * Exécuter avec: npm test ou directement avec ts-node
 */

import { cleanTypography, isValidTypography, cleanTypographyRecursive } from './clean-typography';

// Test 1: Typography valide devrait passer
console.log('🧪 Test 1: Typography valide');
const validTypography = {
  h1: { fontSize: 'text-xl', fontWeight: 'font-bold', lineHeight: 'leading-tight', color: 'text-black', tracking: 'tracking-normal' },
  h2: { fontSize: 'text-lg', fontWeight: 'font-semibold', lineHeight: 'leading-normal', color: 'text-gray-900', tracking: 'tracking-tight' }
};
console.log('✅ isValidTypography:', isValidTypography(validTypography) === true ? 'PASS' : 'FAIL');

// Test 2: Typography corrompu avec _template devrait être détecté
console.log('\n🧪 Test 2: Typography corrompu avec _template');
const corruptedTypography1 = {
  _template: 'pearl',
  h1: { fontSize: 'text-xl' }
};
console.log('✅ isValidTypography (corrompu):', isValidTypography(corruptedTypography1) === false ? 'PASS' : 'FAIL');
console.log('✅ cleanTypography nettoie:', Object.keys(cleanTypography(corruptedTypography1)).length === 0 ? 'PASS' : 'FAIL');

// Test 3: Typography corrompu avec metadata devrait être détecté
console.log('\n🧪 Test 3: Typography corrompu avec metadata');
const corruptedTypography2 = {
  h1: { fontSize: 'text-xl' },
  metadata: { title: 'Test' }
};
console.log('✅ isValidTypography (corrompu):', isValidTypography(corruptedTypography2) === false ? 'PASS' : 'FAIL');
const cleaned2 = cleanTypography(corruptedTypography2);
console.log('✅ cleanTypography nettoie:', !('metadata' in cleaned2) && 'h1' in cleaned2 ? 'PASS' : 'FAIL');

// Test 4: Typography avec tout le contenu dupliqué
console.log('\n🧪 Test 4: Typography avec contenu dupliqué (scénario réel)');
const corruptedTypography3 = {
  _template: 'pearl',
  metadata: { title: 'Site' },
  home: { hero: { title: 'Test' } },
  nav: { items: [] },
  h1: { fontSize: 'text-xl' }
};
console.log('✅ isValidTypography (corrompu):', isValidTypography(corruptedTypography3) === false ? 'PASS' : 'FAIL');
const cleaned3 = cleanTypography(corruptedTypography3);
console.log('✅ cleanTypography nettoie complètement:', Object.keys(cleaned3).length === 0 ? 'PASS' : 'FAIL');

// Test 5: Nettoyage récursif
console.log('\n🧪 Test 5: Nettoyage récursif');
const corruptedObject = {
  metadata: {
    typography: {
      h1: { fontSize: 'text-xl' },
      _template: 'pearl' // corrompu
    },
    reveal: {
      typography: {
        h1: { fontSize: 'text-xl' },
        metadata: { title: 'Test' } // corrompu
      }
    }
  }
};
const cleanedRecursive = cleanTypographyRecursive(corruptedObject);
console.log('✅ Nettoyage récursif metadata.typography:', !('_template' in (cleanedRecursive as any).metadata.typography) ? 'PASS' : 'FAIL');
console.log('✅ Nettoyage récursif reveal.typography:', !('metadata' in (cleanedRecursive as any).metadata.reveal.typography) ? 'PASS' : 'FAIL');

// Test 6: Typography avec polices primaire/secondaire
console.log('\n🧪 Test 6: Typography avec polices primaire/secondaire');
const typographyWithFonts = {
  h1: { fontSize: 'text-xl' },
  fonts: {
    primary: { mode: 'google', family: 'Inter', weights: '400;700' },
    secondary: { mode: 'custom', family: 'MyFont', cssUrl: 'https://example.com/font.css' },
  },
};
console.log('✅ isValidTypography (fonts):', isValidTypography(typographyWithFonts) === true ? 'PASS' : 'FAIL');
const cleanedFonts = cleanTypography(typographyWithFonts);
console.log('✅ cleanTypography conserve les fonts:', cleanedFonts.fonts?.primary?.mode === 'google' && cleanedFonts.fonts?.secondary?.mode === 'custom' ? 'PASS' : 'FAIL');

// Test 7: Typography avec font primary/secondary par élément
console.log('\n🧪 Test 7: Typography per-element font');
const typographyWithFontFlag = {
  h1: { fontSize: 'text-xl', font: 'primary' },
  p: { fontSize: 'text-base', font: 'secondary' },
};
console.log('✅ isValidTypography (font flags):', isValidTypography(typographyWithFontFlag) === true ? 'PASS' : 'FAIL');
const cleanedWithFontFlag = cleanTypography(typographyWithFontFlag);
console.log('✅ cleanTypography conserve font flags:', cleanedWithFontFlag.h1?.font === 'primary' && cleanedWithFontFlag.p?.font === 'secondary' ? 'PASS' : 'FAIL');

console.log('\n✅ Tous les tests terminés !');
