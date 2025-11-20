import { NextResponse } from 'next/server';
import { loadTemplateContent } from '@/lib/load-template-content';

export const runtime = "nodejs";

/**
 * API Métadonnées - Retourne uniquement les métadonnées nécessaires
 * Sans le contenu HTML complet des articles/projets
 * Taille estimée : < 100 Ko au lieu de 45 Mo
 */
export async function GET() {
  try {
    console.log('🔄 API Metadata: Chargement des métadonnées...');
    
    const content = await loadTemplateContent();
    
    // Extraire uniquement les métadonnées (sans contenu HTML complet)
    const metadata = {
      _template: content._template,
      _transitionConfig: (content as any)._transitionConfig || content.metadata?._transitionConfig,
      metadata: content.metadata,
      nav: content.nav,
      footer: content.footer,
      home: {
        hero: content.home?.hero,
        title: content.home?.title,
        description: content.home?.description,
        blocks: content.home?.blocks || []
      },
      studio: {
        hero: content.studio?.hero,
        title: content.studio?.title,
        description: content.studio?.description,
        blocks: content.studio?.blocks || []
      },
      contact: {
        hero: content.contact?.hero,
        sections: content.contact?.sections,
        socials: content.contact?.socials,
        briefGenerator: content.contact?.briefGenerator
      },
      work: {
        hero: content.work?.hero,
        description: content.work?.description,
        filters: content.work?.filters || [],
        columns: content.work?.columns, // Nombre de colonnes pour la grille
        // Articles/projets avec métadonnées uniquement (pas de content HTML)
        adminProjects: (content.work?.adminProjects || []).map((project: any) => ({
          id: project.id,
          title: project.title,
          slug: project.slug,
          excerpt: project.excerpt || project.description?.substring(0, 200),
          category: project.category,
          image: project.image,
          status: project.status,
          publishedAt: project.publishedAt,
          client: project.client,
          year: project.year,
          featured: project.featured
          // PAS de content, blocks, description complète
        })),
        projects: (content.work?.projects || []).map((project: any) => ({
          title: project.title,
          slug: project.slug,
          description: project.description?.substring(0, 200), // Excerpt uniquement
          category: project.category,
          image: project.image,
          alt: project.alt
          // PAS de content complet
        }))
      },
      blog: {
        hero: content.blog?.hero,
        description: content.blog?.description,
        // Articles avec métadonnées uniquement (pas de content HTML)
        articles: (content.blog?.articles || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || article.content?.substring(0, 200),
          publishedAt: article.publishedAt,
          status: article.status
          // PAS de content, blocks, seo complet
        }))
      },
      pages: content.pages
    };
    
    const metadataSize = Buffer.byteLength(JSON.stringify(metadata), 'utf8');
    console.log(`✅ API Metadata: Métadonnées chargées (${(metadataSize / 1024).toFixed(2)} Ko)`);
    
    return NextResponse.json(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Pas de cache pour toujours avoir la dernière version
      }
    });
  } catch (error) {
    console.error('❌ API Metadata: Erreur lors du chargement:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement des métadonnées',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

