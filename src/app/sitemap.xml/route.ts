import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";

// Type pour les entrées du sitemap
type Entry = { 
  url: string; 
  lastmod?: string; 
  changefreq?: string;
  priority?: number;
};

// Fonction pour récupérer tous les articles depuis votre API
async function fetchAllArticles(): Promise<Entry[]> {
  try {
    // Utiliser la variable d'environnement ou détecter automatiquement le port
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                   process.env.API_URL || 
                   `http://localhost:${process.env.PORT || 3001}`;
    
    const res = await fetch(`${apiUrl}/api/content`, { 
      cache: "no-store" 
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    // Récupérer les articles de blog
    const blogArticles = data.blog?.articles || [];
    const blogPages = blogArticles.map((article: any) => ({
      url: `${SITE_URL}/blog/${article.slug || article.id}`,
      lastmod: article.updatedAt || article.publishedAt || article.createdAt,
      changefreq: 'weekly',
      priority: 0.7
    }));
    
    // Récupérer les projets de work
    const workProjects = data.work?.projects || [];
    const workPages = workProjects.map((project: any) => ({
      url: `${SITE_URL}/work/${project.slug || project.id}`,
      lastmod: project.updatedAt || project.publishedAt || project.createdAt,
      changefreq: 'weekly',
      priority: 0.7
    }));
    
    return [...blogPages, ...workPages];
  } catch (error) {
    console.error('Erreur lors de la récupération des articles pour le sitemap:', error);
    return [];
  }
}

// Fonction pour récupérer les pages personnalisées
async function fetchCustomPages(): Promise<Entry[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                   process.env.API_URL || 
                   `http://localhost:${process.env.PORT || 3001}`;
    
    const res = await fetch(`${apiUrl}/api/content`, { 
      cache: "no-store" 
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    // Récupérer les pages personnalisées
    const customPages = data.pages?.pages || [];
    const customPageUrls = customPages
      .filter((page: any) => page.slug && page.slug !== 'home')
      .map((page: any) => ({
        url: `${SITE_URL}/${page.slug}`,
        lastmod: page.updatedAt || page.publishedAt || page.createdAt,
        changefreq: 'weekly',
        priority: 0.7
      }));
    
    return customPageUrls;
  } catch (error) {
    console.error('Erreur lors de la récupération des pages personnalisées:', error);
    return [];
  }
}

// Fonction de dédoublonnage
function dedupe(list: Entry[]) {
  const m = new Map<string, Entry>();
  for (const e of list) m.set(e.url, e);
  return Array.from(m.values());
}

// Fonction pour formater la date
function formatDate(dateString?: string): string {
  if (!dateString) return new Date().toISOString();
  return new Date(dateString).toISOString();
}

export async function GET() {
  try {
    // Pages statiques
    const staticPages: Entry[] = [
      { 
        url: `${SITE_URL}/`,
        changefreq: 'weekly',
        priority: 1.0
      },
      { 
        url: `${SITE_URL}/work`,
        changefreq: 'weekly',
        priority: 0.7
      },
      { 
        url: `${SITE_URL}/studio`,
        changefreq: 'weekly',
        priority: 0.7
      },
      { 
        url: `${SITE_URL}/blog`,
        changefreq: 'weekly',
        priority: 0.7
      },
      { 
        url: `${SITE_URL}/contact`,
        changefreq: 'weekly',
        priority: 0.7
      }
    ];

    // Récupérer les pages dynamiques
    const [articles, customPages] = await Promise.all([
      fetchAllArticles(),
      fetchCustomPages()
    ]);

    // Combiner et dédoublonner
    const allPages = dedupe([...staticPages, ...articles, ...customPages]);

    console.log(`🗺️ Sitemap XML généré avec ${allPages.length} pages`);

    // Générer le XML manuellement
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${formatDate(page.lastmod)}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: { 
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap XML:', error);
    
    // Fallback : sitemap minimal
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackXml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" }
    });
  }
} 