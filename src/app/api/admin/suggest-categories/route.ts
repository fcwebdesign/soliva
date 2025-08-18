import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    const content = await readContent();
    
    // Analyser séparément les projets et les articles
    const projectTexts: string[] = [];
    const articleTexts: string[] = [];
    
    // Analyser les projets
    if (content.work?.projects) {
      content.work.projects.forEach((project: any) => {
        if (project.title) projectTexts.push(project.title);
        if (project.description) projectTexts.push(project.description);
        if (project.category) projectTexts.push(project.category);
      });
    }
    
    // Analyser les articles
    if (content.blog?.articles) {
      content.blog.articles.forEach((article: any) => {
        if (article.title) articleTexts.push(article.title);
        if (article.content) articleTexts.push(article.content);
      });
    }
    
    const projectText = projectTexts.join(' ').toLowerCase();
    const articleText = articleTexts.join(' ').toLowerCase();
    
    // Extraire des mots-clés pour chaque type
    const projectKeywords = extractKeywords(projectText);
    const articleKeywords = extractKeywords(articleText);
    
    // Générer des suggestions spécifiques
    const projectCategories = generateProjectCategories(projectKeywords, projectText);
    const articleCategories = generateArticleCategories(articleKeywords, articleText);
    
    return NextResponse.json({
      success: true,
      projects: {
        categories: projectCategories,
        keywords: projectKeywords.slice(0, 10),
        analysis: {
          totalProjects: content.work?.projects?.length || 0,
          textLength: projectText.length
        }
      },
      articles: {
        categories: articleCategories,
        keywords: articleKeywords.slice(0, 10),
        analysis: {
          totalArticles: content.blog?.articles?.length || 0,
          textLength: articleText.length
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse du contenu:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'analyse du contenu' },
      { status: 500 }
    );
  }
}

function extractKeywords(text: string): string[] {
  // Mots à ignorer
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or',
    'de', 'du', 'des', 'à', 'au', 'aux', 'avec', 'sans', 'pour', 'par', 'sur', 'sous',
    'dans', 'entre', 'chez', 'vers', 'depuis', 'jusqu', 'pendant', 'avant', 'après',
    'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
    'notre', 'votre', 'leur', 'leurs', 'qui', 'que', 'quoi', 'où', 'quand', 'comment',
    'pourquoi', 'est', 'sont', 'était', 'étaient', 'être', 'avoir', 'faire', 'dire',
    'voir', 'savoir', 'pouvoir', 'vouloir', 'devoir', 'aller', 'venir', 'prendre',
    'mettre', 'donner', 'trouver', 'penser', 'croire', 'paraître', 'sembler',
    'très', 'plus', 'moins', 'bien', 'mal', 'bon', 'mauvais', 'grand', 'petit',
    'nouveau', 'ancien', 'jeune', 'vieux', 'beau', 'laid', 'bon', 'mauvais'
  ]);
  
  // Nettoyer le texte et extraire les mots
  const words = text
    .replace(/[^\w\sàáâãäåçèéêëìíîïñòóôõöùúûüýÿ]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.has(word) && 
      !/^\d+$/.test(word)
    );
  
  // Compter les occurrences
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Trier par fréquence
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .map(([word]) => word);
}

function generateProjectCategories(keywords: string[], text: string): string[] {
  const suggestions = new Set<string>();
  
  // Mots-clés spécifiques aux projets
  const projectKeywords = {
    'design': ['design', 'créatif', 'visuel', 'graphique', 'branding', 'identité', 'logo'],
    'digital': ['digital', 'web', 'site', 'application', 'mobile', 'plateforme', 'app'],
    'brand': ['marque', 'brand', 'identité', 'logo', 'corporate', 'entreprise'],
    'strategy': ['stratégie', 'conseil', 'planning', 'analyse', 'étude', 'positionnement'],
    'marketing': ['marketing', 'communication', 'campagne', 'publicité', 'promotion'],
    'ecommerce': ['ecommerce', 'boutique', 'vente', 'commerce', 'shop', 'online'],
    'technologie': ['tech', 'technologie', 'innovation', 'ia', 'intelligence', 'artificielle'],
    'print': ['print', 'papier', 'impression', 'brochure', 'flyer', 'catalogue'],
    'video': ['video', 'vidéo', 'motion', 'animation', 'film', 'spot'],
    'photo': ['photo', 'photographie', 'image', 'shooting', 'studio'],
    'event': ['événement', 'event', 'exposition', 'salon', 'conférence'],
    'architecture': ['architecture', 'espace', 'intérieur', 'décoration', 'aménagement']
  };
  
  // Analyser le texte pour chaque thème de projet
  Object.entries(projectKeywords).forEach(([category, words]) => {
    const matches = words.filter(word => 
      text.includes(word) || keywords.some(kw => kw.includes(word))
    );
    if (matches.length > 0) {
      suggestions.add(category.charAt(0).toUpperCase() + category.slice(1));
    }
  });
  
  // Ajouter "All" comme première suggestion
  const result = ['All', ...Array.from(suggestions)];
  
  return result.slice(0, 8);
}

function generateArticleCategories(keywords: string[], text: string): string[] {
  const suggestions = new Set<string>();
  
  // Mots-clés spécifiques aux articles
  const articleKeywords = {
    'marketing': ['marketing', 'communication', 'stratégie', 'campagne', 'publicité'],
    'digital': ['digital', 'web', 'site', 'ecommerce', 'online', 'plateforme'],
    'design': ['design', 'créatif', 'visuel', 'ux', 'ui', 'expérience'],
    'business': ['business', 'entreprise', 'stratégie', 'conseil', 'management'],
    'technology': ['tech', 'technologie', 'innovation', 'ia', 'intelligence', 'artificielle'],
    'trends': ['tendances', 'trends', 'actualité', 'nouveauté', 'innovation'],
    'tips': ['conseils', 'tips', 'astuces', 'guide', 'tutoriel', 'méthode'],
    'analysis': ['analyse', 'étude', 'réflexion', 'pensée', 'insight'],
    'case-study': ['cas', 'étude', 'exemple', 'retour', 'expérience'],
    'social': ['social', 'réseaux', 'community', 'influence', 'engagement'],
    'content': ['contenu', 'rédaction', 'copywriting', 'éditorial', 'storytelling'],
    'data': ['data', 'données', 'analytics', 'performance', 'mesure', 'kpi']
  };
  
  // Analyser le texte pour chaque thème d'article
  Object.entries(articleKeywords).forEach(([category, words]) => {
    const matches = words.filter(word => 
      text.includes(word) || keywords.some(kw => kw.includes(word))
    );
    if (matches.length > 0) {
      suggestions.add(category.charAt(0).toUpperCase() + category.slice(1));
    }
  });
  
  // Ajouter "All" comme première suggestion
  const result = ['All', ...Array.from(suggestions)];
  
  return result.slice(0, 8);
} 