// Utilitaires SEO pour Next.js - Ne touche pas au rendu existant
import type { Metadata } from "next";

// Configuration de base
export const SITE_NAME = "Soliva";
export const SITE_URL = "http://localhost:3006"; // À adapter en production
export const DEFAULT_OG_IMAGE = "/og-default.jpg";

// Types pour les champs SEO
export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  keywords?: string[];
  og?: {
    title?: string;
    description?: string;
    images?: string[];
    type?: "article" | "website";
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    site?: string;
    creator?: string;
  };
};

// Type pour les articles
export type Article = {
  slug: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  seo?: SeoFields;
};

// Fonction pour créer des URLs absolues
export function absoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return new URL(SITE_URL).toString();
  try { 
    return new URL(pathOrUrl, SITE_URL).toString(); 
  } catch { 
    return SITE_URL; 
  }
}

// Fonction pour nettoyer les descriptions
export function sanitizeDesc(input?: string, max = 160) {
  if (!input) return undefined;
  const txt = input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return txt.length > max ? txt.slice(0, max - 1).trimEnd() + "…" : txt;
}

// Fonction pour créer le JSON-LD Schema.org
export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.seo?.metaTitle ?? article.title,
    description: sanitizeDesc(article.seo?.metaDescription ?? article.description),
    image: [absoluteUrl(article.seo?.og?.images?.[0] ?? article.image ?? DEFAULT_OG_IMAGE)],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: [{ "@type": "Person", "name": SITE_NAME }],
    publisher: {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": { "@type": "ImageObject", "url": absoluteUrl(DEFAULT_OG_IMAGE) }
    },
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`)
  };
}

// Fonction pour construire les métadonnées Next.js
export function buildArticleMetadata(article: Article): Metadata {
  const title = article.seo?.metaTitle ?? article.title;
  const description = sanitizeDesc(article.seo?.metaDescription ?? article.description);
  const ogImages = article.seo?.og?.images?.length
    ? article.seo.og.images.map(absoluteUrl)
    : [absoluteUrl(article.image ?? DEFAULT_OG_IMAGE)];

  const canonical = absoluteUrl(article.seo?.canonicalUrl ?? `/blog/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: article.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: article.seo?.og?.type ?? "article",
      title: article.seo?.og?.title ?? title,
      description: article.seo?.og?.description ?? description,
      url: canonical,
      siteName: SITE_NAME,
      images: ogImages
    },
    twitter: {
      card: article.seo?.twitter?.card ?? "summary_large_image",
      site: article.seo?.twitter?.site,
      creator: article.seo?.twitter?.creator,
      title,
      description,
      images: ogImages
    },
    keywords: article.seo?.keywords
  };
} 