import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    
    const content = await readContent();
    const items = type === 'work' 
      ? content.work?.adminProjects || []
      : content.blog?.articles || [];

    if (items.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun contenu trouvé pour analyser' 
      }, { status: 400 });
    }

    const contentForAnalysis = items
      .filter(item => item.status === 'published' || !item.status)
      .map(item => ({
        title: item.title,
        excerpt: item.excerpt || item.description,
        content: item.content?.substring(0, 300),
        category: item.category,
        client: item.client
      }))
      .slice(0, 15);

    if (contentForAnalysis.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun contenu publié trouvé' 
      }, { status: 400 });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es copywriter senior. 
Ta mission: rédiger une description de page web (50–70 mots). 
Style: clair, piquant, direct. Ton: confiant, légèrement provocateur. 
Pas de jargon, pas de langue de bois. 
Interdits: "nous accompagnons", "notre expertise", "solutions sur-mesure", "partenaire de confiance", "plongez dans", "au cœur de".

Spécificités selon le type:
- home → Accroche forte: qui on est + pourquoi on est différent.
- work → Impact des projets: résultat concret, valeur visible.
- studio → Positionnement clair: ce qui nous distingue (ton, méthode, approche).
- blog → Angle éditorial: ce qu'on partage + pourquoi ça compte.
- contact → Invitation simple, directe, proximité (Paris / Le Havre si utile).

Contraintes:
- Phrases courtes (max 12 mots).
- 50–70 mots au total.
- Sortie: seulement le texte final, sans explications.`
          },
          {
            role: 'user',
            content: `type=${type}\n\nAnalyse ce contenu et rédige une description engageante:\n\n${JSON.stringify(contentForAnalysis, null, 2)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const suggestedDescription = openaiData.choices[0]?.message?.content;

    if (!suggestedDescription) {
      throw new Error('Pas de réponse de l\'IA');
    }

    return NextResponse.json({
      suggestedDescription: suggestedDescription.trim(),
      analyzedItems: contentForAnalysis.length,
      type
    });

  } catch (error) {
    console.error('Erreur suggestions description IA:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la génération de la description',
      details: error.message 
    }, { status: 500 });
  }
} 