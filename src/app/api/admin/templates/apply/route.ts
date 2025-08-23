import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID requis' },
        { status: 400 }
      );
    }

    // Lire le template
    const templatePath = path.join(process.cwd(), 'data', 'templates', `${templateId}.json`);
    
    try {
      await fs.access(templatePath);
    } catch {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = JSON.parse(templateContent);

    // Créer une sauvegarde avant d'appliquer le template
    const currentContent = await fs.readFile(path.join(process.cwd(), 'data', 'content.json'), 'utf-8');
    const currentData = JSON.parse(currentContent);
    
    // Si c'est la première fois qu'on applique un template, sauvegarder l'original
    if (!currentData._originalContent) {
      const originalBackup = {
        ...currentData,
        _originalContent: true,
        _savedAt: new Date().toISOString()
      };
      
      const originalBackupPath = path.join(process.cwd(), 'data', 'backups', `original-content-${Date.now()}.json`);
      await fs.writeFile(originalBackupPath, JSON.stringify(originalBackup, null, 2));
      
      // Marquer le contenu actuel comme original
      currentData._originalContent = true;
      await fs.writeFile(path.join(process.cwd(), 'data', 'content.json'), JSON.stringify(currentData, null, 2));
    }
    
    // Sauvegarder l'état actuel avant d'appliquer le template
    const backupPath = path.join(process.cwd(), 'data', 'backups', `before-template-${templateId}-${Date.now()}.json`);
    await fs.writeFile(backupPath, currentContent);

    // Fusion intelligente pour préserver les projets existants
    let finalContent;
    
    if (templateId === 'minimaliste-premium') {
      // Pour le template minimaliste, préserver les projets existants
      finalContent = {
        ...template,
        work: {
          ...template.work,
          // Préserver les projets existants s'ils existent
          items: currentData.work?.items || template.work.items,
          // Préserver aussi la structure projects complète
          projects: currentData.work?.projects || [],
          // Préserver la structure adminProjects
          adminProjects: currentData.work?.adminProjects || [],
          // Préserver les autres propriétés work
          hero: currentData.work?.hero || template.work.hero,
          filters: currentData.work?.filters || template.work.filters,
          description: currentData.work?.description || template.work.description
        },
        // Préserver les autres sections importantes
        blog: currentData.blog,
        studio: {
          ...template.studio || {},
          ...currentData.studio,
          // Préserver les blocs custom créés via l'admin
          blocks: currentData.studio?.blocks || [],
          // Préserver la description personnalisée
          description: currentData.studio?.description || template.studio?.description
        },
        // Préserver les métadonnées
        metadata: currentData.metadata
      };
    } else {
      // Pour les autres templates, fusion intelligente générique
      finalContent = {
        ...template,
        // Préserver les sections importantes avec leurs blocs
        work: {
          ...template.work,
          ...currentData.work,
          // Préserver les projets existants
          projects: currentData.work?.projects || template.work?.projects || [],
          adminProjects: currentData.work?.adminProjects || template.work?.adminProjects || [],
          // Préserver les blocs custom
          blocks: currentData.work?.blocks || []
        },
        studio: {
          ...template.studio,
          ...currentData.studio,
          // Préserver les blocs custom
          blocks: currentData.studio?.blocks || []
        },
        blog: {
          ...template.blog,
          ...currentData.blog,
          // Préserver les blocs custom
          blocks: currentData.blog?.blocks || []
        },
        contact: {
          ...template.contact,
          ...currentData.contact,
          // Préserver les blocs custom
          blocks: currentData.contact?.blocks || []
        },
        home: {
          ...template.home,
          ...currentData.home,
          // Préserver les blocs custom
          blocks: currentData.home?.blocks || []
        },
        // Préserver les autres sections
        nav: currentData.nav || template.nav,
        metadata: currentData.metadata || template.metadata,
        footer: currentData.footer || template.footer
      };
    }

    // Appliquer le template fusionné
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'content.json'),
      JSON.stringify(finalContent, null, 2)
    );

    console.log(`✅ Template ${templateId} appliqué avec succès (projets préservés)`);

    return NextResponse.json({
      success: true,
      message: `Template ${templateId} appliqué avec succès`,
      content: finalContent
    });

  } catch (error) {
    console.error('Erreur lors de l\'application du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'application du template' },
      { status: 500 }
    );
  }
} 