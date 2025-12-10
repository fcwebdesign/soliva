import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SEED_DATA } from '@/lib/content';

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
    const templateDir = join(process.cwd(), 'data', 'templates', templateId);
    const templateContentPath = join(templateDir, 'content.json');
    let newContent;
    
    if (existsSync(templateContentPath)) {
      // Charger le contenu spécifique du template (avec les modifications sauvegardées)
      console.log(`📁 Chargement du contenu sauvegardé du template "${templateId}"`);
      const savedContent = JSON.parse(readFileSync(templateContentPath, 'utf8'));
      // ✅ Fusionner avec le seed pour garantir la conformité au schéma actuel
      newContent = {
        ...SEED_DATA,
        ...savedContent,
        _template: templateId,
        nav: {
          ...SEED_DATA.nav,
          ...(savedContent?.nav || {}),
          logo: templateId,
        },
      };
      writeFileSync(templateContentPath, JSON.stringify(newContent, null, 2));
    } else {
      // Créer un contenu de base pour le nouveau template
      console.log(`🆕 Création d'un contenu de base pour le template "${templateId}"`);
      newContent = {
        ...SEED_DATA,
        _template: templateId,
        metadata: {
          ...SEED_DATA.metadata,
          title: `Site ${templateId}`,
          description: `Description du site ${templateId}`,
        },
        nav: {
          ...SEED_DATA.nav,
          logo: templateId,
        },
        home: {
          ...SEED_DATA.home,
          title: `Accueil ${templateId}`,
          description: `Page d'accueil du template ${templateId}`,
          hero: {
            ...(SEED_DATA.home as any)?.hero,
            title: `Bienvenue sur ${templateId}`,
            subtitle: `Template ${templateId} généré avec l'IA`,
            cta: 'Découvrir',
          },
          blocks: [],
        },
        studio: {
          ...SEED_DATA.studio,
          title: `Studio ${templateId}`,
          description: `Page studio du template ${templateId}`,
          blocks: [],
        },
        work: {
          ...SEED_DATA.work,
          title: `Projets ${templateId}`,
          description: `Page projets du template ${templateId}`,
          blocks: [],
        },
        contact: {
          ...SEED_DATA.contact,
          title: `Contact ${templateId}`,
          description: `Page contact du template ${templateId}`,
          blocks: [],
        },
        blog: {
          ...SEED_DATA.blog,
          title: `Blog ${templateId}`,
          description: `Page blog du template ${templateId}`,
          blocks: [],
        },
      };
      
      // Créer le dossier du template et sauvegarder le contenu de base
      if (!existsSync(templateDir)) {
        mkdirSync(templateDir, { recursive: true });
      }
      writeFileSync(templateContentPath, JSON.stringify(newContent, null, 2));
      console.log(`💾 Contenu de base sauvegardé pour le template "${templateId}"`);
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
