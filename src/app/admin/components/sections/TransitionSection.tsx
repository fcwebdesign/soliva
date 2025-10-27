"use client";
import { useState, useEffect } from 'react';
import { Settings, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransitionType, getTransitionConfig } from '@/templates/transition-config';
import { useTemplate } from '@/templates/context';

interface TransitionSectionProps {
  localData: any;
  updateField: (path: string, value: any) => void;
}

const TransitionSection: React.FC<TransitionSectionProps> = ({ localData, updateField }) => {
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('slide-up');
  const [duration, setDuration] = useState(1500);
  const [easing, setEasing] = useState('cubic-bezier(0.87, 0, 0.13, 1)');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Charger la configuration actuelle depuis le contenu
  useEffect(() => {
    const transitionConfig = localData._transitionConfig;
    if (transitionConfig) {
      setSelectedTransition(transitionConfig.type || 'slide-up');
      setDuration(transitionConfig.duration || 1500);
      setEasing(transitionConfig.easing || 'cubic-bezier(0.87, 0, 0.13, 1)');
    }
  }, [localData]);

  const handleSave = async () => {
    try {
      const transitionConfig = {
        type: selectedTransition,
        duration,
        easing,
      };

      const response = await fetch('/api/transitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transitionConfig }),
      });

      if (response.ok) {
        // Mettre à jour aussi le champ local pour la cohérence
        updateField('_transitionConfig', transitionConfig);
        // Notifier les consommateurs live et éviter un reload complet
        try {
          window.dispatchEvent(new CustomEvent('content-updated', {
            detail: { _transitionConfig: transitionConfig }
          }));
          localStorage.setItem('transitions-updated', String(Date.now()));
        } catch {}

        alert('Configuration des transitions sauvegardée !');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
    // Simuler une transition
    setTimeout(() => {
      setIsPreviewMode(false);
    }, duration + 500);
  };

  const easingPresets = [
    { value: 'cubic-bezier(0.87, 0, 0.13, 1)', label: 'Ease Out Quart' },
    { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Ease Out' },
    { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', label: 'Ease Out Quad' },
    { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Ease Out Back' },
    { value: 'cubic-bezier(0.25, 0.1, 0.25, 1)', label: 'Ease Out Sine' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Transitions de Pages</h3>
      </div>
      
      <div className="space-y-4">
        {/* Type de transition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de transition
          </label>
          <select
            value={selectedTransition}
            onChange={(e) => setSelectedTransition(e.target.value as TransitionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="slide-up">Slide Up (Pearl)</option>
            <option value="slide-down">Slide Down</option>
            <option value="fade">Fade</option>
            <option value="zoom">Zoom</option>
            <option value="flip">Flip 3D</option>
            <option value="curtain">Curtain</option>
          </select>
        </div>

        {/* Durée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée (ms)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            min="300"
            max="3000"
            step="100"
          />
        </div>

        {/* Easing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Courbe d'animation
          </label>
          <select
            value={easing}
            onChange={(e) => setEasing(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {easingPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Aperçu de la transition actuelle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration actuelle</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Type: <Badge variant="secondary">{selectedTransition}</Badge></div>
            <div>Durée: {duration}ms</div>
            <div>Courbe: {easingPresets.find(p => p.value === easing)?.label || easing}</div>
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
            <Play className="w-4 h-4" />
            {isPreviewMode ? 'Aperçu en cours...' : 'Aperçu'}
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </Button>
        </div>

        {/* Note d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les transitions s'appliquent à toutes les navigations entre pages du site. 
            Les changements seront visibles immédiatement après sauvegarde.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransitionSection;
