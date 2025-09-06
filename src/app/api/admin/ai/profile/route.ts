import { NextRequest, NextResponse } from 'next/server';
import { AIProfile, AIProfileFormData, SerializedAIProfile } from '@/types/ai-profile';
import fs from 'fs';
import path from 'path';

const AI_PROFILE_FILE = path.join(process.cwd(), 'data', 'ai-profile.json');

// Fonction pour calculer le score de complétude
function calculateCompletenessScore(profile: Partial<AIProfile>): number {
  const fields = [
    'brand.name', 'brand.baseline', 'brand.elevatorPitch',
    'offer.mainServices', 'offer.usps',
    'audience.primary.type', 'audience.primary.sector', 'audience.expertiseLevel',
    'tone.styles', 'tone.formality', 'tone.preferredLength',
    'writingRules.do', 'writingRules.avoid',
    'lexicon.brandKeywords', 'lexicon.allowedCTAs',
    'localization.outputLanguages', 'localization.currency',
    'seo.priorityKeywords',
    'compliance.forbiddenClauses',
    'governance.allowedRoles', 'governance.dailyQuota',
    'consent.allowContextualTraining', 'consent.dataRetentionDays'
  ];
  
  let completedFields = 0;
  const totalFields = fields.length;
  
  fields.forEach(field => {
    const value = getNestedValue(profile, field);
    if (value !== undefined && value !== null && value !== '' && 
        (!Array.isArray(value) || value.length > 0)) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / totalFields) * 100);
}

// Fonction utilitaire pour accéder aux valeurs imbriquées
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Fonction pour sérialiser le profil en format prêt-à-prompt
function serializeProfile(profile: AIProfile): SerializedAIProfile {
  return {
    brand: `Marque: ${profile.brand.name}. Baseline: ${profile.brand.baseline}. Pitch: ${profile.brand.elevatorPitch}`,
    offer: `Services principaux: ${profile.offer.mainServices.join(', ')}. USP: ${profile.offer.usps.join(', ')}`,
    audience: `Cible: ${profile.audience.primary.type} - ${profile.audience.primary.sector}. Niveau: ${profile.audience.expertiseLevel}${profile.audience.secondary ? `. Cible secondaire: ${profile.audience.secondary.type} - ${profile.audience.secondary.sector}` : ''}`,
    tone: `Ton: ${profile.tone.styles.join(', ')}. Formalité: ${profile.tone.formality}. Émojis: ${profile.tone.emojisAllowed ? 'autorisés' : 'interdits'}. Longueur: ${profile.tone.preferredLength}`,
    writingRules: `À faire: ${profile.writingRules.do.join(', ')}. À éviter: ${profile.writingRules.avoid.join(', ')}. Mots bannis: ${profile.writingRules.bannedWords.join(', ')}`,
    lexicon: `Mots-clés marque: ${profile.lexicon.brandKeywords.join(', ')}. CTA autorisés: ${profile.lexicon.allowedCTAs.join(', ')}`,
    localization: `Langues: ${profile.localization.outputLanguages.join(', ')}. Devise: ${profile.localization.currency}. Format date: ${profile.localization.dateFormat}`,
    seo: `Mots-clés prioritaires: ${profile.seo.priorityKeywords.join(', ')}. Concurrents: ${profile.seo.competitors.join(', ')}`,
    compliance: `Clauses interdites: ${profile.compliance.forbiddenClauses.join(', ')}. Disclaimer: ${profile.compliance.requiredDisclaimer}`,
    governance: `Rôles autorisés: ${profile.governance.allowedRoles.join(', ')}. Quota/jour: ${profile.governance.dailyQuota}. Révision obligatoire: ${profile.governance.mandatoryReview ? 'oui' : 'non'}`
  };
}

// GET - Récupérer le profil IA
export async function GET(request: NextRequest) {
  try {
    if (!fs.existsSync(AI_PROFILE_FILE)) {
      return NextResponse.json({ profile: null, completenessScore: 0 });
    }
    
    const profileData = fs.readFileSync(AI_PROFILE_FILE, 'utf8');
    const profile: AIProfile = JSON.parse(profileData);
    
    // Recalculer le score de complétude
    profile.metadata.completenessScore = calculateCompletenessScore(profile);
    
    return NextResponse.json({ 
      profile,
      completenessScore: profile.metadata.completenessScore,
      serializedProfile: serializeProfile(profile)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil IA' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour le profil IA
export async function POST(request: NextRequest) {
  try {
    const formData: AIProfileFormData = await request.json();
    
    // Construire le profil complet
    const profile: AIProfile = {
      id: `ai-profile-${Date.now()}`,
      siteId: 'main-site', // Pour l'instant, un seul site
      
      brand: {
        name: formData.brandName,
        baseline: formData.brandBaseline,
        elevatorPitch: formData.brandElevatorPitch
      },
      
      offer: {
        mainServices: formData.mainServices,
        usps: formData.usps
      },
      
      audience: {
        primary: {
          type: formData.audienceType,
          sector: formData.audienceSector
        },
        secondary: formData.audienceSecondaryType && formData.audienceSecondarySector ? {
          type: formData.audienceSecondaryType,
          sector: formData.audienceSecondarySector
        } : undefined,
        expertiseLevel: formData.expertiseLevel
      },
      
      tone: {
        styles: formData.toneStyles,
        formality: formData.formality,
        emojisAllowed: formData.emojisAllowed,
        preferredLength: formData.preferredLength
      },
      
      writingRules: {
        do: formData.writingDo,
        avoid: formData.writingAvoid,
        bannedWords: formData.bannedWords
      },
      
      lexicon: {
        brandKeywords: formData.brandKeywords,
        allowedCTAs: formData.allowedCTAs
      },
      
      localization: {
        outputLanguages: formData.outputLanguages,
        currency: formData.currency,
        dateFormat: formData.dateFormat,
        numberFormat: formData.numberFormat,
        formalityByLanguage: {}
      },
      
      seo: {
        priorityKeywords: formData.priorityKeywords,
        competitors: formData.competitors,
        inspirationSources: formData.inspirationSources
      },
      
      compliance: {
        forbiddenClauses: formData.forbiddenClauses,
        requiredDisclaimer: formData.requiredDisclaimer
      },
      
      internalSources: {
        existingPages: formData.existingPages,
        documents: formData.documents
      },
      
      governance: {
        allowedRoles: formData.allowedRoles,
        dailyQuota: formData.dailyQuota,
        mandatoryReview: formData.mandatoryReview
      },
      
      consent: {
        allowContextualTraining: formData.allowContextualTraining,
        dataRetentionDays: formData.dataRetentionDays
      },
      
      metadata: {
        version: 1,
        updatedBy: 'admin', // TODO: récupérer depuis la session
        updatedAt: new Date().toISOString(),
        completenessScore: 0 // Sera calculé
      }
    };
    
    // Calculer le score de complétude
    profile.metadata.completenessScore = calculateCompletenessScore(profile);
    
    // Sauvegarder le profil
    fs.writeFileSync(AI_PROFILE_FILE, JSON.stringify(profile, null, 2));
    
    return NextResponse.json({ 
      success: true,
      profile,
      completenessScore: profile.metadata.completenessScore,
      serializedProfile: serializeProfile(profile)
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du profil IA' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer le profil IA
export async function DELETE(request: NextRequest) {
  try {
    if (fs.existsSync(AI_PROFILE_FILE)) {
      fs.unlinkSync(AI_PROFILE_FILE);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du profil IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du profil IA' },
      { status: 500 }
    );
  }
}
