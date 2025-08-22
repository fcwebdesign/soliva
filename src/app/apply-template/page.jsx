"use client";
import { useState } from 'react';

export default function ApplyTemplate() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const applyTemplate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: 'minimaliste-premium' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Template appliqué avec succès ! Rechargez la page d\'accueil.');
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const restoreOriginal = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/templates/restore', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Site original restauré ! Rechargez la page d\'accueil.');
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Appliquer Template</h1>
      
      <div className="bg-white p-6 rounded mb-4">
        <h2 className="font-bold mb-4">Actions:</h2>
        
        <button
          onClick={applyTemplate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        >
          {loading ? 'Application...' : 'Appliquer Minimaliste Premium'}
        </button>
        
        <button
          onClick={restoreOriginal}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Restauration...' : 'Restaurer Original'}
        </button>
      </div>
      
      {message && (
        <div className="bg-white p-4 rounded">
          <p>{message}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Après application, allez sur:</p>
        <ul className="list-disc ml-4">
          <li><a href="/" className="text-blue-600 underline">Page d'accueil</a> (devrait montrer le template)</li>
          <li><a href="/debug-template" className="text-blue-600 underline">Page debug</a> (pour vérifier)</li>
        </ul>
      </div>
    </div>
  );
} 