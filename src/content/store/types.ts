export type SiteKey = string;

export type ContentMode = 'json' | 'dual_write' | 'dual_read' | 'db';

export type ListParams = {
  limit: number;
  cursor?: string | null;
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
  visibility?: 'public' | 'admin';
};

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
};

export interface ContentStore {
  // Metadata light
  getMetadata(siteKey: SiteKey): Promise<any>;

  // Pages
  getPageBySlug(siteKey: SiteKey, slug: string): Promise<any | null>;
  upsertPage(siteKey: SiteKey, payload: any): Promise<any>;

  // Articles
  listArticles(siteKey: SiteKey, params: ListParams): Promise<PaginatedResult<any>>;
  getArticleBySlug(siteKey: SiteKey, slug: string): Promise<any | null>;
  upsertArticle(siteKey: SiteKey, payload: any): Promise<any>;

  // Projects
  listProjects(siteKey: SiteKey, params: ListParams): Promise<PaginatedResult<any>>;
  getProjectBySlug(siteKey: SiteKey, slug: string): Promise<any | null>;
  upsertProject(siteKey: SiteKey, payload: any): Promise<any>;

  // Nav/Footer
  getNavigation(siteKey: SiteKey): Promise<any[]>;
  setNavigation(siteKey: SiteKey, items: any[]): Promise<void>;
  getFooter(siteKey: SiteKey): Promise<any | null>;
  setFooter(siteKey: SiteKey, payload: any): Promise<void>;
}
