#!/usr/bin/env node
/**
 * Migration JSON -> Postgres (Prisma)
 *
 * Usage:
 *   node scripts/migrate-content-to-db.js --content data/content.json --site soliva
 *
 * Remarque : le script est idempotent sur la clé de site (upsert Site + truncate ciblé pour les entrées de ce site).
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { PrismaClient, ContentStatus, ProjectVisibility } = require('@prisma/client');

const prisma = new PrismaClient();

const argv = require('minimist')(process.argv.slice(2), {
  string: ['content', 'site', 'name'],
  alias: { c: 'content', s: 'site', n: 'name' },
});

async function main() {
  const contentPath = argv.content || 'data/content.json';
  const siteKey = argv.site || path.basename(contentPath, path.extname(contentPath));
  const siteName = argv.name || siteKey;

  if (!fs.existsSync(contentPath)) {
    throw new Error(`Fichier introuvable: ${contentPath}`);
  }
  console.log(`▶️ Migration du fichier ${contentPath} vers site "${siteKey}"`);

  const raw = fs.readFileSync(contentPath, 'utf8');
  const content = JSON.parse(raw);

  // Préparer metadata globales
  const activeTheme = content._template || null;
  const typography = content.typography || content.metadata?.typography || {};
  const spacing = content.metadata?.spacing || {};
  const palettes = content.metadata?.palettes || [];
  const transitions = content.metadata?.transitions || {};
  const siteMetadata = content.metadata || {};

  // Upsert site
  const site = await prisma.site.upsert({
    where: { key: siteKey },
    update: {
      name: siteName,
      activeTheme,
      metadata: siteMetadata,
      typography,
      spacing,
      palettes,
      transitions,
    },
    create: {
      key: siteKey,
      name: siteName,
      activeTheme,
      metadata: siteMetadata,
      typography,
      spacing,
      palettes,
      transitions,
    },
  });
  console.log(`✅ Site upsert: ${siteKey}`);

  // Nettoyer les données existantes pour ce site (pages/articles/projects/nav/footer/assets/revisions)
  await prisma.navigationItem.deleteMany({ where: { siteId: site.id } });
  await prisma.footer.deleteMany({ where: { siteId: site.id } });
  await prisma.article.deleteMany({ where: { siteId: site.id } });
  await prisma.project.deleteMany({ where: { siteId: site.id } });
  await prisma.page.deleteMany({ where: { siteId: site.id } });
  console.log('♻️ Données précédentes nettoyées pour ce site');

  // Navigation
  if (content.nav?.items && Array.isArray(content.nav.items)) {
    const navItems = content.nav.items.map((item, idx) => ({
      label: content.nav.pageLabels?.[item] || item,
      url: item === 'home' ? '/' : `/${item}`,
      orderIndex: idx,
      isExternal: false,
      siteId: site.id,
    }));
    if (navItems.length) {
      await prisma.navigationItem.createMany({ data: navItems });
      console.log(`✅ Navigation: ${navItems.length} items`);
    }
  }

  // Footer si présent
  if (content.footer) {
    await prisma.footer.create({
      data: {
        siteId: site.id,
        content: content.footer.content || '',
        socials: content.footer.socials || [],
        columns: content.footer.columns || [],
      },
    });
    console.log('✅ Footer importé');
  }

  // Pages principales
  const corePages = ['home', 'contact', 'studio', 'work', 'blog'];
  for (const slug of corePages) {
    const data = content[slug];
    if (!data) continue;
    await prisma.page.create({
      data: {
        siteId: site.id,
        slug,
        title: data.title || slug,
        description: data.description || '',
        hero: data.hero || {},
        blocks: data.blocks || [],
        seo: data.seo || {},
        status: ContentStatus.published,
      },
    });
  }

  // Pages custom éventuelles
  if (Array.isArray(content.pages?.pages)) {
    for (const p of content.pages.pages) {
      await prisma.page.create({
        data: {
          siteId: site.id,
          slug: p.slug || p.id || `page-${Date.now()}`,
          title: p.title || '',
          description: p.description || '',
          hero: p.hero || {},
          blocks: p.blocks || [],
          seo: p.seo || {},
          status: (p.status && ContentStatus[p.status]) || ContentStatus.published,
        },
      });
    }
  }

  // Articles (blog)
  if (Array.isArray(content.blog?.articles)) {
    for (const art of content.blog.articles) {
      await prisma.article.create({
        data: {
          siteId: site.id,
          slug: art.slug || art.id,
          title: art.title || art.id || 'Article',
          excerpt: art.excerpt || '',
          coverImage: art.coverImage || '',
          content: art.content || '',
          blocks: art.blocks || [],
          seo: art.seo || {},
          status: ContentStatus.published,
          publishedAt: art.publishedAt ? new Date(art.publishedAt) : null,
        },
      });
    }
    console.log(`✅ Articles: ${content.blog.articles.length}`);
  }

  const usedProjectSlugs = new Set();

  // Projects (public)
  if (Array.isArray(content.work?.projects)) {
    for (const proj of content.work.projects) {
      const baseSlug = proj.slug || proj.title?.toLowerCase().replace(/\s+/g, '-') || `proj-${Date.now()}`;
      const slug = usedProjectSlugs.has(baseSlug) ? `${baseSlug}-pub` : baseSlug;
      usedProjectSlugs.add(slug);
      await prisma.project.create({
        data: {
          siteId: site.id,
          slug,
          title: proj.title || '',
          excerpt: proj.excerpt || '',
          description: proj.description || '',
          coverImage: proj.image || proj.coverImage || '',
          category: proj.category || '',
          featured: !!proj.featured,
          visibility: ProjectVisibility.public,
          content: proj.content || '',
          blocks: proj.blocks || [],
          seo: proj.seo || {},
          status: (proj.status && ContentStatus[proj.status]) || ContentStatus.published,
          publishedAt: proj.publishedAt ? new Date(proj.publishedAt) : null,
        },
      });
    }
    console.log(`✅ Projects (public): ${content.work.projects.length}`);
  }

  // Projects (admin / visibility admin)
  if (Array.isArray(content.work?.adminProjects)) {
    for (const proj of content.work.adminProjects) {
      let baseSlug = proj.slug || proj.title?.toLowerCase().replace(/\s+/g, '-') || `proj-${Date.now()}`;
      if (usedProjectSlugs.has(baseSlug)) {
        let suffix = 1;
        while (usedProjectSlugs.has(`${baseSlug}-admin-${suffix}`)) {
          suffix += 1;
        }
        baseSlug = `${baseSlug}-admin-${suffix}`;
      }
      usedProjectSlugs.add(baseSlug);
      await prisma.project.create({
        data: {
          siteId: site.id,
          slug: baseSlug,
          title: proj.title || '',
          excerpt: proj.excerpt || '',
          description: proj.description || '',
          coverImage: proj.image || proj.coverImage || '',
          category: proj.category || '',
          featured: !!proj.featured,
          visibility: ProjectVisibility.admin,
          content: proj.content || '',
          blocks: proj.blocks || [],
          seo: proj.seo || {},
          status: (proj.status && ContentStatus[proj.status]) || ContentStatus.published,
          publishedAt: proj.publishedAt ? new Date(proj.publishedAt) : null,
        },
      });
    }
    console.log(`✅ Projects (admin): ${content.work.adminProjects.length}`);
  }

  console.log('🎉 Migration terminée.');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
