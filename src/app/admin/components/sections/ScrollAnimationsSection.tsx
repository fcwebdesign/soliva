"use client";
import React, { useEffect, useState } from 'react';
import { Sparkles, Play, Eye } from 'lucide-react';
import { getBlockMetadata } from '@/blocks/auto-declared/registry';

interface ScrollAnimationsSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

// Types d'animations disponibles (style Awwwards)
export type ScrollAnimationType = 
  | 'none'
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'scale-in'
  | 'scale-in-up'
  | 'rotate-in'
  | 'blur-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'split-text-up'
  | 'split-text-down'
  | 'parallax';

interface AnimationConfig {
  type: ScrollAnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  threshold?: number; // Point de déclenchement (0-1)
}

const ANIMATION_PRESETS: Record<ScrollAnimationType, { 
  label: string; 
  description: string;
  defaultDuration: number;
  defaultEasing: string;
}> = {
  'none': {
    label: 'Aucune animation',
    description: 'Désactive les animations de scroll',
    defaultDuration: 0,
    defaultEasing: 'power2.out'
  },
  'fade-in': {
    label: 'Fade In',
    description: 'Apparition en fondu simple',
    defaultDuration: 0.8,
    defaultEasing: 'power2.out'
  },
  'fade-in-up': {
    label: 'Fade In Up',
    description: 'Apparition depuis le bas avec fondu',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'fade-in-down': {
    label: 'Fade In Down',
    description: 'Apparition depuis le haut avec fondu',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'fade-in-left': {
    label: 'Fade In Left',
    description: 'Apparition depuis la gauche avec fondu',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'fade-in-right': {
    label: 'Fade In Right',
    description: 'Apparition depuis la droite avec fondu',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'scale-in': {
    label: 'Scale In',
    description: 'Apparition avec zoom depuis 0.8',
    defaultDuration: 0.9,
    defaultEasing: 'back.out(1.7)'
  },
  'scale-in-up': {
    label: 'Scale In Up',
    description: 'Zoom depuis le bas',
    defaultDuration: 1,
    defaultEasing: 'back.out(1.7)'
  },
  'rotate-in': {
    label: 'Rotate In',
    description: 'Rotation légère à l\'apparition',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'blur-in': {
    label: 'Blur In',
    description: 'Apparition avec flou progressif',
    defaultDuration: 1,
    defaultEasing: 'power2.out'
  },
  'slide-up': {
    label: 'Slide Up',
    description: 'Glissement depuis le bas',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'slide-down': {
    label: 'Slide Down',
    description: 'Glissement depuis le haut',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'slide-left': {
    label: 'Slide Left',
    description: 'Glissement depuis la droite',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'slide-right': {
    label: 'Slide Right',
    description: 'Glissement depuis la gauche',
    defaultDuration: 1,
    defaultEasing: 'power3.out'
  },
  'split-text-up': {
    label: 'Split Text Up',
    description: 'Texte divisé qui monte (pour titres)',
    defaultDuration: 1.2,
    defaultEasing: 'power4.out'
  },
  'split-text-down': {
    label: 'Split Text Down',
    description: 'Texte divisé qui descend (pour titres)',
    defaultDuration: 1.2,
    defaultEasing: 'power4.out'
  },
  'parallax': {
    label: 'Parallax',
    description: 'Effet de parallaxe au scroll',
    defaultDuration: 0,
    defaultEasing: 'power1.out'
  }
};

const ScrollAnimationsSection: React.FC<ScrollAnimationsSectionProps> = ({ 
  localData, 
  updateField 
}) => {
  const [globalAnimation, setGlobalAnimation] = useState<AnimationConfig>({
    type: 'fade-in-up',
    duration: 1,
    delay: 0,
    stagger: 0,
    easing: 'power3.out',
    threshold: 0.2
  });

  const [blockAnimations, setBlockAnimations] = useState<Record<string, AnimationConfig>>({});
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  // Charger les valeurs existantes
  useEffect(() => {
    const scrollAnimations = localData?.metadata?.scrollAnimations || {};
    
    if (scrollAnimations.enabled !== undefined) {
      setIsEnabled(scrollAnimations.enabled);
    }
    
    if (scrollAnimations.global) {
      setGlobalAnimation({
        type: scrollAnimations.global.type || 'fade-in-up',
        duration: scrollAnimations.global.duration ?? 1,
        delay: scrollAnimations.global.delay ?? 0,
        stagger: scrollAnimations.global.stagger ?? 0,
        easing: scrollAnimations.global.easing || 'power3.out',
        threshold: scrollAnimations.global.threshold ?? 0.2
      });
    }
    
    if (scrollAnimations.blocks) {
      setBlockAnimations(scrollAnimations.blocks);
    }
  }, [localData]);

  const save = (updates: any) => {
    const current = localData?.metadata?.scrollAnimations || {};
    const newConfig = {
      ...current,
      ...updates
    };
    updateField('metadata.scrollAnimations', newConfig);
  };

  const updateGlobalAnimation = (field: keyof AnimationConfig, value: any) => {
    const updated = { ...globalAnimation, [field]: value };
    setGlobalAnimation(updated);
    save({ global: updated });
  };

  const updateBlockAnimation = (blockType: string, config: AnimationConfig) => {
    const updated = { ...blockAnimations, [blockType]: config };
    setBlockAnimations(updated);
    save({ blocks: updated });
  };

  const toggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    save({ enabled: newEnabled });
  };

  // Détecter automatiquement tous les blocs depuis le registre
  const [blockTypes, setBlockTypes] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    // Fonction pour convertir le type de bloc en nom d'animation
    // Ex: 'content-block' -> 'ContentBlock', 'h2' -> 'H2Block'
    const convertToAnimationType = (blockType: string): string => {
      const pascalCase = blockType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      return pascalCase.endsWith('Block') ? pascalCase : `${pascalCase}Block`;
    };

    try {
      // Récupérer tous les blocs depuis le registre
      const metadata = getBlockMetadata();
      const types = metadata.map(block => ({
        id: convertToAnimationType(block.type),
        label: block.label || block.type
      }));

      // Ajouter les blocs spéciaux/legacy qui ne sont pas dans le registre
      const specialBlocks = [
        { id: 'ContentBlock', label: 'Bloc de contenu' }, // Legacy
      ];

      // Fusionner et dédupliquer
      const allBlocks = [...types, ...specialBlocks];
      const uniqueBlocks = Array.from(
        new Map(allBlocks.map(block => [block.id, block])).values()
      ).sort((a, b) => a.label.localeCompare(b.label));

      setBlockTypes(uniqueBlocks);
    } catch (error) {
      // Fallback si le registre n'est pas disponible
      console.warn('Impossible de charger les blocs depuis le registre:', error);
      setBlockTypes([
        { id: 'ContentBlock', label: 'Bloc de contenu' },
        { id: 'H2Block', label: 'Titre H2' },
        { id: 'H3Block', label: 'Titre H3' },
        { id: 'ImageBlock', label: 'Image' },
        { id: 'ProjectsBlock', label: 'Projets' },
        { id: 'TestimonialBlock', label: 'Témoignages' },
        { id: 'GalleryGridBlock', label: 'Galerie' },
        { id: 'ContactBlock', label: 'Contact' },
        { id: 'LogosBlock', label: 'Logos' },
        { id: 'ServicesBlock', label: 'Services' },
        { id: 'TwoColumnsBlock', label: 'Deux colonnes' },
        { id: 'ThreeColumnsBlock', label: 'Trois colonnes' },
        { id: 'FourColumnsBlock', label: 'Quatre colonnes' },
        { id: 'FAQBlock', label: 'FAQ' },
        { id: 'QuoteBlock', label: 'Citation' },
        { id: 'ExpandableCard', label: 'Carte extensible' }
      ]);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Animations de Scroll</h3>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={toggleEnabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Activer les animations</span>
        </label>
      </div>

      {!isEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Les animations de scroll sont désactivées. Activez-les pour configurer les animations.
          </p>
        </div>
      )}

      {isEnabled && (
        <div className="space-y-8">
          {/* Configuration globale */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Animation globale (par défaut pour tous les blocs)
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Type d'animation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'animation
                </label>
                <select
                  value={globalAnimation.type}
                  onChange={(e) => updateGlobalAnimation('type', e.target.value as ScrollAnimationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(ANIMATION_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {ANIMATION_PRESETS[globalAnimation.type].description}
                </p>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (secondes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  step="0.1"
                  value={globalAnimation.duration}
                  onChange={(e) => updateGlobalAnimation('duration', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Délai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai (secondes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={globalAnimation.delay}
                  onChange={(e) => updateGlobalAnimation('delay', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Stagger (pour les éléments multiples) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stagger (secondes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={globalAnimation.stagger}
                  onChange={(e) => updateGlobalAnimation('stagger', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Délai entre chaque élément (pour les listes)
                </p>
              </div>

              {/* Easing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courbe d'animation (Easing)
                </label>
                <select
                  value={globalAnimation.easing}
                  onChange={(e) => updateGlobalAnimation('easing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="power1.out">Power 1 Out</option>
                  <option value="power2.out">Power 2 Out</option>
                  <option value="power3.out">Power 3 Out</option>
                  <option value="power4.out">Power 4 Out</option>
                  <option value="back.out(1.7)">Back Out</option>
                  <option value="elastic.out(1, 0.3)">Elastic Out</option>
                  <option value="expo.out">Expo Out</option>
                  <option value="sine.out">Sine Out</option>
                </select>
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point de déclenchement
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={globalAnimation.threshold}
                  onChange={(e) => updateGlobalAnimation('threshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quand déclencher : 0 = dès l'entrée, 0.2 = tôt (recommandé), 0.5 = milieu, 1 = tard
                </p>
              </div>
            </div>
          </div>

          {/* Animations par type de bloc */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Animations spécifiques par type de bloc
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Configurez des animations différentes pour chaque type de bloc. Si non défini, l'animation globale sera utilisée.
            </p>

            <div className="space-y-4">
              {blockTypes.map((blockType) => {
                const blockAnim = blockAnimations[blockType.id] || { 
                  ...globalAnimation,
                  // Threshold par défaut plus bas pour ImageBlock (apparition plus tôt)
                  threshold: blockType.id === 'ImageBlock' ? 0.1 : globalAnimation.threshold
                };
                
                return (
                  <div key={blockType.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">{blockType.label}</h5>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={blockAnim.type}
                          onChange={(e) => {
                            const updated = { ...blockAnim, type: e.target.value as ScrollAnimationType };
                            updateBlockAnimation(blockType.id, updated);
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(ANIMATION_PRESETS).map(([key, preset]) => (
                            <option key={key} value={key}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Durée
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          step="0.1"
                          value={blockAnim.duration || 1}
                          onChange={(e) => {
                            const updated = { ...blockAnim, duration: parseFloat(e.target.value) };
                            updateBlockAnimation(blockType.id, updated);
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Point de déclenchement
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={blockAnim.threshold ?? 0.2}
                          onChange={(e) => {
                            const updated = { ...blockAnim, threshold: parseFloat(e.target.value) };
                            updateBlockAnimation(blockType.id, updated);
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {blockAnim.threshold === 0 ? 'Très tôt (dès l\'entrée)' :
                           blockAnim.threshold <= 0.2 ? 'Tôt (recommandé pour images)' :
                           blockAnim.threshold <= 0.4 ? 'Moyen' : 'Tard'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note de sauvegarde */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>✓ Sauvegarde automatique :</strong> Les modifications sont sauvegardées automatiquement. 
              N'oubliez pas de cliquer sur "Sauvegarder" dans la barre supérieure pour finaliser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollAnimationsSection;

