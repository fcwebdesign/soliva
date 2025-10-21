"use client";
import React, { useState, useEffect } from 'react';
import { AIProfile, AIProfileFormData } from '@/types/ai-profile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Settings, TestTube, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import AIProfileForm from './components/AIProfileForm';
import VoiceTestModal from './components/VoiceTestModal';
import AdminPageLayout from '../components/AdminPageLayout';

export default function AISettingsPage() {
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Appliquer les styles admin au body
  useEffect(() => {
    document.body.classList.add('admin-page');
    
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

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
    setSaveStatus('saving');
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
        setHasUnsavedChanges(false); // Réinitialiser l'état des modifications
        
        setSaveStatus('success');
        // Réinitialiser le statut après 3 secondes
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        console.error('Erreur API:', data.error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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

  // Actions pour le header
  const headerActions = (
    <>
      {hasUnsavedChanges && (
        <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          Modifications non enregistrées
        </span>
      )}
      
      {saveStatus === 'saving' && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Enregistrement...</span>
        </div>
      )}
      
      {saveStatus === 'success' && (
        <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Enregistré à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      
      {saveStatus === 'error' && (
        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
          ❌ Erreur
        </span>
      )}
      
      {profile && (
        <Button
          onClick={() => handleTestVoice('standard')}
          variant="default"
          size="sm"
        >
          <TestTube className="w-4 h-4 mr-1" />
          Tester la voix
        </Button>
      )}
      
      <Button
        onClick={() => {
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }}
        disabled={saveStatus === 'saving' || !hasUnsavedChanges}
        variant="secondary"
        size="sm"
      >
        <Save className="w-4 h-4 mr-1" />
        {saveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
      </Button>
    </>
  );

  return (
    <AdminPageLayout
      title="Paramètres IA"
      description="Configuration du profil IA pour générer des contenus alignés à votre marque"
      currentPage="ai"
      loading={isLoading}
      actions={headerActions}
    >
      <div className="space-y-6">
              {/* Description */}
              <div>
                <p className="text-gray-600">
                  Configurez le profil IA pour des contenus alignés à votre marque
                </p>
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
                isLoading={saveStatus === 'saving'}
                onDataChange={setHasUnsavedChanges}
              />

        {/* Modal de test de voix */}
        {showVoiceTest && testResult && (
          <VoiceTestModal
            result={testResult}
            onClose={() => setShowVoiceTest(false)}
          />
        )}
      </div>
    </AdminPageLayout>
  );
}
