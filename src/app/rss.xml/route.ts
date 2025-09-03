import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";

async function fetchArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/content`, { 
      cache: "no-store" 
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.blog?.articles || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des articles pour le RSS:', error);
    return [];
  }
}

export async function GET() {
  const items = await fetchArticles();
  
  const feedItems = items.map((a: any) => `
    <item>
      <title><![CDATA[${a.seo?.metaTitle ?? a.title}]]></title>
      <link>${SITE_URL}/blog/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${a.slug}</guid>
      <pubDate>${new Date(a.publishedAt || a.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${(a.seo?.metaDescription ?? a.excerpt ?? "").slice(0,300)}]]></description>
    </item>
  `).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_URL}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_URL} — RSS</description>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
} 