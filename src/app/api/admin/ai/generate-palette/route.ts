import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, mood, industry } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY non configurée' },
        { status: 500 }
      );
    }

    const systemPrompt = `Tu es un expert en design de palettes de couleurs pour sites web. 
Tu crées des palettes harmonieuses et professionnelles inspirées de Squarespace.

FORMAT DE RÉPONSE (JSON strict) :
{
  "name": "Nom de la palette",
  "description": "Description courte (max 50 caractères)",
  "category": "classic|professional|dark|warm|nature|ocean|purple|bold|creative|pastel|elegant|seasonal",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "textSecondary": "#hex",
    "border": "#hex"
  }
}

RÈGLES :
- primary : couleur principale (CTA, liens, éléments importants)
- secondary : couleur secondaire (variante de primary)
- accent : couleur d'accent (highlights, hover)
- background : couleur de fond (généralement claire, #ffffff ou nuance très claire)
- text : couleur du texte principal (généralement sombre, #1F2937 ou similaire)
- textSecondary : couleur du texte secondaire (gris moyen, #6B7280)
- border : couleur des bordures (gris clair, #E5E7EB)

PALETTES PASTELS : couleurs désaturées, douces, backgrounds très clairs (#F9FAFB, #FAF5FF, etc.)
PALETTES SOMBRES : background sombre (#111827, #0A0A0A), text clair (#ffffff)
PALETTES PROFESSIONNELLES : bleus/gris, sobres, backgrounds blancs
PALETTES CHALEUREUSES : oranges/beiges, backgrounds crème (#FFF7ED, #FEF3C7)

Génère UNE palette cohérente et utilisable.`;

    const userPrompt = `Crée une palette de couleurs pour un site web.
${prompt ? `Description: ${prompt}` : ''}
${style ? `Style: ${style}` : ''}
${mood ? `Ambiance: ${mood}` : ''}
${industry ? `Secteur: ${industry}` : ''}

Génère une palette harmonieuse et professionnelle.`;

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
      // GPT-5 : Réduire drastiquement l'effort de raisonnement
      requestBody.max_completion_tokens = 500;
      requestBody.reasoning_effort = "minimal";
    } else {
      requestBody.max_tokens = 500;
      requestBody.temperature = 0.8;
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
      const errorData = await openaiResponse.json();
      console.error('❌ OpenAI Error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
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

    const palette = JSON.parse(responseText);

    // Valider et normaliser les couleurs
    const validateColor = (color: string) => {
      if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
        return '#000000';
      }
      return color.toUpperCase();
    };

    return NextResponse.json({
      success: true,
      palette: {
        id: palette.name?.toLowerCase().replace(/\s+/g, '-') || 'ai-generated',
        name: palette.name || 'Palette IA',
        description: palette.description || 'Générée par IA',
        category: palette.category || 'creative',
        colors: {
          primary: validateColor(palette.colors?.primary),
          secondary: validateColor(palette.colors?.secondary),
          accent: validateColor(palette.colors?.accent),
          background: validateColor(palette.colors?.background),
          text: validateColor(palette.colors?.text),
          textSecondary: validateColor(palette.colors?.textSecondary),
          border: validateColor(palette.colors?.border),
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur génération palette:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}

