import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/templates/registry';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Convertir l'objet TEMPLATES en array
    const staticTemplates = Object.values(TEMPLATES);
    
    // Charger les templates générés dynamiquement
    const dataTemplatesDir = join(process.cwd(), 'data', 'templates');
    let dynamicTemplates: any[] = [];
    
    try {
      const templateFiles = readdirSync(dataTemplatesDir).filter(file => file.endsWith('.json'));
      dynamicTemplates = templateFiles.map(file => {
        const templateData = JSON.parse(readFileSync(join(dataTemplatesDir, file), 'utf8'));
        return {
          key: templateData.name || file.replace('.json', ''),
          name: templateData.name ? 
            templateData.name.charAt(0).toUpperCase() + templateData.name.slice(1).replace(/-/g, ' ') :
            file.replace('.json', '').charAt(0).toUpperCase() + file.replace('.json', '').slice(1).replace(/-/g, ' '),
          description: templateData.description || `Template ${templateData.category || 'généré'}`,
          autonomous: templateData.autonomous || true,
          category: templateData.category,
          createdAt: templateData.createdAt
        };
      });
    } catch (error) {
      console.log('Aucun template dynamique trouvé:', error);
    }
    
    // Combiner les templates statiques et dynamiques
    const allTemplates = [...staticTemplates, ...dynamicTemplates];
    
    return NextResponse.json({
      success: true,
      templates: allTemplates
    });
  } catch (error) {
    console.error('Erreur lors du chargement des templates:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des templates' },
      { status: 500 }
    );
  }
}