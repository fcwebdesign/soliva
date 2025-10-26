import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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
    
    // Sauvegarder le contenu actuel avec le nom du template actuel
    const currentTemplate = currentContent._template || 'default';
    const backupPath = join(process.cwd(), 'data', 'backups', `template-${currentTemplate}-${Date.now()}.json`);
    writeFileSync(backupPath, JSON.stringify(currentContent, null, 2));
    
    // Essayer de charger le contenu du template sélectionné
    const templateContentPath = join(process.cwd(), 'data', 'templates', templateId, 'content.json');
    let newContent;
    
    if (existsSync(templateContentPath)) {
      // Charger le contenu spécifique du template
      console.log(`📁 Chargement du contenu du template "${templateId}"`);
      newContent = JSON.parse(readFileSync(templateContentPath, 'utf8'));
      // S'assurer que le _template est défini
      newContent._template = templateId;
    } else {
      // Créer un contenu vide pour le nouveau template
      console.log(`🆕 Création d'un contenu vide pour le template "${templateId}"`);
      newContent = {
        _template: templateId,
        metadata: {
          title: `Site ${templateId}`,
          description: `Description du site ${templateId}`
        },
        site: {
          title: `Site ${templateId}`,
          description: `Description du site ${templateId}`,
          logo: ''
        },
        nav: {
          logo: templateId,
          items: ['home', 'work', 'studio', 'contact', 'blog']
        },
        home: {
          title: `Accueil ${templateId}`,
          description: `Page d'accueil du template ${templateId}`,
          hero: {
            title: `Bienvenue sur ${templateId}`,
            subtitle: `Template ${templateId} généré avec l'IA`,
            cta: 'Découvrir'
          },
          blocks: []
        },
        studio: {
          title: `Studio ${templateId}`,
          description: `Page studio du template ${templateId}`,
          blocks: []
        },
        work: {
          title: `Projets ${templateId}`,
          description: `Page projets du template ${templateId}`,
          blocks: []
        },
        contact: {
          title: `Contact ${templateId}`,
          description: `Page contact du template ${templateId}`,
          blocks: []
        },
        blog: {
          title: `Blog ${templateId}`,
          description: `Page blog du template ${templateId}`,
          blocks: []
        }
      };
    }
    
    // Sauvegarder le nouveau contenu
    writeFileSync(contentPath, JSON.stringify(newContent, null, 2));
    
    return NextResponse.json({
      success: true,
      message: `Template "${templateId}" appliqué avec succès`,
      backup: backupPath,
      hasTemplateContent: existsSync(templateContentPath)
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'application du template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'application du template' },
      { status: 500 }
    );
  }
}