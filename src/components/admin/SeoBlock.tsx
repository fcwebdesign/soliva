"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

// Types pour le SEO
interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  schemas?: any[];
  suggestedInternalLinks?: Array<{
    url: string;
    label: string;
    reason: string;
  }>;
}

interface SeoBlockProps {
  content: {
    id: string;
    type: string;
    title: string;
    slug: string;
    contentHtml: string | any[];
    excerpt?: string;
    category?: string;
    tags?: string[];
    publishedAt?: string;
    updatedAt?: string;
    seo?: SeoData;
  };
  seoFields: SeoData;
  onSeoChange: (seo: SeoData) => void;
  className?: string;
}

// Types pour l'analyse SEO
interface SeoAnalysis {
  score: number;
  flags: string[];
  focusKeyword: string;
  internalLinks: Array<{
    url: string;
    label: string;
    reason: string;
  }>;
}

// Types pour les propositions IA
interface AIProposals {
  focus: string;
  alternatives: string[];
  metaTitles: string[];
  metaDescriptions: Array<{
    kind: string;
    text: string;
  }>;
  internalLinks: Array<{
    url: string;
    label: string;
    reason: string;
  }>;
  schemas: string[];
}

export default function SeoBlock({ content, seoFields, onSeoChange, className = '' }: SeoBlockProps) {
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  const [aiProposals, setAiProposals] = useState<AIProposals | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');

  // Analyse locale du contenu
  const analyzeContent = useMemo(() => {
    if (!content) return null;

    const plainText = Array.isArray(content.contentHtml) 
      ? content.contentHtml.map(block => {
          if (typeof block === 'string') return block;
          if (block.content) return block.content;
          return '';
        }).join(' ')
      : content.contentHtml || '';

    // Extraire le texte sans HTML
    const cleanText = plainText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Analyser les sections H2/H3
    const headings = plainText.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || [];
    
    // Proposer un mot-clé focus (n-gram dominant)
    const words = cleanText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['avec', 'dans', 'pour', 'cette', 'sont', 'tout', 'plus', 'bien', 'très'].includes(word));
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const focusKeyword = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Construire un pool de liens internes
    const internalLinks = [
      { url: '/blog', label: 'Blog', reason: 'Page principale du blog' },
      { url: '/studio', label: 'Le Studio', reason: 'Présentation de l\'équipe' },
      { url: '/work', label: 'Portfolio', reason: 'Nos réalisations' },
      { url: '/contact', label: 'Contact', reason: 'Nous contacter' }
    ];

    // Détecter FAQ et HowTo
    const hasFAQ = /question|réponse|faq|pourquoi|comment|quand|où|qui|quoi/i.test(cleanText);
    const hasHowTo = /étape|étape|processus|tutoriel|guide|comment faire/i.test(cleanText);

    return {
      plainText: cleanText,
      headings,
      focusKeyword,
      internalLinks,
      hasFAQ,
      hasHowTo,
      wordCount: cleanText.split(' ').length
    };
  }, [content]);

  // Calculer le score SEO
  const calculateScore = useMemo(() => {
    if (!content) return { score: 0, flags: [] };

    let score = 100;
    const flags: string[] = [];

    // Fondamentaux on-page (40 points)
    if (!seoFields.metaTitle) {
      score -= 12;
      flags.push('missing_title');
    } else if (seoFields.metaTitle.length > 60) {
      score -= 6;
      flags.push('title_too_long');
    }

    if (!seoFields.metaDescription) {
      score -= 10;
      flags.push('meta_missing');
    } else if (seoFields.metaDescription.length < 150 || seoFields.metaDescription.length > 160) {
      score -= 5;
      flags.push('meta_too_short');
    }

    if (!seoFields.focusKeyword) {
      score -= 8;
      flags.push('keyword_missing');
    }

    if (!content.title) {
      score -= 8;
      flags.push('missing_h1');
    }

    if (!seoFields.canonicalUrl) {
      score -= 10;
      flags.push('canonical_missing');
    }

    // Pertinence & contenu (30 points)
    if (analyzeContent && analyzeContent.wordCount < 300) {
      score -= 10;
      flags.push('content_too_short');
    }

    if (!seoFields.suggestedInternalLinks || seoFields.suggestedInternalLinks.length === 0) {
      score -= 12;
      flags.push('no_internal_links');
    }

    // Données enrichies (10 points)
    if (!seoFields.schemas || seoFields.schemas.length === 0) {
      score -= 6;
      flags.push('schema_missing');
    }

    // Cap à 50 si bloquant
    if (flags.includes('missing_title') || flags.includes('missing_h1') || flags.includes('canonical_missing')) {
      score = Math.min(score, 50);
    }

    return { score: Math.max(0, score), flags };
  }, [content, seoFields, analyzeContent]);

  // Analyser le contenu au chargement
  useEffect(() => {
    if (content && analyzeContent) {
      setIsAnalyzing(true);
      
      // Simuler l'analyse (dans un vrai projet, ce serait une API)
      setTimeout(() => {
        const newAnalysis: SeoAnalysis = {
          score: calculateScore.score,
          flags: calculateScore.flags,
          focusKeyword: analyzeContent.focusKeyword,
          internalLinks: analyzeContent.internalLinks
        };
        
        setAnalysis(newAnalysis);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [content, analyzeContent, calculateScore]);

  // Générer les propositions IA
  const generateAIProposals = async () => {
    if (!content || !analyzeContent) return;

    setIsGenerating(true);
    
    try {
      const requestData = {
        brand: SITE_NAME,
        siteUrl: SITE_URL,
        type: content.type,
        title: content.title,
        h1: content.title,
        excerpt: content.excerpt,
        plainText: analyzeContent.plainText,
        tags: content.tags || [],
        category: content.category || '',
        internalUrls: analyzeContent.internalLinks.map(link => link.url),
        focusKeyword: seoFields.focusKeyword || analyzeContent.focusKeyword
      };
      
      console.log('📤 Envoi requête SEO IA:', requestData);
      
      const response = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Réponse API SEO:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Impossible de parser la réponse d\'erreur:', e);
        }
        
        console.error('Erreur API SEO détaillée:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: response.url
        });
        
        throw new Error(`Erreur lors de la génération IA: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const proposals: AIProposals = await response.json();
      setAiProposals(proposals);
      
      // Sélectionner automatiquement la première proposition
      if (proposals.metaTitles.length > 0) {
        setSelectedTitle(proposals.metaTitles[0]);
      }
      if (proposals.metaDescriptions.length > 0) {
        setSelectedDescription(proposals.metaDescriptions[0].text);
      }
      
      // Appliquer automatiquement le mot-clé focus de l'IA
      if (proposals.focus && proposals.focus !== seoFields.focusKeyword) {
        onSeoChange({ ...seoFields, focusKeyword: proposals.focus });
      }
      
    } catch (error) {
      console.error('Erreur génération IA:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Appliquer toutes les propositions
  const applyAllProposals = () => {
    if (!aiProposals) return;

    const finalTitle = selectedTitle || aiProposals.metaTitles[0];
    const finalDescription = selectedDescription || aiProposals.metaDescriptions[0].text;
    const finalKeyword = aiProposals.focus;

    const newSeo: SeoData = {
      ...seoFields,
      metaTitle: finalTitle,
      metaDescription: finalDescription,
      focusKeyword: finalKeyword,
      canonicalUrl: absoluteUrl(`/blog/${content.slug}`),
      schemas: aiProposals.schemas,
      suggestedInternalLinks: aiProposals.internalLinks
    };

    // Mettre à jour les états de sélection
    setSelectedTitle(finalTitle);
    setSelectedDescription(finalDescription);
    setSelectedKeyword(finalKeyword);

    onSeoChange(newSeo);
  };

  // Appliquer une proposition individuelle
  const applyProposal = (type: 'title' | 'description', value: string) => {
    const newSeo = { ...seoFields };
    if (type === 'title') {
      newSeo.metaTitle = value;
    } else {
      newSeo.metaDescription = value;
    }
    onSeoChange(newSeo);
  };

  // Corriger automatiquement
  const autoFix = () => {
    const newSeo = { ...seoFields };
    
    // Corriger les longueurs
    if (newSeo.metaTitle && newSeo.metaTitle.length > 60) {
      newSeo.metaTitle = newSeo.metaTitle.substring(0, 57).trim() + '...';
    }
    
    if (newSeo.metaDescription) {
      if (newSeo.metaDescription.length < 150) {
        newSeo.metaDescription = newSeo.metaDescription + ' Découvrez nos services et notre expertise.';
      } else if (newSeo.metaDescription.length > 160) {
        newSeo.metaDescription = newSeo.metaDescription.substring(0, 157).trim() + '...';
      }
    }
    
    // Ajouter canonical
    if (!newSeo.canonicalUrl) {
      newSeo.canonicalUrl = absoluteUrl(`/blog/${content.slug}`);
    }
    
    // Ajouter schéma Article
    if (!newSeo.schemas) {
      newSeo.schemas = ['Article'];
    }
    
    onSeoChange(newSeo);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">��</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEO Optimizer</h3>
            <p className="text-sm text-gray-500">Optimisation automatique avec IA</p>
          </div>
        </div>
        
        {/* Score */}
        <div className="flex items-center space-x-4">
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Analyse...</span>
            </div>
          ) : analysis ? (
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                analysis.score >= 80 ? 'text-green-600' : 
                analysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.score}
              </div>
              <div className="text-xs text-gray-500">Score SEO</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Champs essentiels */}
      <div className="space-y-4 mb-6">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                seoFields.metaTitle && seoFields.metaTitle.length >= 50 && seoFields.metaTitle.length <= 60
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {seoFields.metaTitle?.length || 0}/60
              </span>
              {seoFields.metaTitle && seoFields.metaTitle.length > 60 && (
                <span className="text-xs text-red-600">⚠️ Trop long</span>
              )}
            </div>
          </div>
          <input
            type="text"
            value={seoFields.metaTitle || ''}
            onChange={(e) => onSeoChange({ ...seoFields, metaTitle: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              seoFields.metaTitle && seoFields.metaTitle.length > 60
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Titre optimisé pour les moteurs de recherche..."
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                seoFields.metaDescription && seoFields.metaDescription.length >= 150 && seoFields.metaDescription.length <= 160
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {seoFields.metaDescription?.length || 0}/160
              </span>
              {seoFields.metaDescription && (seoFields.metaDescription.length < 150 || seoFields.metaDescription.length > 160) && (
                <span className="text-xs text-red-600">⚠️ Longueur non optimale</span>
              )}
            </div>
          </div>
          <textarea
            value={seoFields.metaDescription || ''}
            onChange={(e) => onSeoChange({ ...seoFields, metaDescription: e.target.value })}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              seoFields.metaDescription && (seoFields.metaDescription.length < 150 || seoFields.metaDescription.length > 160)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Description optimisée pour les moteurs de recherche..."
          />
        </div>

        {/* Mot-clé focus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot-clé focus
          </label>
          <input
            type="text"
            value={seoFields.focusKeyword || ''}
            onChange={(e) => onSeoChange({ ...seoFields, focusKeyword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Mot-clé principal de l'article..."
          />
          {analysis?.focusKeyword && (
            <p className="text-xs text-blue-600 mt-1">
              💡 Suggestion: {analysis.focusKeyword}
            </p>
          )}
        </div>

        {/* Canonical */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Canonical
          </label>
          <input
            type="text"
            value={seoFields.canonicalUrl || ''}
            onChange={(e) => onSeoChange({ ...seoFields, canonicalUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="URL canonique absolue..."
          />
        </div>
      </div>

      {/* Section IA */}
      <div className="border-t pt-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">�� Propositions IA</h4>
          <button
            onClick={generateAIProposals}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Génération...' : '🔄 Générer'}
          </button>
        </div>

        {aiProposals && (
          <div className="space-y-4">
            {/* Mot-clé focus IA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot-clé focus suggéré par l'IA
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => {
                    onSeoChange({ ...seoFields, focusKeyword: aiProposals.focus });
                    setSelectedKeyword(aiProposals.focus);
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedKeyword === aiProposals.focus
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {aiProposals.focus}
                </button>
                <span className="text-xs text-gray-500">
                  (cliquez pour appliquer)
                </span>
              </div>
              {aiProposals.alternatives.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Alternatives: </span>
                  {aiProposals.alternatives.map((alt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSeoChange({ ...seoFields, focusKeyword: alt });
                        setSelectedKeyword(alt);
                      }}
                      className={`text-xs underline mr-2 transition-colors ${
                        selectedKeyword === alt
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Propositions de titres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titres suggérés (≤60 caractères)
              </label>
              <div className="space-y-2">
                {aiProposals.metaTitles.map((title, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        applyProposal('title', title);
                        setSelectedTitle(title);
                      }}
                      className={`flex-1 text-left px-3 py-2 rounded-lg border transition-colors ${
                        selectedTitle === title
                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                          : title.length > 60 
                            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{title}</div>
                      <div className="text-xs text-gray-500">({title.length}/60 caractères)</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Propositions de descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriptions suggérées (150-160 caractères)
              </label>
              <div className="space-y-2">
                {aiProposals.metaDescriptions.map((desc, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        applyProposal('description', desc.text);
                        setSelectedDescription(desc.text);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                        selectedDescription === desc.text
                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                          : desc.text.length < 150 || desc.text.length > 160
                            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm">{desc.text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ({desc.text.length}/160 caractères) • Type: {desc.kind}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Liens internes suggérés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liens internes suggérés
              </label>
              <div className="space-y-2">
                {aiProposals.internalLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{link.label}</span>
                      <span className="text-xs text-gray-500 ml-2">({link.url})</span>
                      <div className="text-xs text-gray-600 mt-1">{link.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schémas suggérés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schémas suggérés
              </label>
              <div className="flex flex-wrap gap-2">
                {aiProposals.schemas.map((schema, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {schema}
                  </span>
                ))}
              </div>
            </div>

            {/* Bouton appliquer tout */}
            <div className="pt-4 border-t">
              <button
                onClick={applyAllProposals}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ✅ Appliquer toutes les propositions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Aide & contrôle */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">��️ Aide & Contrôle</h4>
          <button
            onClick={autoFix}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            🔧 Corriger automatiquement
          </button>
        </div>

        {/* Flags d'erreur */}
        {analysis && analysis.flags.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Problèmes détectés:</h5>
            <div className="space-y-1">
              {analysis.flags.map((flag, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <span>⚠️</span>
                  <span>
                    {flag === 'missing_title' && 'Titre manquant'}
                    {flag === 'title_too_long' && 'Titre trop long (>60 caractères)'}
                    {flag === 'meta_missing' && 'Meta description manquante'}
                    {flag === 'meta_too_short' && 'Meta description trop courte (<150 caractères)'}
                    {flag === 'keyword_missing' && 'Mot-clé focus manquant'}
                    {flag === 'missing_h1' && 'H1 manquant'}
                    {flag === 'canonical_missing' && 'URL canonique manquante'}
                    {flag === 'no_internal_links' && 'Aucun lien interne'}
                    {flag === 'schema_missing' && 'Schéma manquant'}
                    {flag === 'content_too_short' && 'Contenu trop court (<300 mots)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERP Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Aperçu SERP</h5>
          <div className="space-y-2">
            <div className="text-blue-600 text-lg font-medium truncate">
              {seoFields.metaTitle || content.title || 'Titre de l\'article'}
            </div>
            <div className="text-green-600 text-sm">
              {seoFields.canonicalUrl || `${SITE_URL}/blog/${content.slug}`}
            </div>
            <div className="text-gray-600 text-sm">
              {seoFields.metaDescription || content.excerpt || 'Description de l\'article...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}