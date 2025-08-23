import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import type { Content } from '@/types/content';

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log('🔄 API: Tentative de lecture du contenu...');
    
    const content = await readContent();
    
    console.log('✅ API: Contenu lu avec succès, taille:', JSON.stringify(content).length);
    
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('❌ API: Erreur lors de la lecture du contenu:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la lecture du contenu',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Le champ "content" est requis' },
        { status: 400 }
      );
    }

    const content: Content = body.content;
    
    console.log('🔄 API: Tentative d\'écriture du contenu...');
    console.log('📊 Taille du contenu:', JSON.stringify(content).length, 'caractères');
    
    // Écrire le contenu
    await writeContent(content, { actor: 'admin-api' });
    
    console.log('✅ API: Contenu écrit avec succès');
    
    // Retourner le contenu mis à jour
    const updatedContent = await readContent();
    
    return NextResponse.json(updatedContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('❌ API: Erreur lors de l\'écriture du contenu:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // Retourner une erreur plus détaillée
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'écriture du contenu',
        details: errorMessage,
        stack: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 