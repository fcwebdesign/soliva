// Script de test pour les différents modèles GPT
const models = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4o-mini'];

async function testModel(model) {
  console.log(`\n🧪 Test du modèle: ${model}`);
  
  try {
    const response = await fetch('/api/admin/ai/suggest-block-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockType: 'content',
        pageKey: 'studio',
        existingBlocks: [
          { type: 'h2', content: 'Notre approche créative' },
          { type: 'content', content: 'Nous utilisons une méthode unique.' }
        ],
        context: 'Test de modèle'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${model} - Succès!`);
      console.log(`📝 Contenu généré: ${data.suggestedContent.substring(0, 100)}...`);
    } else {
      const error = await response.text();
      console.log(`❌ ${model} - Erreur ${response.status}: ${error}`);
    }
  } catch (error) {
    console.log(`❌ ${model} - Exception: ${error.message}`);
  }
}

async function testAllModels() {
  console.log('🚀 Test de tous les modèles GPT...');
  
  for (const model of models) {
    // Temporairement changer le modèle dans l'API
    // Note: En réalité, il faudrait modifier l'API pour chaque test
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
  }
  
  console.log('\n✅ Tests terminés!');
}

// Pour exécuter: node test-models.js
if (typeof window === 'undefined') {
  testAllModels();
} 