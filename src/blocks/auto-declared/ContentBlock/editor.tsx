import React, { useState } from 'react';
import WysiwygEditor from '../../../app/admin/components/WysiwygEditor';

interface ContentData {
  content: string;
}

export default function ContentBlockEditor({ data, onChange }: { data: ContentData; onChange: (data: ContentData) => void }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey: 'content',
          context: `Contenu de texte pour la page`
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      onChange({ content: responseData.suggestedContent });
      
    } catch (error) {
      console.error('Erreur suggestion contenu IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => getBlockContentSuggestion('content-block', 'content')}
          disabled={isLoadingBlockAI === 'content-block'}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            isLoadingBlockAI === 'content-block' 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
          }`}
        >
          {isLoadingBlockAI === 'content-block' ? '🤖...' : '🤖 IA'}
        </button>
      </div>
      <WysiwygEditor
        value={data.content}
        onChange={(content: any) => onChange({ content })}
        placeholder="Saisissez votre contenu ici..."
      />
    </div>
  );
}
