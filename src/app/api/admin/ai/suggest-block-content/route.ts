import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    const { blockType, pageKey, context, existingBlocks } = await request.json();
    
    const content = await readContent();
    
    // Contexte spécifique selon la page avec plus de détails
    let pageContext = '';
    if (pageKey === 'studio') {
      const studioBlocks = content.studio?.blocks || [];
      const existingContent = studioBlocks.map(b => b.content).join(' ');
      pageContext = `Page: Studio créatif Soliva. ${content.studio?.hero?.title || 'Le studio'}. ${content.studio?.description || ''}. Contenu existant: ${existingContent}`;
    } else if (pageKey === 'work') {
      const projects = content.work?.projects || [];
      const projectTitles = projects.map(p => p.title).join(', ');
      pageContext = `Page: Nos réalisations. ${content.work?.hero?.title || 'Nos réalisations'}. ${content.work?.description || ''}. Projets: ${projectTitles}`;
    } else if (pageKey === 'blog') {
      const articles = content.blog?.articles || [];
      const articleTitles = articles.map(a => a.title).join(', ');
      pageContext = `Page: Le journal. ${content.blog?.hero?.title || 'Le journal'}. ${content.blog?.description || ''}. Articles: ${articleTitles}`;
    } else if (pageKey === 'contact') {
      pageContext = `Page: Contact. ${content.contact?.hero?.title || 'Contact'}. ${content.contact?.description || ''}. Sections: ${JSON.stringify(content.contact?.sections || {})}`;
    }

    // Analyser les blocs existants pour la cohérence
    let blocksContext = '';
    if (existingBlocks && existingBlocks.length > 0) {
      const h2Titles = existingBlocks.filter(b => b.type === 'h2').map(b => b.content);
      const contentBlocks = existingBlocks.filter(b => b.type === 'content').map(b => b.content);
      
      blocksContext = `Blocs existants - Titres H2: ${h2Titles.join(', ')}. Contenu: ${contentBlocks.join(' ')}`;
    }

    // Instructions spécifiques selon le type de bloc - style direct et professionnel
    let blockInstructions = '';
    switch (blockType) {
      case 'content':
        blockInstructions = `Génère un paragraphe de contenu clair et direct (2-3 phrases).
        Évite les métaphores poétiques, les formulations vagues, et le jargon marketing.
        Utilise des faits concrets, des exemples pratiques, ou des bénéfices tangibles.
        IMPORTANT: Le contenu doit être cohérent avec les titres H2 existants.
        Style: professionnel, direct, authentique.`;
        break;
      case 'h2':
        blockInstructions = `Génère un titre H2 clair et impactant (3-6 mots).
        Évite les titres génériques comme "Notre approche", "Nos services", "Qui nous sommes".
        Utilise des verbes d'action concrets ou des questions directes.
        IMPORTANT: Le titre doit être cohérent avec le contenu existant.
        Style: direct, professionnel, mémorable.`;
        break;
      case 'h3':
        blockInstructions = `Génère un titre H3 précis et descriptif (2-4 mots).
        Évite les titres vagues comme "Processus", "Méthode", "Résultats".
        Utilise des termes concrets, des chiffres, ou des concepts spécifiques.
        IMPORTANT: Le titre doit s'intégrer dans la structure existante.
        Style: précis, informatif, professionnel.`;
        break;
      default:
        blockInstructions = `Génère du contenu clair et approprié pour ce type de bloc.`;
    }

    // Déterminer le bon paramètre selon le modèle
    const model = 'gpt-5'; // Retour à GPT-5 avec la nouvelle configuration
    const isGpt5 = model.startsWith('gpt-5');
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
- Sortie: seulement le contenu final, sans explications ni balises HTML`
        },
        {
          role: 'user',
          content: `Type de bloc: ${blockType}
Page: ${pageKey}
Contexte: ${pageContext}
Blocs existants: ${blocksContext || 'Aucun'}
Contexte supplémentaire: ${context || 'Aucun'}
Timestamp: ${Date.now()}

Génère du contenu professionnel et direct pour ce bloc. Le contenu doit être cohérent avec les autres blocs existants. Évite toute répétition.`
        }
      ],
    };

    // Utiliser le bon paramètre selon le modèle
    if (isGpt5) {
      // GPT-5 : Réduire drastiquement l'effort de raisonnement
      requestBody.max_completion_tokens = 300;
      requestBody.reasoning_effort = "minimal";
      console.log('🔧 Configuration GPT-5 pour bloc:', JSON.stringify(requestBody, null, 2));
    } else {
      requestBody.max_tokens = 200;
      requestBody.temperature = 0.7;
      console.log('🔧 Configuration GPT-4 pour bloc:', JSON.stringify(requestBody, null, 2));
    }

    console.log('🚀 Envoi requête OpenAI pour bloc:', blockType);
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
    
    const suggestedContent = openaiData.choices?.[0]?.message?.content;

    if (!suggestedContent) {
      console.error('Pas de contenu dans la réponse OpenAI:', openaiData);
      throw new Error('Pas de réponse de l\'IA');
    }

    return NextResponse.json({
      suggestedContent: suggestedContent.trim()
    });

  } catch (error) {
    console.error('Erreur suggestion contenu bloc:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du contenu' },
      { status: 500 }
    );
  }
} 