import { NextResponse } from 'next/server';
import { loadTemplateContent } from '@/lib/load-template-content';

export const runtime = "nodejs";

/**
 * API Project - Retourne un projet spécifique avec son contenu complet
 * Utilisé uniquement pour les pages individuelles de projets
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
    
    console.log(`🔄 API Project: Chargement du projet "${slug}"...`);
    
    const content = await loadTemplateContent();
    
    // Chercher d'abord dans adminProjects (avec blocs), puis dans projects (fallback)
    let project = content.work?.adminProjects?.find((p: any) => 
      p.slug === slug || p.id === slug
    );
    
    if (!project) {
      // Fallback vers les projets publics
      project = content.work?.projects?.find((p: any) => 
        p.slug === slug || p.id === slug
      );
    }
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`✅ API Project: Projet "${slug}" chargé`);
    
    return NextResponse.json({
      project: {
        ...project,
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
    console.error('❌ API Project: Erreur lors du chargement:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement du projet',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

