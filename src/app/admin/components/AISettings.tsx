"use client";
import React, { useState, useEffect } from 'react';
import { AIProfile, AIProfileFormData } from '@/types/ai-profile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Settings, TestTube, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import AIProfileForm from '../ai/components/AIProfileForm';
import VoiceTestModal from '../ai/components/VoiceTestModal';

export default function AISettings() {
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger le profil IA
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
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

  const calculateCompleteness = (profileData: AIProfile) => {
    const fields = [
      'companyName', 'industry', 'targetAudience', 'brandVoice', 'contentGoals',
      'competitors', 'keyMessages', 'contentTypes', 'tone', 'style'
    ];
    
    const filledFields = fields.filter(field => {
      const value = profileData[field as keyof AIProfile];
      return value && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    }).length;
    
    const score = Math.round((filledFields / fields.length) * 100);
    setCompletenessScore(score);
  };

  const handleSaveProfile = async (profileData: AIProfileFormData) => {
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/admin/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setProfile(profileData as unknown as AIProfile);
        calculateCompleteness(profileData as unknown as AIProfile);
        setSaveStatus('success');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleTestVoice = async () => {
    try {
      const response = await fetch('/api/admin/ai/test-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
        setShowVoiceTest(true);
      }
    } catch (error) {
      console.error('Erreur test voix:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration IA</h1>
            <p className="text-gray-600">Personnalisez votre assistant IA pour des suggestions adaptées</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleTestVoice}
            className="flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>Tester la voix</span>
          </Button>
        </div>
      </div>

      {/* Score de complétude */}
      {profile && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profil IA</h3>
            <Badge variant={completenessScore >= 80 ? "default" : "secondary"}>
              {completenessScore}% complet
            </Badge>
          </div>
          
          <Progress value={completenessScore} className="mb-4" />
          
          <div className="space-y-3">
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
  );
}
