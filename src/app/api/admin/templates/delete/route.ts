import { NextResponse } from 'next/server';
import { rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
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

    // Nettoyer les références dans registry.ts
    const registryPath = join(process.cwd(), 'src', 'templates', 'registry.ts');
    if (existsSync(registryPath)) {
      let registryContent = readFileSync(registryPath, 'utf-8');
      
      // Supprimer la définition du template du registre
      const templateRegex = new RegExp(
        `\\s*'${templateKey}':\\s*{[^}]*},?\\s*`,
        'g'
      );
      registryContent = registryContent.replace(templateRegex, '');
      
      // Nettoyer les virgules orphelines
      registryContent = registryContent.replace(/,\s*}/g, '}');
      registryContent = registryContent.replace(/,\s*,/g, ',');
      
      writeFileSync(registryPath, registryContent);
      console.log(`✅ Référence template "${templateKey}" supprimée du registry`);
    }

    // Nettoyer les références dans TemplateRenderer.tsx
    const rendererPath = join(process.cwd(), 'src', 'templates', 'TemplateRenderer.tsx');
    if (existsSync(rendererPath)) {
      let rendererContent = readFileSync(rendererPath, 'utf-8');
      
      // Supprimer l'import du template
      const importRegex = new RegExp(
        `import\\s+\\w+\\s+from\\s+['"]@/templates/${templateKey}/${templateKey}-client['"];?\\s*`,
        'g'
      );
      rendererContent = rendererContent.replace(importRegex, '');
      
      // Supprimer le case du template
      const caseRegex = new RegExp(
        `\\s*case\\s+['"]${templateKey}['"]:\\s*return\\s+<\\w+\\s*/>;?\\s*`,
        'g'
      );
      rendererContent = rendererContent.replace(caseRegex, '');
      
      // Nettoyer les lignes vides multiples
      rendererContent = rendererContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      writeFileSync(rendererPath, rendererContent);
      console.log(`✅ Référence template "${templateKey}" supprimée du TemplateRenderer`);
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
