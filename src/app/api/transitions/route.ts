import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    const { transitionConfig } = await request.json();
    
    if (!transitionConfig) {
      return NextResponse.json({ error: 'Configuration de transition requise' }, { status: 400 });
    }

    // Valider la configuration
    const validTypes = ['slide-up', 'slide-down', 'fade', 'zoom', 'flip', 'curtain'];
    if (!validTypes.includes(transitionConfig.type)) {
      return NextResponse.json({ error: 'Type de transition invalide' }, { status: 400 });
    }

    if (transitionConfig.duration && (transitionConfig.duration < 300 || transitionConfig.duration > 3000)) {
      return NextResponse.json({ error: 'Durée doit être entre 300ms et 3000ms' }, { status: 400 });
    }

    // Lire le contenu actuel
    const content = await readContent();
    
    // Mettre à jour la configuration des transitions à la racine du contenu
    (content as any)._transitionConfig = {
      type: transitionConfig.type,
      duration: transitionConfig.duration || 1500,
      easing: transitionConfig.easing || 'cubic-bezier(0.87, 0, 0.13, 1)',
      updatedAt: new Date().toISOString()
    };
    
    // Aussi dans metadata pour compatibilité avec l'admin
    if (!content.metadata) {
      (content as any).metadata = {};
    }
    (content as any).metadata._transitionConfig = (content as any)._transitionConfig;

    // Sauvegarder
    await writeContent(content);

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration des transitions sauvegardée', 
      config: (content as any)._transitionConfig 
    });

  } catch (error) {
    console.error('Erreur sauvegarde transitions:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const content = await readContent();
    
    return NextResponse.json({
      transitionConfig: (content as any)._transitionConfig || null
    });

  } catch (error) {
    console.error('Erreur lecture transitions:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture' }, { status: 500 });
  }
}
