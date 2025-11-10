"use client";
import React, { useState, useEffect } from 'react';
import { Type, Palette } from 'lucide-react';

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
    p: {
      fontSize: 'text-base',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-700',
      tracking: 'tracking-normal'
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Charger la configuration actuelle
  useEffect(() => {
    const typoConfig = localData?.metadata?.typography || {};
    setTypography({
      h1: {
        fontSize: typoConfig.h1?.fontSize || 'text-fluid-10xl',
        fontWeight: typoConfig.h1?.fontWeight || 'font-medium',
        lineHeight: typoConfig.h1?.lineHeight || 'leading-none',
        color: typoConfig.h1?.color || 'text-gray-900',
        tracking: typoConfig.h1?.tracking || 'tracking-tighter'
      },
      h2: {
        fontSize: typoConfig.h2?.fontSize || 'text-fluid-4xl',
        fontWeight: typoConfig.h2?.fontWeight || 'font-semibold',
        lineHeight: typoConfig.h2?.lineHeight || 'leading-tight',
        color: typoConfig.h2?.color || 'text-gray-900',
        tracking: typoConfig.h2?.tracking || 'tracking-tight'
      },
      p: {
        fontSize: typoConfig.p?.fontSize || 'text-base',
        fontWeight: typoConfig.p?.fontWeight || 'font-normal',
        lineHeight: typoConfig.p?.lineHeight || 'leading-relaxed',
        color: typoConfig.p?.color || 'text-gray-700',
        tracking: typoConfig.p?.tracking || 'tracking-normal'
      }
    });
    setIsInitialized(true);
  }, [localData]);

  // Sauvegarder automatiquement quand les valeurs changent (après l'initialisation)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Éviter de sauvegarder si les valeurs sont identiques à celles chargées
    const currentConfig = localData?.metadata?.typography || {};
    const hasChanges = JSON.stringify(typography) !== JSON.stringify(currentConfig);
    
    if (!hasChanges) return;
    
    const typoConfig = {
      h1: typography.h1,
      h2: typography.h2,
      p: typography.p,
    };
    updateField('metadata.typography', typoConfig);
  }, [typography, isInitialized, localData, updateField]);

  const updateTypography = (element: 'h1' | 'h2' | 'p', property: string, value: string) => {
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

  const colorOptions = [
    { value: 'text-gray-900', label: 'Gris foncé' },
    { value: 'text-gray-800', label: 'Gris 800' },
    { value: 'text-gray-700', label: 'Gris 700' },
    { value: 'text-gray-600', label: 'Gris 600' },
    { value: 'text-black', label: 'Noir' },
    { value: 'text-white', label: 'Blanc' },
  ];

  const renderElementConfig = (element: 'h1' | 'h2' | 'p', label: string) => {
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
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <select
              value={config.color}
              onChange={(e) => updateTypography(element, 'color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {colorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Aperçu */}
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
          <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
          <div className={Object.values(config).join(' ')}>
            {element === 'h1' && <h1>Exemple de titre H1</h1>}
            {element === 'h2' && <h2>Exemple de titre H2</h2>}
            {element === 'p' && <p>Exemple de paragraphe avec du texte pour voir le rendu.</p>}
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
        {renderElementConfig('p', 'Paragraphe')}
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

