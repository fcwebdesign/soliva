/**
 * Fonction utilitaire pour charger le contenu d'un template
 * Réutilisable dans toutes les APIs pour éviter la duplication
 */
import { readContent } from '@/lib/content';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function loadTemplateContent(): Promise<any> {
  // Lire d'abord le contenu de base pour détecter le template
  let content = await readContent();
  const currentTemplate = (content as any)._template;
  
  // Si un template spécifique est défini et qu'un fichier de template existe, le lire
  if (currentTemplate && currentTemplate !== 'soliva') {
    const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
    
    if (existsSync(templateContentPath)) {
      try {
        const templateContent = JSON.parse(readFileSync(templateContentPath, 'utf-8'));
        content = templateContent;
      } catch (error) {
        console.warn(`⚠️ Erreur lecture template "${currentTemplate}", fallback sur content.json:`, error);
        // Fallback sur le contenu de base si erreur
      }
    }
  }
  
  return content;
}

