"use client";
import React, { useState, useEffect } from 'react';
import { AIProfile, AIProfileFormData } from '@/types/ai-profile';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, X } from 'lucide-react';

interface AIProfileFormProps {
  initialData?: AIProfile | null;
  onSave: (data: AIProfileFormData) => void;
  isLoading: boolean;
  onDataChange?: (hasChanges: boolean) => void;
}

export default function AIProfileForm({ initialData, onSave, isLoading, onDataChange }: AIProfileFormProps) {
  const [formData, setFormData] = useState<AIProfileFormData>({
    // 1. Marque
    brandName: '',
    brandBaseline: '',
    brandElevatorPitch: '',
    
    // 2. Offre
    mainServices: ['', '', ''],
    usps: ['', '', ''],
    
    // 3. Audience
    audienceType: 'B2B',
    audienceSector: '',
    expertiseLevel: 'pro',
    
    // 4. Ton & style
    toneStyles: [],
    formality: 'vouvoiement',
    emojisAllowed: false,
    preferredLength: 'standard',
    
    // 5. Règles d'écriture
    writingDo: ['', '', ''],
    writingAvoid: ['', '', ''],
    bannedWords: [],
    
    // 6. Lexique & CTA
    brandKeywords: ['', '', '', '', '', ''],
    allowedCTAs: ['', '', ''],
    
    // 7. Langues & localisation
    outputLanguages: ['fr'],
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1 234,56',
    
    // 8. SEO léger
    priorityKeywords: ['', '', '', '', ''],
    competitors: ['', '', ''],
    inspirationSources: ['', ''],
    
    // 9. Conformité
    forbiddenClauses: ['', '', ''],
    requiredDisclaimer: '',
    
    // 10. Sources internes
    existingPages: ['', ''],
    documents: ['', ''],
    
    // 11. Gouvernance & quotas
    allowedRoles: ['Admin'],
    dailyQuota: 50,
    mandatoryReview: false,
    
    // 12. Consentement & logs
    allowContextualTraining: true,
    dataRetentionDays: 90
  });

  // Détecter les changements dans le formulaire
  useEffect(() => {
    if (onDataChange) {
      if (initialData) {
        // Comparer avec les données initiales pour détecter les vrais changements
        const initialFormData = {
          brandName: initialData.brand.name || '',
          brandBaseline: initialData.brand.baseline || '',
          brandElevatorPitch: initialData.brand.elevatorPitch || '',
          mainServices: [...initialData.offer.mainServices, '', '', ''].slice(0, 3),
          usps: [...initialData.offer.usps, '', '', ''].slice(0, 3),
          audienceType: initialData.audience.primary.type || 'B2B',
          audienceSector: initialData.audience.primary.sector || '',
          expertiseLevel: initialData.audience.expertiseLevel || 'pro',
          toneStyles: initialData.tone.styles || [],
          formality: initialData.tone.formality || 'vouvoiement',
          emojisAllowed: initialData.tone.emojisAllowed || false,
          preferredLength: initialData.tone.preferredLength || 'standard',
          writingDo: [...initialData.writingRules.do, '', '', ''].slice(0, 3),
          writingAvoid: [...initialData.writingRules.avoid, '', '', ''].slice(0, 3),
          bannedWords: initialData.writingRules.bannedWords || [],
          brandKeywords: [...initialData.lexicon.brandKeywords, '', '', '', '', '', ''].slice(0, 6),
          allowedCTAs: [...initialData.lexicon.allowedCTAs, '', '', ''].slice(0, 3),
          outputLanguages: initialData.localization.outputLanguages || ['fr'],
          currency: initialData.localization.currency || 'EUR',
          dateFormat: initialData.localization.dateFormat || 'DD/MM/YYYY',
          numberFormat: initialData.localization.numberFormat || '1 234,56',
          priorityKeywords: [...initialData.seo.priorityKeywords, '', '', '', '', ''].slice(0, 5),
          competitors: [...initialData.seo.competitors, '', '', ''].slice(0, 3),
          inspirationSources: [...initialData.seo.inspirationSources, '', ''].slice(0, 2),
          forbiddenClauses: [...initialData.compliance.forbiddenClauses, '', '', ''].slice(0, 3),
          requiredDisclaimer: initialData.compliance.requiredDisclaimer || '',
          existingPages: [...initialData.internalSources.existingPages, '', ''].slice(0, 2),
          documents: [...initialData.internalSources.documents, '', ''].slice(0, 2),
          allowedRoles: initialData.governance.allowedRoles || ['Admin'],
          dailyQuota: initialData.governance.dailyQuota || 50,
          mandatoryReview: initialData.governance.mandatoryReview || false,
          allowContextualTraining: initialData.consent.allowContextualTraining || true,
          dataRetentionDays: initialData.consent.dataRetentionDays || 90
        };
        
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
        onDataChange(hasChanges);
      } else {
        // Si pas de données initiales, considérer comme modifié si au moins un champ est rempli
        const hasContent = Object.values(formData).some(value => {
          if (Array.isArray(value)) {
            return value.some(item => item && item.trim() !== '');
          }
          return value && value.toString().trim() !== '';
        });
        onDataChange(hasContent);
      }
    }
  }, [formData, onDataChange, initialData]);

  // Charger les données initiales
  useEffect(() => {
    if (initialData) {
      setFormData({
        brandName: initialData.brand.name || '',
        brandBaseline: initialData.brand.baseline || '',
        brandElevatorPitch: initialData.brand.elevatorPitch || '',
        mainServices: [...initialData.offer.mainServices, '', '', ''].slice(0, 3),
        usps: [...initialData.offer.usps, '', '', ''].slice(0, 3),
        audienceType: initialData.audience.primary.type,
        audienceSector: initialData.audience.primary.sector || '',
        audienceSecondaryType: initialData.audience.secondary?.type,
        audienceSecondarySector: initialData.audience.secondary?.sector,
        expertiseLevel: initialData.audience.expertiseLevel,
        toneStyles: initialData.tone.styles || [],
        formality: initialData.tone.formality,
        emojisAllowed: initialData.tone.emojisAllowed,
        preferredLength: initialData.tone.preferredLength,
        writingDo: [...initialData.writingRules.do, '', '', ''].slice(0, 3),
        writingAvoid: [...initialData.writingRules.avoid, '', '', ''].slice(0, 3),
        bannedWords: initialData.writingRules.bannedWords || [],
        brandKeywords: [...initialData.lexicon.brandKeywords, '', '', '', '', '', ''].slice(0, 6),
        allowedCTAs: [...initialData.lexicon.allowedCTAs, '', '', ''].slice(0, 3),
        outputLanguages: initialData.localization.outputLanguages || ['fr'],
        currency: initialData.localization.currency || 'EUR',
        dateFormat: initialData.localization.dateFormat || 'DD/MM/YYYY',
        numberFormat: initialData.localization.numberFormat || '1 234,56',
        priorityKeywords: [...initialData.seo.priorityKeywords, '', '', '', '', ''].slice(0, 5),
        competitors: [...initialData.seo.competitors, '', '', ''].slice(0, 3),
        inspirationSources: [...initialData.seo.inspirationSources, '', ''].slice(0, 2),
        forbiddenClauses: [...initialData.compliance.forbiddenClauses, '', '', ''].slice(0, 3),
        requiredDisclaimer: initialData.compliance.requiredDisclaimer || '',
        existingPages: [...initialData.internalSources.existingPages, '', ''].slice(0, 2),
        documents: [...initialData.internalSources.documents, '', ''].slice(0, 2),
        allowedRoles: initialData.governance.allowedRoles || ['Admin'],
        dailyQuota: initialData.governance.dailyQuota || 50,
        mandatoryReview: initialData.governance.mandatoryReview || false,
        allowContextualTraining: initialData.consent.allowContextualTraining,
        dataRetentionDays: initialData.consent.dataRetentionDays || 90
      });
    }
  }, [initialData]);

  const handleArrayChange = (field: keyof AIProfileFormData, index: number, value: string) => {
    const array = [...(formData[field] as string[])];
    array[index] = value;
    setFormData({ ...formData, [field]: array });
  };

  const handleCheckboxChange = (field: keyof AIProfileFormData, value: string, checked: boolean) => {
    const array = [...(formData[field] as string[])];
    if (checked) {
      array.push(value);
    } else {
      const index = array.indexOf(value);
      if (index > -1) array.splice(index, 1);
    }
    setFormData({ ...formData, [field]: array });
  };

  const addBannedWord = () => {
    setFormData({
      ...formData,
      bannedWords: [...formData.bannedWords, '']
    });
  };

  const removeBannedWord = (index: number) => {
    const newWords = formData.bannedWords.filter((_, i) => i !== index);
    setFormData({ ...formData, bannedWords: newWords });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nettoyer les données (supprimer les chaînes vides)
    const cleanedData = {
      ...formData,
      mainServices: formData.mainServices.filter(s => s.trim() !== ''),
      usps: formData.usps.filter(s => s.trim() !== ''),
      writingDo: formData.writingDo.filter(s => s.trim() !== ''),
      writingAvoid: formData.writingAvoid.filter(s => s.trim() !== ''),
      bannedWords: formData.bannedWords.filter(s => s.trim() !== ''),
      brandKeywords: formData.brandKeywords.filter(s => s.trim() !== ''),
      allowedCTAs: formData.allowedCTAs.filter(s => s.trim() !== ''),
      priorityKeywords: formData.priorityKeywords.filter(s => s.trim() !== ''),
      competitors: formData.competitors.filter(s => s.trim() !== ''),
      inspirationSources: formData.inspirationSources.filter(s => s.trim() !== ''),
      forbiddenClauses: formData.forbiddenClauses.filter(s => s.trim() !== ''),
      existingPages: formData.existingPages.filter(s => s.trim() !== ''),
      documents: formData.documents.filter(s => s.trim() !== '')
    };
    
    onSave(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* 1. Marque */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">1. Marque</h3>
          <p className="text-sm text-gray-600">Identité de votre entreprise</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="brandName">Nom officiel *</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="Ex: Soliva Creative Studio"
              required
            />
          </div>
          <div>
            <Label htmlFor="brandBaseline">Baseline (≤80 caractères)</Label>
            <Input
              id="brandBaseline"
              value={formData.brandBaseline}
              onChange={(e) => setFormData({ ...formData, brandBaseline: e.target.value })}
              placeholder="Ex: Creative Studio | Digital & Brand Strategy"
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="brandElevatorPitch">Elevator pitch (1 phrase)</Label>
            <Textarea
              id="brandElevatorPitch"
              value={formData.brandElevatorPitch}
              onChange={(e) => setFormData({ ...formData, brandElevatorPitch: e.target.value })}
              placeholder="Ex: Nous créons des expériences digitales qui transforment les marques et engagent les audiences."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* 2. Offre */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">2. Offre</h3>
          <p className="text-sm text-gray-600">Services et propositions de valeur</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>3 services/produits principaux</Label>
            {formData.mainServices.map((service, index) => (
              <Input
                key={index}
                value={service}
                onChange={(e) => handleArrayChange('mainServices', index, e.target.value)}
                placeholder={`Service ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>3 preuves/USP (Unique Selling Propositions)</Label>
            {formData.usps.map((usp, index) => (
              <Input
                key={index}
                value={usp}
                onChange={(e) => handleArrayChange('usps', index, e.target.value)}
                placeholder={`USP ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Audience */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">3. Audience          </h3>
          <p className="text-sm text-gray-600">Cible et niveau d'expertise          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="audienceType">Type de cible principale</Label>
              <Select value={formData.audienceType} onValueChange={(value: any) => setFormData({ ...formData, audienceType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B2C">B2B2C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="audienceSector">Secteur d'activité</Label>
              <Input
                id="audienceSector"
                value={formData.audienceSector}
                onChange={(e) => setFormData({ ...formData, audienceSector: e.target.value })}
                placeholder="Ex: Digital, Restauration, Juridique"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="expertiseLevel">Niveau d'expertise du public</Label>
            <Select value={formData.expertiseLevel} onValueChange={(value: any) => setFormData({ ...formData, expertiseLevel: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grand public">Grand public</SelectItem>
                <SelectItem value="pro">Professionnel</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Ton & style */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">4. Ton & style          </h3>
          <p className="text-sm text-gray-600">Personnalité de votre communication          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Ton souhaité (plusieurs choix possibles)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['sobre', 'chaleureux', 'premium', 'technique', 'fun'].map((tone) => (
                <div key={tone} className="flex items-center space-x-2">
                  <Checkbox
                    id={tone}
                    checked={formData.toneStyles.includes(tone as any)}
                    onCheckedChange={(checked) => handleCheckboxChange('toneStyles', tone, checked as boolean)}
                  />
                  <Label htmlFor={tone} className="text-sm">{tone}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="formality">Tutoiement/Vouvoiement</Label>
              <Select value={formData.formality} onValueChange={(value: any) => setFormData({ ...formData, formality: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutoiement">Tutoiement</SelectItem>
                  <SelectItem value="vouvoiement">Vouvoiement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferredLength">Longueur préférée</Label>
              <Select value={formData.preferredLength} onValueChange={(value: any) => setFormData({ ...formData, preferredLength: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="court">Court</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="détaillé">Détaillé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emojisAllowed"
              checked={formData.emojisAllowed}
              onCheckedChange={(checked) => setFormData({ ...formData, emojisAllowed: checked as boolean })}
            />
            <Label htmlFor="emojisAllowed">Émojis autorisés</Label>
          </div>
        </div>
      </div>

      {/* 5. Règles d'écriture */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">5. Règles d'écriture          </h3>
          <p className="text-sm text-gray-600">Guidelines et interdictions          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>À faire (3 règles)</Label>
            {formData.writingDo.map((rule, index) => (
              <Input
                key={index}
                value={rule}
                onChange={(e) => handleArrayChange('writingDo', index, e.target.value)}
                placeholder={`Règle ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>À éviter (3 règles)</Label>
            {formData.writingAvoid.map((rule, index) => (
              <Input
                key={index}
                value={rule}
                onChange={(e) => handleArrayChange('writingAvoid', index, e.target.value)}
                placeholder={`Interdiction ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>Mots bannis</Label>
            <div className="space-y-2">
              {formData.bannedWords.map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={word}
                    onChange={(e) => handleArrayChange('bannedWords', index, e.target.value)}
                    placeholder="Mot à bannir"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBannedWord(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBannedWord}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un mot
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Lexique & CTA */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">6. Lexique & CTA          </h3>
          <p className="text-sm text-gray-600">Mots-clés de marque et appels à l'action          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>6 mots-clés de marque</Label>
            {formData.brandKeywords.map((keyword, index) => (
              <Input
                key={index}
                value={keyword}
                onChange={(e) => handleArrayChange('brandKeywords', index, e.target.value)}
                placeholder={`Mot-clé ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>3 CTA autorisés</Label>
            {formData.allowedCTAs.map((cta, index) => (
              <Input
                key={index}
                value={cta}
                onChange={(e) => handleArrayChange('allowedCTAs', index, e.target.value)}
                placeholder={`CTA ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 7. Langues & localisation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">7. Langues & localisation          </h3>
          <p className="text-sm text-gray-600">Paramètres linguistiques et culturels          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Format de date</Label>
              <Select value={formData.dateFormat} onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 8. SEO léger */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">8. SEO léger          </h3>
          <p className="text-sm text-gray-600">Mots-clés et références          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>5 mots-clés prioritaires</Label>
            {formData.priorityKeywords.map((keyword, index) => (
              <Input
                key={index}
                value={keyword}
                onChange={(e) => handleArrayChange('priorityKeywords', index, e.target.value)}
                placeholder={`Mot-clé SEO ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>3 concurrents (URLs)</Label>
            {formData.competitors.map((competitor, index) => (
              <Input
                key={index}
                value={competitor}
                onChange={(e) => handleArrayChange('competitors', index, e.target.value)}
                placeholder={`https://concurrent${index + 1}.com`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>2 références d'inspiration (URLs)</Label>
            {formData.inspirationSources.map((source, index) => (
              <Input
                key={index}
                value={source}
                onChange={(e) => handleArrayChange('inspirationSources', index, e.target.value)}
                placeholder={`https://inspiration${index + 1}.com`}
                className="mt-2"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 9. Conformité */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">9. Conformité          </h3>
          <p className="text-sm text-gray-600">Règles légales et éthiques          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Clauses interdites (3 règles)</Label>
            {formData.forbiddenClauses.map((clause, index) => (
              <Input
                key={index}
                value={clause}
                onChange={(e) => handleArrayChange('forbiddenClauses', index, e.target.value)}
                placeholder={`Interdiction ${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label htmlFor="requiredDisclaimer">Disclaimer requis</Label>
            <Textarea
              id="requiredDisclaimer"
              value={formData.requiredDisclaimer}
              onChange={(e) => setFormData({ ...formData, requiredDisclaimer: e.target.value })}
              placeholder="Ex: Les résultats peuvent varier selon les individus."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* 10. Sources internes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">10. Sources internes (optionnel)          </h3>
          <p className="text-sm text-gray-600">Pages et documents existants à utiliser          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Pages existantes à "absorber" (URLs)</Label>
            {formData.existingPages.map((page, index) => (
              <Input
                key={index}
                value={page}
                onChange={(e) => handleArrayChange('existingPages', index, e.target.value)}
                placeholder={`https://monsite.com/page${index + 1}`}
                className="mt-2"
              />
            ))}
          </div>
          <div>
            <Label>Documents (chemins)</Label>
            {formData.documents.map((doc, index) => (
              <Input
                key={index}
                value={doc}
                onChange={(e) => handleArrayChange('documents', index, e.target.value)}
                placeholder={`/docs/document${index + 1}.pdf`}
                className="mt-2"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 11. Gouvernance & quotas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">11. Gouvernance & quotas          </h3>
          <p className="text-sm text-gray-600">Contrôles d'accès et limites          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Rôles autorisés</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Admin', 'Éditeur', 'Rédacteur'].map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={formData.allowedRoles.includes(role as any)}
                    onCheckedChange={(checked) => handleCheckboxChange('allowedRoles', role, checked as boolean)}
                  />
                  <Label htmlFor={role} className="text-sm">{role}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dailyQuota">Quota par jour</Label>
              <Input
                id="dailyQuota"
                type="number"
                value={formData.dailyQuota}
                onChange={(e) => setFormData({ ...formData, dailyQuota: parseInt(e.target.value) || 0 })}
                min="1"
                max="1000"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mandatoryReview"
                checked={formData.mandatoryReview}
                onCheckedChange={(checked) => setFormData({ ...formData, mandatoryReview: checked as boolean })}
              />
              <Label htmlFor="mandatoryReview">Révision obligatoire</Label>
            </div>
          </div>
        </div>
      </div>

      {/* 12. Consentement & logs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">12. Consentement & logs          </h3>
          <p className="text-sm text-gray-600">Paramètres de confidentialité          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowContextualTraining"
              checked={formData.allowContextualTraining}
              onCheckedChange={(checked) => setFormData({ ...formData, allowContextualTraining: checked as boolean })}
            />
            <Label htmlFor="allowContextualTraining">Autoriser l'entraînement contextuel local</Label>
          </div>
          <div>
            <Label htmlFor="dataRetentionDays">Durée de rétention des données</Label>
            <Select value={formData.dataRetentionDays.toString()} onValueChange={(value) => setFormData({ ...formData, dataRetentionDays: parseInt(value) as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="180">180 jours</SelectItem>
                <SelectItem value="365">365 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Le bouton de sauvegarde est maintenant dans le HeaderAdmin */}
    </form>
  );
}
