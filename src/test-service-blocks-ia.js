// Test script pour l'intégration IA des blocs de service
const testServiceOfferingIA = async () => {
  console.log('🧪 Test de l\'IA pour service-offering...');
  
  try {
    const response = await fetch('/api/admin/ai/suggest-block-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockType: 'service-offering',
        pageKey: 'home',
        context: 'Test d\'intégration IA pour bloc service-offering',
        existingBlocks: []
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur API');
    }

    console.log('✅ Réponse IA service-offering:', data.suggestedContent);
    return data.suggestedContent;
  } catch (error) {
    console.error('❌ Erreur test service-offering:', error);
    return null;
  }
};

const testServiceOfferingsIA = async () => {
  console.log('🧪 Test de l\'IA pour service-offerings...');
  
  try {
    const response = await fetch('/api/admin/ai/suggest-block-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockType: 'service-offerings',
        pageKey: 'home',
        context: 'Test d\'intégration IA pour bloc service-offerings',
        existingBlocks: []
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur API');
    }

    console.log('✅ Réponse IA service-offerings:', data.suggestedContent);
    return data.suggestedContent;
  } catch (error) {
    console.error('❌ Erreur test service-offerings:', error);
    return null;
  }
};

// Exporter les fonctions pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testServiceOfferingIA = testServiceOfferingIA;
  window.testServiceOfferingsIA = testServiceOfferingsIA;
  
  console.log('🚀 Scripts de test IA chargés!');
  console.log('Utilisez:');
  console.log('- testServiceOfferingIA() pour tester un service individuel');
  console.log('- testServiceOfferingsIA() pour tester un groupe de services');
}

export { testServiceOfferingIA, testServiceOfferingsIA }; 