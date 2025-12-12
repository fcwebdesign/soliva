"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Type, Palette } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';
import { resolvePalette } from '@/utils/palette';

const SYSTEM_FONT_FALLBACK = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

interface TypographySectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const TypographySection: React.FC<TypographySectionProps> = ({ localData, updateField }) => {
  // Stabilise updateField pour éviter les re-renders infinis (prop recréée à chaque rendu parent)
  const updateFieldRef = useRef(updateField);
  useEffect(() => {
    updateFieldRef.current = updateField;
  }, [updateField]);

  const [typography, setTypography] = useState({
    h1: {
      fontSize: 'text-fluid-10xl',
      fontWeight: 'font-medium',
      lineHeight: 'leading-none',
      color: 'text-gray-900',
      tracking: 'tracking-tighter',
      font: 'primary',
    },
    h2: {
      fontSize: 'text-fluid-4xl',
      fontWeight: 'font-semibold',
      lineHeight: 'leading-tight',
      color: 'text-gray-900',
      tracking: 'tracking-tight',
      font: 'primary',
    },
    h3: {
      fontSize: 'text-lg',
      fontWeight: 'font-semibold',
      lineHeight: 'leading-normal',
      color: 'text-gray-900',
      tracking: 'tracking-normal',
      font: 'primary',
    },
    h4: {
      fontSize: 'text-sm',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-600',
      tracking: 'tracking-normal',
      font: 'primary',
    },
    h1Single: {
      fontSize: 'text-fluid-10xl',
      fontWeight: 'font-medium',
      lineHeight: 'leading-none',
      color: 'text-gray-900',
      tracking: 'tracking-tighter',
      font: 'primary',
    },
    p: {
      fontSize: 'text-base',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-700',
      tracking: 'tracking-normal',
      font: 'primary',
    },
    nav: {
      fontSize: 'text-sm',
      fontWeight: 'font-medium',
      lineHeight: 'leading-normal',
      color: 'text-gray-500',
      tracking: 'tracking-normal',
      font: 'primary',
    },
    footer: {
      fontSize: 'text-sm',
      fontWeight: 'font-normal',
      lineHeight: 'leading-relaxed',
      color: 'text-gray-600',
      tracking: 'tracking-normal',
      font: 'primary',
    },
    kicker: {
      fontSize: 'text-sm',
      fontWeight: 'font-medium',
      lineHeight: 'leading-normal',
      color: 'text-gray-500',
      tracking: 'tracking-wider',
      font: 'primary',
    }
  });
  const [fontSettingsPrimary, setFontSettingsPrimary] = useState<{
    mode: 'system' | 'google' | 'custom';
    family?: string;
    weights?: string;
    cssUrl?: string;
  }>({ mode: 'system' });
  const [fontSettingsSecondary, setFontSettingsSecondary] = useState<{
    mode: 'system' | 'google' | 'custom';
    family?: string;
    weights?: string;
    cssUrl?: string;
  }>({ mode: 'system' });

  const [isInitialized, setIsInitialized] = useState(false);
  const lastSavedRef = useRef<string>('');
  const prevTypographyRef = useRef<string>('');

  const computePreviewFont = useMemo(() => {
    return (fonts?: typeof fontSettingsPrimary) => {
      const safeFonts = fonts || { mode: 'system' as const };
      const mode = safeFonts.mode || 'system';
      const family = safeFonts.family?.trim();
      const weights = safeFonts.weights?.trim() || '400;600;700';
      const cssUrl = safeFonts.cssUrl?.trim();

      if (mode === 'google' && family) {
        const familyParam = family.replace(/\s+/g, '+');
        const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyParam)}:wght@${weights}&display=swap`;
        return { href, fontFamily: `'${family}', ${SYSTEM_FONT_FALLBACK}` };
      }

      if (mode === 'custom' && family && cssUrl) {
        return { href: cssUrl, fontFamily: `${family}` };
      }

      return { href: null as string | null, fontFamily: SYSTEM_FONT_FALLBACK };
    };
  }, []);

  const previewFontFamily = useMemo(() => {
    const { fontFamily } = computePreviewFont(fontSettingsPrimary);
    return fontFamily;
  }, [fontSettingsPrimary, computePreviewFont]);

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
    
    // PROTECTION : Nettoyer typography au chargement pour éviter la corruption
    const { cleanTypography, isValidTypography } = require('@/utils/clean-typography');
    let typoConfig = localData?.metadata?.typography || {};
    
    if (typoConfig && !isValidTypography(typoConfig)) {
      console.warn('⚠️ Typography corrompu détecté au chargement, nettoyage...');
      typoConfig = cleanTypography(typoConfig);
    }
    
    const defaultColorH1 = getDefaultPaletteColor('h1');
    const defaultColorH2 = getDefaultPaletteColor('h2');
    const defaultColorH3 = getDefaultPaletteColor('h3');
    const defaultColorH4 = getDefaultPaletteColor('h4');
    const defaultColorH1Single = getDefaultPaletteColor('h1Single');
    const defaultColorP = getDefaultPaletteColor('p');
    const defaultColorNav = getDefaultPaletteColor('nav');
    const defaultColorFooter = getDefaultPaletteColor('footer');
    const defaultColorKicker = getDefaultPaletteColor('kicker');
    
    // ✅ CRITIQUE : Toujours charger les fonts, même si elles sont vides
    const incomingFonts = (typoConfig as any)?.fonts || {};
    const incomingPrimary = incomingFonts?.primary || { mode: 'system' };
    const incomingSecondary = incomingFonts?.secondary || { mode: 'system' };
    
    setTypography({
      h1: {
        fontSize: typoConfig.h1?.fontSize || 'text-fluid-10xl',
        fontWeight: typoConfig.h1?.fontWeight || 'font-medium',
        lineHeight: typoConfig.h1?.lineHeight || 'leading-none',
        color: typoConfig.h1?.color || defaultColorH1,
        tracking: typoConfig.h1?.tracking || 'tracking-tighter',
        font: typoConfig.h1?.font || 'font-sans'
      },
      h2: {
        fontSize: typoConfig.h2?.fontSize || 'text-fluid-4xl',
        fontWeight: typoConfig.h2?.fontWeight || 'font-semibold',
        lineHeight: typoConfig.h2?.lineHeight || 'leading-tight',
        color: typoConfig.h2?.color || defaultColorH2,
        tracking: typoConfig.h2?.tracking || 'tracking-tight',
        font: typoConfig.h2?.font || 'font-sans'
      },
      h3: {
        fontSize: typoConfig.h3?.fontSize || 'text-lg',
        fontWeight: typoConfig.h3?.fontWeight || 'font-semibold',
        lineHeight: typoConfig.h3?.lineHeight || 'leading-normal',
        color: typoConfig.h3?.color || defaultColorH3,
        tracking: typoConfig.h3?.tracking || 'tracking-normal',
        font: typoConfig.h3?.font || 'font-sans'
      },
      h4: {
        fontSize: typoConfig.h4?.fontSize || 'text-sm',
        fontWeight: typoConfig.h4?.fontWeight || 'font-normal',
        lineHeight: typoConfig.h4?.lineHeight || 'leading-relaxed',
        color: typoConfig.h4?.color || defaultColorH4,
        tracking: typoConfig.h4?.tracking || 'tracking-normal',
        font: typoConfig.h4?.font || 'font-sans'
      },
      h1Single: {
        fontSize: typoConfig.h1Single?.fontSize || 'text-fluid-10xl',
        fontWeight: typoConfig.h1Single?.fontWeight || 'font-medium',
        lineHeight: typoConfig.h1Single?.lineHeight || 'leading-none',
        color: typoConfig.h1Single?.color || defaultColorH1Single,
        tracking: typoConfig.h1Single?.tracking || 'tracking-tighter',
        font: typoConfig.h1Single?.font || 'font-sans'
      },
      p: {
        fontSize: typoConfig.p?.fontSize || 'text-base',
        fontWeight: typoConfig.p?.fontWeight || 'font-normal',
        lineHeight: typoConfig.p?.lineHeight || 'leading-relaxed',
        color: typoConfig.p?.color || defaultColorP,
        tracking: typoConfig.p?.tracking || 'tracking-normal',
        font: typoConfig.p?.font || 'font-sans'
      },
      nav: {
        fontSize: typoConfig.nav?.fontSize || 'text-sm',
        fontWeight: typoConfig.nav?.fontWeight || 'font-medium',
        lineHeight: typoConfig.nav?.lineHeight || 'leading-normal',
        color: typoConfig.nav?.color || defaultColorNav,
        tracking: typoConfig.nav?.tracking || 'tracking-normal',
        font: typoConfig.nav?.font || 'font-sans'
      },
      footer: {
        fontSize: typoConfig.footer?.fontSize || 'text-sm',
        fontWeight: typoConfig.footer?.fontWeight || 'font-normal',
        lineHeight: typoConfig.footer?.lineHeight || 'leading-relaxed',
        color: typoConfig.footer?.color || defaultColorFooter,
        tracking: typoConfig.footer?.tracking || 'tracking-normal',
        font: typoConfig.footer?.font || 'font-sans'
      },
      kicker: {
        fontSize: typoConfig.kicker?.fontSize || 'text-sm',
        fontWeight: typoConfig.kicker?.fontWeight || 'font-medium',
        lineHeight: typoConfig.kicker?.lineHeight || 'leading-normal',
        color: typoConfig.kicker?.color || defaultColorKicker,
        tracking: typoConfig.kicker?.tracking || 'tracking-wider',
        font: typoConfig.kicker?.font || 'font-sans'
      }
    });
    setFontSettingsPrimary({
      mode: incomingPrimary.mode || 'system',
      family: incomingPrimary.family || '',
      weights: incomingPrimary.weights || '',
      cssUrl: incomingPrimary.cssUrl || ''
    });
    setFontSettingsSecondary({
      mode: incomingSecondary.mode || 'system',
      family: incomingSecondary.family || '',
      weights: incomingSecondary.weights || '',
      cssUrl: incomingSecondary.cssUrl || ''
    });
    
    // Marquer la configuration comme sauvegardée pour éviter les re-sauvegardes inutiles
    const savedConfigStr = JSON.stringify({
      ...typoConfig,
      fonts: { primary: incomingPrimary, secondary: incomingSecondary }
    });
    lastSavedRef.current = savedConfigStr;
    prevTypographyRef.current = savedConfigStr;
    
    setIsInitialized(true);
  }, [isInitialized, localData?.metadata?.typography, getDefaultPaletteColor]);

  // Sauvegarder automatiquement quand les valeurs changent (après l'initialisation)
  // Utiliser un debounce pour éviter les sauvegardes trop fréquentes
  const [isSaving, setIsSaving] = useState(false);
  
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
      kicker: typography.kicker,
      fonts: { primary: fontSettingsPrimary, secondary: fontSettingsSecondary },
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
      kicker: typography.kicker,
      fonts: { primary: fontSettingsPrimary, secondary: fontSettingsSecondary },
      };
      
      // Marquer comme sauvegardé AVANT d'appeler updateField pour éviter les boucles
      lastSavedRef.current = newConfigStr;
      updateFieldRef.current('metadata.typography', typoConfig);
      
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
  }, [typography, fontSettingsPrimary, fontSettingsSecondary, isInitialized, localData?.metadata?.typography, isSaving]);

  // Propager les fonts (sans debounce pour éviter des valeurs obsolètes)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Ne sauvegarder que si les fonts ont vraiment changé (éviter les sauvegardes inutiles au chargement)
    const currentFonts = (localData?.metadata?.typography as any)?.fonts || {};
    const currentPrimary = currentFonts?.primary || { mode: 'system' };
    const currentSecondary = currentFonts?.secondary || { mode: 'system' };
    
    const hasChanged = 
      JSON.stringify(currentPrimary) !== JSON.stringify(fontSettingsPrimary) ||
      JSON.stringify(currentSecondary) !== JSON.stringify(fontSettingsSecondary);
    
    if (hasChanged) {
      updateFieldRef.current('metadata.typography.fonts', { primary: fontSettingsPrimary, secondary: fontSettingsSecondary });
    }
  }, [fontSettingsPrimary, fontSettingsSecondary, isInitialized, localData?.metadata?.typography]);

  // Charger la font dans l'admin uniquement pour l'aperçu (sans impacter l'UI globale)
  useEffect(() => {
    if (!isInitialized) return;
    const slots = [
      { settings: fontSettingsPrimary, id: 'admin-typo-preview-font-primary' },
      { settings: fontSettingsSecondary, id: 'admin-typo-preview-font-secondary' },
    ];

    slots.forEach(({ settings, id }) => {
      const { href } = computePreviewFont(settings);
      if (!href) {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        return;
      }
      let linkEl = document.getElementById(id) as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = id;
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = href;
    });
  }, [fontSettingsPrimary, fontSettingsSecondary, isInitialized, computePreviewFont]);
  
  // ✅ CRITIQUE : Mettre à jour les fonts si elles changent dans localData (après l'initialisation)
  // Cela permet de recharger les fonts si elles sont mises à jour depuis l'extérieur
  // ⚠️ Ne pas inclure fontSettingsPrimary/fontSettingsSecondary dans les dépendances pour éviter les boucles
  useEffect(() => {
    if (!isInitialized) return;
    
    const incomingFonts = (localData?.metadata?.typography as any)?.fonts;
    if (!incomingFonts) return; // Si pas de fonts dans localData, ne rien faire (éviter de réinitialiser à vide)
    
    const incomingPrimary = incomingFonts?.primary;
    const incomingSecondary = incomingFonts?.secondary;
    
    // Mettre à jour seulement si les valeurs ont vraiment changé ET qu'elles ne sont pas vides
    if (incomingPrimary && 
        JSON.stringify(incomingPrimary) !== JSON.stringify(fontSettingsPrimary) &&
        (incomingPrimary.mode !== 'system' || incomingPrimary.family || incomingPrimary.weights || incomingPrimary.cssUrl)) {
      setFontSettingsPrimary({
        mode: incomingPrimary.mode || 'system',
        family: incomingPrimary.family || '',
        weights: incomingPrimary.weights || '',
        cssUrl: incomingPrimary.cssUrl || ''
      });
    }
    
    if (incomingSecondary && 
        JSON.stringify(incomingSecondary) !== JSON.stringify(fontSettingsSecondary) &&
        (incomingSecondary.mode !== 'system' || incomingSecondary.family || incomingSecondary.weights || incomingSecondary.cssUrl)) {
      setFontSettingsSecondary({
        mode: incomingSecondary.mode || 'system',
        family: incomingSecondary.family || '',
        weights: incomingSecondary.weights || '',
        cssUrl: incomingSecondary.cssUrl || ''
      });
    }
    
    // Mettre à jour lastSavedRef pour éviter les re-sauvegardes
    const savedConfigStr = JSON.stringify(localData.metadata.typography);
    if (lastSavedRef.current !== savedConfigStr) {
      lastSavedRef.current = savedConfigStr;
      prevTypographyRef.current = savedConfigStr;
    }
  }, [localData?.metadata?.typography, isInitialized]); // ⚠️ Retiré fontSettingsPrimary/fontSettingsSecondary des dépendances

  const normalizeLineHeight = (val: string) => {
    const trimmed = val.trim();
    // Si l'utilisateur tape un nombre (ex: 0.75 ou 1.1), convertir en classe Tailwind arbitraire leading-[x]
    // Vérifier si c'est déjà une classe leading-[...] ou si c'est un nombre pur
    if (/^leading-\[/.test(trimmed)) {
      // Déjà une classe Tailwind arbitraire, la retourner telle quelle
      return trimmed;
    }
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return `leading-[${trimmed}]`;
    }
    return trimmed;
  };

  const updateTypography = (element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer' | 'kicker', property: string, value: string) => {
    const nextValue = property === 'lineHeight' ? normalizeLineHeight(value) : value;
    setTypography(prev => ({
      ...prev,
      [element]: {
        ...prev[element],
        [property]: nextValue
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

  const baseFontWeightOptions = [
    { value: 'font-thin', label: 'Thin', numeric: 100 },
    { value: 'font-light', label: 'Light', numeric: 300 },
    { value: 'font-normal', label: 'Normal', numeric: 400 },
    { value: 'font-medium', label: 'Medium', numeric: 500 },
    { value: 'font-semibold', label: 'Semibold', numeric: 600 },
    { value: 'font-bold', label: 'Bold', numeric: 700 },
    { value: 'font-black', label: 'Black', numeric: 900 },
  ];

  // Filtrer les graisses selon les poids déclarés dans Google Fonts (ex: 400;600;700)
  const parseWeights = (weights?: string) => {
    if (!weights) return [];
    return weights
      .split(/[^0-9]+/)
      .map(val => parseInt(val, 10))
      .filter(val => !Number.isNaN(val));
  };

  const getFilteredFontWeightOptions = (weights?: string) => {
    const parsed = parseWeights(weights);
    // Pas de poids déclarés => fallback standard
    if (!parsed.length) return baseFontWeightOptions;

    const mapWeightToClass = (w: number) => {
      if (w <= 150) return 'font-thin';
      if (w <= 350) return 'font-light';
      if (w <= 450) return 'font-normal';
      if (w <= 550) return 'font-medium';
      if (w <= 750) return 'font-semibold';
      if (w <= 850) return 'font-bold';
      return 'font-black';
    };

    const allowedClasses = new Set<string>(
      parsed
        .map(mapWeightToClass)
        .filter(Boolean) as string[]
    );

    const filtered = baseFontWeightOptions.filter(opt => allowedClasses.has(opt.value as string));
    // Si aucune correspondance, revenir au fallback de base
    return filtered.length ? filtered : baseFontWeightOptions;
  };

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

  const renderElementConfig = (element: 'h1' | 'h2' | 'h3' | 'h4' | 'h1Single' | 'p' | 'nav' | 'footer' | 'kicker', label: string) => {
    const config = typography[element];
    const previewStyle: React.CSSProperties = {};
    const currentFontSettings = config.font === 'secondary' ? fontSettingsSecondary : fontSettingsPrimary;
    const { fontFamily } = computePreviewFont(currentFontSettings);
    if (fontFamily) previewStyle.fontFamily = fontFamily;
    if (isCustomColor(config.color)) previewStyle.color = config.color;

    // Adapter les options de graisse selon les poids chargés (et conserver la valeur actuelle si hors liste)
    const weightOptionsSource = getFilteredFontWeightOptions(currentFontSettings.weights);
    let weightOptions = weightOptionsSource;
    if (!weightOptions.find(opt => opt.value === config.fontWeight)) {
      // Extraire la valeur numérique du fontWeight si possible (ex: font-bold -> 700)
      const numericValue = config.fontWeight.includes('thin') ? 100 :
                           config.fontWeight.includes('light') ? 300 :
                           config.fontWeight.includes('normal') ? 400 :
                           config.fontWeight.includes('medium') ? 500 :
                           config.fontWeight.includes('semibold') ? 600 :
                           config.fontWeight.includes('bold') ? 700 :
                           config.fontWeight.includes('black') ? 900 : 400;
      weightOptions = [
        { value: config.fontWeight, label: 'Valeur actuelle', numeric: numericValue },
        ...weightOptions,
      ];
    }
    
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
              {weightOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Choix de la police (principale/secondaire) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Police utilisée
            </label>
            <select
              value={config.font || 'primary'}
              onChange={(e) => updateTypography(element, 'font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="primary">Principale</option>
              <option value="secondary">Secondaire</option>
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
            <input
              type="text"
              value={config.lineHeight}
              onChange={(e) => updateTypography(element, 'lineHeight', e.target.value)}
              placeholder="leading-[1.05] ou 1.1"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Choisissez une option ou saisissez une classe Tailwind (leading-[1.05]) ou une valeur CSS (1.1).
            </p>
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
            className={[
              config.fontSize,
              config.fontWeight,
              config.lineHeight,
              config.tracking,
            ].filter(Boolean).join(' ')}
            style={Object.keys(previewStyle).length ? previewStyle : undefined}
          >
            {element === 'h1' && <h1>Exemple de titre H1</h1>}
            {element === 'h2' && <h2>Exemple de titre H2</h2>}
            {element === 'h3' && <h3>Exemple de titre H3</h3>}
            {element === 'h4' && <h4>Exemple de titre H4</h4>}
            {element === 'h1Single' && <h1>Exemple de titre projet/article</h1>}
            {element === 'p' && <p>Exemple de paragraphe avec du texte pour voir le rendu.</p>}
            {element === 'kicker' && <span>Exemple de subtitle / kicker</span>}
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
        {renderElementConfig('kicker', 'Subtitle / Kicker')}
        {renderElementConfig('nav', 'Navigation / Menu')}
        {renderElementConfig('footer', 'Footer')}
      </div>

      {/* Fonts globales */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Polices globales (principale + secondaire)
        </h3>

        {[{ label: 'Principale', settings: fontSettingsPrimary, setter: setFontSettingsPrimary, id: 'primary' },
          { label: 'Secondaire', settings: fontSettingsSecondary, setter: setFontSettingsSecondary, id: 'secondary' }].map((slot) => (
          <div key={slot.id} className="mb-6 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-800">Police {slot.label}</div>
              <span className="text-xs text-gray-500">
                Utilisée pour les éléments marqués "{slot.label.toLowerCase()}"
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={slot.settings.mode}
                  onChange={(e) => slot.setter((prev) => ({ ...prev, mode: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="system">Système (aucun chargement)</option>
                  <option value="google">Google Fonts (swap)</option>
                  <option value="custom">Custom (CSS URL)</option>
                </select>
              </div>

              {slot.settings.mode === 'google' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Famille</label>
                    <input
                      type="text"
                      value={slot.settings.family || ''}
                      onChange={(e) => slot.setter((prev) => ({ ...prev, family: e.target.value }))}
                      placeholder="Ex: Inter"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poids (ex: 400;600;700)</label>
                    <input
                      type="text"
                      value={slot.settings.weights || ''}
                      onChange={(e) => slot.setter((prev) => ({ ...prev, weights: e.target.value }))}
                      placeholder="400;600;700"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </>
              )}

              {slot.settings.mode === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Famille CSS</label>
                    <input
                      type="text"
                      value={slot.settings.family || ''}
                      onChange={(e) => slot.setter((prev) => ({ ...prev, family: e.target.value }))}
                      placeholder="Ex: 'My Font', sans-serif"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL CSS (@font-face)</label>
                    <input
                      type="text"
                      value={slot.settings.cssUrl || ''}
                      onChange={(e) => slot.setter((prev) => ({ ...prev, cssUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">
          Mode système = aucune requête externe. Google Fonts est chargé en display=swap pour limiter le FOIT.
          Custom attend une URL de stylesheet (@font-face) déjà optimisée.
        </p>
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
