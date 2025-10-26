import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateKey: string }> }
) {
  try {
    const { templateKey } = await params;
    
    if (!templateKey) {
      return NextResponse.json(
        { success: false, error: 'Clé du template requise' },
        { status: 400 }
      );
    }

    // Chemin vers le fichier de contenu du template
    const contentPath = join(process.cwd(), 'data', 'templates', templateKey, 'content.json');
    
    if (!existsSync(contentPath)) {
      return NextResponse.json(
        { success: false, error: `Template "${templateKey}" non trouvé` },
        { status: 404 }
      );
    }

    // Lire le contenu du template
    const templateContent = JSON.parse(readFileSync(contentPath, 'utf8'));
    
    return NextResponse.json({
      success: true,
      content: templateContent,
      templateKey
    });

  } catch (error) {
    console.error('Erreur lecture contenu template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la lecture du contenu du template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ templateKey: string }> }
) {
  try {
    const { templateKey } = await params;
    const { content } = await request.json();
    
    if (!templateKey) {
      return NextResponse.json(
        { success: false, error: 'Clé du template requise' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Contenu requis' },
        { status: 400 }
      );
    }

    // Chemin vers le fichier de contenu du template
    const contentPath = join(process.cwd(), 'data', 'templates', templateKey, 'content.json');
    
    // Créer le dossier s'il n'existe pas
    const templateDir = join(process.cwd(), 'data', 'templates', templateKey);
    if (!existsSync(templateDir)) {
      return NextResponse.json(
        { success: false, error: `Template "${templateKey}" non trouvé` },
        { status: 404 }
      );
    }

    // Sauvegarder le contenu
    writeFileSync(contentPath, JSON.stringify(content, null, 2));
    
    return NextResponse.json({
      success: true,
      message: `Contenu du template "${templateKey}" sauvegardé avec succès`
    });

  } catch (error) {
    console.error('Erreur sauvegarde contenu template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde du contenu du template' },
      { status: 500 }
    );
  }
}
