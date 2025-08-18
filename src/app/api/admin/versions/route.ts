import { NextRequest, NextResponse } from 'next/server';
import { listVersions, revertTo, readContent } from '@/lib/content';

export const runtime = "nodejs";

export async function GET() {
  try {
    const versions = await listVersions();
    
    return NextResponse.json(versions, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Erreur lors de la lecture des versions:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la lecture des versions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.filename) {
      return NextResponse.json(
        { error: 'Le champ "filename" est requis' },
        { status: 400 }
      );
    }

    const { filename } = body;
    
    // Revenir à la version
    await revertTo(filename);
    
    // Retourner le contenu restauré
    const content = await readContent();
    
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Erreur lors du revert:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du revert',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 