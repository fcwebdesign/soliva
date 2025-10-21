import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { Content } from '@/types/content';
import { cleanContentLinks } from '@/utils/cleanLinks';
import { logger } from '@/utils/logger';

export const runtime = "nodejs";

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
 * Lit et parse le JSON, fait une validation minimale
 * Lève une erreur claire si les clés de pages utilisées sont manquantes
 */
export async function readContent(): Promise<Content> {
  try {
    logger.debug('📖 Lecture du fichier content.json...');
    
    // S'assurer que le fichier existe
    await ensureDataFile();
    
    // Lire le fichier
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    logger.debug('📄 Fichier lu, taille:', fileContent.length, 'caractères');
    
    const content: Content = JSON.parse(fileContent);
    logger.debug('✅ JSON parsé avec succès');
    
    // Nettoyer les liens internes qui ont target="_blank" incorrectement
    const cleanedContent = cleanContentLinks(content);
    logger.debug('🔧 Liens internes nettoyés');
    
    // Validation plus souple - fusionner avec le seed si des pages manquent
    const requiredPages = ['home', 'contact', 'studio', 'work', 'blog', 'nav', 'metadata'];
    const missingPages = requiredPages.filter(page => !(page in cleanedContent));
    
    if (missingPages.length > 0) {
      logger.warn('⚠️ Pages manquantes détectées:', missingPages);
      logger.info('🔄 Fusion avec le seed pour les pages manquantes...');
      
      // Fusionner avec le seed pour les pages manquantes
      const mergedContent = { ...SEED_DATA, ...cleanedContent };
      
      // Sauvegarder la version fusionnée
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
      logger.info('✅ Fichier mis à jour avec les pages manquantes');
      
      return mergedContent;
    }
    
    // Validation des sections critiques (plus souple)
    if (!cleanedContent.home?.hero?.title) {
      logger.debug('⚠️ home.hero.title manquant, utilisation du seed');
      const mergedContent = { ...SEED_DATA, ...cleanedContent };
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
      return mergedContent;
    }
    
    if (!cleanedContent.nav?.items || !Array.isArray(cleanedContent.nav.items)) {
      logger.debug('⚠️ nav.items manquant ou invalide, utilisation du seed');
      logger.debug('🔍 cleanedContent.nav:', JSON.stringify(cleanedContent.nav, null, 2));
      const mergedContent = { ...SEED_DATA, ...cleanedContent };
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(mergedContent, null, 2), 'utf-8');
      return mergedContent;
    }
    
    logger.debug('✅ nav.items valide:', JSON.stringify(cleanedContent.nav.items, null, 2));
    
    logger.debug('✅ Validation réussie, retour du contenu');
    return cleanedContent;
  } catch (error) {
    logger.error('❌ Erreur dans readContent:', error);
    
    if (error instanceof SyntaxError) {
      logger.debug('🔄 Erreur de syntaxe JSON, recréation du fichier...');
      // Recréer le fichier avec le seed
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      return SEED_DATA;
    }
    
    if (error instanceof Error) {
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

// Lock léger en mémoire pour éviter les writes concurrents
let isWriting = false;

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

    // Créer le dossier versions s'il n'existe pas
    const versionsDir = join(process.cwd(), 'data', 'versions');
    await fs.mkdir(versionsDir, { recursive: true });

    // Sauvegarder la version actuelle
    try {
      const currentContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = join(versionsDir, `content-${timestamp}.json`);
      
      await fs.writeFile(backupPath, currentContent, 'utf-8');
      logger.debug(`✅ Version sauvegardée: ${backupPath}`);

      // Nettoyage automatique : garder seulement les 15 plus récentes
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

        const MAX_VERSIONS = 15;
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
      logger.warn('⚠️ Impossible de sauvegarder la version actuelle:', error);
    }

    // Écriture atomique
    const tempPath = `${DATA_FILE_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(next, null, 2), 'utf-8');
    await fs.rename(tempPath, DATA_FILE_PATH);

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