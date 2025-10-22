import { useState } from 'react';
import { toast } from "sonner";

interface UseAIAssistantProps {
  pageKey: string;
  localData: any;
  blocks: any[];
  updateField: (path: string, value: any) => void;
  updateBlock: (blockId: string, updates: any) => void;
}

export const useAIAssistant = ({ pageKey, localData, blocks, updateField, updateBlock }: UseAIAssistantProps) => {
  const [isLoadingDescriptionAI, setIsLoadingDescriptionAI] = useState(false);
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);

  const getDescriptionSuggestion = async () => {
    if (pageKey !== 'blog' && pageKey !== 'work' && pageKey !== 'contact' && pageKey !== 'studio' && pageKey !== 'custom') return;
    
    setIsLoadingDescriptionAI(true);
    try {
      const response = await fetch('/api/admin/ai/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: pageKey === 'work' ? 'work' : pageKey === 'blog' ? 'blog' : pageKey === 'contact' ? 'contact' : pageKey === 'custom' ? 'custom' : 'studio',
          title: pageKey === 'custom' ? localData.title : undefined
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Appliquer la suggestion
      const descriptionPath = 'description';
      updateField(descriptionPath, data.suggestedDescription);
      
    } catch (error) {
      console.error('Erreur suggestion description IA:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoadingDescriptionAI(false);
    }
  };

  const getBlockContentSuggestion = async (blockId: string, blockType: string) => {
    setIsLoadingBlockAI(blockId);
    try {
      // Récupérer le bloc actuel pour avoir le titre existant
      const currentBlock = blocks.find(block => block.id === blockId);
      
      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType,
          pageKey,
          existingBlocks: blocks,
          existingTitle: currentBlock?.title || '',
          existingOfferings: currentBlock?.offerings || [],
          context: `Bloc ${blockType} dans la page ${pageKey}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Appliquer la suggestion au bloc selon le type
      if (blockType === 'services') {
        // Pour services, garder le titre existant et mettre à jour seulement les descriptions
        const suggestion = data.suggestedContent;
        if (suggestion.offerings && currentBlock?.offerings) {
          // Mettre à jour seulement les descriptions des services existants
          const updatedOfferings = currentBlock.offerings.map((offering, index) => ({
            ...offering,
            description: suggestion.offerings[index]?.description || offering.description
          }));
          updateBlock(blockId, { offerings: updatedOfferings });
        } else if (suggestion.offerings) {
          // Si pas d'offerings existants, utiliser les nouveaux
          updateBlock(blockId, { offerings: suggestion.offerings });
        }
      } else {
        // Pour les autres types, mettre à jour le contenu
        updateBlock(blockId, { content: data.suggestedContent });
      }
      
    } catch (error) {
      console.error('Erreur suggestion contenu bloc IA:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  const getServiceDescriptionSuggestion = async (blockId: string, serviceIndex: number, serviceTitle: string) => {
    const loadingId = `${blockId}-${serviceIndex}`;
    setIsLoadingBlockAI(loadingId);
    try {
      const response = await fetch('/api/admin/ai/suggest-service-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceTitle,
          pageKey,
          existingBlocks: blocks,
          context: `Service "${serviceTitle}" dans la page ${pageKey}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      // Appliquer la suggestion au service spécifique
      const currentBlock = blocks.find(block => block.id === blockId);
      if (currentBlock?.offerings) {
        const updatedOfferings = [...currentBlock.offerings];
        updatedOfferings[serviceIndex] = {
          ...updatedOfferings[serviceIndex],
          description: data.suggestedDescription
        };
        updateBlock(blockId, { offerings: updatedOfferings });
      }
      
    } catch (error) {
      console.error('Erreur suggestion description service IA:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  return {
    isLoadingDescriptionAI,
    isLoadingBlockAI,
    getDescriptionSuggestion,
    getBlockContentSuggestion,
    getServiceDescriptionSuggestion
  };
};
