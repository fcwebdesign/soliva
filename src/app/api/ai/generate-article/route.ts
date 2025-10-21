import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';
import slugify from 'slugify';

export const runtime = 'nodejs';

interface GenerateArticleRequest {
  title: string;
  keyword?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { title, keyword } = await request.json() as GenerateArticleRequest;
    
    console.log('✍️ API Generate Article - Début:', { title, keyword });

    if (!title) {
      return NextResponse.json(
        { error: 'Titre requis' },
        { status: 400 }
      );
    }

    // Lire le contenu existant pour les liens internes
    const content = await readContent();
    const existingArticles = content.blog?.articles || [];
    
    // Extraire les articles existants pour suggestions de liens internes
    const articlesForLinks = existingArticles
      .filter((a: any) => a.status === 'published' && a.slug)
      .slice(0, 10)
      .map((a: any) => ({
        title: a.title,
        slug: a.slug
      }));

    // Prompt système pour le ton Soliva
    const systemPrompt = `Tu es le rédacteur en chef de Soliva, un studio créatif spécialisé en développement web, IA appliquée et stratégie de marque.

ARTICLE DE RÉFÉRENCE (à imiter) : "Les faux outils IA qui sont juste des scripts"
- Longueur : ~2000 mots minimum
- Structure dense avec contenu riche
- Exemples concrets et précis
- Listes à puces quand pertinent (pas systématique)

TON SOLIVA (OBLIGATOIRE) :
- Direct et cash : "Parlons cash", "Soyons clairs", "La vérité c'est que..."
- Assertif sans être agressif : "Dans 80% des cas...", "Le problème n'est pas X, c'est Y"
- Concret avec exemples réels : Netflix, Nike, Shopify, WordPress...
- Provocateur mais bienveillant : Challenger sans condescendre
- Accessible : Expliquer simplement les concepts complexes
- BANNIR : jargon corporate (synergie, paradigme), langue de bois (peut-être, il semblerait), promesses vides (révolutionnaire, unique)

INTROS (varier - PAS toujours "Parlons cash") :
- Anecdote concrète qui illustre le problème
- Question provocatrice
- Constat chiffré ou statistique marquante
- Scénario vécu par le lecteur
- "Parlons cash" (1 fois sur 4 max)

STRUCTURE TYPE :
1. Introduction accrocheuse (2-3 paragraphes, minimum 150 mots)
2. 6-8 sections H2 (titres clairs et descriptifs)
3. Chaque section : 250-350 mots minimum avec :
   - Paragraphes riches (pas de phrases courtes isolées)
   - Exemples concrets
   - Listes à puces UNIQUEMENT si ça apporte de la clarté (3-5 articles max, pas systématique)
4. Conclusion substantielle (200+ mots)
5. Citation/blockquote marquante
6. Signature éditoriale en italique

LONGUEUR MINIMUM : 2000 mots (vérifier que chaque section fait 250-350 mots)

LISTES À PUCES (à utiliser avec parcimonie) :
- Format : <ul class="list-disc list-inside space-y-2"><li><p>Point 1 avec détails...</p></li></ul>
- Seulement quand ça aide la compréhension
- Pas dans toutes les sections
- Alterner avec des paragraphes riches

SEO :
- Intégrer naturellement le mot-clé
- Sous-titres optimisés
- Liens internes pertinents
- Meta optimisées

FORMAT BLOCS (CRITIQUE - structure à la racine, PAS dans "data") :
- "content" : paragraphes riches avec HTML enrichi (strong, listes, etc.)
- "h2" : titres de section
- "faq" : questions/réponses (OPTIONNEL - seulement si vraiment pertinent)`;

    const userPrompt = `Génère un article COMPLET sur : "${title}"
${keyword ? `Mot-clé SEO principal : ${keyword}` : ''}

Articles existants pour liens internes :
${articlesForLinks.map(a => `- ${a.title} (slug: ${a.slug})`).join('\n')}

TÂCHE (IMPORTANT - article de 2000 mots MINIMUM) :
1. Intro percutante variée (PAS "Parlons cash" systématique) - 150+ mots
2. 6-8 sections H2 substantielles (250-350 mots CHACUNE)
3. Contenu riche avec :
   - Paragraphes développés (pas de phrases isolées)
   - Exemples concrets et chiffrés
   - Listes à puces dans 2-3 sections max (quand utile)
4. Conclusion substantielle (200+ mots) avec citation
5. FAQ optionnelle (seulement si vraiment pertinent)
6. SEO complet

LONGUEUR CIBLE : 2000-2500 mots (vérifier que CHAQUE section H2 fait 250-350 mots)

RÉPONSE JSON (STRUCTURE EXACTE) :
{
  "article": {
    "title": "${title}",
    "slug": "slug-optimise",
    "status": "draft",
    "blocks": [
      {
        "id": "intro-1",
        "type": "content",
        "content": "<p>Intro paragraphe 1...</p><p>Paragraphe 2...</p>"
      },
      {
        "id": "section-1",
        "type": "h2",
        "content": "Titre de section 1"
      },
      {
        "id": "content-1",
        "type": "content",
        "content": "<p>Contenu section 1 dense et développé... 250-350 mots...</p><p>Avec <strong>emphase</strong> et exemples concrets...</p><p>Optionnel - Liste si pertinent :</p><ul class=\\"list-disc list-inside space-y-2\\"><li><p><strong>Point 1</strong> : Explication détaillée...</p></li><li><p><strong>Point 2</strong> : Autre point avec contenu...</p></li></ul><p>Paragraphe après la liste qui continue le développement...</p>"
      },
      {
        "id": "section-2",
        "type": "h2",
        "content": "Titre de section 2"
      },
      {
        "id": "content-2",
        "type": "content",
        "content": "<p>Contenu...</p>"
      },
      {
        "id": "conclusion-1",
        "type": "h2",
        "content": "Conclusion : Titre conclusion"
      },
      {
        "id": "conclusion-content",
        "type": "content",
        "content": "<p>Synthèse...</p><blockquote><p><strong>\\"Citation marquante\\"</strong></p></blockquote><p><br>✨ <em>Cet article fait partie de notre ligne éditoriale : [message]. Parce qu'au final, la seule promesse qui compte, c'est celle qu'on peut tenir.</em></p>"
      },
      {
        "id": "faq-1",
        "type": "faq",
        "items": [
          {
            "id": "faq-q1",
            "question": "Question pertinente ?",
            "answer": "<p>Réponse directe avec <strong>emphase</strong>...</p>"
          }
        ],
        "theme": "auto"
      }
    ],
    "seo": {
      "focusKeyword": "${keyword || 'mot-clé principal'}",
      "metaTitle": "Titre SEO ~55 caractères — Soliva",
      "metaDescription": "Description vendeuse 150-160 caractères avec mot-clé et bénéfice clair.",
      "canonicalUrl": "http://localhost:3006/blog/slug-optimise",
      "schemas": ["Article", "FAQPage"],
      "suggestedInternalLinks": [
        {
          "url": "/studio",
          "label": "Nos services",
          "reason": "Pertinence contextuelle"
        }
      ]
    }
  }
}

ATTENTION STRUCTURE :
- Blocs FAQ : propriétés "items" et "theme" À LA RACINE, PAS dans "data"
- Utiliser <strong> pour emphase, pas <b>
- Paragraphes dans <p>, listes dans <ul class="list-disc list-inside"><li class="mb-1"><p>...</p></li></ul>
- FAQ optionnelle : inclure SEULEMENT si le sujet s'y prête vraiment

Génère maintenant l'article complet dans le ton Soliva !`;

    console.log('🤖 Appel OpenAI pour génération article...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // GPT-4o pour meilleure qualité d'écriture
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 6000,  // Augmenté pour articles de 2000+ mots
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('❌ OpenAI Error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    let responseText = openaiData.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Pas de réponse de l\'IA');
    }

    // Parser la réponse
    const result = JSON.parse(responseText);
    
    // Générer un slug propre (sans timestamp)
    const baseSlug = slugify(title, { lower: true, strict: true });
    
    // Vérifier si le slug existe déjà et ajouter un suffixe si nécessaire
    let finalSlug = baseSlug;
    let counter = 1;
    while (existingArticles.some((a: any) => a.slug === finalSlug)) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }
    
    // Générer un ID unique avec timestamp court (6 derniers chiffres)
    const shortTimestamp = Date.now().toString().slice(-6);
    const articleId = `article-${finalSlug}-${shortTimestamp}`;
    
    const article = {
      ...result.article,
      id: articleId,
      slug: finalSlug,
      publishedAt: new Date().toISOString(),
      hasCustomSlug: true
    };

    console.log('✅ Article généré:', {
      id: article.id,
      blocksCount: article.blocks?.length || 0,
      hasFAQ: article.blocks?.some((b: any) => b.type === 'faq'),
      seoComplete: !!article.seo
    });

    return NextResponse.json({
      article,
      message: 'Article généré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur génération article:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de l\'article',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

