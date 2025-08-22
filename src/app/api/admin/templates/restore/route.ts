import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  try {
    const backupsDir = path.join(process.cwd(), 'data', 'backups');
    
    // Chercher la sauvegarde originale (la plus récente)
    const files = await fs.readdir(backupsDir);
    const originalBackups = files.filter(file => file.startsWith('original-content-'));
    
    if (originalBackups.length === 0) {
      return NextResponse.json(
        { error: 'Aucune sauvegarde originale trouvée' },
        { status: 404 }
      );
    }

    // Prendre la sauvegarde originale la plus récente
    const latestOriginalBackup = originalBackups.sort().pop();
    const backupPath = path.join(backupsDir, latestOriginalBackup);
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const originalContent = JSON.parse(backupContent);

    // Créer une sauvegarde de l'état actuel avant restauration
    const currentContent = await fs.readFile(path.join(process.cwd(), 'data', 'content.json'), 'utf-8');
    const beforeRestorePath = path.join(backupsDir, `before-restore-${Date.now()}.json`);
    await fs.writeFile(beforeRestorePath, currentContent);

    // Restaurer le contenu original (sans les métadonnées de sauvegarde)
    const cleanOriginalContent = {
      ...originalContent,
      _template: undefined,
      _templateVersion: undefined,
      _originalContent: undefined,
      _savedAt: undefined
    };

    await fs.writeFile(
      path.join(process.cwd(), 'data', 'content.json'),
      JSON.stringify(cleanOriginalContent, null, 2)
    );

    console.log('✅ Site original restauré avec succès');

    return NextResponse.json({
      success: true,
      message: 'Site original restauré avec succès',
      content: cleanOriginalContent
    });

  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la restauration' },
      { status: 500 }
    );
  }
} 