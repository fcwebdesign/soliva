import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

const models = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4o-mini'];

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();
    
    if (!models.includes(model)) {
      return NextResponse.json(
        { error: `Modèle non supporté: ${model}` },
        { status: 400 }
      );
    }

    const content = await readContent();
    
    // Contexte simple pour le test
    const pageContext = `Page: Studio créatif Soliva. ${content.studio?.hero?.title || 'Le studio'}. ${content.studio?.description || ''}`;

    // Déterminer le bon paramètre selon le modèle
    const isGpt5 = model.startsWith('gpt-5');
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: `Tu es un copywriter. Réponds immédiatement en texte final. Pas d'analyse intermédiaire. Exactement 2-3 phrases.`
        },
        {
          role: 'user',
          content: `Écris un paragraphe court (2-3 phrases) pour un studio créatif. Style professionnel. Réponds directement.`
        }
      ],
    };

    // Utiliser le bon paramètre selon le modèle
    if (isGpt5) {
      // GPT-5 : Réduire drastiquement l'effort de raisonnement
      requestBody.max_completion_tokens = 200;
      requestBody.reasoning_effort = "minimal";
      console.log('🔧 Configuration GPT-5:', JSON.stringify(requestBody, null, 2));
    } else {
      requestBody.max_tokens = 100;
      requestBody.temperature = 0.7;
      console.log('🔧 Configuration GPT-4:', JSON.stringify(requestBody, null, 2));
    }

    console.log('🚀 Envoi requête OpenAI pour modèle:', model);
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
      const errorText = await openaiResponse.text();
      console.error('❌ Erreur OpenAI:', openaiResponse.status, errorText);
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiResponse.status} - ${errorText}` },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI Response:', JSON.stringify(openaiData, null, 2));
    
    const suggestedContent = openaiData.choices?.[0]?.message?.content;

    if (!suggestedContent) {
      console.error('Pas de contenu dans la réponse OpenAI:', openaiData);
      throw new Error('Pas de réponse de l\'IA');
    }

    return NextResponse.json({
      model: model,
      suggestedContent: suggestedContent.trim(),
      status: 'success'
    });

  } catch (error) {
    console.error('Erreur test modèle:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du test' },
      { status: 500 }
    );
  }
} 