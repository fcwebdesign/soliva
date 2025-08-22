import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'data', 'templates');
    
    // Vérifier si le dossier existe
    try {
      await fs.access(templatesDir);
    } catch {
      // Créer le dossier s'il n'existe pas
      await fs.mkdir(templatesDir, { recursive: true });
    }

    // Lire tous les fichiers JSON dans le dossier templates
    const files = await fs.readdir(templatesDir);
    const templateFiles = files.filter(file => file.endsWith('.json'));

    const templates = [];

    for (const file of templateFiles) {
      try {
        const filePath = path.join(templatesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const template = JSON.parse(content);
        
        templates.push({
          id: template._template || file.replace('.json', ''),
          name: template.metadata?.title || file.replace('.json', ''),
          description: template.metadata?.description || '',
          version: template._templateVersion || '1.0.0',
          category: template._template || 'portfolio'
        });
      } catch (error) {
        console.error(`Erreur lors de la lecture du template ${file}:`, error);
      }
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Erreur lors du chargement des templates:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des templates' },
      { status: 500 }
    );
  }
} 