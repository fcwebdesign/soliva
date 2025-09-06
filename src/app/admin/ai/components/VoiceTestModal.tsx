"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Copy, RefreshCw, TestTube } from 'lucide-react';

interface VoiceTestModalProps {
  result: {
    generatedText: string;
    length: string;
    profileUsed: {
      brandName: string;
      tone: string;
      formality: string;
    };
  };
  onClose: () => void;
}

export default function VoiceTestModal({ result, onClose }: VoiceTestModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentText, setCurrentText] = useState(result.generatedText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      // TODO: Afficher une notification de succès
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleRegenerate = async (length: 'court' | 'standard' | 'détaillé') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/ai/test-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentText(data.generatedText);
      }
    } catch (error) {
      console.error('Erreur lors de la régénération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLengthLabel = (length: string) => {
    switch (length) {
      case 'court': return 'Court (1-2 phrases)';
      case 'standard': return 'Standard (2-3 phrases)';
      case 'détaillé': return 'Détaillé (3-4 phrases)';
      default: return length;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-500" />
              Test de voix de marque
            </h3>
            <p className="text-sm text-gray-600">
              Exemple généré avec votre profil IA
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Informations du profil utilisé */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Profil utilisé :</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{result.profileUsed.brandName}</Badge>
              <Badge variant="outline">Ton: {result.profileUsed.tone}</Badge>
              <Badge variant="outline">{result.profileUsed.formality}</Badge>
              <Badge variant="outline">{getLengthLabel(result.length)}</Badge>
            </div>
          </div>

          {/* Texte généré */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Texte généré :</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier
              </Button>
            </div>
            <div className="bg-white border rounded-lg p-4 min-h-[120px]">
              <p className="text-gray-800 leading-relaxed">{currentText}</p>
            </div>
          </div>

          {/* Boutons de régénération */}
          <div className="space-y-3">
            <h4 className="font-medium">Régénérer avec une autre longueur :</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegenerate('court')}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Court
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegenerate('standard')}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Standard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegenerate('détaillé')}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Détaillé
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={handleCopy} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copier et fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
