"use client";
import { useState } from 'react';

const models = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4o-mini'];

export default function TestModels() {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const testModel = async (model) => {
    console.log(`🧪 Test du modèle: ${model}`);
    
    try {
      console.log('📤 Envoi requête pour modèle:', model);
      const response = await fetch('/api/admin/ai/test-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      
      console.log('📡 Réponse reçue, statut:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📄 Données reçues:', data);
        setResults(prev => ({
          ...prev,
          [model]: { status: 'success', content: data.suggestedContent }
        }));
        console.log(`✅ ${model} - Succès!`);
      } else {
        const error = await response.text();
        console.log('❌ Erreur complète:', error);
        setResults(prev => ({
          ...prev,
          [model]: { status: 'error', error: `${response.status}: ${error}` }
        }));
        console.log(`❌ ${model} - Erreur ${response.status}: ${error}`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [model]: { status: 'error', error: error.message }
      }));
      console.log(`❌ ${model} - Exception: ${error.message}`);
    }
  };

  const testAllModels = async () => {
    setTesting(true);
    setResults({});
    
    for (const model of models) {
      await testModel(model);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
    }
    
    setTesting(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test des Modèles GPT</h1>
      
      <button
        onClick={testAllModels}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {testing ? '🔄 Test en cours...' : '🚀 Tester tous les modèles'}
      </button>

      <div className="space-y-4">
        {models.map(model => (
          <div key={model} className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">{model}</h3>
            
            {!results[model] && (
              <p className="text-gray-500">En attente du test...</p>
            )}
            
            {results[model]?.status === 'success' && (
              <div>
                <p className="text-green-600 font-semibold">✅ Succès</p>
                <p className="mt-2 text-sm bg-gray-100 p-2 rounded">
                  {results[model].content}
                </p>
              </div>
            )}
            
            {results[model]?.status === 'error' && (
              <div>
                <p className="text-red-600 font-semibold">❌ Erreur</p>
                <p className="mt-2 text-sm bg-red-50 p-2 rounded text-red-700">
                  {results[model].error}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 