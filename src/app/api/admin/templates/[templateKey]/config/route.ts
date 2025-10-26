import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
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

    // Chemin vers le fichier de configuration du template
    const configPath = join(process.cwd(), 'data', 'templates', templateKey, 'config.json');
    
    if (!existsSync(configPath)) {
      return NextResponse.json(
        { success: false, error: `Configuration du template "${templateKey}" non trouvée` },
        { status: 404 }
      );
    }

    // Lire la configuration du template
    const templateConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    
    return NextResponse.json({
      success: true,
      config: templateConfig,
      templateKey
    });

  } catch (error) {
    console.error('Erreur lecture config template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la lecture de la configuration du template' },
      { status: 500 }
    );
  }
}
