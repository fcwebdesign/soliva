import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { invalidateMetadataCache } from '@/lib/load-template-metadata';
import type { Content } from '@/types/content';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import getContentRepository from '@/content/getRepository';
import type { ContentMode } from '@/content/store/types';
import { PrismaClient, ContentStatus, ProjectVisibility } from '@prisma/client';

export const runtime = "nodejs";

async function buildContentFromStore(siteKey: string) {
  const repo = getContentRepository();
  const prisma = new PrismaClient();

  // metadata + globals
  const meta = await repo.getMetadata(siteKey);
  const navItems = await repo.getNavigation(siteKey);
  const footerRecord = await repo.getFooter(siteKey);

  const mapNav = navItems.map((n: any) => n.url?.replace(/^\//, '') || '').filter(Boolean);

  // pages clés
  const home = await repo.getPageBySlug(siteKey, 'home');
  const contact = await repo.getPageBySlug(siteKey, 'contact');
  const studio = await repo.getPageBySlug(siteKey, 'studio');
  const workPage = await repo.getPageBySlug(siteKey, 'work');
  const blogPage = await repo.getPageBySlug(siteKey, 'blog');

  // Pages custom (toutes les pages hors core slugs)
  const coreSlugs = ['home', 'contact', 'studio', 'work', 'blog'];
  let customPages: any[] = [];
  try {
    const site = await prisma.site.findUnique({ where: { key: siteKey } });
    if (site) {
      const pages = await prisma.page.findMany({
        where: { siteId: site.id, slug: { notIn: coreSlugs } },
        orderBy: [{ title: 'asc' }, { slug: 'asc' }],
      });
      customPages = pages.map((p) => ({
        id: p.slug || p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        hero: p.hero,
        blocks: p.blocks,
        seo: p.seo,
        status: p.status,
      }));
    }
  } catch (e) {
    console.warn('⚠️ Impossible de charger les pages custom pour', siteKey, e);
  } finally {
    await prisma.$disconnect();
  }

  // articles / projects
  const articlesRes = await repo.listArticles(siteKey, { limit: 500, status: 'published' });
  const projectsRes = await repo.listProjects(siteKey, { limit: 500, status: 'published', visibility: 'public' });
  const adminProjectsRes = await repo.listProjects(siteKey, { limit: 500, status: 'published', visibility: 'admin' });

  // Nav (items + identité) depuis BDD
  const navMeta = (meta?.metadata as any)?.nav || {};
  const nav = {
    logo: navMeta.logo || meta?.metadata?.title || siteKey,
    logoImage: navMeta.logoImage || '',
    location: navMeta.location || '',
    headerVariant: navMeta.headerVariant,
    pageLabels: navMeta.pageLabels || {},
    items: navItems.map((n: any) => {
      // Conserver l'URL telle quelle pour les externes, retirer le leading slash pour les internes
      const isExternal = n.isExternal || /^https?:\/\//i.test(n.url || '');
      const cleanUrl = isExternal ? n.url : (n.url || '').replace(/^\//, '');
      return cleanUrl || '';
    }).filter(Boolean),
  };
  // Si aucun item en base, fallback sur meta.nav.items éventuel
  if (!nav.items.length && (meta as any)?.nav?.items) {
    nav.items = (meta as any).nav.items;
  }
  // Ajouter les labels depuis les enregistrements NavigationItem si pageLabels vide
  if (navItems.length && Object.keys(nav.pageLabels).length === 0) {
    navItems.forEach((n: any) => {
      const key = (n.url || '').replace(/^\//, '');
      if (key) nav.pageLabels[key] = n.label || key;
    });
  }

  const content: any = {
    metadata: meta?.metadata || {},
    nav: {
      ...nav,
      // compat ancienne structure
      items: nav.items.length ? nav.items : mapNav,
      pageLabels: nav.pageLabels || {},
    },
    footer: (() => {
      if (!footerRecord) return undefined;
      const cols = (footerRecord as any).columns || {};
      const socials = (footerRecord as any).socials || cols.socialLinks || [];
      const description = cols.description || (footerRecord as any).content || '';
      const footerVariant = cols.footerVariant || cols.variant || (footerRecord as any).footerVariant || 'classic';
      return {
        ...cols,
        description,
        footerVariant,
        socialLinks: socials,
      };
    })(),
    home: home || {},
    contact: contact || {},
    studio: studio || {},
    work: {
      ...(workPage || {}),
      projects: projectsRes.items,
      adminProjects: adminProjectsRes.items,
    },
    blog: {
      ...(blogPage || {}),
      articles: articlesRes.items,
    },
    _template: meta?.activeTheme || siteKey,
    typography: meta?.typography || meta?.metadata?.typography || {},
    // garder compat typographie/spacing/palettes
    ...meta,
  };

  // Injecter les pages custom (admin/pages)
  if (customPages.length) {
    content.pages = {
      ...(content as any).pages,
      pages: customPages,
    };
  }

  return content;
}

export async function GET(req: NextRequest) {
  try {
    const siteKey = req.nextUrl.searchParams.get('site') || 'soliva';
    const mode = (process.env.CONTENT_MODE as ContentMode) || 'json';

    // Si mode JSON, on garde l'ancien comportement (lecture fichier), sinon on reconstruit via repo (DB/dual)
    const content = mode === 'json'
      ? await readContent()
      : await buildContentFromStore(siteKey);

    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('❌ API: Erreur lors de la lecture du contenu:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // Extraire les détails de l'erreur de manière plus claire
    let errorDetails = error instanceof Error ? error.message : 'Erreur inconnue';
    let errorStack = error instanceof Error ? error.stack : undefined;
    
    // Si c'est une erreur de validation Zod, extraire les détails
    if (error instanceof Error && error.message.includes('Content validation failed')) {
      errorDetails = error.message;
      console.error('❌ API: Erreur de validation Zod détectée:', errorDetails);
    }
    
    // Toujours retourner les détails en développement, et aussi en production pour les erreurs de validation
    const isDev = process.env.NODE_ENV === 'development';
    const isValidationError = error instanceof Error && error.message.includes('Content validation failed');
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la lecture du contenu',
        details: errorDetails,
        stack: (isDev || isValidationError) ? errorStack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Le champ "content" est requis' },
        { status: 400 }
      );
    }

    const content: Content = body.content;
    const currentTemplate = content._template || 'soliva';
    const mode = (process.env.CONTENT_MODE as ContentMode) || 'json';
    
    // Prévenir les validations Zod sur work.filters manquant
    if (content.work) {
      (content.work as any).filters = Array.isArray((content.work as any).filters)
        ? (content.work as any).filters
        : [];
    }
    // Garantir que palettes est un tableau (sinon validation/fallback)
    if (!(Array.isArray((content as any).palettes))) {
      (content as any).palettes = [];
    }
    
    console.log('🔄 API: Tentative d\'écriture du contenu...');
    console.log('📊 Taille du contenu:', JSON.stringify(content).length, 'caractères');
    console.log('🎨 Template/Site actuel:', currentTemplate, 'mode:', mode);

    // Helper conversion status
    const toStatus = (s?: string) => (s && ContentStatus[s as keyof typeof ContentStatus]) || ContentStatus.published;

    if (mode === 'json') {
      // Comportement historique fichier
      if (currentTemplate && currentTemplate !== 'soliva') {
        console.log(`📁 Sauvegarde template "${currentTemplate}" (fichier)`);
        const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
        const templateDir = join(process.cwd(), 'data', 'templates', currentTemplate);
        if (!existsSync(templateDir)) mkdirSync(templateDir, { recursive: true });
        await writeContent(content, { actor: 'admin-api' });
        const validatedContent = await readContent();
        writeFileSync(templateContentPath, JSON.stringify(validatedContent, null, 2));
        await writeContent(content, { actor: 'admin-api' });
      } else {
        console.log('📁 Sauvegarde fichier content.json');
        await writeContent(content, { actor: 'admin-api' });
      }
      invalidateMetadataCache();
      return NextResponse.json(content, { status: 200 });
    }

    // Modes db / dual_write : écrire en base (et optionnellement fichier si dual_write)
    const prisma = new PrismaClient();
    const siteKey = currentTemplate;
    
    // Variables pour les résultats (déclarées avant le try pour être accessibles après)
    let publicResult: { successCount: number; errorCount: number } = { successCount: 0, errorCount: 0 };
    let adminResult: { successCount: number; errorCount: number } = { successCount: 0, errorCount: 0 };
    let totalSuccess = 0;
    let totalErrors = 0;
    
    try {
      // Fusionner metadata nav (logo/labels/identity)
      const navMeta = {
        logo: (content as any).nav?.logo || (content as any).metadata?.title || currentTemplate,
        logoImage: (content as any).nav?.logoImage || '',
        location: (content as any).nav?.location || '',
        headerVariant: (content as any).nav?.headerVariant,
        pageLabels: (content as any).nav?.pageLabels || {},
      };

      const site = await prisma.site.upsert({
        where: { key: siteKey },
        update: {
          activeTheme: currentTemplate,
          metadata: {
            ...(content.metadata || {}),
            nav: {
              ...(content as any).metadata?.nav,
              ...navMeta,
            },
          } as any,
          typography: (content as any).typography || {},
          spacing: (content as any).spacing || {},
          palettes: (content as any).palettes || [],
          transitions: (content as any).transitions || {},
        },
        create: {
          key: siteKey,
          name: siteKey,
          activeTheme: currentTemplate,
          metadata: {
            ...(content.metadata || {}),
            nav: {
              ...(content as any).metadata?.nav,
              ...navMeta,
            },
          } as any,
          typography: (content as any).typography || {},
          spacing: (content as any).spacing || {},
          palettes: (content as any).palettes || [],
          transitions: (content as any).transitions || {},
        },
      });

      // Navigation
      if (content.nav?.items) {
        await prisma.navigationItem.deleteMany({ where: { siteId: site.id } });
        const navData = content.nav as any;
        const items = content.nav.items
          .map((i: any, idx: number) => {
            const isExternal = typeof i === 'string' && /^https?:\/\//i.test(i);
            const cleanKey = typeof i === 'string' ? i.replace(/^\//, '') : '';
            const label = navData?.pageLabels?.[cleanKey] || cleanKey || i || '';
            const url = isExternal ? i : (cleanKey === 'home' ? '/' : `/${cleanKey}`);
            if (!url) return null;
            return {
              siteId: site.id,
              label,
              url,
              orderIndex: idx,
              isExternal: !!isExternal,
            };
          })
          .filter(Boolean) as any[];
        if (items.length) await prisma.navigationItem.createMany({ data: items });
      }

      // Footer
      if (content.footer) {
        const footerData = content.footer as any;
        await prisma.footer.upsert({
          where: { siteId: site.id },
          update: {
            content: footerData.description || footerData.content || '',
            socials: footerData.socialLinks || footerData.socials || [],
            columns: {
              ...footerData,
            },
          },
          create: {
            siteId: site.id,
            content: footerData.description || footerData.content || '',
            socials: footerData.socialLinks || footerData.socials || [],
            columns: {
              ...footerData,
            },
          },
        });
      }

      // Pages clés
      const corePages = ['home', 'contact', 'studio', 'work', 'blog'] as const;
      for (const slug of corePages) {
        const data = (content as any)[slug];
        if (!data) continue;
        await prisma.page.upsert({
          where: { siteId_slug: { siteId: site.id, slug } },
          update: {
            title: data.title || '',
            description: data.description || '',
            hero: data.hero || {},
            blocks: data.blocks || [],
            seo: data.seo || {},
            status: ContentStatus.published,
          },
          create: {
            siteId: site.id,
            slug,
            title: data.title || '',
            description: data.description || '',
            hero: data.hero || {},
            blocks: data.blocks || [],
            seo: data.seo || {},
            status: ContentStatus.published,
          },
        });
      }

      // Pages custom éventuelles
      const customPages = (content as any).pages?.pages || [];
      for (const p of customPages) {
        const slug = p.slug || p.id;
        if (!slug) continue;
        await prisma.page.upsert({
          where: { siteId_slug: { siteId: site.id, slug } },
          update: {
            title: p.title || '',
            description: p.description || '',
            hero: p.hero || {},
            blocks: p.blocks || [],
            seo: p.seo || {},
            status: toStatus(p.status),
          },
          create: {
            siteId: site.id,
            slug,
            title: p.title || '',
            description: p.description || '',
            hero: p.hero || {},
            blocks: p.blocks || [],
            seo: p.seo || {},
            status: toStatus(p.status),
          },
        });
      }

      // Articles
      const articles = (content.blog as any)?.articles || [];
      await prisma.article.deleteMany({ where: { siteId: site.id } });
      if (articles.length) {
        await prisma.article.createMany({
          data: articles.map((a: any) => ({
            siteId: site.id,
            slug: a.slug || a.id,
            title: a.title || a.id || 'Article',
            excerpt: a.excerpt || '',
            coverImage: a.coverImage || '',
            content: a.content || '',
            blocks: a.blocks || [],
            seo: a.seo || {},
            status: toStatus(a.status),
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
          })),
        });
      }

      // Projects public
      const projects = (content.work as any)?.projects || [];
      // Projects admin
      const adminProjects = (content.work as any)?.adminProjects || [];
      
      console.log(`📦 Traitement de ${projects.length} projets public et ${adminProjects.length} projets admin`);
      
      // Utiliser upsert pour chaque projet individuellement (plus robuste que deleteMany + createMany)
      const processProjects = async (arr: any[], visibility: ProjectVisibility) => {
        const seen = new Set<string>();
        let successCount = 0;
        let errorCount = 0;
        
        for (const proj of arr) {
          const newSlug = proj.slug || proj.title?.toLowerCase().replace(/\s+/g, '-') || `proj-${Date.now()}`;
          const key = `${site.id}:${newSlug}`;
          
          // Éviter les doublons dans le même batch
          if (seen.has(key)) {
            continue;
          }
          seen.add(key);
          
          try {
            // ✅ CRITIQUE : Chercher le projet existant par son slug actuel en BDD
            // Si le slug dans le JSON est différent, on doit trouver le projet existant
            // et le mettre à jour avec le nouveau slug ET le nouveau titre
            
            // 1. Chercher par le slug explicite du projet (le plus fiable)
            let existingProject = proj.slug 
              ? await prisma.project.findFirst({
                  where: {
                    siteId: site.id,
                    slug: proj.slug,
                  },
                })
              : null;
            
            // 2. Si pas trouvé et qu'il y a un ID, chercher par slug = ID
            if (!existingProject && proj.id) {
              existingProject = await prisma.project.findFirst({
                where: {
                  siteId: site.id,
                  slug: proj.id,
                },
              });
            }
            
            // 3. Si toujours pas trouvé, chercher par titre exact (pour retrouver un projet existant)
            if (!existingProject && proj.title) {
              // Chercher tous les projets du site et comparer les titres
              const allProjects = await prisma.project.findMany({
                where: { siteId: site.id },
                select: { id: true, slug: true, title: true },
              });
              const matchingProject = allProjects.find(p => 
                p.title === proj.title || 
                p.title?.toLowerCase() === proj.title?.toLowerCase()
              );
              
              if (matchingProject) {
                // Récupérer le projet complet
                existingProject = await prisma.project.findUnique({
                  where: { id: matchingProject.id },
                });
              }
            }
            
            // Déterminer le slug final à utiliser
            // Si le projet existe déjà, on préserve son slug sauf si un slug explicite est fourni
            const finalSlug = existingProject && !proj.slug
              ? existingProject.slug // Préserver l'ancien slug si pas de slug explicite
              : (proj.slug || newSlug); // Utiliser le slug explicite ou le nouveau slug généré
            
            // Si le projet existe mais avec un slug différent, on doit le mettre à jour
            if (existingProject && existingProject.slug !== finalSlug) {
              // Vérifier qu'aucun autre projet n'utilise déjà le nouveau slug
              const conflict = await prisma.project.findFirst({
                where: {
                  siteId: site.id,
                  slug: finalSlug,
                  id: { not: existingProject.id },
                },
              });
              
              if (conflict) {
                // Mettre à jour sans changer le slug
                await prisma.project.update({
                  where: { id: existingProject.id },
                  data: {
                    title: proj.title || '',
                    excerpt: proj.excerpt || '',
                    description: proj.description || '',
                    coverImage: proj.coverImage || proj.image || '',
                    category: proj.category || '',
                    featured: !!proj.featured,
                    visibility,
                    content: proj.content || '',
                    blocks: proj.blocks || [],
                    seo: proj.seo || {},
                    status: toStatus(proj.status),
                    publishedAt: proj.publishedAt ? new Date(proj.publishedAt) : null,
                  },
                });
                successCount++;
                continue;
              } else {
                // Le nouveau slug est libre, on peut le mettre à jour
                await prisma.project.update({
                  where: { id: existingProject.id },
                  data: {
                    slug: finalSlug, // Mettre à jour le slug
                    title: proj.title || '',
                    excerpt: proj.excerpt || '',
                    description: proj.description || '',
                    coverImage: proj.coverImage || proj.image || '',
                    category: proj.category || '',
                    featured: !!proj.featured,
                    visibility,
                    content: proj.content || '',
                    blocks: proj.blocks || [],
                    seo: proj.seo || {},
                    status: toStatus(proj.status),
                    publishedAt: proj.publishedAt ? new Date(proj.publishedAt) : null,
                  },
                });
                successCount++;
                continue;
              }
            }
            
            // Upsert normal (projet existe déjà avec le même slug, ou nouveau projet)
            await prisma.project.upsert({
              where: { siteId_slug: { siteId: site.id, slug: finalSlug } },
              update: {
                title: proj.title || '',
                excerpt: proj.excerpt || '',
                description: proj.description || '',
                coverImage: proj.coverImage || proj.image || '',
                category: proj.category || '',
                featured: !!proj.featured,
                visibility,
                content: proj.content || '',
                blocks: proj.blocks || [],
                seo: proj.seo || {},
                status: toStatus(proj.status),
                publishedAt: proj.publishedAt ? new Date(proj.publishedAt) : null,
              },
              create: {
                siteId: site.id,
                slug: finalSlug,
                title: proj.title || '',
                excerpt: proj.excerpt || '',
                description: proj.description || '',
                coverImage: proj.coverImage || proj.image || '',
                category: proj.category || '',
                featured: !!proj.featured,
                visibility,
                content: proj.content || '',
                blocks: proj.blocks || [],
                seo: proj.seo || {},
                status: toStatus(proj.status),
                publishedAt: proj.publishedAt ? new Date(proj.publishedAt) : null,
              },
            });
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Erreur lors de la sauvegarde du projet ${newSlug}:`, error);
          }
        }
        
        return { successCount, errorCount };
      };
      
      // Traiter les projets public puis admin
      publicResult = await processProjects(projects, ProjectVisibility.public);
      adminResult = await processProjects(adminProjects, ProjectVisibility.admin);
      
      totalSuccess = publicResult.successCount + adminResult.successCount;
      totalErrors = publicResult.errorCount + adminResult.errorCount;
      
      // Note: On ne nettoie pas les projets orphelins automatiquement car si un projet change de slug
      // (ex: titre modifié), on ne peut pas savoir quel était l'ancien slug.
      // Un script de nettoyage manuel peut être utilisé si nécessaire.

      // Invalid cache
      invalidateMetadataCache();

      // dual_write : écrire aussi le fichier pour compat
      if (mode === 'dual_write') {
        if (currentTemplate && currentTemplate !== 'soliva') {
          const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
          const templateDir = join(process.cwd(), 'data', 'templates', currentTemplate);
          if (!existsSync(templateDir)) mkdirSync(templateDir, { recursive: true });
          await writeContent(content, { actor: 'admin-api' });
          const validatedContent = await readContent();
          writeFileSync(templateContentPath, JSON.stringify(validatedContent, null, 2));
          await writeContent(content, { actor: 'admin-api' });
        } else {
          await writeContent(content, { actor: 'admin-api' });
        }
      }
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('❌ API: Erreur lors de l\'écriture du contenu:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // Retourner une erreur plus détaillée
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'écriture du contenu',
        details: errorMessage,
        stack: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
