import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Type pour les pages
type PageLike = { 
  url: string; 
  lastmod?: string; 
};

// Fonction pour récupérer tous les articles depuis votre API
async function fetchAllArticles(): Promise<PageLike[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/content`, { 
      cache: "no-store" 
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const articles = data.pages?.pages || [];
    
    return articles.map((article: any) => ({
      url: `${SITE_URL}/blog/${article.slug || article.id}`,
      lastmod: article.updatedAt || article.publishedAt || article.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des articles pour le sitemap:', error);
    return [];
  }
}

// Fonction pour récupérer les pages statiques
async function fetchStaticPages(): Promise<PageLike[]> {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/work` },
    { url: `${SITE_URL}/studio` },
    { url: `${SITE_URL}/blog` },
    { url: `${SITE_URL}/contact` }
  ];
}

// Fonction pour récupérer les pages personnalisées (mentions légales, etc.)
async function fetchCustomPages(): Promise<PageLike[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/content`, { 
      cache: "no-store" 
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const customPages = data.pages?.pages || [];
    
    return customPages
      .filter((page: any) => page.slug && page.slug !== 'home')
      .map((page: any) => ({
        url: `${SITE_URL}/${page.slug}`,
        lastmod: page.updatedAt || page.publishedAt || page.createdAt
      }));
  } catch (error) {
    console.error('Erreur lors de la récupération des pages personnalisées pour le sitemap:', error);
    return [];
  }
}

// Fonction principale du sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Récupérer toutes les pages en parallèle
    const [staticPages, articles, customPages] = await Promise.all([
      fetchStaticPages(),
      fetchAllArticles(),
      fetchCustomPages()
    ]);

    // Combiner toutes les pages
    const allPages = [...staticPages, ...articles, ...customPages];

    // Créer le sitemap avec priorités
    return allPages.map((page) => ({
      url: page.url,
      lastModified: page.lastmod ? new Date(page.lastmod) : new Date(),
      changeFrequency: "weekly" as const,
      priority: page.url === `${SITE_URL}/` ? 1 : 0.7
    }));
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    
    // Fallback : retourner au moins les pages statiques
    const staticPages = await fetchStaticPages();
    return staticPages.map((page) => ({
      url: page.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page.url === `${SITE_URL}/` ? 1 : 0.7
    }));
  }
} 