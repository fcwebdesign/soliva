"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { THEME_TRANSITIONS, TRANSITION_TYPES, updateTransitionConfig, TransitionType } from '@/templates/transition-config';

interface TransitionAdminProps {
  currentTheme: string;
}

export default function TransitionAdmin({ currentTheme }: TransitionAdminProps) {
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('slide-up');
  const [duration, setDuration] = useState(1500);
  const [easing, setEasing] = useState('cubic-bezier(0.87, 0, 0.13, 1)');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Charger la configuration actuelle
  useEffect(() => {
    const config = THEME_TRANSITIONS[currentTheme];
    if (config) {
      setSelectedTransition(config.type);
      setDuration(config.duration || 1500);
      setEasing(config.easing || 'cubic-bezier(0.87, 0, 0.13, 1)');
    }
  }, [currentTheme]);

  const handleSave = () => {
    updateTransitionConfig(currentTheme, {
      type: selectedTransition,
      duration,
      easing,
    });
    
    // Recharger la page pour appliquer les changements
    window.location.reload();
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
    { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', label: 'Ease Out Sine' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration des Transitions</CardTitle>
          <CardDescription>
            Personnalisez les animations de transition pour le thème <Badge variant="secondary">{currentTheme}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type de transition */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de transition</label>
            <Select value={selectedTransition} onValueChange={(value: TransitionType) => setSelectedTransition(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSITION_TYPES).map(([key, { name, description }]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Durée */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Durée (ms)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="300"
              max="3000"
              step="100"
            />
          </div>

          {/* Easing */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Courbe d'animation</label>
            <Select value={easing} onValueChange={setEasing}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {easingPresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="outline">
              Aperçu
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu des transitions disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Transitions Disponibles</CardTitle>
          <CardDescription>
            Liste de toutes les transitions configurées par thème
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(THEME_TRANSITIONS).map(([theme, config]) => (
              <div key={theme} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium capitalize">{theme}</h3>
                  {theme === currentTheme && (
                    <Badge variant="default">Actuel</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Type: {TRANSITION_TYPES[config.type].name}</div>
                  <div>Durée: {config.duration}ms</div>
                  <div className="truncate">Easing: {config.easing}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
