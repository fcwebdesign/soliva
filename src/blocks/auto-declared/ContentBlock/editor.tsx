"use client";
import React, { useState } from 'react';
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';

interface ContentData {
  id?: string;
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContentBlockEditor({ data, onChange, context }: { data: ContentData; onChange: (data: ContentData) => void; context?: any }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const handleContentChange = (content: string) => {
    // Pas de nettoyage HTML - on laisse TipTap faire son travail naturellement
    onChange({ ...data, content });
  };

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      // Construire le contexte à partir des données disponibles
      let contextText = `Contenu pour un bloc de contenu`;
      
      if (context) {
        // Ajouter le contexte du site/domaine si disponible
        if (context.metadata?.title) {
          contextText += `. Site: ${context.metadata.title}`;
        }
        
        // Ajouter la description du site si disponible
        if (context.metadata?.description) {
          contextText += `. Description du site: "${context.metadata.description}"`;
        }
        
        // Ajouter le contexte du site/domaine si disponible (fallback)
        if (context.domain || context.siteName || context.brand) {
          const siteInfo = context.domain || context.siteName || context.brand;
          contextText += `. Domaine: ${siteInfo}`;
        }
        
        // Ajouter le type de site/industrie si disponible
        if (context.industry || context.category || context.type) {
          const industryInfo = context.industry || context.category || context.type;
          contextText += `. Industrie: ${industryInfo}`;
        }
        
        // Ajouter le titre de la page si disponible
        if (context.title || context.hero?.title) {
          contextText += `. Titre de la page: "${context.title || context.hero?.title}"`;
        }
        
        // Ajouter la description si disponible
        if (context.description || context.hero?.description) {
          contextText += `. Description de la page: "${context.description || context.hero?.description}"`;
        }
        
        // Ajouter les autres blocs de contenu pour le contexte
        if (context.blocks && Array.isArray(context.blocks)) {
          // Trouver l'index du bloc actuel
          const currentBlockIndex = context.blocks.findIndex((b: any) => b.id === data.id);
          
          // Prendre les blocs juste avant (titre h2, h3, ou contenu)
          const previousBlocks = context.blocks
            .slice(0, currentBlockIndex)
            .filter((b: any) => b.type === 'h2' || b.type === 'h3' || b.type === 'content')
            .slice(-2) // Prendre les 2 derniers blocs avant
            .map((b: any) => {
              if (b.type === 'h2' || b.type === 'h3') {
                return `Titre: "${b.content}"`;
              } else if (b.type === 'content') {
                return `Contenu: "${b.content}"`;
              }
              return '';
            })
            .filter(text => text.length > 0);
          
          if (previousBlocks.length > 0) {
            contextText += `. Contexte précédent: ${previousBlocks.join(' | ')}`;
          }
          
          // Ajouter aussi d'autres blocs de contenu pour le contexte général
          const otherContentBlocks = context.blocks
            .filter((b: any) => b.type === 'content' && b.content && b.id !== data.id)
            .map((b: any) => b.content)
            .slice(0, 2); // Limiter à 2 blocs pour éviter un contexte trop long
          
          if (otherContentBlocks.length > 0) {
            contextText += `. Autres contenus sur la page: ${otherContentBlocks.join(' | ')}`;
          }
        }
      }

      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey: 'content',
          context: contextText
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      onChange({ ...data, content: responseData.suggestedContent });
      
    } catch (error) {
      console.error('Erreur suggestion contenu IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return (
    <div className="block-editor">
      <WysiwygEditor
        value={data.content || ''}
        onChange={handleContentChange}
        placeholder="Saisissez votre contenu ici..."
        onAISuggestion={() => getBlockContentSuggestion('content-block', 'content')}
        isLoadingAI={isLoadingBlockAI === 'content-block'}
      />
    </div>
  );
}
