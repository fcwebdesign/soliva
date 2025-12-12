"use client";
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WysiwygEditor from '../../../components/WysiwygEditorWrapper';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface PageIntroData {
  title?: string;
  description?: string;
  layout?: 'default' | 'two-columns';
  descriptionSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  parallax?: {
    enabled?: boolean;
    speed?: number;
  };
}

export default function PageIntroBlockEditor({ data, onChange, compact = false, context }: { data: PageIntroData; onChange: (data: PageIntroData) => void; compact?: boolean; context?: any }) {
  const [isLoadingBlockAI, setIsLoadingBlockAI] = useState<string | null>(null);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [descSizeOpen, setDescSizeOpen] = useState(false);
  const sizeOptions: Array<{ value: PageIntroData['descriptionSize']; label: string }> = [
    { value: 'h4', label: 'Petit (h4)' },
    { value: 'h3', label: 'Moyen (h3)' },
    { value: 'h2', label: 'Large (h2)' },
    { value: 'h1', label: 'XL (h1)' },
    { value: 'p', label: 'Paragraphe (p)' },
  ];

  // Compatibilité avec les anciennes valeurs (small/medium/large/xl)
  const normalizeSize = (val?: string): PageIntroData['descriptionSize'] => {
    const map: Record<string, PageIntroData['descriptionSize']> = {
      small: 'h4',
      medium: 'h3',
      large: 'h2',
      xl: 'h1',
    };
    return (map[val || ''] || (val as any)) as PageIntroData['descriptionSize'];
  };

  const currentSize = normalizeSize(data.descriptionSize) || 'h3';
  
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
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-[10px] text-gray-400">Description</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Taille</span>
              <Select
                  value={currentSize}
                  onValueChange={(value) => onChange({ ...data, descriptionSize: value as PageIntroData['descriptionSize'] })}
                  open={descSizeOpen}
                  onOpenChange={setDescSizeOpen}
                >
                  <SelectTrigger className="h-auto px-2 py-1 text-[12px] leading-normal font-normal shadow-none rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="shadow-none border rounded">
                    {sizeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value || 'h3'}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <WysiwygEditor
              value={data.description || ''}
              onChange={(content: string) => onChange({ ...data, description: content })}
              placeholder="Laisser vide pour utiliser la description de la page"
              onAISuggestion={getBlockContentSuggestion}
              isLoadingAI={isLoadingBlockAI === 'description'}
              compact={true}
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Layout</label>
              <Select 
                value={data.layout || 'default'} 
                onValueChange={(value) => onChange({ ...data, layout: value as 'default' | 'two-columns' })}
                open={layoutOpen}
                onOpenChange={setLayoutOpen}
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

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Parallax (scroll)</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!data.parallax?.enabled}
                  onCheckedChange={(checked) => onChange({ ...data, parallax: { ...(data.parallax || {}), enabled: checked } })}
                />
                <div className="flex-1 -mx-2 px-2">
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[data.parallax?.speed ?? 0.25]}
                    onValueChange={(values) =>
                      onChange({ ...data, parallax: { ...(data.parallax || {}), enabled: true, speed: values[0] } })
                    }
                    disabled={!data.parallax?.enabled}
                  />
                </div>
                <span className="text-[11px] text-gray-500 text-right flex-shrink-0 w-12">
                  {(data.parallax?.speed ?? 0.25).toFixed(2)}
                </span>
              </div>
            </div>
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
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-gray-500">Taille</span>
          <Select
            value={currentSize}
            onValueChange={(value) => onChange({ ...data, descriptionSize: value as PageIntroData['descriptionSize'] })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value || 'h3'}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      {/* Parallax (design aligné avec HeroFloatingGallery) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Parallax (scroll)</label>
        <div className="flex items-center gap-3 mt-1">
          <Switch
            checked={!!data.parallax?.enabled}
            onCheckedChange={(checked) => onChange({ ...data, parallax: { ...(data.parallax || {}), enabled: checked } })}
          />
          <div className="flex-1 -mx-2 px-2">
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[data.parallax?.speed ?? 0.25]}
              onValueChange={(values) =>
                onChange({ ...data, parallax: { ...(data.parallax || {}), enabled: true, speed: values[0] } })
              }
              disabled={!data.parallax?.enabled}
            />
          </div>
          <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
            {(data.parallax?.speed ?? 0.25).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Taille de la description (info) */}
      <p className="text-xs text-gray-500">
        Le rendu suit les styles typographiques configurés : h4 (petit), h3 (moyen), h2 (large), h1 (XL), p (paragraphe).
      </p>
    </div>
  );
}
