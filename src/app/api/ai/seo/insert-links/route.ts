import { NextRequest, NextResponse } from 'next/server';

interface InsertLinksRequest {
  content: string | any[];
  internalLinks: Array<{
    url: string;
    label: string;
    reason: string;
  }>;
  focusKeyword: string;
  title: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: InsertLinksRequest = await request.json();
    
    console.log('🔗 API Insert Links - Données reçues:', {
      title: data.title,
      focusKeyword: data.focusKeyword,
      linksCount: data.internalLinks.length,
      contentType: Array.isArray(data.content) ? 'blocks' : 'html'
    });

    if (!data.content || !data.internalLinks.length) {
      return NextResponse.json(
        { error: 'Contenu et liens requis' },
        { status: 400 }
      );
    }

    // Convertir le contenu en texte pour l'analyse
    let plainText = '';
    let contentBlocks: any[] = [];

    if (Array.isArray(data.content)) {
      // Contenu en blocs
      contentBlocks = data.content;
      plainText = data.content.map(block => {
        if (typeof block === 'string') return block;
        if (block.content) return block.content;
        return '';
      }).join(' ');
    } else {
      // Contenu HTML - convertir en blocs
      plainText = data.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      // Diviser le contenu en paragraphes pour créer des blocs
      const paragraphs = data.content.split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim());
      contentBlocks = paragraphs.map((paragraph, index) => ({
        type: 'content',
        content: paragraph.replace(/<[^>]*>/g, '').trim()
      })).filter(block => block.content);
    }

    // Appeler l'IA pour l'insertion intelligente
    const result = await enhanceContentWithLinks(
      contentBlocks,
      data.internalLinks,
      data.focusKeyword,
      data.title
    );

    console.log('📤 Résultat final API:', {
      enhancedBlocks: result.enhancedBlocks?.length || 0,
      insertedLinks: result.insertedLinks?.length || 0
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur insertion liens:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'insertion des liens' },
      { status: 500 }
    );
  }
}

async function enhanceContentWithLinks(
  contentBlocks: any[],
  internalLinks: any[],
  focusKeyword: string,
  title: string
): Promise<any[]> {
  
  const model = 'gpt-4o-mini';
  
  const systemPrompt = `Tu es un expert SEO et rédacteur web spécialisé dans l'insertion intelligente de liens internes.

RÈGLES STRICTES:
1. Insérer UNIQUEMENT les liens fournis dans le pool
2. Créer des ancres naturelles et contextuelles (pas le titre de l'article)
3. Réécrire subtilement le texte pour intégrer le lien naturellement
4. Placer les liens au meilleur endroit sémantique
5. Maximum 2-3 liens par bloc de contenu
6. Éviter la sur-optimisation
7. Garder le sens et la fluidité du texte
8. OBLIGATOIRE: Insérer AU MOINS 2-3 liens dans le contenu
9. Si le contexte n'est pas parfait, AJOUTER des phrases pour créer des opportunités de liens
10. FORMAT DES LIENS: Utiliser le format [texte du lien](URL) pour que les liens soient visibles
11. NE PAS REFUSER d'insérer des liens - toujours en trouver un moyen

POOL DE LIENS DISPONIBLES:
${internalLinks.map(link => `- ${link.url} (${link.label})`).join('\n')}

Réponds UNIQUEMENT en JSON valide avec les blocs modifiés.`;

  const userPrompt = `CONTEXTE:
- Titre: ${title}
- Focus: ${focusKeyword}
- Liens à insérer: ${internalLinks.length}

CONTENU ACTUEL (blocs):
${JSON.stringify(contentBlocks, null, 2)}

TÂCHE OBLIGATOIRE:
1. Analyser chaque bloc de contenu
2. Identifier les meilleurs endroits pour insérer les liens
3. Réécrire le texte pour intégrer naturellement les liens
4. Créer des ancres contextuelles et variées
5. Maintenir la cohérence et la fluidité
6. Utiliser le format [texte](URL) pour que les liens soient visibles dans l'éditeur
7. OBLIGATOIRE: Insérer AU MOINS 2 liens dans le contenu
8. Si nécessaire, AJOUTER des phrases pour créer des opportunités de liens

RÉPONSE ATTENDUE (JSON):
{
  "enhancedBlocks": [
    {
      "type": "content",
      "content": "Texte modifié avec [lien contextuel](URL) intégré naturellement..."
    }
  ],
  "insertedLinks": [
    {
      "url": "/blog/article",
      "anchor": "terme contextuel",
      "position": "dans le bloc X"
    }
  ]
}

EXEMPLE DE LIEN À INSÉRER:
"Les [faux outils d'IA](https://monsite.com/blog/faux-outils-ia) sont nombreux sur le marché."`;

  try {
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
        max_tokens: 2000,
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
    const result = JSON.parse(responseText);
    
    console.log('✅ Liens insérés intelligemment:', {
      blocksModified: result.enhancedBlocks?.length || 0,
      linksInserted: result.insertedLinks?.length || 0,
      result: result
    });

    return {
      enhancedBlocks: result.enhancedBlocks || contentBlocks,
      insertedLinks: result.insertedLinks || []
    };

  } catch (error) {
    console.error('Erreur IA insertion liens:', error);
    
    // Fallback: insérer manuellement au moins 1 lien
    if (contentBlocks.length > 0 && internalLinks.length > 0) {
      const firstBlock = contentBlocks[0];
      const firstLink = internalLinks[0];
      
      console.log('🔄 Fallback - Insertion manuelle:', {
        firstBlock: firstBlock,
        firstLink: firstLink,
        blocksCount: contentBlocks.length
      });
      
      const enhancedBlocks = [...contentBlocks];
      enhancedBlocks[0] = {
        ...firstBlock,
        content: `${firstBlock.content} Pour en savoir plus, consultez notre article sur [${firstLink.label}](${firstLink.url}).`
      };
      
      return {
        enhancedBlocks,
        insertedLinks: [{
          url: firstLink.url,
          anchor: firstLink.label,
          position: `dans le bloc 1 (${firstBlock.type || 'contenu'}) - fin du paragraphe`
        }]
      };
    }
    
    // Retourner le contenu original en cas d'erreur
    return {
      enhancedBlocks: contentBlocks,
      insertedLinks: []
    };
  }
}
