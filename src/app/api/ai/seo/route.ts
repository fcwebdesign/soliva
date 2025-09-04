import { NextRequest, NextResponse } from 'next/server';
import { detectContentSchemas } from '@/lib/schema';

interface SEORequest {
  brand: string;
  siteUrl: string;
  type: string;
  title: string;
  h1: string;
  excerpt?: string;
  plainText: string;
  tags: string[];
  category: string;
  internalUrls: string[];
  focusKeyword: string;
}

interface SEOResponse {
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

export async function POST(request: NextRequest) {
  try {
    const data: SEORequest = await request.json();
    
    console.log('🔍 API SEO - Données reçues:', {
      title: data.title,
      plainTextLength: data.plainText?.length,
      focusKeyword: data.focusKeyword,
      hasTitle: !!data.title,
      hasPlainText: !!data.plainText
    });
    
    if (!data.title || !data.plainText) {
      console.error('❌ API SEO - Données manquantes:', { title: data.title, plainText: data.plainText });
      return NextResponse.json(
        { error: 'Titre et contenu requis' },
        { status: 400 }
      );
    }

    // Déterminer le modèle à utiliser
    const model = 'gpt-4o-mini'; // Utiliser GPT-4o-mini pour la génération SEO
    
    const systemPrompt = `Tu es un expert SEO senior spécialisé dans l'optimisation de contenu web.

Règles strictes pour la génération:

TITRES (≤60 caractères):
- Focus au DÉBUT
- Suffixe marque " — ${data.brand}" si disponible
- Pas d'emoji, pas de double ponctuation
- Maximum 60 caractères après trim

DESCRIPTIONS (150-160 caractères):
- Exactement 1× le focus
- Bénéfice clair + verbe d'action
- Pas d'ellipses ("…", "...")
- Pas de répétition du titre
- 150-160 caractères après trim

LIENS INTERNES:
- Uniquement parmi le pool fourni: ${data.internalUrls.join(', ')}
- Sélectionner les 3 PLUS PERTINENTS pour le contenu
- Priorité: articles avec tags similaires > contenu similaire (titre+excerpt) > articles récents
- Ancres descriptives et naturelles
- Raison courte expliquant la pertinence

SCHÉMAS:
- Article (toujours)
- FAQPage si Q/R détectées
- HowTo si étapes détectées

Langue: français naturel
Si contrainte non respectée → reformuler, ne jamais tronquer.`;

    // Détecter les schémas pertinents dans le contenu
    const detectedSchemas = detectContentSchemas(data.plainText);
    const suggestedSchemas = ['Article', ...detectedSchemas];

    const userPrompt = `Contexte:
- Marque: ${data.brand}
- Site: ${data.siteUrl}
- Type: ${data.type}
- Titre: ${data.title}
- H1: ${data.h1}
- Extrait: ${data.excerpt || 'Aucun'}
- Contenu: ${data.plainText.substring(0, 2000)}...
- Tags: ${data.tags.join(', ')}
- Catégorie: ${data.category}
- Focus proposé: ${data.focusKeyword}
- Schémas détectés: ${detectedSchemas.join(', ') || 'Aucun'}

Génère:
1. Focus keyword (1 seul, le plus pertinent)
2. 2 alternatives au focus
3. 2 titres optimisés (≤60 chars, focus au début)
4. 3 descriptions (standard, conversion, pédagogique, 150-160 chars)
5. 3 liens internes les plus pertinents (sélectionner intelligemment parmi le pool)
6. Schémas appropriés (UNIQUEMENT ceux détectés dans le contenu)

IMPORTANT: Ne suggère que les schémas qui correspondent vraiment au contenu analysé.

Réponds UNIQUEMENT en JSON valide:
{
  "focus": "mot-clé principal",
  "alternatives": ["alt1", "alt2"],
  "metaTitles": ["titre1", "titre2"],
  "metaDescriptions": [
    {"kind": "standard", "text": "description1"},
    {"kind": "conversion", "text": "description2"},
    {"kind": "pédagogique", "text": "description3"}
  ],
  "internalLinks": [
    {"url": "/url1", "label": "Label1", "reason": "Raison1"},
    {"url": "/url2", "label": "Label2", "reason": "Raison2"},
    {"url": "/url3", "label": "Label3", "reason": "Raison3"}
  ],
  "schemas": ${JSON.stringify(suggestedSchemas)}
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const responseText = openaiData.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Pas de réponse de l\'IA');
    }

    // Parser la réponse JSON
    let seoData: SEOResponse;
    try {
      seoData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      throw new Error('Réponse IA invalide');
    }

    // Validation serveur
    const validatedData = validateSEOData(seoData, data);
    
    return NextResponse.json(validatedData);

  } catch (error) {
    console.error('Erreur génération SEO:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération SEO' },
      { status: 500 }
    );
  }
}

function validateSEOData(data: SEOResponse, context: SEORequest): SEOResponse {
  // Valider les titres
  const validatedTitles = data.metaTitles.map(title => {
    if (title.length > 60) {
      // Reformuler si trop long
      const words = title.split(' ');
      let newTitle = '';
      for (const word of words) {
        if ((newTitle + ' ' + word).trim().length <= 57) {
          newTitle += (newTitle ? ' ' : '') + word;
        } else {
          break;
        }
      }
      return newTitle.trim() + '...';
    }
    return title;
  });

  // Valider les descriptions
  const validatedDescriptions = data.metaDescriptions.map(desc => {
    let text = desc.text;
    
    // Vérifier la longueur
    if (text.length < 150) {
      text = text + ' Découvrez nos services et notre expertise.';
    } else if (text.length > 160) {
      text = text.substring(0, 157).trim() + '...';
    }
    
    // Vérifier la présence du focus
    if (data.focus && !text.toLowerCase().includes(data.focus.toLowerCase())) {
      text = text.replace(/\.$/, '') + ` avec ${data.focus}.`;
    }
    
    return { ...desc, text };
  });

  // Valider les liens internes
  const validatedLinks = data.internalLinks.filter(link => 
    context.internalUrls.includes(link.url)
  );

  return {
    ...data,
    metaTitles: validatedTitles,
    metaDescriptions: validatedDescriptions,
    internalLinks: validatedLinks
  };
}
