import { resolveContentPath, readJsonFile, writeJsonFile } from './json-file';
import type { ContentStore, ListParams, PaginatedResult } from './types';

const DEFAULT_LIMIT = 20;

export class JsonStore implements ContentStore {
  private load(siteKey: string): any {
    const filePath = resolveContentPath(siteKey);
    return readJsonFile(filePath);
  }

  private save(siteKey: string, data: any) {
    const filePath = resolveContentPath(siteKey);
    writeJsonFile(filePath, data);
  }

  async getMetadata(siteKey: string) {
    const data = this.load(siteKey);
    return data.metadata || {};
  }

  async getPageBySlug(siteKey: string, slug: string) {
    const data = this.load(siteKey);
    if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
      return data[slug] || null;
    }
    const pages = data.pages?.pages || [];
    return pages.find((p: any) => p.slug === slug || p.id === slug) || null;
  }

  async upsertPage(siteKey: string, payload: any) {
    const data = this.load(siteKey);
    const slug = payload.slug || payload.id;
    if (!slug) throw new Error('slug requis pour la page');

    if (['home', 'contact', 'studio', 'work', 'blog'].includes(slug)) {
      data[slug] = payload;
    } else {
      const pages = data.pages?.pages || [];
      const idx = pages.findIndex((p: any) => p.slug === slug || p.id === slug);
      if (idx >= 0) pages[idx] = payload; else pages.push(payload);
      data.pages = { ...(data.pages || {}), pages };
    }
    this.save(siteKey, data);
    return payload;
  }

  async listArticles(siteKey: string, params: ListParams): Promise<PaginatedResult<any>> {
    const data = this.load(siteKey);
    const articles = data.blog?.articles || [];
    const limit = params.limit || DEFAULT_LIMIT;
    const items = articles.slice(0, limit);
    return { items, nextCursor: null };
  }

  async getArticleBySlug(siteKey: string, slug: string) {
    const data = this.load(siteKey);
    const articles = data.blog?.articles || [];
    return articles.find((a: any) => a.slug === slug || a.id === slug) || null;
  }

  async upsertArticle(siteKey: string, payload: any) {
    const data = this.load(siteKey);
    const slug = payload.slug || payload.id;
    if (!slug) throw new Error('slug requis pour l’article');
    const articles = data.blog?.articles || [];
    const idx = articles.findIndex((a: any) => a.slug === slug || a.id === slug);
    if (idx >= 0) articles[idx] = payload; else articles.push(payload);
    data.blog = { ...(data.blog || {}), articles };
    this.save(siteKey, data);
    return payload;
  }

  async listProjects(siteKey: string, params: ListParams): Promise<PaginatedResult<any>> {
    const data = this.load(siteKey);
    const projects = params.visibility === 'admin' ? (data.work?.adminProjects || []) : (data.work?.projects || []);
    const limit = params.limit || DEFAULT_LIMIT;
    const items = projects.slice(0, limit);
    return { items, nextCursor: null };
  }

  async getProjectBySlug(siteKey: string, slug: string) {
    const data = this.load(siteKey);
    const projects = data.work?.projects || [];
    const adminProjects = data.work?.adminProjects || [];
    return projects.find((p: any) => p.slug === slug) || adminProjects.find((p: any) => p.slug === slug) || null;
  }

  async upsertProject(siteKey: string, payload: any) {
    const data = this.load(siteKey);
    const slug = payload.slug || payload.id;
    if (!slug) throw new Error('slug requis pour le projet');
    const isAdmin = payload.visibility === 'admin';
    const key = isAdmin ? 'adminProjects' : 'projects';
    const arr = data.work?.[key] || [];
    const idx = arr.findIndex((p: any) => p.slug === slug || p.id === slug);
    if (idx >= 0) arr[idx] = payload; else arr.push(payload);
    data.work = { ...(data.work || {}), [key]: arr };
    this.save(siteKey, data);
    return payload;
  }

  async getNavigation(siteKey: string) {
    const data = this.load(siteKey);
    return data.nav?.items || [];
  }

  async setNavigation(siteKey: string, items: any[]) {
    const data = this.load(siteKey);
    data.nav = { ...(data.nav || {}), items };
    this.save(siteKey, data);
  }

  async getFooter(siteKey: string) {
    const data = this.load(siteKey);
    return data.footer || null;
  }

  async setFooter(siteKey: string, payload: any) {
    const data = this.load(siteKey);
    data.footer = payload;
    this.save(siteKey, data);
  }
}

export default JsonStore;
