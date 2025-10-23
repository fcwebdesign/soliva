import { draftMode, headers } from 'next/headers';
import { readContent } from '@/lib/content';
import { TEMPLATES, type TemplateMeta } from './registry';

export async function getActiveTemplate(): Promise<TemplateMeta | null> {
  try {
    const { isEnabled } = await draftMode();
    const headersList = await headers();
    
    // Vérifier si on est sur une route d'administration
    const pathname = headersList.get('x-pathname') || '';
    const isAdminRoute = pathname.startsWith('/admin') || 
                        pathname.startsWith('/debug-template') || 
                        pathname.startsWith('/apply-template');
    
    // Vérifier les paramètres URL
    const searchParams = headersList.get('x-search-params') || '';
    const urlParams = new URLSearchParams(searchParams);
    const hasPreviewParam = urlParams.has('preview');
    const templateParam = urlParams.get('template');
    
    // Ne pas appliquer de template sur les routes d'admin
    if (isAdminRoute) {
      console.log('🔧 Route admin détectée, pas de template appliqué:', pathname);
      return null;
    }
    
    // 1. Paramètre ?template=... (priorité absolue, même en mode preview)
    if (templateParam && TEMPLATES[templateParam]) {
      console.log('🔍 Template paramètre détecté:', templateParam, hasPreviewParam ? '(mode preview)' : '');
      return TEMPLATES[templateParam];
    }
    
    // En mode preview sans paramètre template, ne pas appliquer de template
    if (hasPreviewParam) {
      console.log('👁️ Mode preview détecté sans template spécifique, pas de template appliqué:', urlParams.get('preview'));
      return null;
    }
    
    // 2. Configuration du site (content.json) - appliqué sur toutes les pages
    const content = await readContent();
    const configTemplate = content._template;
    if (configTemplate && TEMPLATES[configTemplate]) {
      console.log('⚙️ Template config détecté:', configTemplate, 'sur', pathname);
      return TEMPLATES[configTemplate];
    }
    
    return null;
    
  } catch (error) {
    console.error('Erreur lors de la détection du template:', error);
    return null;
  }
} 