import { NextRequest, NextResponse } from 'next/server';
import { SerializedAIProfile } from '@/types/ai-profile';
import fs from 'fs';
import path from 'path';

const AI_PROFILE_FILE = path.join(process.cwd(), 'data', 'ai-profile.json');

// POST - Tester la voix de marque
export async function POST(request: NextRequest) {
  try {
    const { length = 'standard' } = await request.json();
    
    // Récupérer le profil IA
    if (!fs.existsSync(AI_PROFILE_FILE)) {
      return NextResponse.json(
        { error: 'Profil IA non configuré' },
        { status: 400 }
      );
    }
    
    const profileData = fs.readFileSync(AI_PROFILE_FILE, 'utf8');
    const profile = JSON.parse(profileData);
    
    // Construire le prompt avec le profil
    const systemPrompt = `Tu es le rédacteur du site ${profile.brand.name}. 
    
PROFIL DE MARQUE:
- Marque: ${profile.brand.name}. Baseline: ${profile.brand.baseline}. Pitch: ${profile.brand.elevatorPitch}
- Services: ${profile.offer.mainServices.join(', ')}. USP: ${profile.offer.usps.join(', ')}
- Cible: ${profile.audience.primary.type} - ${profile.audience.primary.sector}. Niveau: ${profile.audience.expertiseLevel}
- Ton: ${profile.tone.styles.join(', ')}. Formalité: ${profile.tone.formality}. Émojis: ${profile.tone.emojisAllowed ? 'autorisés' : 'interdits'}
- À faire: ${profile.writingRules.do.join(', ')}. À éviter: ${profile.writingRules.avoid.join(', ')}
- Mots-clés marque: ${profile.lexicon.brandKeywords.join(', ')}
- CTA autorisés: ${profile.lexicon.allowedCTAs.join(', ')}

RÈGLES:
- Respecte le ton ${profile.tone.styles.join(', ')}
- Utilise le ${profile.tone.formality}
- Longueur: ${length === 'court' ? '1-2 phrases' : length === 'standard' ? '2-3 phrases' : '3-4 phrases'}
- ${profile.tone.emojisAllowed ? 'Tu peux utiliser des émojis' : 'N\'utilise PAS d\'émojis'}
- Évite: ${profile.writingRules.avoid.join(', ')}
- Utilise ces mots-clés: ${profile.lexicon.brandKeywords.join(', ')}`;

    const userPrompt = `Génère un paragraphe d'exemple qui présente ${profile.brand.name} et ses services principaux. 
    Ce paragraphe doit servir d'exemple de la voix de marque pour les futurs contenus.`;

    // Appeler l'API IA (utiliser la même logique que les autres endpoints)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: length === 'court' ? 100 : length === 'standard' ? 200 : 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Erreur API OpenAI');
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      generatedText,
      length,
      profileUsed: {
        brandName: profile.brand.name,
        tone: profile.tone.styles.join(', '),
        formality: profile.tone.formality
      }
    });

  } catch (error) {
    console.error('Erreur lors du test de voix:', error);
    return NextResponse.json(
      { error: 'Erreur lors du test de voix' },
      { status: 500 }
    );
  }
}
