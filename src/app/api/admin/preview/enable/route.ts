import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to') || '/';
    
    // Activer le Draft Mode
    (await draftMode()).enable();
    
    // Rediriger vers la page demandée
    return NextResponse.redirect(new URL(to, request.url));
  } catch (error) {
    console.error('Erreur lors de l\'activation du Draft Mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'activation du Draft Mode',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 