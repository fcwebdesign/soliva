import { NextResponse } from 'next/server';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { templateKey } = await request.json();

    if (!templateKey) {
      return NextResponse.json(
        { success: false, error: 'Clé du template requise' },
        { status: 400 }
      );
    }

    // Supprimer le dossier du template
    const templateDir = join(process.cwd(), 'src', 'templates', templateKey);
    if (existsSync(templateDir)) {
      rmSync(templateDir, { recursive: true, force: true });
      console.log(`✅ Dossier template "${templateKey}" supprimé`);
    }

    // Supprimer le fichier de configuration
    const configFile = join(process.cwd(), 'data', 'templates', `${templateKey}.json`);
    if (existsSync(configFile)) {
      rmSync(configFile, { force: true });
      console.log(`✅ Configuration template "${templateKey}" supprimée`);
    }

    return NextResponse.json({
      success: true,
      message: `Template "${templateKey}" supprimé avec succès`
    });

  } catch (error) {
    console.error('Erreur suppression template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    );
  }
}
