/**
 * Fonction serveur optimisée pour charger uniquement les métadonnées
 * Utilisée par les pages SSR pour éviter de charger 85 MB à chaque navigation
 * 
 * ✅ OPTIMISATION : Cache en mémoire avec invalidation basée sur le timestamp du fichier
 * pour éviter de relire/parser 85 MB à chaque navigation
 */
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

// Cache en mémoire pour éviter de relire le fichier à chaque fois
let metadataCache: any = null;
let cacheTimestamp: number = 0;
let cacheFilePath: string | null = null;

export async function loadTemplateMetadata(): Promise<any> {
  // ✅ OPTIMISATION : Vérifier le cache en mémoire avant de lire le fichier
  const baseContentPath = join(process.cwd(), 'data', 'content.json');
  
  // Vérifier d'abord si le cache base est valide
  let needsRefresh = true;
  let activeFilePath = baseContentPath;
  let content: any = null;
  
  if (metadataCache && cacheFilePath === baseContentPath) {
    try {
      const fileStats = statSync(baseContentPath);
      if (fileStats.mtimeMs === cacheTimestamp) {
        // Cache valide pour baseContentPath, vérifier si un template est utilisé
        const cachedTemplate = metadataCache._template;
        if (cachedTemplate && cachedTemplate !== 'soliva') {
          const templateContentPath = join(process.cwd(), 'data', 'templates', cachedTemplate, 'content.json');
          if (existsSync(templateContentPath)) {
            const templateStats = statSync(templateContentPath);
            if (cacheFilePath === templateContentPath && templateStats.mtimeMs === cacheTimestamp) {
              // Cache valide pour le template aussi
              return metadataCache;
            }
          } else {
            // Template n'existe plus, utiliser le cache base
            return metadataCache;
          }
        } else {
          // Pas de template, cache base valide
          return metadataCache;
        }
      }
    } catch {
      // Erreur de stat, continuer avec refresh
    }
  }
  
  // Cache invalide ou inexistant, lire le fichier
  const baseFileContent = readFileSync(baseContentPath, 'utf-8');
  content = JSON.parse(baseFileContent);
  
  // Vérifier si un template spécifique doit être utilisé
  const currentTemplate = (content as any)._template;
  if (currentTemplate && currentTemplate !== 'soliva') {
    const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
    if (existsSync(templateContentPath)) {
      const templateFileContent = readFileSync(templateContentPath, 'utf-8');
      content = JSON.parse(templateFileContent);
      activeFilePath = templateContentPath;
    }
  }
  
  // Extraire uniquement les métadonnées (sans contenu HTML complet)
  const metadata = {
    _template: content._template,
    _transitionConfig: (content as any)._transitionConfig || content.metadata?._transitionConfig,
    metadata: content.metadata,
    nav: content.nav,
    footer: content.footer,
    home: {
      hero: content.home?.hero,
      title: content.home?.title,
      description: content.home?.description,
      blocks: content.home?.blocks || []
    },
    studio: {
      hero: content.studio?.hero,
      title: content.studio?.title,
      description: content.studio?.description,
      blocks: content.studio?.blocks || []
    },
    contact: {
      hero: content.contact?.hero,
      sections: content.contact?.sections,
      socials: content.contact?.socials,
      briefGenerator: content.contact?.briefGenerator
    },
    work: {
      hero: content.work?.hero,
      description: content.work?.description,
      filters: content.work?.filters || [],
      columns: content.work?.columns,
      adminProjects: (content.work?.adminProjects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        excerpt: project.excerpt || project.description?.substring(0, 200),
        category: project.category,
        image: project.image,
        status: project.status,
        publishedAt: project.publishedAt,
        client: project.client,
        year: project.year,
        featured: project.featured
      })),
      projects: (content.work?.projects || []).map((project: any) => ({
        title: project.title,
        slug: project.slug,
        description: project.description?.substring(0, 200),
        category: project.category,
        image: project.image,
        alt: project.alt
      }))
    },
    blog: {
      hero: content.blog?.hero,
      description: content.blog?.description,
      articles: (content.blog?.articles || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || article.content?.substring(0, 200),
        publishedAt: article.publishedAt,
        status: article.status
      }))
    },
    pages: content.pages
  };
  
  // ✅ OPTIMISATION : Mettre en cache le résultat avec le timestamp du fichier
  try {
    const fileStats = statSync(activeFilePath);
    metadataCache = metadata;
    cacheTimestamp = fileStats.mtimeMs;
    cacheFilePath = activeFilePath;
  } catch (error) {
    // Erreur silencieuse, on continue sans cache
  }
  
  return metadata;
}

/**
 * Invalide le cache (utile après une sauvegarde)
 */
export function invalidateMetadataCache(): void {
  metadataCache = null;
  cacheTimestamp = 0;
  cacheFilePath = null;
}

