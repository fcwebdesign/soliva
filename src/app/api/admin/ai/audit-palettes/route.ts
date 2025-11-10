import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { palettes } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY non configurée' },
        { status: 500 }
      );
    }

    if (!palettes || !Array.isArray(palettes) || palettes.length === 0) {
      return NextResponse.json(
        { error: 'Aucune palette fournie' },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es un expert en design de palettes de couleurs pour sites web. 
Tu analyses des palettes de couleurs et fournis des recommandations professionnelles.

FORMAT DE RÉPONSE (JSON strict) :
{
  "summary": "Résumé général de l'audit",
  "strengths": ["Point fort 1", "Point fort 2"],
  "weaknesses": ["Point faible 1", "Point faible 2"],
  "recommendations": [
    {
      "paletteId": "id-de-la-palette",
      "issue": "Problème identifié",
      "suggestion": "Recommandation d'amélioration"
    }
  ],
  "missingCategories": ["catégorie manquante 1", "catégorie manquante 2"],
  "suggestions": [
    {
      "category": "catégorie",
      "reason": "Pourquoi cette palette serait utile",
      "description": "Description de la palette à créer"
    }
  ]
}

CRITÈRES D'ANALYSE :
- Contraste : les couleurs de texte sont-elles lisibles sur les backgrounds ?
- Harmonie : les couleurs fonctionnent-elles bien ensemble ?
- Complétude : toutes les catégories importantes sont-elles représentées ?
- Cohérence : les palettes d'une même catégorie sont-elles cohérentes ?
- Accessibilité : les contrastes respectent-ils WCAG AA minimum ?

Sois constructif et précis dans tes recommandations.`;

    // Limiter le nombre de palettes envoyées pour éviter un payload trop lourd
    const palettesSummary = palettes.slice(0, 50).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      primary: p.colors?.primary,
      background: p.colors?.background,
      text: p.colors?.text,
    }));

    const userPrompt = `Analyse ces ${palettes.length} palettes de couleurs :

${JSON.stringify(palettesSummary, null, 2)}

Fournis un audit complet avec :
1. Points forts et faiblesses globaux
2. Recommandations spécifiques par palette si nécessaire
3. Catégories manquantes
4. Suggestions de nouvelles palettes à créer`;

    const model = 'gpt-5';
    const isGpt5 = model.startsWith('gpt-5');
    
    const requestBody: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" }
    };

    // Utiliser le bon paramètre selon le modèle
    if (isGpt5) {
      // GPT-5 : Pour l'audit, on peut utiliser un effort un peu plus élevé mais toujours minimal
      requestBody.max_completion_tokens = 2000;
      requestBody.reasoning_effort = "minimal";
    } else {
      requestBody.max_tokens = 2000;
      requestBody.temperature = 0.7;
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({ 
        error: { message: `HTTP ${openaiResponse.status}: ${openaiResponse.statusText}` }
      }));
      console.error('❌ OpenAI Error:', errorData);
      const errorMessage = errorData.error?.message || errorData.message || `Erreur OpenAI: ${openaiResponse.status}`;
      throw new Error(errorMessage);
    }

    const openaiData = await openaiResponse.json();
    console.log('📥 Réponse OpenAI complète:', JSON.stringify(openaiData, null, 2));
    
    const responseText = openaiData.choices?.[0]?.message?.content;

    if (!responseText) {
      console.error('❌ Pas de contenu dans la réponse OpenAI:', {
        choices: openaiData.choices,
        choicesLength: openaiData.choices?.length,
        firstChoice: openaiData.choices?.[0],
        message: openaiData.choices?.[0]?.message,
        content: openaiData.choices?.[0]?.message?.content
      });
      throw new Error('Pas de réponse de l\'IA - vérifiez les logs pour plus de détails');
    }

    let audit;
    try {
      audit = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.error('Réponse brute:', responseText);
      throw new Error('Réponse de l\'IA invalide (JSON mal formé)');
    }

    return NextResponse.json({
      success: true,
      audit
    });

  } catch (error: any) {
    console.error('❌ Erreur audit palettes:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'audit' },
      { status: 500 }
    );
  }
}

