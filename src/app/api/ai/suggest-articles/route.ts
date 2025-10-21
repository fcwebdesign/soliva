import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export const runtime = 'nodejs';

interface ArticleSuggestion {
  title: string;
  keyword: string;
  angle: string;
  estimatedWords: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💡 API Suggest Articles - Début');
    
    // Lire le contenu existant
    const content = await readContent();
    const existingArticles = content.blog?.articles || [];
    
    // Extraire les titres existants pour éviter les doublons
    const existingTitles = existingArticles.map(a => a.title).filter(Boolean);
    
    console.log('📚 Articles existants:', existingTitles.length);

    // Appel à l'IA pour suggérer des idées
    const systemPrompt = `Tu es un expert en stratégie de contenu et SEO pour Soliva, un studio créatif spécialisé en développement web, IA appliquée et stratégie de marque.

TON SOLIVA : Direct, cash, sans bullshit. Provocateur mais bienveillant. Concret avec des exemples réels.

THÉMATIQUES PRINCIPALES :
- Développement web (WordPress, Next.js, CMS, performance)
- E-commerce (Shopify, conversion, UX)
- IA appliquée (vrais outils vs faux outils, automation, prompts)
- Branding & stratégie de marque
- Design & UX
- No-code vs code
- SEO technique

EXEMPLES D'ANGLES SOLIVA :
- "Pourquoi X ne marche pas" (démystifier)
- "Le mythe de Y" (casser les idées reçues)
- "Arrêtez de Z" (provocateur)
- "La vérité sur W" (transparence)

OBJECTIF SEO :
- Titres accrocheurs mais optimisés
- Keywords recherchés
- Sujets à fort potentiel de trafic
- Complémentaires au contenu existant`;

    const userPrompt = `Analyse ces articles existants et suggère 10 NOUVELLES idées d'articles pour Soliva.

ARTICLES EXISTANTS :
${existingTitles.slice(0, 30).map((t, i) => `${i + 1}. ${t}`).join('\n')}

CONSIGNES :
1. Identifier les GAPS : quels sujets manquent ?
2. Trouver des angles provocateurs mais pertinents
3. Optimiser pour le SEO (keywords recherchés)
4. Respecter le ton Soliva (direct, sans langue de bois)
5. Éviter ABSOLUMENT les doublons avec l'existant
6. Mélanger les thématiques (web, e-commerce, IA, branding)

FORMAT DE RÉPONSE (JSON strict) :
{
  "suggestions": [
    {
      "title": "Titre accrocheur optimisé SEO",
      "keyword": "mot-clé principal",
      "angle": "Angle éditorial en 1 phrase",
      "estimatedWords": 2000
    }
  ]
}

Génère EXACTEMENT 10 suggestions variées et pertinentes.`;

    console.log('🤖 Appel OpenAI pour suggestions...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    let responseText = openaiData.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Pas de réponse de l\'IA');
    }

    // Parser la réponse
    const result = JSON.parse(responseText);
    
    console.log('✅ Suggestions générées:', result.suggestions?.length || 0);

    return NextResponse.json({
      suggestions: result.suggestions || [],
      existingCount: existingTitles.length
    });

  } catch (error) {
    console.error('❌ Erreur suggestions articles:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération des suggestions',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

