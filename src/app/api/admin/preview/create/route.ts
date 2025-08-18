import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { previewId, content, page } = await request.json();
    
    if (!previewId || !content) {
      return NextResponse.json(
        { error: 'previewId et content sont requis' },
        { status: 400 }
      );
    }
    
    // Créer le dossier previews s'il n'existe pas
    const previewsDir = join(process.cwd(), 'data', 'previews');
    await fs.mkdir(previewsDir, { recursive: true });
    
    // Sauvegarder la révision temporaire
    const previewPath = join(previewsDir, `${previewId}.json`);
    const revisionData = {
      content,
      page,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };
    
    await fs.writeFile(
      previewPath,
      JSON.stringify(revisionData, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Révision temporaire créée: ${previewId}`);
    console.log(`📄 Contenu sauvegardé:`, {
      page,
      contentKeys: Object.keys(content),
      pageContent: content[page],
      contentSize: JSON.stringify(content).length
    });
    
    return NextResponse.json({ 
      success: true, 
      previewId,
      message: 'Révision temporaire créée'
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la révision:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la révision',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 