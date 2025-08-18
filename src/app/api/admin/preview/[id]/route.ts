import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: previewId } = await params;
    
    if (!previewId) {
      return NextResponse.json(
        { error: 'ID de prévisualisation requis' },
        { status: 400 }
      );
    }
    
    // Chemin vers la révision temporaire
    const previewPath = join(process.cwd(), 'data', 'previews', `${previewId}.json`);
    
    try {
      const previewData = await fs.readFile(previewPath, 'utf-8');
      const preview = JSON.parse(previewData);
      
      // Vérifier si la révision a expiré
      const now = new Date();
      const expiresAt = new Date(preview.expiresAt);
      
      if (now > expiresAt) {
        // Supprimer la révision expirée
        await fs.unlink(previewPath).catch(() => {});
        
        return NextResponse.json(
          { error: 'Cette prévisualisation a expiré' },
          { status: 410 }
        );
      }
      
      console.log(`✅ Révision temporaire récupérée: ${previewId}`);
      
      return NextResponse.json(preview.content);
      
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Prévisualisation non trouvée' },
          { status: 404 }
        );
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la révision:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération de la révision',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: previewId } = await params;
    
    if (!previewId) {
      return NextResponse.json(
        { error: 'ID de prévisualisation requis' },
        { status: 400 }
      );
    }
    
    // Supprimer la révision temporaire
    const previewPath = join(process.cwd(), 'data', 'previews', `${previewId}.json`);
    await fs.unlink(previewPath).catch(() => {});
    
    console.log(`🗑️ Révision temporaire supprimée: ${previewId}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Révision temporaire supprimée'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de la révision:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de la révision',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 