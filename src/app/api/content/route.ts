import { NextResponse } from 'next/server';
import { readContent } from '@/lib/content';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log('🔄 API Public: Tentative de lecture du contenu...');
    
    // Lire d'abord le contenu de base pour détecter le template
    let content = await readContent();
    const currentTemplate = (content as any)._template;
    
    // Si un template spécifique est défini et qu'un fichier de template existe, le lire
    if (currentTemplate && currentTemplate !== 'soliva') {
      const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
      
      if (existsSync(templateContentPath)) {
        console.log(`📁 [API Content] Lecture depuis le template "${currentTemplate}"`);
        try {
          const templateContent = JSON.parse(readFileSync(templateContentPath, 'utf-8'));
          // Forcer la clé _template depuis la config active pour éviter les retours incohérents
          content = { ...templateContent, _template: currentTemplate };
          console.log(`✅ [API Content] Contenu du template "${currentTemplate}" chargé avec succès`);
        } catch (error) {
          console.warn(`⚠️ [API Content] Erreur lecture template "${currentTemplate}", fallback sur content.json:`, error);
          // Fallback sur le contenu de base si erreur
        }
      } else {
        console.log(`📁 [API Content] Template "${currentTemplate}" détecté mais fichier non trouvé, utilisation de content.json`);
      }
    } else {
      console.log('📁 [API Content] Lecture depuis content.json (template soliva ou par défaut)');
    }
    
    console.log('✅ API Public: Contenu lu avec succès');
    
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Pas de cache
      }
    });
  } catch (error) {
    console.error('❌ API Public: Erreur lors de la lecture du contenu:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la lecture du contenu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 
