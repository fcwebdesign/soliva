"use client";
import { useState, useEffect } from 'react';
import { Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HeaderVariant } from '@/templates/pearl/components/Header';

interface HeaderVariantsSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const HEADER_VARIANTS: { value: HeaderVariant; label: string; description: string }[] = [
  { value: 'classic', label: 'Classique', description: 'Logo à gauche, menu + CTA à droite' },
  { value: 'centered', label: 'Centré', description: 'Logo à gauche, menu centré, CTA à droite' },
  { value: 'minimal', label: 'Minimaliste', description: 'Logo à gauche, burger (menu) à droite' },
  { value: 'asymmetric', label: 'Asymétrique', description: 'Logo + menu à gauche, CTA à droite' },
  { value: 'split', label: 'Split', description: 'Logo centré, menu réparti de part et d’autre, CTA à droite' },
  { value: 'brand-centered', label: 'Marque centrée', description: 'Menu à gauche, marque/Logo centré, CTA à droite' }
];

export default function HeaderVariantsSection({ localData, updateField }: HeaderVariantsSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<HeaderVariant>('classic');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Charger la variante actuelle depuis le contenu complet (nav)
    const loadVariant = async () => {
      try {
        const res = await fetch('/api/admin/content', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const current = (data?.nav?.headerVariant as HeaderVariant) || 'classic';
          setSelectedVariant(current);
          return;
        }
      } catch {
        // ignore et fallback sur localData
      }
      const currentVariant = (localData?.nav?.headerVariant as HeaderVariant) || 'classic';
      setSelectedVariant(currentVariant);
    };
    loadVariant();
  }, [localData]);

  const handleSave = async () => {
    try {
      // Récupérer le contenu complet puis persister uniquement la variante du header dans nav
      const getRes = await fetch('/api/admin/content', { cache: 'no-store' });
      if (!getRes.ok) {
        throw new Error('Lecture du contenu impossible');
      }
      const fullContent = await getRes.json();

      const updatedContent = {
        ...fullContent,
        nav: {
          ...fullContent.nav,
          headerVariant: selectedVariant,
        },
      };

      const putRes = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (putRes.ok) {
        console.log('✅ Variante de header sauvegardée');
        // Mise à jour locale pour l'aperçu instantané dans l'admin
        updateField('nav.headerVariant', selectedVariant);
        alert('Variante de header sauvegardée avec succès !');
        try {
          // Notifier les wrappers qui écoutent
          window.dispatchEvent(new CustomEvent('content-updated', {
            detail: { nav: updatedContent.nav }
          }));
        } catch {}
      } else {
        const err = await putRes.json().catch(() => ({}));
        console.error('❌ Erreur lors de la sauvegarde', err);
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde variante header:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
    // Mettre à jour temporairement la variante pour l'aperçu
    updateField('nav.headerVariant', selectedVariant);
    
    setTimeout(() => {
      setIsPreviewMode(false);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Variantes de Header</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style de header
          </label>
          <div className="grid grid-cols-1 gap-3">
            {HEADER_VARIANTS.map((variant) => (
              <div
                key={variant.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVariant === variant.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedVariant(variant.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{variant.label}</div>
                    <div className="text-sm text-gray-600">{variant.description}</div>
                  </div>
                  {selectedVariant === variant.value && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Actuel
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aperçu de la variante actuelle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration actuelle</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Variante: <Badge variant="secondary">{HEADER_VARIANTS.find(v => v.value === selectedVariant)?.label}</Badge></div>
            <div>Description: {HEADER_VARIANTS.find(v => v.value === selectedVariant)?.description}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handlePreview} 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isPreviewMode}
          >
            <Eye className="w-4 h-4" />
            {isPreviewMode ? 'Aperçu en cours...' : 'Aperçu'}
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Sauvegarder
          </Button>
        </div>

        {/* Note d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les variantes de header s'appliquent uniquement au template Pearl. 
            Chaque variante offre un layout différent pour s'adapter à votre identité de marque.
          </p>
        </div>
      </div>
    </div>
  );
}
