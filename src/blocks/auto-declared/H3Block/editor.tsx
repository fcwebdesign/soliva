import React, { useState } from 'react';

interface H3Data {
  content: string;
}

export default function H3BlockEditor({ data, onChange }: { data: H3Data; onChange: (data: H3Data) => void }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey: 'h3',
          context: `Sous-titre H3 pour la page`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      onChange({ content: responseData.suggestedContent });
      
    } catch (error) {
      console.error('Erreur suggestion contenu H3 IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => getBlockContentSuggestion('h3-block', 'h3')}
          disabled={isLoadingBlockAI === 'h3-block'}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            isLoadingBlockAI === 'h3-block' 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
          }`}
        >
          {isLoadingBlockAI === 'h3-block' ? '🤖...' : '🤖 IA'}
        </button>
      </div>
      <input
        type="text"
        value={data.content || ''}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Sous-titre (H3)"
        className="block-input h3-input"
      />
    </div>
  );
}
