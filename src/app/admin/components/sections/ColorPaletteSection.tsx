"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Check, Filter, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ColorPaletteSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

interface ColorPalette {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const COLOR_PALETTES: ColorPalette[] = [
  // Palettes classiques et intemporelles
  {
    id: 'classic',
    name: 'Classique',
    description: 'Noir et blanc, élégant et intemporel',
    category: 'classic',
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#3B82F6',
      background: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e5e7eb'
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Nuances de gris, sophistiqué et raffiné',
    category: 'classic',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#6B7280',
      background: '#F9FAFB',
      text: '#111827',
      textSecondary: '#4B5563',
      border: '#D1D5DB'
    }
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Gris clair, épuré et minimal',
    category: 'classic',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#3B82F6',
      background: '#F9FAFB',
      text: '#374151',
      textSecondary: '#6B7280',
      border: '#E5E7EB'
    }
  },
  
  // Palettes professionnelles
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Bleu et gris, professionnel et contemporain',
    category: 'professional',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#ffffff',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB'
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Bleu marine, sérieux et professionnel',
    category: 'professional',
    colors: {
      primary: '#1E3A8A',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      background: '#ffffff',
      text: '#1F2937',
      textSecondary: '#475569',
      border: '#CBD5E1'
    }
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Bleu profond, autorité et confiance',
    category: 'professional',
    colors: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#3B82F6',
      background: '#F8FAFC',
      text: '#0F172A',
      textSecondary: '#475569',
      border: '#E2E8F0'
    }
  },
  
  // Palettes sombres
  {
    id: 'dark',
    name: 'Sombre',
    description: 'Fond sombre, style moderne et élégant',
    category: 'dark',
    colors: {
      primary: '#ffffff',
      secondary: '#1F2937',
      accent: '#3B82F6',
      background: '#111827',
      text: '#ffffff',
      textSecondary: '#D1D5DB',
      border: '#374151'
    }
  },
  {
    id: 'midnight',
    name: 'Minuit',
    description: 'Noir profond, mystérieux et élégant',
    category: 'dark',
    colors: {
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#8B5CF6',
      background: '#0A0A0A',
      text: '#ffffff',
      textSecondary: '#A3A3A3',
      border: '#262626'
    }
  },
  {
    id: 'charcoal',
    name: 'Charbon',
    description: 'Gris anthracite, moderne et sobre',
    category: 'dark',
    colors: {
      primary: '#ffffff',
      secondary: '#1F2937',
      accent: '#10B981',
      background: '#171717',
      text: '#F5F5F5',
      textSecondary: '#A3A3A3',
      border: '#404040'
    }
  },
  
  // Palettes chaleureuses
  {
    id: 'warm',
    name: 'Chaleureux',
    description: 'Oranges et beiges, accueillant et chaleureux',
    category: 'warm',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#EF4444',
      background: '#FEF3C7',
      text: '#78350F',
      textSecondary: '#92400E',
      border: '#FCD34D'
    }
  },
  {
    id: 'sunset',
    name: 'Coucher de Soleil',
    description: 'Oranges et roses, chaleureux et romantique',
    category: 'warm',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#EC4899',
      background: '#FFF7ED',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FED7AA'
    }
  },
  {
    id: 'terracotta',
    name: 'Terre cuite',
    description: 'Oranges brûlés, naturel et authentique',
    category: 'warm',
    colors: {
      primary: '#C2410C',
      secondary: '#9A3412',
      accent: '#F97316',
      background: '#FFF7ED',
      text: '#431407',
      textSecondary: '#7C2D12',
      border: '#FED7AA'
    }
  },
  
  // Palettes nature
  {
    id: 'nature',
    name: 'Nature',
    description: 'Verts et bruns, naturel et apaisant',
    category: 'nature',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#F59E0B',
      background: '#F0FDF4',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#86EFAC'
    }
  },
  {
    id: 'forest',
    name: 'Forêt',
    description: 'Verts profonds, naturel et apaisant',
    category: 'nature',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10B981',
      background: '#ECFDF5',
      text: '#064E3B',
      textSecondary: '#065F46',
      border: '#6EE7B7'
    }
  },
  {
    id: 'sage',
    name: 'Sauge',
    description: 'Vert sauge, doux et apaisant',
    category: 'nature',
    colors: {
      primary: '#84CC16',
      secondary: '#65A30D',
      accent: '#A3E635',
      background: '#F7FEE7',
      text: '#365314',
      textSecondary: '#4D7C0F',
      border: '#D9F99D'
    }
  },
  {
    id: 'moss',
    name: 'Mousse',
    description: 'Vert mousse, organique et terreux',
    category: 'nature',
    colors: {
      primary: '#65A30D',
      secondary: '#4D7C0F',
      accent: '#84CC16',
      background: '#F7FEE7',
      text: '#365314',
      textSecondary: '#3F6212',
      border: '#BEF264'
    }
  },
  
  // Palettes océaniques
  {
    id: 'ocean',
    name: 'Océan',
    description: 'Bleus profonds, calme et serein',
    category: 'ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#06B6D4',
      background: '#F0F9FF',
      text: '#0C4A6E',
      textSecondary: '#075985',
      border: '#BAE6FD'
    }
  },
  {
    id: 'azure',
    name: 'Azur',
    description: 'Bleu ciel, frais et lumineux',
    category: 'ocean',
    colors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#60A5FA',
      background: '#EFF6FF',
      text: '#1E3A8A',
      textSecondary: '#1E40AF',
      border: '#93C5FD'
    }
  },
  {
    id: 'navy',
    name: 'Marine',
    description: 'Bleu marine, classique et élégant',
    category: 'ocean',
    colors: {
      primary: '#1E3A8A',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      background: '#F8FAFC',
      text: '#0F172A',
      textSecondary: '#1E293B',
      border: '#CBD5E1'
    }
  },
  {
    id: 'turquoise',
    name: 'Turquoise',
    description: 'Bleu-vert, frais et moderne',
    category: 'ocean',
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      accent: '#22D3EE',
      background: '#ECFEFF',
      text: '#083344',
      textSecondary: '#0E7490',
      border: '#67E8F9'
    }
  },
  
  // Palettes violettes
  {
    id: 'purple',
    name: 'Violet',
    description: 'Violets et pourpres, créatif et unique',
    category: 'purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      background: '#FAF5FF',
      text: '#4C1D95',
      textSecondary: '#6D28D9',
      border: '#DDD6FE'
    }
  },
  {
    id: 'lavender',
    name: 'Lavande',
    description: 'Violet doux, apaisant et élégant',
    category: 'purple',
    colors: {
      primary: '#A78BFA',
      secondary: '#8B5CF6',
      accent: '#C4B5FD',
      background: '#F5F3FF',
      text: '#5B21B6',
      textSecondary: '#7C3AED',
      border: '#E9D5FF'
    }
  },
  {
    id: 'plum',
    name: 'Prune',
    description: 'Violet profond, riche et sophistiqué',
    category: 'purple',
    colors: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#8B5CF6',
      background: '#FAF5FF',
      text: '#4C1D95',
      textSecondary: '#5B21B6',
      border: '#C4B5FD'
    }
  },
  
  // Palettes audacieuses
  {
    id: 'bold',
    name: 'Audacieux',
    description: 'Couleurs vives, dynamique et énergique',
    category: 'bold',
    colors: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#F59E0B',
      background: '#ffffff',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#FEE2E2'
    }
  },
  {
    id: 'crimson',
    name: 'Cramoisi',
    description: 'Rouge profond, passionné et intense',
    category: 'bold',
    colors: {
      primary: '#DC2626',
      secondary: '#B91C1C',
      accent: '#EF4444',
      background: '#FEF2F2',
      text: '#7F1D1D',
      textSecondary: '#991B1B',
      border: '#FECACA'
    }
  },
  {
    id: 'coral',
    name: 'Corail',
    description: 'Rose-corail, vivant et énergique',
    category: 'bold',
    colors: {
      primary: '#F87171',
      secondary: '#EF4444',
      accent: '#FB7185',
      background: '#FFF1F2',
      text: '#7F1D1D',
      textSecondary: '#BE123C',
      border: '#FECDD3'
    }
  },
  {
    id: 'amber',
    name: 'Ambre',
    description: 'Jaune-orange, chaleureux et lumineux',
    category: 'bold',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      background: '#FFFBEB',
      text: '#78350F',
      textSecondary: '#92400E',
      border: '#FDE68A'
    }
  },
  
  // Palettes créatives
  {
    id: 'neon',
    name: 'Néon',
    description: 'Couleurs néon, moderne et accrocheur',
    category: 'creative',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#F59E0B',
      background: '#000000',
      text: '#ffffff',
      textSecondary: '#D1D5DB',
      border: '#374151'
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Couleurs saturées, dynamique et expressif',
    category: 'creative',
    colors: {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#F59E0B',
      background: '#FDF2F8',
      text: '#831843',
      textSecondary: '#9F1239',
      border: '#FBCFE8'
    }
  },
  {
    id: 'electric',
    name: 'Électrique',
    description: 'Bleu électrique, moderne et énergique',
    category: 'creative',
    colors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#8B5CF6',
      background: '#EFF6FF',
      text: '#1E3A8A',
      textSecondary: '#1E40AF',
      border: '#93C5FD'
    }
  },
  
  // Palettes douces / Pastels
  {
    id: 'pastel',
    name: 'Pastel',
    description: 'Couleurs pastel, doux et apaisant',
    category: 'pastel',
    colors: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      accent: '#F0ABFC',
      background: '#FAF5FF',
      text: '#5B21B6',
      textSecondary: '#7C3AED',
      border: '#E9D5FF'
    }
  },
  {
    id: 'blush',
    name: 'Rose poudré',
    description: 'Rose doux, délicat et féminin',
    category: 'pastel',
    colors: {
      primary: '#FB7185',
      secondary: '#F472B6',
      accent: '#F0ABFC',
      background: '#FFF1F2',
      text: '#9F1239',
      textSecondary: '#BE123C',
      border: '#FECDD3'
    }
  },
  {
    id: 'mint',
    name: 'Menthe',
    description: 'Vert menthe, frais et apaisant',
    category: 'pastel',
    colors: {
      primary: '#34D399',
      secondary: '#10B981',
      accent: '#6EE7B7',
      background: '#ECFDF5',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#A7F3D0'
    }
  },
  {
    id: 'peach',
    name: 'Pêche',
    description: 'Orange doux, chaleureux et accueillant',
    category: 'pastel',
    colors: {
      primary: '#FB923C',
      secondary: '#F97316',
      accent: '#FDBA74',
      background: '#FFF7ED',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FED7AA'
    }
  },
  {
    id: 'lavender-pastel',
    name: 'Lavande pastel',
    description: 'Violet pastel doux, apaisant et délicat',
    category: 'pastel',
    colors: {
      primary: '#C4B5FD',
      secondary: '#A78BFA',
      accent: '#DDD6FE',
      background: '#FAF5FF',
      text: '#6D28D9',
      textSecondary: '#7C3AED',
      border: '#E9D5FF'
    }
  },
  {
    id: 'sky-pastel',
    name: 'Ciel pastel',
    description: 'Bleu ciel pastel, doux et aérien',
    category: 'pastel',
    colors: {
      primary: '#93C5FD',
      secondary: '#60A5FA',
      accent: '#BFDBFE',
      background: '#EFF6FF',
      text: '#1E40AF',
      textSecondary: '#2563EB',
      border: '#DBEAFE'
    }
  },
  {
    id: 'rose-pastel',
    name: 'Rose pastel',
    description: 'Rose pastel, doux et romantique',
    category: 'pastel',
    colors: {
      primary: '#FBCFE8',
      secondary: '#F9A8D4',
      accent: '#FCE7F3',
      background: '#FDF2F8',
      text: '#9F1239',
      textSecondary: '#BE185D',
      border: '#FDE2E4'
    }
  },
  {
    id: 'lemon-pastel',
    name: 'Citron pastel',
    description: 'Jaune citron pastel, frais et lumineux',
    category: 'pastel',
    colors: {
      primary: '#FEF3C7',
      secondary: '#FDE68A',
      accent: '#FEF9C3',
      background: '#FFFBEB',
      text: '#78350F',
      textSecondary: '#92400E',
      border: '#FEF3C7'
    }
  },
  {
    id: 'coral-pastel',
    name: 'Corail pastel',
    description: 'Corail pastel, doux et chaleureux',
    category: 'pastel',
    colors: {
      primary: '#FED7AA',
      secondary: '#FCD34D',
      accent: '#FEE2E2',
      background: '#FFF7ED',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FED7AA'
    }
  },
  {
    id: 'mint-pastel',
    name: 'Menthe pastel',
    description: 'Vert menthe pastel, frais et apaisant',
    category: 'pastel',
    colors: {
      primary: '#A7F3D0',
      secondary: '#6EE7B7',
      accent: '#D1FAE5',
      background: '#ECFDF5',
      text: '#065F46',
      textSecondary: '#047857',
      border: '#A7F3D0'
    }
  },
  {
    id: 'lilac-pastel',
    name: 'Lilas pastel',
    description: 'Lilas pastel, doux et élégant',
    category: 'pastel',
    colors: {
      primary: '#E9D5FF',
      secondary: '#DDD6FE',
      accent: '#F3E8FF',
      background: '#FAF5FF',
      text: '#6B21A8',
      textSecondary: '#7C3AED',
      border: '#E9D5FF'
    }
  },
  {
    id: 'powder-blue',
    name: 'Bleu poudré',
    description: 'Bleu poudré, doux et apaisant',
    category: 'pastel',
    colors: {
      primary: '#BFDBFE',
      secondary: '#93C5FD',
      accent: '#DBEAFE',
      background: '#EFF6FF',
      text: '#1E3A8A',
      textSecondary: '#1E40AF',
      border: '#DBEAFE'
    }
  },
  {
    id: 'apricot',
    name: 'Abricot',
    description: 'Abricot pastel, doux et chaleureux',
    category: 'pastel',
    colors: {
      primary: '#FED7AA',
      secondary: '#FDBA74',
      accent: '#FEE2E2',
      background: '#FFF7ED',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FED7AA'
    }
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Rose cerisier, délicat et poétique',
    category: 'pastel',
    colors: {
      primary: '#FCE7F3',
      secondary: '#FBCFE8',
      accent: '#FDF2F8',
      background: '#FFF1F2',
      text: '#9F1239',
      textSecondary: '#BE185D',
      border: '#FCE7F3'
    }
  },
  {
    id: 'vanilla',
    name: 'Vanille',
    description: 'Crème vanille, doux et apaisant',
    category: 'pastel',
    colors: {
      primary: '#FEF3C7',
      secondary: '#FDE68A',
      accent: '#FFFBEB',
      background: '#FFFBEB',
      text: '#78350F',
      textSecondary: '#92400E',
      border: '#FEF3C7'
    }
  },
  
  // Palettes élégantes
  {
    id: 'ivory',
    name: 'Ivoire',
    description: 'Beige et crème, élégant et raffiné',
    category: 'elegant',
    colors: {
      primary: '#78716C',
      secondary: '#57534E',
      accent: '#A78BFA',
      background: '#FEFCFB',
      text: '#292524',
      textSecondary: '#44403C',
      border: '#E7E5E4'
    }
  },
  {
    id: 'champagne',
    name: 'Champagne',
    description: 'Or pâle, luxueux et sophistiqué',
    category: 'elegant',
    colors: {
      primary: '#D97706',
      secondary: '#B45309',
      accent: '#F59E0B',
      background: '#FFFBEB',
      text: '#78350F',
      textSecondary: '#92400E',
      border: '#FDE68A'
    }
  },
  {
    id: 'slate',
    name: 'Ardoise',
    description: 'Gris ardoise, sobre et professionnel',
    category: 'elegant',
    colors: {
      primary: '#475569',
      secondary: '#334155',
      accent: '#64748B',
      background: '#F8FAFC',
      text: '#0F172A',
      textSecondary: '#1E293B',
      border: '#CBD5E1'
    }
  },
  
  // Palettes saisonnières
  {
    id: 'spring',
    name: 'Printemps',
    description: 'Verts et roses, frais et joyeux',
    category: 'seasonal',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#EC4899',
      background: '#F0FDF4',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#86EFAC'
    }
  },
  {
    id: 'summer',
    name: 'Été',
    description: 'Jaunes et oranges, lumineux et énergique',
    category: 'seasonal',
    colors: {
      primary: '#FBBF24',
      secondary: '#F59E0B',
      accent: '#F97316',
      background: '#FFFBEB',
      text: '#78350F',
      textSecondary: '#92400E',
      border: '#FDE68A'
    }
  },
  {
    id: 'autumn',
    name: 'Automne',
    description: 'Oranges et bruns, chaleureux et cosy',
    category: 'seasonal',
    colors: {
      primary: '#EA580C',
      secondary: '#C2410C',
      accent: '#D97706',
      background: '#FFF7ED',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FED7AA'
    }
  },
  {
    id: 'winter',
    name: 'Hiver',
    description: 'Bleus et gris, frais et apaisant',
    category: 'seasonal',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#64748B',
      background: '#F0F9FF',
      text: '#0C4A6E',
      textSecondary: '#075985',
      border: '#BAE6FD'
    }
  }
];

const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ localData, updateField }) => {
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('classic');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // États pour l'IA
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPalette, setGeneratedPalette] = useState<any>(null);
  
  // États pour le formulaire de génération
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateStyle, setGenerateStyle] = useState('');
  const [generateMood, setGenerateMood] = useState('');
  const [generateIndustry, setGenerateIndustry] = useState('');
  
  // Palettes générées (stockées dans metadata.customPalettes)
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);
  const [isUpdatingPalettes, setIsUpdatingPalettes] = useState(false);

  // Charger les palettes personnalisées depuis le contenu
  useEffect(() => {
    // Ne pas recharger si on est en train de mettre à jour
    if (isUpdatingPalettes) return;
    
    const savedCustomPalettes = localData?.metadata?.customPalettes || [];
    // Éviter de mettre à jour si les palettes sont identiques (comparaison par JSON pour éviter les boucles)
    setCustomPalettes(prev => {
      const prevJson = JSON.stringify(prev);
      const savedJson = JSON.stringify(savedCustomPalettes);
      if (prevJson === savedJson) {
        return prev; // Pas de changement, retourner la référence précédente
      }
      return savedCustomPalettes;
    });
  }, [localData?.metadata?.customPalettes, isUpdatingPalettes]);

  // Combiner les palettes statiques et personnalisées
  const allPalettes = useMemo(() => {
    return [...COLOR_PALETTES, ...customPalettes];
  }, [customPalettes]);

  // Catégories disponibles (calculées dynamiquement avec les palettes personnalisées)
  const categories = useMemo(() => {
    return [
      { id: 'all', name: 'Toutes', count: allPalettes.length },
      { id: 'classic', name: 'Classiques', count: allPalettes.filter(p => p.category === 'classic').length },
      { id: 'professional', name: 'Professionnelles', count: allPalettes.filter(p => p.category === 'professional').length },
      { id: 'dark', name: 'Sombres', count: allPalettes.filter(p => p.category === 'dark').length },
      { id: 'warm', name: 'Chaleureuses', count: allPalettes.filter(p => p.category === 'warm').length },
      { id: 'nature', name: 'Nature', count: allPalettes.filter(p => p.category === 'nature').length },
      { id: 'ocean', name: 'Océaniques', count: allPalettes.filter(p => p.category === 'ocean').length },
      { id: 'purple', name: 'Violettes', count: allPalettes.filter(p => p.category === 'purple').length },
      { id: 'bold', name: 'Audacieuses', count: allPalettes.filter(p => p.category === 'bold').length },
      { id: 'creative', name: 'Créatives', count: allPalettes.filter(p => p.category === 'creative').length },
      { id: 'pastel', name: 'Pastels', count: allPalettes.filter(p => p.category === 'pastel').length },
      { id: 'elegant', name: 'Élégantes', count: allPalettes.filter(p => p.category === 'elegant').length },
      { id: 'seasonal', name: 'Saisonnières', count: allPalettes.filter(p => p.category === 'seasonal').length },
    ];
  }, [allPalettes]);

  // Filtrer les palettes selon la catégorie sélectionnée
  const filteredPalettes = useMemo(() => {
    const palettesToFilter = selectedCategory === 'all' ? allPalettes : allPalettes.filter(p => p.category === selectedCategory);
    return palettesToFilter;
  }, [selectedCategory, allPalettes]);

  // Générer une palette avec l'IA
  const handleGeneratePalette = async () => {
    if (!generatePrompt.trim() && !generateStyle && !generateMood && !generateIndustry) {
      toast.error('Veuillez remplir au moins un champ');
      return;
    }

    setIsGenerating(true);
    setGeneratedPalette(null);

    try {
      const response = await fetch('/api/admin/ai/generate-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatePrompt,
          style: generateStyle,
          mood: generateMood,
          industry: generateIndustry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.palette) {
        throw new Error('Réponse invalide de l\'API');
      }

      setGeneratedPalette(data.palette);
      toast.success('Palette générée avec succès !');
    } catch (error: any) {
      console.error('Erreur génération palette:', error);
      toast.error('Erreur lors de la génération', {
        description: error.message || 'Impossible de générer la palette. Vérifiez la console pour plus de détails.'
      });
    } finally {
      setIsGenerating(false);
    }
  };


  // Ajouter la palette générée à la liste
  const handleAddGeneratedPalette = () => {
    if (!generatedPalette) return;
    
    // Vérifier si la palette n'existe pas déjà (dans les palettes statiques ou personnalisées)
    const existingInStatic = COLOR_PALETTES.find(p => p.id === generatedPalette.id);
    const existingInCustom = customPalettes.find(p => p.id === generatedPalette.id);
    if (existingInStatic || existingInCustom) {
      toast.warning('Cette palette existe déjà');
      return;
    }
    
    // Ajouter la palette aux palettes personnalisées
    const newCustomPalettes = [...customPalettes, generatedPalette];
    
    // Activer le flag pour éviter les rechargements pendant la mise à jour
    setIsUpdatingPalettes(true);
    
    // Mettre à jour le state local d'abord
    setCustomPalettes(newCustomPalettes);
    
    // Fermer le modal AVANT de sauvegarder pour éviter les conflits
    setIsGenerateModalOpen(false);
    
    // Réinitialiser le formulaire
    setGeneratedPalette(null);
    setGeneratePrompt('');
    setGenerateStyle('');
    setGenerateMood('');
    setGenerateIndustry('');
    
    // Sélectionner automatiquement la nouvelle palette
    setSelectedPaletteId(generatedPalette.id);
    
    // Sauvegarder dans metadata.customPalettes (après avoir fermé le modal)
    setTimeout(() => {
      updateField('metadata.customPalettes', newCustomPalettes);
      // Réactiver le rechargement après un court délai
      setTimeout(() => {
        setIsUpdatingPalettes(false);
      }, 200);
      toast.success('Palette ajoutée avec succès !');
    }, 100);
  };

  // Supprimer une palette personnalisée
  const handleDeletePalette = (e: React.MouseEvent, paletteId: string) => {
    e.stopPropagation(); // Empêcher la sélection de la palette
    
    // Vérifier que c'est bien une palette personnalisée
    const paletteToDelete = customPalettes.find(p => p.id === paletteId);
    if (!paletteToDelete) {
      toast.warning('Cette palette ne peut pas être supprimée');
      return;
    }
    
    // Si la palette supprimée est sélectionnée, sélectionner la palette par défaut
    if (selectedPaletteId === paletteId) {
      setSelectedPaletteId('classic');
    }
    
    // Retirer la palette de la liste
    const newCustomPalettes = customPalettes.filter(p => p.id !== paletteId);
    
    // Activer le flag pour éviter les rechargements pendant la mise à jour
    setIsUpdatingPalettes(true);
    
    // Mettre à jour le state local
    setCustomPalettes(newCustomPalettes);
    
    // Sauvegarder dans metadata.customPalettes
    setTimeout(() => {
      updateField('metadata.customPalettes', newCustomPalettes);
      // Réactiver le rechargement après un court délai
      setTimeout(() => {
        setIsUpdatingPalettes(false);
      }, 200);
      toast.success('Palette supprimée avec succès !');
    }, 100);
  };

  // Charger la palette sélectionnée
  useEffect(() => {
    const savedPaletteId = localData?.metadata?.colorPalette || 'classic';
    setSelectedPaletteId(savedPaletteId);
    setIsInitialized(true);
  }, [localData]);

  // Sauvegarder automatiquement quand la palette change
  useEffect(() => {
    if (!isInitialized) return;

    const currentPalette = localData?.metadata?.colorPalette;
    if (currentPalette === selectedPaletteId) return;

    updateField('metadata.colorPalette', selectedPaletteId);
    console.log('🎨 [ColorPaletteSection] Palette sélectionnée:', selectedPaletteId);
  }, [selectedPaletteId, isInitialized, localData, updateField]);

  const selectedPalette = allPalettes.find(p => p.id === selectedPaletteId) || allPalettes[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <Palette className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Palette de Couleurs</h3>
      </div>
      
      <div className="space-y-6">
        {/* Description et actions IA */}
        <div className="flex items-start justify-between gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1">
            <p className="text-sm text-blue-800">
              <strong>💡 Note :</strong> Sélectionnez une palette de couleurs pour votre site. 
              Les couleurs seront appliquées au template une fois la fonctionnalité frontend implémentée.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Générer avec l'IA
            </button>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">Filtrer par catégorie</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Grille de palettes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPalettes.map((palette) => {
            const isSelected = selectedPaletteId === palette.id;
            const isCustom = customPalettes.some(p => p.id === palette.id);
            
            return (
              <div
                key={palette.id}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {/* Bouton de sélection (couvre toute la carte) */}
                <button
                  onClick={() => setSelectedPaletteId(palette.id)}
                  className="w-full text-left"
                >
                  {/* Badge de sélection */}
                  {isSelected && !isCustom && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 z-10">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Badge "Générée par IA" pour les palettes personnalisées */}
                  {isCustom && (
                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 z-10">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </div>
                  )}

                  {/* Badge de sélection pour les palettes personnalisées (positionné différemment) */}
                  {isSelected && isCustom && (
                    <div className="absolute top-2 right-12 bg-blue-500 text-white rounded-full p-1 z-10">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Nom et description */}
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {palette.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {palette.description}
                    </p>
                  </div>

                  {/* Aperçu des couleurs */}
                  <div className="grid grid-cols-4 gap-2">
                    <div
                      className="h-8 rounded border border-gray-200"
                      style={{ backgroundColor: palette.colors.primary }}
                      title="Primaire"
                    />
                    <div
                      className="h-8 rounded border border-gray-200"
                      style={{ backgroundColor: palette.colors.secondary }}
                      title="Secondaire"
                    />
                    <div
                      className="h-8 rounded border border-gray-200"
                      style={{ backgroundColor: palette.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-8 rounded border border-gray-200"
                      style={{ backgroundColor: palette.colors.background }}
                      title="Fond"
                    />
                  </div>
                </button>

                {/* Bouton de suppression (uniquement pour les palettes personnalisées) */}
                {isCustom && (
                  <button
                    onClick={(e) => handleDeletePalette(e, palette.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 z-20 transition-colors shadow-md"
                    title="Supprimer cette palette"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Aperçu détaillé de la palette sélectionnée */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Palette sélectionnée : {selectedPalette.name}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(selectedPalette.colors).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div
                  className="w-full h-12 rounded border border-gray-200"
                  style={{ backgroundColor: value }}
                />
                <div className="text-xs">
                  <div className="font-medium text-gray-700 capitalize">
                    {key === 'primary' ? 'Primaire' :
                     key === 'secondary' ? 'Secondaire' :
                     key === 'accent' ? 'Accent' :
                     key === 'background' ? 'Fond' :
                     key === 'text' ? 'Texte' :
                     key === 'textSecondary' ? 'Texte secondaire' :
                     key === 'border' ? 'Bordure' : key}
                  </div>
                  <div className="text-gray-500 font-mono">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note de sauvegarde automatique */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>✓ Sauvegarde automatique :</strong> La palette sélectionnée est sauvegardée automatiquement.
            N'oubliez pas de cliquer sur "Sauvegarder" dans la barre supérieure pour finaliser.
          </p>
        </div>
      </div>

      {/* Modal de génération IA */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Générer une palette avec l'IA
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="Ex: Palette pour un site de luxe, élégante et sophistiquée..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={generateStyle}
                  onChange={(e) => setGenerateStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Aucun</option>
                  <option value="moderne">Moderne</option>
                  <option value="classique">Classique</option>
                  <option value="minimaliste">Minimaliste</option>
                  <option value="audacieux">Audacieux</option>
                  <option value="élégant">Élégant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiance
                </label>
                <select
                  value={generateMood}
                  onChange={(e) => setGenerateMood(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Aucune</option>
                  <option value="chaleureux">Chaleureux</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="créatif">Créatif</option>
                  <option value="apaisant">Apaisant</option>
                  <option value="énergique">Énergique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité (optionnel)
              </label>
              <input
                type="text"
                value={generateIndustry}
                onChange={(e) => setGenerateIndustry(e.target.value)}
                placeholder="Ex: E-commerce, Finance, Art, Tech..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleGeneratePalette}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Génération en cours...' : 'Générer la palette'}
            </button>

            {generatedPalette && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Palette générée : {generatedPalette.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">{generatedPalette.description}</p>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Object.entries(generatedPalette.colors).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <div
                        className="w-full h-12 rounded border border-gray-200"
                        style={{ backgroundColor: value }}
                      />
                      <div className="text-xs text-gray-600 font-mono">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddGeneratedPalette}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Utiliser cette palette
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedPalette(null);
                      setGeneratePrompt('');
                      setGenerateStyle('');
                      setGenerateMood('');
                      setGenerateIndustry('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Nouvelle génération
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ColorPaletteSection;

