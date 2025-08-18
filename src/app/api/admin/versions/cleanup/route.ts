import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

export const runtime = "nodejs";

export async function POST() {
  try {
    const versionsDir = join(process.cwd(), 'data', 'versions');
    
    // Lire tous les fichiers de versions
    const files = await fs.readdir(versionsDir);
    const versionFiles = files
      .filter(file => file.startsWith('content-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: join(versionsDir, file),
        // Extraire la date du nom de fichier pour le tri
        timestamp: file.replace('content-', '').replace('.json', '')
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Plus récent en premier

    const MAX_VERSIONS = 10;
    const toDelete = versionFiles.slice(MAX_VERSIONS); // Garder les 10 plus récents

    // Supprimer les anciennes versions
    for (const file of toDelete) {
      await fs.unlink(file.path);
    }

    console.log(`🧹 Nettoyage: ${toDelete.length} versions supprimées, ${Math.min(versionFiles.length, MAX_VERSIONS)} conservées`);

    return NextResponse.json({
      success: true,
      deleted: toDelete.length,
      kept: Math.min(versionFiles.length, MAX_VERSIONS),
      message: `${toDelete.length} anciennes versions supprimées`
    });

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des versions:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du nettoyage des versions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 