import { NextResponse } from 'next/server';
import { loadTemplateContent } from '@/lib/load-template-content';

export const runtime = "nodejs";

/**
 * API Article - Retourne un article spécifique avec son contenu complet
 * Utilisé uniquement pour les pages individuelles d'articles
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requis' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 API Article: Chargement de l'article "${slug}"...`);
    
    const content = await loadTemplateContent();
    const articles = content.blog?.articles || [];
    
    // Chercher l'article par slug ou id
    const article = articles.find((a: any) => 
      a.slug === slug || a.id === slug
    );
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`✅ API Article: Article "${slug}" chargé`);
    
    return NextResponse.json({
      article: {
        ...article,
        // Contenu complet inclus
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache 5min pour le contenu
      }
    });
  } catch (error) {
    console.error('❌ API Article: Erreur lors du chargement:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement de l\'article',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

