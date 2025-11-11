"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Type, Palette } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { resolvePalette } from '@/utils/palette';

interface TypographySectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const TypographySection: React.FC<TypographySectionProps> = ({ localData, updateField }) => {
  const [typography, setTypography] = useState({
    h1: {
      fontSize: 'text-fluid-10xl',
      fontWeight: 'font-medium',
      lineHeight: 'leading-none',
      color: 'text-gray-900',
      tracking: 'tracking-tighter'
    },
    h2: {
      fontSize: 'text-fluid-4xl',
      fontWeight: 'font-semibold',
      lineHeight: 'leading-tight',
      color: 'text-gray-900',
      tracking: 'tracking-tight'
    },
    h3: {
      fontSize: 'text-lg',
      fontWeight: 'font-semibold',
      lineHeight: 'leading-normal',
      color: 'text-gray-900',
      tracking: 'tracking-normal'
    },
    h4: {
      fontSize: 'text-sm',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-600',
      tracking: 'tracking-normal'
    },
    h1Single: {
      fontSize: 'text-fluid-10xl',
      fontWeight: 'font-medium',
      lineHeight: 'leading-none',
      color: 'text-gray-900',
      tracking: 'tracking-tighter'
    },
    p: {
      fontSize: 'text-base',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-700',
      tracking: 'tracking-normal'
    },
    nav: {
      fontSize: 'text-sm',
      fontWeight: 'font-medium',
      lineHeight: 'leading-normal',
      color: 'text-gray-500',
      tracking: 'tracking-normal'
    },
    footer: {
      fontSize: 'text-sm',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-600',
      tracking: 'tracking-normal'
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Récupérer la palette actuelle pour afficher les couleurs par défaut
  // Mémoriser uniquement sur les changements de palette, pas sur tout localData
  const currentPalette = useMemo(() => {
    try {
      const basePalette = resolvePaletteFromContent(localData || {});
      return resolvePalette(basePalette);
    } catch (error) {
      console.error('Erreur lors de la résolution de la palette:', error);
      return null;
    }
  }, [localData?.metadata?.colorPalette, JSON.stringify(localData?.metadata?.customPalettes || [])]);

  // Mapping des éléments vers les tokens de palette par défaut (mémorisé)
  const getDefaultPaletteColor = useMemo(() => {
    return (element: string): string => {
      if (!currentPalette) return 'text-foreground';
      
      // Mapping logique : h1, h2, h3, h1Single → foreground (texte principal)
      // p, nav, footer → muted-foreground (texte secondaire)
      // h4 → muted-foreground (texte secondaire aussi)
      if (['h1', 'h2', 'h3', 'h1Single'].includes(element)) {
        return 'text-foreground';
      }
      return 'text-muted-foreground';
    };
  }, [currentPalette]);

  // Charger la configuration actuelle UNIQUEMENT au chargement initial
  useEffect(() => {
    // Ne charger qu'une seule fois au montage du composant
    if (isInitialized) return;
    
    const typoConfig = localData?.metadata?.typography || {};
    const defaultColorH1 = getDefaultPaletteColor('h1');
    const defaultColorH2 = getDefaultPaletteColor('h2');
    const defaultColorH3 = getDefaultPaletteColor('h3');
    const defaultColorH4 = getDefaultPaletteColor('h4');
    const defaultColorH1Single = getDefaultPaletteColor('h1Single');
    const defaultColorP = getDefaultPaletteColor('p');
    const defaultColorNav = getDefaultPaletteColor('nav');
    const defaultColorFooter = getDefaultPaletteColor('footer');
    
    setTypography({
      h1: {
        fontSize: typoConfig.h1?.fontSize || 'text-fluid-10xl',
        fontWeight: typoConfig.h1?.fontWeight || 'font-medium',
        lineHeight: typoConfig.h1?.lineHeight || 'leading-none',
        color: typoConfig.h1?.color || defaultColorH1,
        tracking: typoConfig.h1?.tracking || 'tracking-tighter'
      },
      h2: {
        fontSize: typoConfig.h2?.fontSize || 'text-fluid-4xl',
        fontWeight: typoConfig.h2?.fontWeight || 'font-semibold',
        lineHeight: typoConfig.h2?.lineHeight || 'leading-tight',
        color: typoConfig.h2?.color || defaultColorH2,
        tracking: typoConfig.h2?.tracking || 'tracking-tight'
      },
      h3: {
        fontSize: typoConfig.h3?.fontSize || 'text-lg',
        fontWeight: typoConfig.h3?.fontWeight || 'font-semibold',
        lineHeight: typoConfig.h3?.lineHeight || 'leading-normal',
        color: typoConfig.h3?.color || defaultColorH3,
        tracking: typoConfig.h3?.tracking || 'tracking-normal'
      },
      h4: {
        fontSize: typoConfig.h4?.fontSize || 'text-sm',
        fontWeight: typoConfig.h4?.fontWeight || 'font-normal',
        lineHeight: typoConfig.h4?.lineHeight || 'leading-relaxed',
        color: typoConfig.h4?.color || defaultColorH4,
        tracking: typoConfig.h4?.tracking || 'tracking-normal'
      },
      h1Single: {
        fontSize: typoConfig.h1Single?.fontSize || 'text-fluid-10xl',
        fontWeight: typoConfig.h1Single?.fontWeight || 'font-medium',
        lineHeight: typoConfig.h1Single?.lineHeight || 'leading-none',
        color: typoConfig.h1Single?.color || defaultColorH1Single,
        tracking: typoConfig.h1Single?.tracking || 'tracking-tighter'
      },
      p: {
        fontSize: typoConfig.p?.fontSize || 'text-base',
        fontWeight: typoConfig.p?.fontWeight || 'font-normal',
        lineHeight: typoConfig.p?.lineHeight || 'leading-relaxed',
        color: typoConfig.p?.color || defaultColorP,
        tracking: typoConfig.p?.tracking || 'tracking-normal'
      },
      nav: {
        fontSize: typoConfig.nav?.fontSize || 'text-sm',
        fontWeight: typoConfig.nav?.fontWeight || 'font-medium',
        lineHeight: typoConfig.nav?.lineHeight || 'leading-normal',
        color: typoConfig.nav?.color || defaultColorNav,
        tracking: typoConfig.nav?.tracking || 'tracking-normal'
      },
      footer: {
        fontSize: typoConfig.footer?.fontSize || 'text-sm',
        fontWeight: typoConfig.footer?.fontWeight || 'font-normal',
        lineHeight: typoConfig.footer?.lineHeight || 'leading-relaxed',
        color: typoConfig.footer?.color || defaultColorFooter,
        tracking: typoConfig.footer?.tracking || 'tracking-normal'
      }
    });
    setIsInitialized(true);
  }, [isInitialized, localData?.metadata?.typography, getDefaultPaletteColor]);

  // Sauvegarder automatiquement quand les valeurs changent (après l'initialisation)
  // Utiliser un debounce pour éviter les sauvegardes trop fréquentes
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef<string>('');
  
  useEffect(() => {
    if (!isInitialized || isSaving) return undefined;
    
    // Éviter de sauvegarder si les valeurs sont identiques à celles chargées
    const currentConfig = localData?.metadata?.typography || {};
    const currentConfigStr = JSON.stringify(currentConfig);
    const newConfigStr = JSON.stringify({
      h1: typography.h1,
      h2: typography.h2,
      h3: typography.h3,
      h4: typography.h4,
      h1Single: typography.h1Single,
      p: typography.p,
      nav: typography.nav,
      footer: typography.footer,
    });
    
    // Éviter les sauvegardes si rien n'a changé ou si c'est la même valeur que la dernière sauvegarde
    if (currentConfigStr === newConfigStr || lastSavedRef.current === newConfigStr) return undefined;
    
    // Debounce : attendre 1500ms avant de sauvegarder (augmenté pour éviter les conflits)
    const timeoutId = setTimeout(() => {
      // Vérifier une dernière fois avant de sauvegarder
      if (lastSavedRef.current === newConfigStr) return;
      
      setIsSaving(true);
      const typoConfig = {
        h1: typography.h1,
        h2: typography.h2,
        h3: typography.h3,
        h4: typography.h4,
        h1Single: typography.h1Single,
        p: typography.p,
        nav: typography.nav,
        footer: typography.footer,
      };
      
      // Marquer comme sauvegardé AVANT d'appeler updateField pour éviter les boucles
      lastSavedRef.current = newConfigStr;
      updateField('metadata.typography', typoConfig);
      
      // Notifier le front après la sauvegarde automatique de typography
      if (typeof window !== 'undefined') {
        // Attendre un peu pour que la sauvegarde soit effectuée côté serveur
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('content-updated', {
            detail: { typography: true }
          }));
        }, 2000); // 2 secondes pour laisser le temps à la sauvegarde
      }
      
      // Réinitialiser le flag après un délai
      setTimeout(() => setIsSaving(false), 200);
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [typography, isInitialized, localData?.metadata?.typography, updateField, isSaving]);
  
  // Réinitialiser lastSavedRef quand localData change depuis l'extérieur (sauvegarde manuelle)
  // Utiliser un ref pour éviter les re-renders inutiles
  const prevTypographyRef = useRef<string>('');
  
  // PROTECTION : Nettoyer typography uniquement au chargement initial, pas à chaque changement
  useEffect(() => {
    if (!isInitialized && localData?.metadata?.typography) {
      // PROTECTION : Nettoyer typography au chargement pour éviter la corruption
      const { cleanTypography, isValidTypography } = require('@/utils/clean-typography');
      
      if (!isValidTypography(localData.metadata.typography)) {
        console.warn('⚠️ Typography corrompu détecté au chargement, nettoyage...');
        // Nettoyer et mettre à jour le state avec la version nettoyée
        const cleaned = cleanTypography(localData.metadata.typography);
        setTypography(prev => ({ ...prev, ...cleaned }));
        setIsInitialized(true);
        return;
      }
      
      // Charger les valeurs depuis localData seulement au chargement initial
      const savedConfigStr = JSON.stringify(localData.metadata.typography);
        lastSavedRef.current = savedConfigStr;
        prevTypographyRef.current = savedConfigStr;
      setIsInitialized(true);
    }
  }, [localData?.metadata?.typography, isInitialized]);

  const updateTypography = (element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer', property: string, value: string) => {
    setTypography(prev => ({
      ...prev,
      [element]: {
        ...prev[element],
        [property]: value
      }
    }));
  };

  const fontSizeOptions = [
    { value: 'text-xs', label: 'XS' },
    { value: 'text-sm', label: 'SM' },
    { value: 'text-base', label: 'Base' },
    { value: 'text-lg', label: 'LG' },
    { value: 'text-xl', label: 'XL' },
    { value: 'text-2xl', label: '2XL' },
    { value: 'text-3xl', label: '3XL' },
    { value: 'text-fluid-2xl', label: 'Fluid 2XL' },
    { value: 'text-fluid-3xl', label: 'Fluid 3XL' },
    { value: 'text-fluid-4xl', label: 'Fluid 4XL' },
    { value: 'text-fluid-5xl', label: 'Fluid 5XL' },
    { value: 'text-fluid-6xl', label: 'Fluid 6XL' },
    { value: 'text-fluid-7xl', label: 'Fluid 7XL' },
    { value: 'text-fluid-8xl', label: 'Fluid 8XL' },
    { value: 'text-fluid-9xl', label: 'Fluid 9XL' },
    { value: 'text-fluid-10xl', label: 'Fluid 10XL' },
  ];

  const fontWeightOptions = [
    { value: 'font-thin', label: 'Thin' },
    { value: 'font-light', label: 'Light' },
    { value: 'font-normal', label: 'Normal' },
    { value: 'font-medium', label: 'Medium' },
    { value: 'font-semibold', label: 'Semibold' },
    { value: 'font-bold', label: 'Bold' },
  ];

  const lineHeightOptions = [
    { value: 'leading-none', label: 'None' },
    { value: 'leading-tight', label: 'Tight' },
    { value: 'leading-snug', label: 'Snug' },
    { value: 'leading-normal', label: 'Normal' },
    { value: 'leading-relaxed', label: 'Relaxed' },
    { value: 'leading-loose', label: 'Loose' },
  ];

  const trackingOptions = [
    { value: 'tracking-tighter', label: 'Tighter' },
    { value: 'tracking-tight', label: 'Tight' },
    { value: 'tracking-normal', label: 'Normal' },
    { value: 'tracking-wide', label: 'Wide' },
    { value: 'tracking-wider', label: 'Wider' },
    { value: 'tracking-widest', label: 'Widest' },
  ];

  // Convertir une classe Tailwind en couleur hex pour le sélecteur (mémorisé)
  const getColorFromClass = useMemo(() => {
    // Mapping des classes Tailwind vers hex (fallback) - constant, pas besoin de recalculer
    const colorMap: Record<string, string> = {
      'text-gray-900': '#111827',
      'text-gray-800': '#1f2937',
      'text-gray-700': '#374151',
      'text-gray-600': '#4b5563',
      'text-gray-500': '#6b7280',
      'text-black': '#000000',
      'text-white': '#ffffff',
    };
    
    return (colorClass: string): string => {
      // Si c'est déjà une couleur hex (commence par #), la retourner
      if (colorClass.startsWith('#')) return colorClass;
      
      // Si c'est un token de palette, récupérer la couleur réelle
      if (colorClass === 'text-foreground' && currentPalette) {
        return currentPalette.text;
      }
      if (colorClass === 'text-muted-foreground' && currentPalette) {
        return currentPalette.textSecondary;
      }
      if (colorClass === 'text-primary' && currentPalette) {
        return currentPalette.primary;
      }
      if (colorClass === 'text-accent' && currentPalette) {
        return currentPalette.accent;
      }
      
      return colorMap[colorClass] || '#000000';
    };
  }, [currentPalette]);

  // Convertir une couleur hex en classe Tailwind ou garder hex si personnalisée
  const getClassFromColor = (color: string, defaultClass: string): string => {
    // Si c'est déjà une classe Tailwind, la retourner
    if (color.startsWith('text-')) return color;
    
    // Si c'est une couleur hex, la retourner telle quelle (on la stockera comme hex)
    if (color.startsWith('#')) return color;
    
    return defaultClass;
  };

  // Vérifier si une couleur est personnalisée (hex) ou utilise la palette (classe)
  const isCustomColor = (color: string): boolean => {
    return color.startsWith('#');
  };

  const renderElementConfig = (element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer', label: string) => {
    const config = typography[element];
    
    return (
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Type className="w-4 h-4" />
          {label}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Taille */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Taille
            </label>
            <select
              value={config.fontSize}
              onChange={(e) => updateTypography(element, 'fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {fontSizeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Graisse */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Graisse
            </label>
            <select
              value={config.fontWeight}
              onChange={(e) => updateTypography(element, 'fontWeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {fontWeightOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Line height */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hauteur de ligne
            </label>
            <select
              value={config.lineHeight}
              onChange={(e) => updateTypography(element, 'lineHeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {lineHeightOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Tracking */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Espacement des lettres
            </label>
            <select
              value={config.tracking}
              onChange={(e) => updateTypography(element, 'tracking', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {trackingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Couleur */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex items-center gap-3">
              {/* Sélecteur de couleur personnalisée */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getColorFromClass(config.color)}
                  onChange={(e) => {
                    // Stocker la couleur hex directement
                    updateTypography(element, 'color', e.target.value);
                  }}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  title="Couleur personnalisée"
                />
                <span className="text-xs text-gray-500">Personnalisée</span>
              </div>
              
              {/* Option pour revenir à la palette */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const defaultColor = getDefaultPaletteColor(element);
                    updateTypography(element, 'color', defaultColor);
                  }}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  title="Utiliser la couleur de la palette"
                >
                  <Palette className="w-3 h-3" />
                  Palette
                </button>
              </div>
              
              {/* Afficher la couleur actuelle */}
              <div className="flex-1 text-xs text-gray-600">
                {isCustomColor(config.color) ? (
                  <span className="text-gray-500">Couleur personnalisée: {config.color}</span>
                ) : (
                  <span className="text-gray-500">Utilise la palette ({config.color})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
          <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
          <div 
            className={Object.values(config).filter(v => !v.startsWith('#')).join(' ')}
            style={isCustomColor(config.color) ? { color: config.color } : undefined}
          >
            {element === 'h1' && <h1>Exemple de titre H1</h1>}
            {element === 'h2' && <h2>Exemple de titre H2</h2>}
            {element === 'h3' && <h3>Exemple de titre H3</h3>}
            {element === 'h4' && <h4>Exemple de titre H4</h4>}
            {element === 'h1Single' && <h1>Exemple de titre projet/article</h1>}
            {element === 'p' && <p>Exemple de paragraphe avec du texte pour voir le rendu.</p>}
            {element === 'nav' && <nav><a href="#" className="hover:text-gray-900">Lien de navigation</a></nav>}
            {element === 'footer' && <footer><p>Texte du footer avec exemple de lien</p></footer>}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <Type className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Typographie</h3>
      </div>
      
      <div className="space-y-6">
        {renderElementConfig('h1', 'Titre H1')}
        {renderElementConfig('h2', 'Titre H2')}
        {renderElementConfig('h3', 'Titre H3')}
        {renderElementConfig('h4', 'Titre H4')}
        {renderElementConfig('h1Single', 'H1 Projets/Articles individuels')}
        {renderElementConfig('p', 'Paragraphe')}
        {renderElementConfig('nav', 'Navigation / Menu')}
        {renderElementConfig('footer', 'Footer')}
      </div>

      {/* Note de sauvegarde automatique */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-800">
          <strong>✓ Sauvegarde automatique :</strong> Les modifications sont sauvegardées automatiquement. 
          N'oubliez pas de cliquer sur "Sauvegarder" dans la barre supérieure pour finaliser.
        </p>
      </div>
    </div>
  );
};

export default TypographySection;

