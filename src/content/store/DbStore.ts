import { PrismaClient, ContentStatus, ProjectVisibility } from '@prisma/client';
import type { ContentStore, ListParams, PaginatedResult } from './types';
import { decodeCursor, encodeCursor } from '../pagination';

const DEFAULT_LIMIT = 20;

function toStatus(status?: string): ContentStatus {
  if (!status) return ContentStatus.published;
  return ContentStatus[status as keyof typeof ContentStatus] || ContentStatus.published;
}

export class DbStore implements ContentStore {
  constructor(private prisma: PrismaClient) {}

  private async getSite(siteKey: string) {
    const site = await this.prisma.site.findUnique({ where: { key: siteKey } });
    if (!site) throw new Error(`Site introuvable: ${siteKey}`);
    return site;
  }

  async getMetadata(siteKey: string) {
    const site = await this.prisma.site.findUnique({ where: { key: siteKey }, select: { metadata: true, typography: true, spacing: true, palettes: true, transitions: true } });
    return site || {};
  }

  async getPageBySlug(siteKey: string, slug: string) {
    const site = await this.getSite(siteKey);
    return this.prisma.page.findFirst({ where: { siteId: site.id, slug } });
  }

  async upsertPage(siteKey: string, payload: any) {
    const site = await this.getSite(siteKey);
    const slug = payload.slug || payload.id;
    if (!slug) throw new Error('slug requis pour la page');
    return this.prisma.page.upsert({
      where: { siteId_slug: { siteId: site.id, slug } },
      update: {
        title: payload.title || '',
        description: payload.description || '',
        hero: payload.hero || {},
        blocks: payload.blocks || [],
        seo: payload.seo || {},
        status: toStatus(payload.status),
      },
      create: {
        siteId: site.id,
        slug,
        title: payload.title || '',
        description: payload.description || '',
        hero: payload.hero || {},
        blocks: payload.blocks || [],
        seo: payload.seo || {},
        status: toStatus(payload.status),
      },
    });
  }

  async listArticles(siteKey: string, params: ListParams): Promise<PaginatedResult<any>> {
    const site = await this.getSite(siteKey);
    const limit = params.limit || DEFAULT_LIMIT;
    const decoded = decodeCursor(params.cursor);
    const where: any = { siteId: site.id, status: toStatus(params.status) };
    if (decoded) {
      where.OR = [
        { publishedAt: { lt: new Date(decoded.publishedAt) } },
        { publishedAt: new Date(decoded.publishedAt), id: { lt: decoded.id } },
      ];
    }
    const items = await this.prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore
      ? encodeCursor({
          publishedAt: sliced[sliced.length - 1].publishedAt?.toISOString() || new Date().toISOString(),
          id: sliced[sliced.length - 1].id,
        })
      : null;
    return { items: sliced, nextCursor };
  }

  async getArticleBySlug(siteKey: string, slug: string) {
    const site = await this.getSite(siteKey);
    return this.prisma.article.findFirst({ where: { siteId: site.id, slug } });
  }

  async upsertArticle(siteKey: string, payload: any) {
    const site = await this.getSite(siteKey);
    const slug = payload.slug || payload.id;
    if (!slug) throw new Error('slug requis pour l’article');
    return this.prisma.article.upsert({
      where: { siteId_slug: { siteId: site.id, slug } },
      update: {
        title: payload.title || '',
        excerpt: payload.excerpt || '',
        coverImage: payload.coverImage || '',
        content: payload.content || '',
        blocks: payload.blocks || [],
        seo: payload.seo || {},
        status: toStatus(payload.status),
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
      },
      create: {
        siteId: site.id,
        slug,
        title: payload.title || '',
        excerpt: payload.excerpt || '',
        coverImage: payload.coverImage || '',
        content: payload.content || '',
        blocks: payload.blocks || [],
        seo: payload.seo || {},
        status: toStatus(payload.status),
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
      },
    });
  }

  async listProjects(siteKey: string, params: ListParams): Promise<PaginatedResult<any>> {
    const site = await this.getSite(siteKey);
    const limit = params.limit || DEFAULT_LIMIT;
    const decoded = decodeCursor(params.cursor);
    const where: any = { siteId: site.id, status: toStatus(params.status) };
    if (params.featured !== undefined) where.featured = params.featured;
    if (params.visibility) where.visibility = ProjectVisibility[params.visibility];
    if (decoded) {
      where.OR = [
        { publishedAt: { lt: new Date(decoded.publishedAt) } },
        { publishedAt: new Date(decoded.publishedAt), id: { lt: decoded.id } },
      ];
    }

    const items = await this.prisma.project.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore
      ? encodeCursor({
          publishedAt: sliced[sliced.length - 1].publishedAt?.toISOString() || new Date().toISOString(),
          id: sliced[sliced.length - 1].id,
        })
      : null;
    return { items: sliced, nextCursor };
  }

  async getProjectBySlug(siteKey: string, slug: string) {
    const site = await this.getSite(siteKey);
    return this.prisma.project.findFirst({ where: { siteId: site.id, slug } });
  }

  async upsertProject(siteKey: string, payload: any) {
    const site = await this.getSite(siteKey);
    const slug = payload.slug || payload.id;
    if (!slug) throw new Error('slug requis pour le projet');
    const visibility = payload.visibility ? ProjectVisibility[payload.visibility] : ProjectVisibility.public;
    return this.prisma.project.upsert({
      where: { siteId_slug: { siteId: site.id, slug } },
      update: {
        title: payload.title || '',
        excerpt: payload.excerpt || '',
        description: payload.description || '',
        coverImage: payload.coverImage || payload.image || '',
        category: payload.category || '',
        featured: !!payload.featured,
        visibility,
        content: payload.content || '',
        blocks: payload.blocks || [],
        seo: payload.seo || {},
        status: toStatus(payload.status),
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
      },
      create: {
        siteId: site.id,
        slug,
        title: payload.title || '',
        excerpt: payload.excerpt || '',
        description: payload.description || '',
        coverImage: payload.coverImage || payload.image || '',
        category: payload.category || '',
        featured: !!payload.featured,
        visibility,
        content: payload.content || '',
        blocks: payload.blocks || [],
        seo: payload.seo || {},
        status: toStatus(payload.status),
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
      },
    });
  }

  async getNavigation(siteKey: string) {
    const site = await this.getSite(siteKey);
    return this.prisma.navigationItem.findMany({
      where: { siteId: site.id },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async setNavigation(siteKey: string, items: any[]) {
    const site = await this.getSite(siteKey);
    await this.prisma.navigationItem.deleteMany({ where: { siteId: site.id } });
    if (items.length) {
      await this.prisma.navigationItem.createMany({
        data: items.map((item, idx) => ({
          siteId: site.id,
          label: item.label || item.name || '',
          url: item.url || '',
          orderIndex: item.orderIndex ?? idx,
          isExternal: !!item.isExternal,
        })),
      });
    }
  }

  async getFooter(siteKey: string) {
    const site = await this.getSite(siteKey);
    return this.prisma.footer.findUnique({ where: { siteId: site.id } });
  }

  async setFooter(siteKey: string, payload: any) {
    const site = await this.getSite(siteKey);
    await this.prisma.footer.upsert({
      where: { siteId: site.id },
      update: {
        content: payload?.content || '',
        socials: payload?.socials || [],
        columns: payload?.columns || [],
      },
      create: {
        siteId: site.id,
        content: payload?.content || '',
        socials: payload?.socials || [],
        columns: payload?.columns || [],
      },
    });
  }
}

export default DbStore;
