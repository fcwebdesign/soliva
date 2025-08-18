import { NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log('🔄 API Public: Tentative de lecture du contenu...');
    
    const content = await readContent();
    
    console.log('✅ API Public: Contenu lu avec succès');
    
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Pas de cache
      }
    });
  } catch (error) {
    console.error('❌ API Public: Erreur lors de la lecture du contenu:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la lecture du contenu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 