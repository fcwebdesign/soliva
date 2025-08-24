import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { serviceTitle, pageKey, context } = await request.json();
    
    if (!serviceTitle || !serviceTitle.trim()) {
      return NextResponse.json(
        { error: 'Le titre du service est requis' },
        { status: 400 }
      );
    }

    const blockInstructions = `Génère UNIQUEMENT une description pour le service "${serviceTitle}".

Règles pour la description:
- 2-3 phrases maximum
- Bénéfices concrets et mesurables
- Processus ou méthodologie spécifique
- Évite le jargon marketing ("nous accompagnons", "expertise", "solutions sur-mesure")
- Style direct et professionnel
- Cohérent avec le titre du service
- Contenu en français

IMPORTANT: Retourne uniquement la description, sans guillemets ni explications.`;

    const model = 'gpt-4';
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: `Tu es copywriter senior créatif spécialisé dans la création de contenu web unique et mémorable.

${blockInstructions}

Règles de style:
- Évite absolument les clichés marketing ("nous accompagnons", "expertise", "solutions sur-mesure")
- Évite les métaphores poétiques et les formulations vagues
- Utilise des faits concrets, des exemples pratiques, des bénéfices tangibles
- Phrases courtes et directes, pas de prose fleurie
- Ton professionnel et authentique, pas corporate

Contraintes:
- Contenu en français
- Style: professionnel, direct, authentique
- Phrases courtes et percutantes
- Sortie: seulement la description, sans explications ni balises HTML`
        },
        {
          role: 'user',
          content: `Titre du service: ${serviceTitle}
Page: ${pageKey}
Contexte: ${context || 'Aucun'}
Timestamp: ${Date.now()}

Génère une description professionnelle et directe pour ce service.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    };

    console.log('🚀 Envoi requête OpenAI pour description service:', serviceTitle);
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📡 Statut réponse OpenAI:', openaiResponse.status, openaiResponse.statusText);

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI Response:', JSON.stringify(openaiData, null, 2));
    
    const suggestedDescription = openaiData.choices?.[0]?.message?.content;

    if (!suggestedDescription) {
      console.error('Pas de contenu dans la réponse OpenAI:', openaiData);
      throw new Error('Pas de réponse de l\'IA');
    }

    return NextResponse.json({
      suggestedDescription: suggestedDescription.trim()
    });

  } catch (error) {
    console.error('Erreur suggestion description service:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération de la description' },
      { status: 500 }
    );
  }
} 