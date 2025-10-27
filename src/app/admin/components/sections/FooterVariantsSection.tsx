"use client";
import { useEffect, useState } from 'react';
import { Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type FooterVariant = 'classic' | 'centered' | 'minimal' | 'columns';

interface FooterVariantsSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const VARIANTS: { value: FooterVariant; label: string; description: string }[] = [
  { value: 'classic', label: 'Classique', description: 'Identité + description à gauche, liens & réseaux à droite, copyright en bas' },
  { value: 'columns', label: 'Colonnes', description: 'Trois colonnes: À propos, Liens, Réseaux — copyright en bas' },
  { value: 'centered', label: 'Centré', description: 'Tout centré: marque, liens en ligne, réseaux, copyright' },
  { value: 'minimal', label: 'Minimal', description: 'Copyright + liens légaux uniquement' },
];

export default function FooterVariantsSection({ localData, updateField }: FooterVariantsSectionProps) {
  const [selected, setSelected] = useState<FooterVariant>('classic');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/content', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSelected((data?.footer?.footerVariant as FooterVariant) || 'classic');
          return;
        }
      } catch {}
      setSelected((localData?.footer?.footerVariant as FooterVariant) || 'classic');
    };
    load();
  }, [localData]);

  const handleSave = async () => {
    try {
      const getRes = await fetch('/api/admin/content', { cache: 'no-store' });
      if (!getRes.ok) throw new Error('Lecture impossible');
      const fullContent = await getRes.json();
      const updated = { ...fullContent, footer: { ...fullContent.footer, footerVariant: selected } };
      const putRes = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updated }),
      });
      if (!putRes.ok) throw new Error('Sauvegarde impossible');
      updateField('footer.footerVariant', selected);
      try {
        window.dispatchEvent(new CustomEvent('content-updated', { detail: { footer: updated.footer } }));
      } catch {}
      alert('Variante de footer sauvegardée !');
    } catch (e) {
      console.error('Erreur sauvegarde variante footer:', e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
    updateField('footer.footerVariant', selected);
    setTimeout(() => setIsPreviewMode(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Variantes de Footer</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style de footer</label>
          <div className="grid grid-cols-1 gap-3">
            {VARIANTS.map(v => (
              <div
                key={v.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selected === v.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setSelected(v.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{v.label}</div>
                    <div className="text-sm text-gray-600">{v.description}</div>
                  </div>
                  {selected === v.value && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Actuel</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2" disabled={isPreviewMode}>
            <Eye className="w-4 h-4" />
            {isPreviewMode ? 'Aperçu en cours...' : 'Aperçu'}
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}

