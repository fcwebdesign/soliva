import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { templateId } = await request.json();
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID requis' },
        { status: 400 }
      );
    }

    // Lire le contenu actuel
    const contentPath = join(process.cwd(), 'data', 'content.json');
    const currentContent = JSON.parse(readFileSync(contentPath, 'utf8'));
    
    // Créer une sauvegarde
    const backupPath = join(process.cwd(), 'data', 'backups', `before-template-${Date.now()}.json`);
    writeFileSync(backupPath, JSON.stringify(currentContent, null, 2));
    
    // Mettre à jour le template
    const updatedContent = {
      ...currentContent,
      _template: templateId
    };
    
    // Sauvegarder
    writeFileSync(contentPath, JSON.stringify(updatedContent, null, 2));
    
    return NextResponse.json({
      success: true,
      message: `Template "${templateId}" appliqué avec succès`,
      backup: backupPath
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'application du template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'application du template' },
      { status: 500 }
    );
  }
}