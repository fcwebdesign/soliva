// Types pour le profil IA du site
export interface AIProfile {
  id: string;
  siteId: string; // ID du site (peut être le même que l'ID de la page principale)
  
  // 1. Marque
  brand: {
    name: string; // Nom officiel
    baseline: string; // ≤80 caractères
    elevatorPitch: string; // 1 phrase
  };
  
  // 2. Offre
  offer: {
    mainServices: string[]; // 3 services/produits principaux
    usps: string[]; // 3 preuves/USP
  };
  
  // 3. Audience
  audience: {
    primary: {
      type: 'B2B' | 'B2C' | 'B2B2C';
      sector: string;
    };
    secondary?: {
      type: 'B2B' | 'B2C' | 'B2B2C';
      sector: string;
    };
    expertiseLevel: 'grand public' | 'pro' | 'expert';
  };
  
  // 4. Ton & style
  tone: {
    styles: ('sobre' | 'chaleureux' | 'premium' | 'technique' | 'fun')[];
    formality: 'tutoiement' | 'vouvoiement';
    emojisAllowed: boolean;
    preferredLength: 'court' | 'standard' | 'détaillé';
  };
  
  // 5. Règles d'écriture
  writingRules: {
    do: string[]; // 3 puces à faire
    avoid: string[]; // 3 puces à éviter
    bannedWords: string[]; // mots bannis
  };
  
  // 6. Lexique & CTA
  lexicon: {
    brandKeywords: string[]; // 6 mots-clés de marque
    allowedCTAs: string[]; // 3 CTA autorisés
  };
  
  // 7. Langues & localisation
  localization: {
    outputLanguages: string[]; // langues de sortie
    currency: string;
    dateFormat: string;
    numberFormat: string;
    formalityByLanguage: Record<string, 'tutoiement' | 'vouvoiement'>;
  };
  
  // 8. SEO léger
  seo: {
    priorityKeywords: string[]; // 5 mots-clés prioritaires
    competitors: string[]; // 3 concurrents (URL)
    inspirationSources: string[]; // 2 références d'inspiration (URL)
  };
  
  // 9. Conformité
  compliance: {
    forbiddenClauses: string[]; // clauses interdites
    requiredDisclaimer: string; // disclaimer requis
  };
  
  // 10. Sources internes (optionnel)
  internalSources: {
    existingPages: string[]; // URLs de pages existantes à "absorber"
    documents: string[]; // chemins vers docs PDF/Markdown
  };
  
  // 11. Gouvernance & quotas
  governance: {
    allowedRoles: ('Admin' | 'Éditeur' | 'Rédacteur')[];
    dailyQuota: number;
    mandatoryReview: boolean;
  };
  
  // 12. Consentement & logs
  consent: {
    allowContextualTraining: boolean;
    dataRetentionDays: 30 | 90 | 180 | 365;
  };
  
  // Métadonnées
  metadata: {
    version: number;
    updatedBy: string;
    updatedAt: string;
    completenessScore: number; // 0-100
  };
}

// Type pour le profil sérialisé prêt-à-prompt
export interface SerializedAIProfile {
  brand: string;
  offer: string;
  audience: string;
  tone: string;
  writingRules: string;
  lexicon: string;
  localization: string;
  seo: string;
  compliance: string;
  governance: string;
}

// Type pour les réponses du questionnaire
export interface AIProfileFormData {
  // 1. Marque
  brandName: string;
  brandBaseline: string;
  brandElevatorPitch: string;
  
  // 2. Offre
  mainServices: string[];
  usps: string[];
  
  // 3. Audience
  audienceType: 'B2B' | 'B2C' | 'B2B2C';
  audienceSector: string;
  audienceSecondaryType?: 'B2B' | 'B2C' | 'B2B2C';
  audienceSecondarySector?: string;
  expertiseLevel: 'grand public' | 'pro' | 'expert';
  
  // 4. Ton & style
  toneStyles: ('sobre' | 'chaleureux' | 'premium' | 'technique' | 'fun')[];
  formality: 'tutoiement' | 'vouvoiement';
  emojisAllowed: boolean;
  preferredLength: 'court' | 'standard' | 'détaillé';
  
  // 5. Règles d'écriture
  writingDo: string[];
  writingAvoid: string[];
  bannedWords: string[];
  
  // 6. Lexique & CTA
  brandKeywords: string[];
  allowedCTAs: string[];
  
  // 7. Langues & localisation
  outputLanguages: string[];
  currency: string;
  dateFormat: string;
  numberFormat: string;
  
  // 8. SEO léger
  priorityKeywords: string[];
  competitors: string[];
  inspirationSources: string[];
  
  // 9. Conformité
  forbiddenClauses: string[];
  requiredDisclaimer: string;
  
  // 10. Sources internes
  existingPages: string[];
  documents: string[];
  
  // 11. Gouvernance & quotas
  allowedRoles: ('Admin' | 'Éditeur' | 'Rédacteur')[];
  dailyQuota: number;
  mandatoryReview: boolean;
  
  // 12. Consentement & logs
  allowContextualTraining: boolean;
  dataRetentionDays: 30 | 90 | 180 | 365;
}
