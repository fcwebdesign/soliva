import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/templates/registry';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Convertir l'objet TEMPLATES en array normalisé
    const staticTemplates = Object.values(TEMPLATES).map(t => ({
      id: t.key,
      key: t.key,
      name: t.name,
      description: t.description || '',
      autonomous: t.autonomous,
    }));
    
    // Charger les templates générés dynamiquement
    const dataTemplatesDir = join(process.cwd(), 'data', 'templates');
    let dynamicTemplates: any[] = [];
    
    try {
      const templateFiles = readdirSync(dataTemplatesDir).filter(file => file.endsWith('.json'));
      dynamicTemplates = templateFiles.map(file => {
        const templateData = JSON.parse(readFileSync(join(dataTemplatesDir, file), 'utf8'));
        const key = templateData.name || file.replace('.json', '');
        return {
          id: key,
          key,
          name: templateData.name ? 
            templateData.name.charAt(0).toUpperCase() + templateData.name.slice(1).replace(/-/g, ' ') :
            file.replace('.json', '').charAt(0).toUpperCase() + file.replace('.json', '').slice(1).replace(/-/g, ' '),
          description: templateData.description || `Template ${templateData.category || 'généré'}`,
          autonomous: templateData.autonomous !== false,
          category: templateData.category,
          createdAt: templateData.createdAt
        };
      });
    } catch (error) {
      console.log('Aucun template dynamique trouvé:', error);
    }
    
    // Combiner et dédupliquer par clé (préférence aux statiques enregistrés)
    const byId = new Map<string, any>();
    for (const t of staticTemplates) {
      if (!t?.id) continue;
      byId.set(t.id, t);
    }
    for (const d of dynamicTemplates) {
      if (!d?.id) continue;
      if (!byId.has(d.id)) {
        byId.set(d.id, d);
      } else {
        // Fusionner en privilégiant le label/description dynamiques
        const existing = byId.get(d.id);
        byId.set(d.id, {
          ...existing,
          name: d.name || existing.name,
          description: d.description || existing.description,
          // conserver autonomous de la version statique si présent
          autonomous: existing.autonomous ?? d.autonomous,
        });
      }
    }
    const allTemplates = Array.from(byId.values());

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
