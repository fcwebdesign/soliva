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

  // metadata + globals
  const meta = await repo.getMetadata(siteKey);
  const navItems = await repo.getNavigation(siteKey);
  const footer = await repo.getFooter(siteKey);

  const mapNav = navItems.map((n: any) => n.url?.replace(/^\//, '') || '').filter(Boolean);

  // pages clés
  const home = await repo.getPageBySlug(siteKey, 'home');
  const contact = await repo.getPageBySlug(siteKey, 'contact');
  const studio = await repo.getPageBySlug(siteKey, 'studio');
  const workPage = await repo.getPageBySlug(siteKey, 'work');
  const blogPage = await repo.getPageBySlug(siteKey, 'blog');

  // articles / projects
  const articlesRes = await repo.listArticles(siteKey, { limit: 500, status: 'published' });
  const projectsRes = await repo.listProjects(siteKey, { limit: 500, status: 'published', visibility: 'public' });
  const adminProjectsRes = await repo.listProjects(siteKey, { limit: 500, status: 'published', visibility: 'admin' });

  const content: any = {
    metadata: meta?.metadata || {},
    nav: {
      logo: meta?.metadata?.title || siteKey,
      items: mapNav,
      location: meta?.metadata?.location || '',
      pageLabels: {},
    },
    footer: footer || undefined,
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
    try {
      const site = await prisma.site.upsert({
        where: { key: siteKey },
        update: {
          activeTheme: currentTemplate,
          metadata: content.metadata || {},
          typography: (content as any).typography || {},
          spacing: (content as any).spacing || {},
          palettes: (content as any).palettes || [],
          transitions: (content as any).transitions || {},
        },
        create: {
          key: siteKey,
          name: siteKey,
          activeTheme: currentTemplate,
          metadata: content.metadata || {},
          typography: (content as any).typography || {},
          spacing: (content as any).spacing || {},
          palettes: (content as any).palettes || [],
          transitions: (content as any).transitions || {},
        },
      });

      // Navigation
      if (content.nav?.items) {
        await prisma.navigationItem.deleteMany({ where: { siteId: site.id } });
        const items = content.nav.items.map((i: any, idx: number) => ({
          siteId: site.id,
          label: content.nav?.pageLabels?.[i] || i,
          url: i === 'home' ? '/' : `/${i}`,
          orderIndex: idx,
          isExternal: false,
        }));
        if (items.length) await prisma.navigationItem.createMany({ data: items });
      }

      // Footer
      if (content.footer) {
        await prisma.footer.upsert({
          where: { siteId: site.id },
          update: {
            content: (content.footer as any).content || '',
            socials: (content.footer as any).socials || [],
            columns: (content.footer as any).columns || [],
          },
          create: {
            siteId: site.id,
            content: (content.footer as any).content || '',
            socials: (content.footer as any).socials || [],
            columns: (content.footer as any).columns || [],
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
      await prisma.project.deleteMany({ where: { siteId: site.id } });
      const mapProjects = (arr: any[], visibility: ProjectVisibility) =>
        arr.map((proj: any) => ({
          siteId: site.id,
          slug: proj.slug || proj.title?.toLowerCase().replace(/\s+/g, '-') || `proj-${Date.now()}`,
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
        }));

      const allProjects = [...mapProjects(projects, ProjectVisibility.public), ...mapProjects(adminProjects, ProjectVisibility.admin)];
      if (allProjects.length) {
        await prisma.project.createMany({ data: allProjects });
      }

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
