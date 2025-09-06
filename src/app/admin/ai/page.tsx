"use client";
import React, { useState, useEffect } from 'react';
import { AIProfile, AIProfileFormData } from '@/types/ai-profile';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Settings, TestTube, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import AIProfileForm from './components/AIProfileForm';
import VoiceTestModal from './components/VoiceTestModal';

export default function AISettingsPage() {
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Charger le profil IA au montage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/admin/ai/profile');
      const data = await response.json();
      
      if (data.profile) {
        setProfile(data.profile);
        setCompletenessScore(data.completenessScore || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (formData: AIProfileFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setCompletenessScore(data.completenessScore);
        // TODO: Afficher une notification de succès
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestVoice = async (length: 'court' | 'standard' | 'détaillé') => {
    try {
      const response = await fetch('/api/admin/ai/test-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult(data);
        setShowVoiceTest(true);
      }
    } catch (error) {
      console.error('Erreur lors du test de voix:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Chargement du profil IA...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" />
            Paramètres IA
          </h1>
          <p className="text-gray-600 mt-2">
            Configurez le profil IA pour des contenus alignés à votre marque
          </p>
        </div>
        
        {profile && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleTestVoice('standard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Tester la voix
            </Button>
          </div>
        )}
      </div>

      {/* Score de complétude */}
      {profile && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Progression du profil
            </h3>
            <p className="text-sm text-gray-600">
              Complétez votre profil pour des suggestions IA plus précises
            </p>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Complétude</span>
                <Badge variant={completenessScore >= 80 ? "default" : "secondary"}>
                  {completenessScore}%
                </Badge>
              </div>
              <Progress value={completenessScore} className="h-2" />
              
              {completenessScore < 80 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Votre profil IA est incomplet. Complétez au moins 80% des champs pour des suggestions optimales.
                  </AlertDescription>
                </Alert>
              )}
              
              {completenessScore >= 80 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Excellent ! Votre profil IA est complet et prêt à générer des contenus personnalisés.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de profil */}
      <AIProfileForm
        initialData={profile}
        onSave={handleSaveProfile}
        isLoading={isSaving}
      />

      {/* Modal de test de voix */}
      {showVoiceTest && testResult && (
        <VoiceTestModal
          result={testResult}
          onClose={() => setShowVoiceTest(false)}
        />
      )}
    </div>
  );
}
