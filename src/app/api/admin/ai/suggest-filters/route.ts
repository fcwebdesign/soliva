import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json(); // 'work' ou 'blog'
    
    // Lire le contenu
    const content = await readContent();
    const items = type === 'work' 
      ? content.work?.adminProjects || []
      : content.blog?.articles || [];

    if (items.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun contenu trouvé pour analyser' 
      }, { status: 400 });
    }

    // Préparer le contenu pour l'IA
    const contentForAnalysis = items
      .filter(item => item.status === 'published' || !item.status)
      .map(item => ({
        title: item.title,
        excerpt: item.excerpt || item.description,
        content: item.content?.substring(0, 500), // Limiter pour éviter les tokens
        category: item.category,
        client: item.client
      }))
      .slice(0, 20); // Limiter à 20 items max

    if (contentForAnalysis.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun contenu publié trouvé' 
      }, { status: 400 });
    }

    // Appel à l'API OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: type === 'work' 
              ? `Tu es un expert en catégorisation de projets créatifs et design. Analyse les projets fournis et suggère des filtres/catégories pertinents pour un portfolio créatif.

Règles :
- Suggère 8-12 filtres maximum
- Utilise des termes courts et professionnels du design/créatif
- Privilégie les termes en anglais pour un portfolio international
- Focus sur les types de projets, secteurs d'activité, techniques utilisées
- Retourne uniquement un array JSON de strings, rien d'autre

Exemples de bons filtres : ["Web Design", "Branding", "UI/UX", "Mobile App", "E-commerce", "Print", "Packaging", "Logo Design", "Corporate Identity", "Startup", "Tech", "Healthcare", "Fashion", "Food & Beverage"]`
              : `Tu es un expert en catégorisation de contenu éditorial et blog. Analyse les articles fournis et suggère des filtres/catégories pertinents pour un blog professionnel.

Règles :
- Suggère 8-12 filtres maximum
- Utilise des termes courts et professionnels du contenu éditorial
- Focus sur les thématiques, sujets traités, types d'articles
- Privilégie les termes en français pour un blog francophone
- Retourne uniquement un array JSON de strings, rien d'autre

Exemples de bons filtres : ["Design", "Stratégie", "Technologie", "Tendances", "Inspiration", "Tutoriels", "Actualités", "Innovation", "Marketing", "UX/UI", "Développement", "Créativité", "Business"]`
          },
          {
            role: 'user',
            content: `Analyse ce contenu et suggère des filtres pertinents :\n\n${JSON.stringify(contentForAnalysis, null, 2)}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const suggestedFiltersText = openaiData.choices[0]?.message?.content;

    if (!suggestedFiltersText) {
      throw new Error('Pas de réponse de l\'IA');
    }

    // Parser la réponse JSON
    let suggestedFilters;
    try {
      suggestedFilters = JSON.parse(suggestedFiltersText);
    } catch (e) {
      // Si ce n'est pas du JSON valide, essayer d'extraire les filtres
      const matches = suggestedFiltersText.match(/"([^"]+)"/g);
      suggestedFilters = matches ? matches.map(m => m.replace(/"/g, '')) : [];
    }

    // Validation et nettoyage
    const validFilters = Array.isArray(suggestedFilters) 
      ? suggestedFilters
          .filter(filter => typeof filter === 'string' && filter.trim().length > 0)
          .map(filter => filter.trim())
          .slice(0, 12) // Max 12 filtres
      : [];

    return NextResponse.json({
      suggestedFilters: validFilters,
      analyzedItems: contentForAnalysis.length,
      type
    });

  } catch (error) {
    console.error('Erreur suggestions IA:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la génération des suggestions',
      details: error.message 
    }, { status: 500 });
  }
} 