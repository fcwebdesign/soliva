'use client';
import { useState } from 'react';

export default function TemplateTestSimple() {
  const [result, setResult] = useState<string>('');

  const testAPI = async () => {
    try {
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erreur: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API Templates</h1>
      <button
        onClick={testAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Tester l'API
      </button>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {result || 'Clique sur "Tester l\'API" pour voir le résultat'}
      </pre>
    </div>
  );
}
