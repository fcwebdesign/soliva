import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Bloquer l'accès aux zones sensibles
        disallow: [
          "/api/",           // API endpoints
          "/admin/",         // Interface d'administration
          "/_next/",         // Fichiers Next.js internes
          "/drafts/",        // Brouillons (si vous en avez)
          "/preview/",       // Mode aperçu
          "/temp/",          // Fichiers temporaires
          "/private/"        // Pages privées
        ]
      },
      // Règles spécifiques pour certains robots
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/"
        ]
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/"
        ]
      }
    ],
    // Sitemap principal
    sitemap: `${SITE_URL}/sitemap.xml`,
    
    // Host principal (optionnel mais recommandé)
    host: SITE_URL
  };
} 