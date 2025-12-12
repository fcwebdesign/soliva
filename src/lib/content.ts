
import { promises as fs } from 'fs';
import { join } from 'path';
// DÉSACTIVÉ : unstable_cache ne peut pas mettre en cache des objets > 2 MB
// import { unstable_cache, revalidateTag } from 'next/cache';
import type { Content } from '@/types/content';
import { cleanContentLinks } from '@/utils/cleanLinks';
import { logger } from '@/utils/logger';
import { cleanTypographyRecursive, isValidTypography } from '@/utils/clean-typography';
import { contentSchema, type ContentFromSchema } from './content-schema';

const DATA_FILE_PATH = join(process.cwd(), 'data', 'content.json');

// Seed data pour recréer le fichier si nécessaire
export const SEED_DATA: Content = {
  "metadata": {
    "title": "NextJS Page Transitions | Codegrid",
    "description": "NextJS Page Transitions | Codegrid"
  },
  "nav": {
    "logo": "soliva",
    "items": ["home", "work", "studio", "blog", "contact"],
    "location": "paris, le havre"
  },
  "home": {
    "hero": {
      "title": "soliva",
      "subtitle": "creative studio.\ndigital & brand strategy."
    }
  },
  "contact": {
    "hero": {
      "title": "Contact Us"
    },
    "sections": {
      "collaborations": {
        "title": "Collaborations",
        "email": "studio@nuvoro.com"
      },
      "inquiries": {
        "title": "Inquiries",
        "email": "support@nuvoro.com"
      }
    },
    "socials": ["Instagram", "Twitter", "LinkedIn"],
    "briefGenerator": {
      "placeholder": "Décris ton projet ici... Sois le plus détaillé possible pour un brief optimal.",
      "button": "Générer le brief",
      "loading": "Génération...",
      "resultTitle": "Brief généré :"
    }
  },
  "studio": {
    "hero": {
      "title": "Le studio"
    },
    "content": {
      "description": "At Nuvoro, we believe creativity isn't just a skill, a mindset. Born from a passion for bold ideas and beautifully crafted storytelling, we're a collective of designers, strategists, and dreamers who thrive at the intersection of art and innovation. Today, we collaborate with visionary clients around the world to shape identities,",
      "image": {
        "src": "/studio.jpg",
        "alt": "Team at work in Nuvoro's creative space"
      }
    }
  },
  "work": {
    "hero": {
      "title": "selected work"
    },
    "filters": ["All", "Strategy", "Brand", "Digital", "IA"],
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "projects": [
      {
        "title": "Project Alpha",
        "description": "Une identité de marque moderne pour une startup innovante dans le secteur de la technologie.",
        "category": "Brand",
        "image": "/img1.jpg",
        "alt": "Project Alpha",
        "slug": "project-1"
      },
      {
        "title": "Project Beta",
        "description": "Plateforme web interactive pour une exposition d'art contemporain.",
        "category": "Digital",
        "image": "/img2.jpg",
        "alt": "Project Beta",
        "slug": "project-2"
      },
      {
        "title": "Project Gamma",
        "description": "Stratégie de communication globale pour une entreprise de mode durable.",
        "category": "Strategy",
        "image": "/img3.jpg",
        "alt": "Project Gamma",
        "slug": "project-3"
      },
      {
        "title": "Project Delta",
        "description": "Application mobile pour la gestion de projets créatifs et collaboratifs.",
        "category": "Digital",
        "image": "/img4.jpg",
        "alt": "Project Delta",
        "slug": "project-4"
      }
    ]
  },
  "blog": {
    "hero": {
      "title": "Journal"
    },
    "description": "Réflexions, analyses et insights sur le design, la technologie et la stratégie digitale.",
    "articles": [
      {
        "id": "ecommerce-retour-relationnel",
        "title": "E-commerce : le retour du relationnel"
      },
      {
        "id": "sobriete-design-moins-plein-vue",
        "title": "La sobriété design : l'art de faire mieux avec moins"
      },
      {
        "id": "sortir-dependance-plateformes-audience-ne-vous-appartient-pas",
        "title": "Sortir de la dépendance aux plateformes : votre audience ne vous appartient pas"
      },
      {
        "id": "sites-vitrine-oublies-5-secondes",
        "title": "Pourquoi 80 % des sites vitrine sont oubliés 5 secondes après leur visite"
      },
      {
        "id": "slider-accueil-ne-sert-rien",
        "title": "Votre slider d'accueil ne sert à rien"
      },
      {
        "id": "site-lent-site-mort",
        "title": "Un site lent est un site mort"
      },
      {
        "id": "pourquoi-boutique-en-ligne-ne-vend-pas",
        "title": "Pourquoi votre boutique en ligne ne vend pas"
      },
      {
        "id": "mythe-theme-shopify-parfait",
        "title": "Le mythe du thème Shopify parfait"
      },
      {
        "id": "marques-misent-moins-mais-mieux",
        "title": "Les marques qui misent sur moins mais mieux"
      },
      {
        "id": "personnalisation-donnees-proprietaires-tendance-montante",
        "title": "La personnalisation et les données propriétaires : la tendance montante"
      },
      {
        "id": "si-ia-tuait-creativite-avant-sauver",
        "title": "Et si l'IA tuait la créativité… avant de la sauver ?"
      },
      {
        "id": "arretez-illustrer-posts-linkedin-images-sans-sens",
        "title": "Arrêtez d'illustrer vos posts LinkedIn avec des images qui n'ont aucun sens"
      },
      {
        "id": "prompts-parfaits-nexistent-pas",
        "title": "Les prompts parfaits n'existent pas"
      },
      {
        "id": "obsession-outils-probleme-pas-logiciel",
        "title": "L'obsession des outils : pourquoi le problème n'est pas votre logiciel"
      },
      {
        "id": "futur-branding-humain-augmente-remplace",
        "title": "Le futur du branding : humain, augmenté ou remplacé ?"
      },
      {
        "id": "faux-outils-ia-juste-scripts",
        "title": "Les faux outils 'IA' qui sont juste des scripts"
      },
      {
        "id": "reseaux-sociaux-ne-sont-pas-strategie",
        "title": "Les réseaux sociaux ne sont pas une stratégie"
      },
      {
        "id": "pourquoi-90-contenus-ia-se-ressemblent",
        "title": "Pourquoi 90 % des contenus IA se ressemblent"
      },
      {
        "id": "pourquoi-copier-branding-grandes-marques-erreur",
        "title": "Pourquoi copier le branding des grandes marques est une erreur"
      },
      {
        "id": "votre-logo-nest-pas-votre-marque",
        "title": "Votre logo n'est pas votre marque"
      },
      {
        "id": "ia-promesses-marketing-realite-technique",
        "title": "IA : entre promesses marketing et réalité technique"
      },
      {
        "id": "no-code-puissant-pas-magique",
        "title": "No-code : puissant, mais pas magique"
      },
      {
        "id": "ia-strategie-marque-arretez-copier-commencez-creer",
        "title": "IA et stratégie de marque : arrêtez de copier, commencez à créer"
      },
      {
        "id": "piege-tout-pour-algorithme",
        "title": "Le piège du 'tout pour l'algorithme'"
      },
      {
        "id": "arretez-vouloir-etre-partout",
        "title": "Arrêtez de vouloir être partout"
      },
      {
        "id": "tendances-graphiques-2025",
        "title": "Les tendances graphiques… pourquoi il faut parfois les ignorer"
      },
      {
        "id": "personnalisation-amazon-toutes-marques",
        "title": "La personnalisation à la Amazon arrive pour toutes les marques"
      }
    ]
  }
};

function validateContentSchema(raw: unknown): ContentFromSchema {
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    const errorMessage = `Content validation failed: ${issues}`;
    logger.error('❌ Erreur de validation Zod:', errorMessage);
    logger.error('❌ Détails des erreurs:', JSON.stringify(parsed.error.issues, null, 2));
    throw new Error(errorMessage);
  }
  return parsed.data;
}

/**
 * Crée le dossier /data et content.json avec le seed si absent
 * Ne remplace pas le fichier s'il existe déjà
 */
export async function ensureDataFile(): Promise<void> {
  try {
    // Vérifier si le fichier existe
    await fs.access(DATA_FILE_PATH);
    logger.debug('✅ Fichier content.json existe déjà');
  } catch {
    // Le fichier n'existe pas, créer le dossier et le fichier
    try {
      const dataDir = join(process.cwd(), 'data');
      await fs.mkdir(dataDir, { recursive: true });
      
      await fs.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(SEED_DATA, null, 2),
        'utf-8'
      );
      
      logger.info('✅ Fichier content.json créé avec le seed');
    } catch (error) {
      logger.error('❌ Erreur lors de la création du fichier content.json:', error);
      throw new Error('Impossible de créer le fichier content.json');
    }
  }
}

/**
 * Fonction interne pour lire le contenu (sans cache)
 */
async function _readContentInternal(): Promise<Content> {
  try {
    // ✅ DEBUG : Tracer d'où vient l'appel
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2] || 'unknown';
    logger.debug(`🔍 [readContent] Appelé depuis: ${caller}`);
    console.log(`🔍 [readContent] Appelé depuis:`, caller);
    
    // S'assurer que le fichier existe
    await ensureDataFile();
    
    logger.debug('📖 Lecture du fichier content.json...');
    
    // Lire le fichier
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    logger.debug('📄 Fichier lu, taille:', fileContent.length, 'caractères');
    
    const content: Content = JSON.parse(fileContent);
    logger.debug('✅ JSON parsé avec succès');
    
    // Nettoyer les liens internes qui ont target="_blank" incorrectement
    const cleanedContent = cleanContentLinks(content);
    logger.debug('🔧 Liens internes nettoyés');
    
    // PROTECTION CRITIQUE : Nettoyer typography au chargement pour éviter la corruption
    const cleanedContentWithTypography = cleanTypographyRecursive(cleanedContent);
    if (cleanedContentWithTypography !== cleanedContent) {
      logger.warn('⚠️ Typography corrompu détecté au chargement, nettoyage effectué');
    }
    
    // Validation plus souple - fusionner avec le seed si des pages manquent
    const requiredPages = ['home', 'contact', 'studio', 'work', 'blog', 'nav', 'metadata'];
    const missingPages = requiredPages.filter(page => !(page in cleanedContentWithTypography));
    
    if (missingPages.length > 0) {
      logger.warn('⚠️ Pages manquantes détectées:', missingPages);
      logger.info('🔄 Fusion avec le seed pour les pages manquantes...');
      
      // Fusionner avec le seed pour les pages manquantes
      const mergedContent = { ...SEED_DATA, ...cleanedContentWithTypography };
      
      // Sauvegarder la version fusionnée
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
      logger.info('✅ Fichier mis à jour avec les pages manquantes');
      
      return mergedContent;
    }
    
    // Validation des sections critiques (plus souple)
    if (!cleanedContentWithTypography.home?.hero?.title) {
      logger.debug('⚠️ home.hero.title manquant, utilisation du seed');
      const mergedContent = { ...SEED_DATA, ...cleanedContentWithTypography };
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
      return mergedContent;
    }
    
    if (!cleanedContentWithTypography.nav?.items || !Array.isArray(cleanedContentWithTypography.nav.items)) {
      logger.debug('⚠️ nav.items manquant ou invalide, utilisation du seed');
      logger.debug('🔍 cleanedContent.nav:', JSON.stringify(cleanedContentWithTypography.nav, null, 2));
      const mergedContent = { ...SEED_DATA, ...cleanedContentWithTypography };
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
      return mergedContent;
    }
    
    logger.debug('✅ nav.items valide:', JSON.stringify(cleanedContentWithTypography.nav.items, null, 2));
    
    const validated = validateContentSchema(cleanedContentWithTypography);
    
    logger.debug('✅ Validation réussie, retour du contenu');
    return validated as Content;
  } catch (error) {
    logger.error('❌ Erreur dans readContent:', error);
    
    if (error instanceof SyntaxError) {
      logger.debug('🔄 Erreur de syntaxe JSON, recréation du fichier...');
      // Recréer le fichier avec le seed
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      return SEED_DATA;
    }
    
    if (error instanceof Error) {
      // Si c'est une erreur de validation Zod, logger les détails
      if (error.message.includes('Content validation failed')) {
        logger.error('❌ Erreur de validation Zod détectée:', error.message);
        // Essayer de fusionner avec le seed pour réparer automatiquement
        try {
          logger.debug('🔄 Tentative de réparation automatique avec le seed...');
          const rawContent = JSON.parse(await fs.readFile(DATA_FILE_PATH, 'utf-8'));
          const mergedContent = { ...SEED_DATA, ...rawContent };
          // Réessayer la validation
          const validated = validateContentSchema(mergedContent);
          await fs.writeFile(DATA_FILE_PATH, JSON.stringify(validated, null, 2), 'utf-8');
          logger.info('✅ Fichier réparé automatiquement');
          return validated as Content;
        } catch (repairError) {
          logger.error('❌ Échec de la réparation automatique:', repairError);
          throw error; // Relancer l'erreur originale
        }
      }
      // Si c'est une erreur de validation, essayer de fusionner avec le seed
      if (error.message.includes('Pages manquantes') || error.message.includes('manquante')) {
        logger.debug('🔄 Erreur de validation, fusion avec le seed...');
        const mergedContent = { ...SEED_DATA, ...JSON.parse(await fs.readFile(DATA_FILE_PATH, 'utf-8')) };
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
        return mergedContent;
      }
      throw error;
    }
    
    throw new Error('Erreur inconnue lors de la lecture de content.json');
  }
}

/**
 * Lit et parse le JSON, fait une validation minimale
 * Lève une erreur claire si les clés de pages utilisées sont manquantes
 * OPTIMISATION : Utilise le cache React pour éviter de relire 475Mo à chaque requête
 */
export async function readContent(): Promise<Content> {
  // ✅ DEBUG : Tracer d'où vient l'appel à readContent()
  const stack = new Error().stack;
  const callerLines = stack?.split('\n').slice(1, 5) || [];
  console.log('🔍 [readContent] Appelé depuis:');
  callerLines.forEach((line, i) => {
    console.log(`  ${i + 1}. ${line.trim()}`);
  });
  
  return getCachedContent();
}

// Lock léger en mémoire pour éviter les writes concurrents
let isWriting = false;

// OPTIMISATION PERFORMANCE : Cache en mémoire pour éviter de relire 475Mo à chaque requête
let contentCache: { content: Content; mtime: number } | null = null;
let cacheFilePath: string | null = null;

// DÉSACTIVÉ : unstable_cache ne peut pas mettre en cache des objets > 2 MB
// Utilisation d'un cache en mémoire uniquement (pas de Data Cache Next.js)
const getCachedContent = async (): Promise<Content> => {
  // ✅ DEBUG : Tracer d'où vient l'appel à getCachedContent()
  const stack = new Error().stack;
  const callerLines = stack?.split('\n').slice(1, 5) || [];
  console.log('🔍 [getCachedContent] Appelé depuis:');
  callerLines.forEach((line, i) => {
    console.log(`  ${i + 1}. ${line.trim()}`);
  });
  
  // Vérifier le cache en mémoire d'abord
  try {
    const stats = await fs.stat(DATA_FILE_PATH);
    const currentMtime = stats.mtimeMs;
    
    // Si le cache existe et que le fichier n'a pas été modifié, retourner le cache
    if (contentCache && cacheFilePath === DATA_FILE_PATH && contentCache.mtime === currentMtime) {
      logger.debug('✅ Utilisation du cache (fichier non modifié)');
      console.log('✅ [getCachedContent] Cache utilisé, pas de lecture fichier');
      return contentCache.content;
    }
    
    console.log('⚠️ [getCachedContent] Cache invalide ou absent, lecture fichier nécessaire');
    
    // Mettre à jour le chemin du cache
    cacheFilePath = DATA_FILE_PATH;
  } catch {
    // Si on ne peut pas lire les stats, continuer sans cache
  }
  
  // Lire le contenu
  const content = await _readContentInternal();
  
  // Vérifier la taille du contenu
  const contentSize = Buffer.byteLength(JSON.stringify(content), 'utf8');
  if (contentSize > 2 * 1024 * 1024) {
    logger.warn(`⚠️ Contenu volumineux (${(contentSize / 1024 / 1024).toFixed(2)} MB), cache Data Cache désactivé`);
  }
  
  // Mettre en cache en mémoire uniquement (pas de Data Cache Next.js)
  try {
    const stats = await fs.stat(DATA_FILE_PATH);
    contentCache = {
      content,
      mtime: stats.mtimeMs
    };
    logger.debug('✅ Contenu mis en cache (mémoire uniquement)');
  } catch {
    // Si on ne peut pas lire les stats, continuer sans cache
  }
  
  return content;
};

/**
 * Écrit le contenu avec validation et versioning
 */
export async function writeContent(next: Content, opts?: { actor?: string }): Promise<void> {
  if (isWriting) {
    throw new Error('Une opération d\'écriture est déjà en cours');
  }

  try {
    isWriting = true;

    logger.debug('🔄 Début de writeContent, validation...');

    // Validation plus souple - fusionner avec le seed si des pages manquent
    const requiredPages = ['home', 'contact', 'studio', 'work', 'blog', 'nav', 'metadata'];
    const missingPages = requiredPages.filter(page => !(page in next));
    
    if (missingPages.length > 0) {
      logger.debug('⚠️ Pages manquantes détectées:', missingPages);
      logger.debug('🔄 Fusion avec le seed pour les pages manquantes...');
      
      // Fusionner avec le seed pour les pages manquantes
      const mergedContent: Content = { ...SEED_DATA, ...next };
      
      // Continuer avec le contenu fusionné
      next = mergedContent;
    }

    // Validation plus souple pour home.hero.title
    if (!next.home?.hero?.title) {
      logger.debug('⚠️ home.hero.title manquant, utilisation du seed');
      const mergedContent: Content = { ...SEED_DATA, ...next };
      next = mergedContent;
    }

    // Validation plus souple pour nav.items
    if (!next.nav?.items || !Array.isArray(next.nav.items)) {
      logger.debug('⚠️ nav.items manquant ou invalide, utilisation du seed');
      const mergedContent: Content = { ...SEED_DATA, ...next };
      next = mergedContent;
    }

    logger.debug('✅ Validation réussie, préparation de la sauvegarde...');

    // ✅ PROTECTION CRITIQUE : Validation complète pour éviter toutes les duplications
    // Liste des champs valides à la racine (selon Content interface)
    const validRootFields = new Set([
      '_template',
      '_templateVersion',
      'metadata',
      'nav',
      'home',
      'contact',
      'studio',
      'work',
      'blog',
      'footer',
      'pages',
      '_transitionConfig',
      'typography' // Peut exister à la racine pour certains templates
    ]);
    
    // Liste des champs suspects qui ne devraient JAMAIS être à la racine
    const suspiciousRootFields = ['colors', 'spacing', 'site', 'reveal'];
    
    // Vérifier tous les champs à la racine
    const rootKeys = Object.keys(next);
    const suspiciousKeys = ['_template', 'metadata', 'home', 'studio', 'work', 'blog', 'nav', 'footer', 'pages'];
    
    for (const key of rootKeys) {
      const value = (next as any)[key];
      
      // Ignorer les champs valides
      if (validRootFields.has(key)) {
        continue;
      }
      
      // Vérifier les champs suspects
      if (suspiciousRootFields.includes(key)) {
        const size = JSON.stringify(value).length;
        const valueKeys = typeof value === 'object' && value !== null && !Array.isArray(value) 
          ? Object.keys(value) 
          : [];
        const hasSuspiciousKeys = suspiciousKeys.some(sk => valueKeys.includes(sk));
        
        if (size > 100000 || hasSuspiciousKeys) {
          logger.warn(`⚠️ Champ "${key}" invalide détecté (${(size / 1024).toFixed(2)} KB, duplication probable), suppression automatique`);
          delete (next as any)[key];
        }
      }
      
      // Vérifier les champs inconnus qui pourraient être des duplications
      if (!validRootFields.has(key) && !suspiciousRootFields.includes(key)) {
        const size = JSON.stringify(value).length;
        const valueKeys = typeof value === 'object' && value !== null && !Array.isArray(value) 
          ? Object.keys(value) 
          : [];
        const hasSuspiciousKeys = suspiciousKeys.some(sk => valueKeys.includes(sk));
        
        // Si un champ inconnu contient des clés suspectes ET fait > 10 KB, c'est probablement une duplication
        if (hasSuspiciousKeys && size > 10000) {
          logger.warn(`⚠️ Champ inconnu "${key}" détecté avec structure suspecte (${(size / 1024).toFixed(2)} KB), suppression automatique`);
          delete (next as any)[key];
        }
      }
    }
    
    // ✅ PROTECTION : Vérifier les doublons dans les articles et projets
    if ((next as any).blog?.articles && Array.isArray((next as any).blog.articles)) {
      const articles = (next as any).blog.articles;
      const articleIds = new Set<string>();
      const articleSlugs = new Set<string>();
      const duplicates: Array<{ id: string; title: string; reason: string }> = [];
      
      for (const article of articles) {
        // Vérifier les IDs dupliqués
        if (article.id) {
          if (articleIds.has(article.id)) {
            duplicates.push({ id: article.id, title: article.title || 'Sans titre', reason: 'ID dupliqué' });
          } else {
            articleIds.add(article.id);
          }
        }
        
        // Vérifier les slugs dupliqués
        if (article.slug) {
          if (articleSlugs.has(article.slug)) {
            duplicates.push({ id: article.id || 'inconnu', title: article.title || 'Sans titre', reason: 'Slug dupliqué' });
          } else {
            articleSlugs.add(article.slug);
          }
        }
        
        // ✅ PROTECTION : Vérifier que les blocs ne contiennent pas de duplications
        if (article.blocks && Array.isArray(article.blocks)) {
          const blockIds = new Set<string>();
          const duplicateBlocks: string[] = [];
          
          for (const block of article.blocks) {
            if (block.id) {
              if (blockIds.has(block.id)) {
                duplicateBlocks.push(block.id);
              } else {
                blockIds.add(block.id);
              }
            }
          }
          
          if (duplicateBlocks.length > 0) {
            logger.warn(`⚠️ Blocs en double dans l'article "${article.title}":`, duplicateBlocks.join(', '));
            // Nettoyer les blocs en double en gardant le premier
            const uniqueBlocks = article.blocks.filter((block: any, index: number, self: any[]) => {
              if (!block.id) return true;
              const firstIndex = self.findIndex((b: any) => b.id === block.id);
              return firstIndex === index;
            });
            article.blocks = uniqueBlocks;
          }
          
          // ✅ PROTECTION : Vérifier la taille des blocs (ne devrait pas être énorme)
          const blocksSize = JSON.stringify(article.blocks).length;
          if (blocksSize > 500000) { // > 500 KB = suspect
            logger.warn(`⚠️ Blocs volumineux dans l'article "${article.title}" (${(blocksSize / 1024).toFixed(2)} KB), vérification recommandée`);
          }
        }
      }
      
      if (duplicates.length > 0) {
        logger.warn(`⚠️ Articles en double détectés (${duplicates.length}):`, duplicates.map(d => `${d.title} (${d.reason})`).join(', '));
        // Nettoyer les doublons en gardant le premier
        const uniqueArticles = articles.filter((article: any, index: number, self: any[]) => {
          if (!article.id) return true; // Garder les articles sans ID
          const firstIndex = self.findIndex((a: any) => a.id === article.id);
          return firstIndex === index;
        });
        (next as any).blog.articles = uniqueArticles;
        logger.info(`✅ Articles nettoyés: ${articles.length} → ${uniqueArticles.length}`);
      }
    }
    
    // ✅ PROTECTION : Vérifier les doublons dans les projets
    if ((next as any).work?.adminProjects && Array.isArray((next as any).work.adminProjects)) {
      const projects = (next as any).work.adminProjects;
      const projectIds = new Set<string>();
      const projectSlugs = new Set<string>();
      const duplicates: Array<{ id: string; title: string; reason: string }> = [];
      
      for (const project of projects) {
        // Vérifier les IDs dupliqués
        if (project.id) {
          if (projectIds.has(project.id)) {
            duplicates.push({ id: project.id, title: project.title || 'Sans titre', reason: 'ID dupliqué' });
          } else {
            projectIds.add(project.id);
          }
        }
        
        // Vérifier les slugs dupliqués
        if (project.slug) {
          if (projectSlugs.has(project.slug)) {
            duplicates.push({ id: project.id || 'inconnu', title: project.title || 'Sans titre', reason: 'Slug dupliqué' });
          } else {
            projectSlugs.add(project.slug);
          }
        }
        
        // ✅ PROTECTION : Vérifier que les blocs ne contiennent pas de duplications
        if (project.blocks && Array.isArray(project.blocks)) {
          const blockIds = new Set<string>();
          const duplicateBlocks: string[] = [];
          
          for (const block of project.blocks) {
            if (block.id) {
              if (blockIds.has(block.id)) {
                duplicateBlocks.push(block.id);
              } else {
                blockIds.add(block.id);
              }
            }
          }
          
          if (duplicateBlocks.length > 0) {
            logger.warn(`⚠️ Blocs en double dans le projet "${project.title}":`, duplicateBlocks.join(', '));
            // Nettoyer les blocs en double en gardant le premier
            const uniqueBlocks = project.blocks.filter((block: any, index: number, self: any[]) => {
              if (!block.id) return true;
              const firstIndex = self.findIndex((b: any) => b.id === block.id);
              return firstIndex === index;
            });
            project.blocks = uniqueBlocks;
          }
          
          // ✅ PROTECTION : Vérifier la taille des blocs (ne devrait pas être énorme)
          const blocksSize = JSON.stringify(project.blocks).length;
          if (blocksSize > 500000) { // > 500 KB = suspect
            logger.warn(`⚠️ Blocs volumineux dans le projet "${project.title}" (${(blocksSize / 1024).toFixed(2)} KB), vérification recommandée`);
          }
        }
      }
      
      if (duplicates.length > 0) {
        logger.warn(`⚠️ Projets en double détectés (${duplicates.length}):`, duplicates.map(d => `${d.title} (${d.reason})`).join(', '));
        // Nettoyer les doublons en gardant le premier
        const uniqueProjects = projects.filter((project: any, index: number, self: any[]) => {
          if (!project.id) return true; // Garder les projets sans ID
          const firstIndex = self.findIndex((p: any) => p.id === project.id);
          return firstIndex === index;
        });
        (next as any).work.adminProjects = uniqueProjects;
        logger.info(`✅ Projets nettoyés: ${projects.length} → ${uniqueProjects.length}`);
      }
    }
    
    // ✅ PROTECTION : Vérifier les doublons dans les pages custom
    if ((next as any).pages?.pages && Array.isArray((next as any).pages.pages)) {
      const customPages = (next as any).pages.pages;
      const pageIds = new Set<string>();
      const pageSlugs = new Set<string>();
      const duplicates: Array<{ id: string; title: string; reason: string }> = [];
      
      for (const page of customPages) {
        // Vérifier les IDs dupliqués
        if (page.id) {
          if (pageIds.has(page.id)) {
            duplicates.push({ id: page.id, title: page.title || 'Sans titre', reason: 'ID dupliqué' });
          } else {
            pageIds.add(page.id);
          }
        }
        
        // Vérifier les slugs dupliqués
        if (page.slug) {
          if (pageSlugs.has(page.slug)) {
            duplicates.push({ id: page.id || 'inconnu', title: page.title || 'Sans titre', reason: 'Slug dupliqué' });
          } else {
            pageSlugs.add(page.slug);
          }
        }
        
        // ✅ PROTECTION : Vérifier que les blocs ne contiennent pas de duplications
        if (page.blocks && Array.isArray(page.blocks)) {
          const blockIds = new Set<string>();
          const duplicateBlocks: string[] = [];
          
          for (const block of page.blocks) {
            if (block.id) {
              if (blockIds.has(block.id)) {
                duplicateBlocks.push(block.id);
              } else {
                blockIds.add(block.id);
              }
            }
          }
          
          if (duplicateBlocks.length > 0) {
            logger.warn(`⚠️ Blocs en double dans la page "${page.title}":`, duplicateBlocks.join(', '));
            // Nettoyer les blocs en double en gardant le premier
            const uniqueBlocks = page.blocks.filter((block: any, index: number, self: any[]) => {
              if (!block.id) return true;
              const firstIndex = self.findIndex((b: any) => b.id === block.id);
              return firstIndex === index;
            });
            page.blocks = uniqueBlocks;
          }
          
          // ✅ PROTECTION : Vérifier la taille des blocs (ne devrait pas être énorme)
          const blocksSize = JSON.stringify(page.blocks).length;
          if (blocksSize > 500000) { // > 500 KB = suspect
            logger.warn(`⚠️ Blocs volumineux dans la page "${page.title}" (${(blocksSize / 1024).toFixed(2)} KB), vérification recommandée`);
          }
        }
      }
      
      if (duplicates.length > 0) {
        logger.warn(`⚠️ Pages custom en double détectées (${duplicates.length}):`, duplicates.map(d => `${d.title} (${d.reason})`).join(', '));
        // Nettoyer les doublons en gardant le premier
        const uniquePages = customPages.filter((page: any, index: number, self: any[]) => {
          if (!page.id) return true; // Garder les pages sans ID
          const firstIndex = self.findIndex((p: any) => p.id === page.id);
          return firstIndex === index;
        });
        (next as any).pages.pages = uniquePages;
        logger.info(`✅ Pages custom nettoyées: ${customPages.length} → ${uniquePages.length}`);
      }
    }
    
    // ✅ PROTECTION : Vérifier pinnedSystem (pages système épinglées)
    if ((next as any).pages?.pinnedSystem && Array.isArray((next as any).pages.pinnedSystem)) {
      const pinnedSystem = (next as any).pages.pinnedSystem;
      const pinnedIds = new Set<string>();
      const duplicates: string[] = [];
      
      for (const pageId of pinnedSystem) {
        if (pinnedIds.has(pageId)) {
          duplicates.push(pageId);
        } else {
          pinnedIds.add(pageId);
        }
      }
      
      if (duplicates.length > 0) {
        logger.warn(`⚠️ Pages système dupliquées dans pinnedSystem:`, duplicates.join(', '));
        // Nettoyer les doublons en gardant le premier
        const uniquePinned = pinnedSystem.filter((pageId: string, index: number, self: string[]) => {
          const firstIndex = self.indexOf(pageId);
          return firstIndex === index;
        });
        (next as any).pages.pinnedSystem = uniquePinned;
        logger.info(`✅ Pages système nettoyées: ${pinnedSystem.length} → ${uniquePinned.length}`);
      }
    }
    
    // ✅ PROTECTION ADDITIONNELLE : Vérifier la taille totale du contenu
    const totalSize = JSON.stringify(next).length;
    if (totalSize > 5000000) { // > 5 MB = problème (devrait être < 1 MB normalement)
      logger.warn(`⚠️ Contenu volumineux détecté (${(totalSize / 1024 / 1024).toFixed(2)} MB), vérification recommandée`);
      
      // Analyser les sections les plus volumineuses
      const sectionSizes: Array<{ key: string; size: number }> = [];
      for (const key of rootKeys) {
        if (validRootFields.has(key)) {
          const size = JSON.stringify((next as any)[key]).length;
          if (size > 100000) { // > 100 KB
            sectionSizes.push({ key, size });
          }
        }
      }
      
      if (sectionSizes.length > 0) {
        logger.warn('⚠️ Sections volumineuses détectées:', sectionSizes.map(s => `${s.key}: ${(s.size / 1024).toFixed(2)} KB`).join(', '));
      }
    }
    
    if (totalSize > 50000000) { // > 50 MB = erreur bloquante
      logger.error('❌ ERREUR CRITIQUE: Contenu trop volumineux (>50MB), sauvegarde bloquée');
      throw new Error('Le contenu est trop volumineux. Vérifiez les duplications avant de sauvegarder.');
    }

    // PROTECTION CRITIQUE : Nettoyer typography avant de sauvegarder pour éviter la corruption
    const metadata = (next as any).metadata;
    if (metadata?.typography) {
      if (!isValidTypography(metadata.typography)) {
        logger.warn('⚠️ Typography corrompu détecté dans le contenu à sauvegarder, nettoyage...');
        next = cleanTypographyRecursive(next) as Content;
      } else {
        // Vérifier aussi la taille (typography ne devrait jamais faire >100Ko)
        const typoSize = JSON.stringify(metadata.typography).length;
        if (typoSize > 100 * 1024) {
          logger.warn(`⚠️ Typography trop volumineux (${(typoSize / 1024).toFixed(0)}Ko), nettoyage préventif...`);
          next = cleanTypographyRecursive(next) as Content;
        }
      }
    }
    
    // ✅ PROTECTION : Vérifier les duplications dans metadata
    // metadata peut contenir nav et footer (configuration normale), mais pas de duplication complète
    if (metadata) {
      const metadataKeys = Object.keys(metadata);
      const suspiciousKeys = ['_template', 'home', 'studio', 'work', 'blog', 'pages'];
      
      // Vérifier si metadata contient des clés qui indiquent une duplication complète
      // Si plusieurs clés suspectes sont présentes ET qu'elles sont volumineuses, c'est une duplication
      const foundSuspicious = suspiciousKeys.filter(sk => metadataKeys.includes(sk));
      
      if (foundSuspicious.length > 0) {
        // Vérifier la taille de chaque clé suspecte
        for (const sk of foundSuspicious) {
          if (metadata[sk]) {
            const size = JSON.stringify(metadata[sk]).length;
            if (size > 10000) { // > 10 KB = probablement une duplication
              logger.warn(`⚠️ Duplication détectée dans metadata.${sk} (${(size / 1024).toFixed(2)} KB), suppression automatique`);
              delete metadata[sk];
            }
          }
        }
      }
      
      // Vérifier la taille totale de metadata (ne devrait pas être énorme)
      const metadataSize = JSON.stringify(metadata).length;
      if (metadataSize > 500000) { // > 500 KB = suspect
        logger.warn(`⚠️ Metadata trop volumineux (${(metadataSize / 1024).toFixed(2)} KB), vérification recommandée`);
      }
    }
    
    // Nettoyer aussi récursivement au cas où typography serait ailleurs (reveal.typography, etc.)
    next = cleanTypographyRecursive(next) as Content;
    
    // Vérification finale : compter les occurrences de typography (ne devrait pas y en avoir beaucoup)
    const contentStr = JSON.stringify(next);
    const typographyCount = (contentStr.match(/"typography"/g) || []).length;
    if (typographyCount > 10) {
      logger.error(`🚨 ALERTE: ${typographyCount} occurrences de typography détectées ! Corruption probable !`);
      logger.error('🔄 Nettoyage récursif complet...');
      next = cleanTypographyRecursive(next) as Content;
    }

    // OPTIMISATION PERFORMANCE : Vérifier la taille du fichier avant de faire le backup
    // Pour les gros fichiers (>50Mo), on désactive le versioning pour éviter les blocages
    let shouldVersion = true;
    let currentContentForBackup: string | null = null;
    try {
      const stats = await fs.stat(DATA_FILE_PATH);
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        shouldVersion = false;
        logger.warn(`⚠️ Fichier trop volumineux (${fileSizeMB.toFixed(1)}Mo), versioning désactivé pour cette sauvegarde`);
      } else {
        // Lire le contenu actuel AVANT de le modifier (pour le backup)
        currentContentForBackup = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      }
    } catch {
      // Si le fichier n'existe pas encore, on peut versionner
    }

    // Écriture atomique (priorité : sauvegarder rapidement)
    const tempPath = `${DATA_FILE_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(next, null, 2), 'utf-8');
    await fs.rename(tempPath, DATA_FILE_PATH);

    // OPTIMISATION PERFORMANCE : Invalider le cache en mémoire après écriture
    // CRITIQUE : Invalider le cache pour que le front reçoive les nouvelles données
    contentCache = null;
    cacheFilePath = null;
    logger.debug('✅ Cache mémoire invalidé');

    // Versioning asynchrone APRÈS la sauvegarde (ne bloque pas)
    const versionsDir = join(process.cwd(), 'data', 'versions');
    if (shouldVersion && currentContentForBackup) {
      // Lancer le versioning en arrière-plan sans attendre
      (async () => {
        try {
          await fs.mkdir(versionsDir, { recursive: true });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const backupPath = join(versionsDir, `content-${timestamp}.json`);
          
          await fs.writeFile(backupPath, currentContentForBackup!, 'utf-8');
          logger.debug(`✅ Version sauvegardée: ${backupPath}`);

          // Nettoyage automatique : garder seulement les 10 plus récentes (réduit de 15 à 10)
          try {
            const files = await fs.readdir(versionsDir);
            const versionFiles = files
              .filter(file => file.startsWith('content-') && file.endsWith('.json'))
              .map(file => ({
                name: file,
                path: join(versionsDir, file),
                timestamp: file.replace('content-', '').replace('.json', '')
              }))
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

            const MAX_VERSIONS = 10;
            const toDelete = versionFiles.slice(MAX_VERSIONS);

            for (const file of toDelete) {
              await fs.unlink(file.path);
            }

            if (toDelete.length > 0) {
              logger.debug(`🧹 Auto-nettoyage: ${toDelete.length} anciennes versions supprimées`);
            }
          } catch (cleanupError) {
            logger.warn('⚠️ Erreur lors du nettoyage automatique:', cleanupError);
          }
        } catch (error) {
          logger.warn('⚠️ Erreur lors du versioning asynchrone:', error);
        }
      })().catch(err => {
        logger.warn('⚠️ Erreur dans le versioning asynchrone:', err);
      });
    }

    logger.debug(`✅ Contenu mis à jour par ${opts?.actor || 'admin'}`);
  } catch (error) {
    logger.error('❌ Erreur dans writeContent:', error);
    logger.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // En cas d'erreur critique, essayer de restaurer depuis le seed
    try {
      logger.debug('🔄 Tentative de restauration depuis le seed...');
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      logger.debug('✅ Restauration depuis le seed réussie');
    } catch (restoreError) {
      logger.error('❌ Impossible de restaurer depuis le seed:', restoreError);
    }
    
    throw error;
  } finally {
    isWriting = false;
  }
}

/**
 * Liste les versions disponibles
 */
export async function listVersions(): Promise<Array<{ filename: string; createdAt: string }>> {
  const versionsDir = join(process.cwd(), 'data', 'versions');
  
  try {
    await fs.access(versionsDir);
  } catch {
    return [];
  }

  const files = await fs.readdir(versionsDir);
  const versions = [];

  for (const file of files) {
    if (file.startsWith('content-') && file.endsWith('.json')) {
      const stat = await fs.stat(join(versionsDir, file));
      versions.push({
        filename: file,
        createdAt: stat.mtime.toISOString(),
      });
    }
  }

  return versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Revient à une version donnée
 */
export async function revertTo(filename: string): Promise<void> {
  const versionsDir = join(process.cwd(), 'data', 'versions');
  const versionPath = join(versionsDir, filename);

  // Vérifier que le fichier existe
  try {
    await fs.access(versionPath);
  } catch {
    throw new Error(`Version ${filename} introuvable`);
  }

  // Lire la version
  const versionContent = await fs.readFile(versionPath, 'utf-8');
  const content: Content = JSON.parse(versionContent);

  // Valider la version
  const requiredPages = ['home', 'contact', 'studio', 'work', 'blog', 'nav', 'metadata'];
  const missingPages = requiredPages.filter(page => !(page in content));
  
  if (missingPages.length > 0) {
    throw new Error(`Version invalide: pages manquantes ${missingPages.join(', ')}`);
  }

  // Sauvegarder l'état actuel avant de revenir
  try {
    const currentContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = join(versionsDir, `content-before-revert-${timestamp}.json`);
    await fs.writeFile(backupPath, currentContent, 'utf-8');
  } catch (error) {
    logger.warn('⚠️ Impossible de sauvegarder avant revert:', error);
  }

  // Restaurer la version
  await writeContent(content, { actor: 'revert' });
  logger.debug(`✅ Revenu à la version: ${filename}`);
} 
