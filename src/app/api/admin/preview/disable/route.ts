import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Désactiver le Draft Mode
    draftMode().disable();
    
    // Rediriger vers la page d'accueil
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Erreur lors de la désactivation du Draft Mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la désactivation du Draft Mode',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 