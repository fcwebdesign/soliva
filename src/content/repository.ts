import type { ContentStore, ContentMode } from './store/types';

export class ContentRepository implements ContentStore {
  constructor(
    private mode: ContentMode,
    private db: ContentStore,
    private json: ContentStore,
    private logger: { warn: (...a: any[]) => void; error: (...a: any[]) => void } = console
  ) {}

  private async read<T>(fn: (s: ContentStore) => Promise<T>): Promise<T> {
    if (this.mode === 'db') return fn(this.db);
    if (this.mode === 'json') return fn(this.json);

    if (this.mode === 'dual_read') {
      try {
        return await fn(this.db);
      } catch (e) {
        this.logger.warn('DB read failed, fallback JSON', e);
        return fn(this.json);
      }
    }

    // dual_write : lecture JSON par défaut
    return fn(this.json);
  }

  private async write<T>(fn: (s: ContentStore) => Promise<T>): Promise<T> {
    if (this.mode === 'db') return fn(this.db);
    if (this.mode === 'json') return fn(this.json);

    if (this.mode === 'dual_write') {
      const dbRes = await fn(this.db);
      try {
        await fn(this.json);
      } catch (e) {
        this.logger.error('JSON write failed (db kept)', e);
      }
      return dbRes;
    }

    // dual_read : écriture DB seulement
    return fn(this.db);
  }

  getMetadata(siteKey: string) {
    return this.read((s) => s.getMetadata(siteKey));
  }

  getPageBySlug(siteKey: string, slug: string) {
    return this.read((s) => s.getPageBySlug(siteKey, slug));
  }

  upsertPage(siteKey: string, payload: any) {
    return this.write((s) => s.upsertPage(siteKey, payload));
  }

  listArticles(siteKey: string, params: any) {
    return this.read((s) => s.listArticles(siteKey, params));
  }

  getArticleBySlug(siteKey: string, slug: string) {
    return this.read((s) => s.getArticleBySlug(siteKey, slug));
  }

  upsertArticle(siteKey: string, payload: any) {
    return this.write((s) => s.upsertArticle(siteKey, payload));
  }

  listProjects(siteKey: string, params: any) {
    return this.read((s) => s.listProjects(siteKey, params));
  }

  getProjectBySlug(siteKey: string, slug: string) {
    return this.read((s) => s.getProjectBySlug(siteKey, slug));
  }

  upsertProject(siteKey: string, payload: any) {
    return this.write((s) => s.upsertProject(siteKey, payload));
  }

  getNavigation(siteKey: string) {
    return this.read((s) => s.getNavigation(siteKey));
  }

  setNavigation(siteKey: string, items: any[]) {
    return this.write((s) => s.setNavigation(siteKey, items));
  }

  getFooter(siteKey: string) {
    return this.read((s) => s.getFooter(siteKey));
  }

  setFooter(siteKey: string, payload: any) {
    return this.write((s) => s.setFooter(siteKey, payload));
  }
}
