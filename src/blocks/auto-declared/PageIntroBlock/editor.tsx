"use client";
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';

interface PageIntroData {
  title?: string;
  description?: string;
  layout?: 'default' | 'two-columns';
}

export default function PageIntroBlockEditor({ data, onChange, compact = false, context }: { data: PageIntroData; onChange: (data: PageIntroData) => void; compact?: boolean; context?: any }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);
  const [openSelect, setOpenSelect] = useState(false);
  
  // Pré-remplir le titre et la description si vides (seulement au montage initial)
  const [hasInitialized, setHasInitialized] = React.useState(false);
  React.useEffect(() => {
    if (hasInitialized) return;
    
    const hasTitle = data.title && data.title.trim();
    const hasDescription = data.description && data.description.trim();
    let needsUpdate = false;
    const updates: Partial<PageIntroData> = {};
    
    // Si pas de titre, utiliser celui de la page
    if (!hasTitle && context) {
      const pageTitle = context.title || context.hero?.title || '';
      if (pageTitle) {
        updates.title = pageTitle;
        needsUpdate = true;
      }
    }
    
    // Si pas de description, mettre "Description of the page" par défaut
    if (!hasDescription) {
      updates.description = 'Description of the page';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      onChange({ ...data, ...updates });
      setHasInitialized(true);
    } else {
      setHasInitialized(true);
    }
  }, []); // Seulement au montage initial

  const getBlockContentSuggestion = async () => {
    setIsLoadingBlockAI('description');
    try {
      // Construire le contexte à partir des données disponibles
      let contextText = 'Description de page';
      
      // PRIORITÉ 1 : Utiliser le titre saisi dans le bloc (le plus récent)
      if (data.title && data.title.trim()) {
        contextText += `. Titre de la page: "${data.title.trim()}". Génère une description cohérente et pertinente pour cette page.`;
      }
      
      if (context) {
        // Ajouter le contexte du site/domaine si disponible
        if (context.metadata?.title) {
          contextText += `. Site: ${context.metadata.title}`;
        }
        
        // Ajouter la description du site si disponible
        if (context.metadata?.description) {
          contextText += `. Description du site: "${context.metadata.description}"`;
        }
        
        // Ajouter le titre de la page si disponible (fallback si pas de titre dans le bloc)
        if (!data.title && (context.title || context.hero?.title)) {
          contextText += `. Titre de la page actuelle: "${context.title || context.hero?.title}"`;
        }
        
        // Ajouter la description si disponible
        if (context.description || context.hero?.description) {
          contextText += `. Description de la page actuelle: "${context.description || context.hero?.description}"`;
        }
      }

      const response = await fetch('/api/admin/ai/suggest-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockType: 'page-intro',
          pageKey: 'description',
          context: contextText
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur API');
      }

      onChange({ 
        ...data, 
        description: responseData.suggestedContent 
      });
      
    } catch (error: any) {
      console.error('Erreur suggestion description IA:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoadingBlockAI(null);
    }
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Laisser vide pour utiliser le titre de la page"
              className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Description</label>
            <WysiwygEditor
              value={data.description || ''}
              onChange={(content: string) => onChange({ ...data, description: content })}
              placeholder="Laisser vide pour utiliser la description de la page"
              onAISuggestion={getBlockContentSuggestion}
              isLoadingAI={isLoadingBlockAI === 'description'}
              compact={true}
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Layout</label>
            <Select 
              value={data.layout || 'default'} 
              onValueChange={(value) => onChange({ ...data, layout: value as 'default' | 'two-columns' })}
              open={openSelect}
              onOpenChange={setOpenSelect}
            >
              <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border rounded">
                <SelectItem value="default">Par défaut (adaptatif)</SelectItem>
                <SelectItem value="two-columns">2 colonnes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor space-y-4">
      <div className="text-sm text-gray-600 mb-3">
        <p className="mb-1">💡 Ce bloc affiche le titre et la description de la page.</p>
        <p className="text-xs">Si laissés vides, il utilisera automatiquement les métadonnées de la page.</p>
      </div>
      
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Laisser vide pour utiliser le titre de la page"
          className="block-input w-full"
        />
        <p className="text-xs text-gray-500 mt-1">Laisser vide pour utiliser automatiquement le titre de la page</p>
      </div>

      {/* Description */}
      <div>
        <WysiwygEditor
          value={data.description || ''}
          onChange={(content: string) => onChange({ ...data, description: content })}
          placeholder="Laisser vide pour utiliser la description de la page"
          onAISuggestion={getBlockContentSuggestion}
          isLoadingAI={isLoadingBlockAI === 'description'}
          compact={false}
        />
        <p className="text-xs text-gray-500 mt-1">Laisser vide pour utiliser automatiquement la description de la page</p>
      </div>

      {/* Layout */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
        <Select 
          value={data.layout || 'default'} 
          onValueChange={(value) => onChange({ ...data, layout: value as 'default' | 'two-columns' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Par défaut (adaptatif selon template)</SelectItem>
            <SelectItem value="two-columns">2 colonnes (titre gauche, description droite)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          "Par défaut" : layout adaptatif selon le template (Pearl = 2 colonnes, autres = centré)
        </p>
      </div>
    </div>
  );
}

