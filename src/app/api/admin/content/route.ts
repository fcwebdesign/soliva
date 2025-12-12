import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { invalidateMetadataCache } from '@/lib/load-template-metadata';
import type { Content } from '@/types/content';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import getContentRepository from '@/content/getRepository';
import type { ContentMode } from '@/content/store/types';

export const runtime = "nodejs";

async function buildContentFromStore(siteKey: string) {
  const repo = getContentRepository();

  // metadata + globals
  const meta = await repo.getMetadata(siteKey);
  const navItems = await repo.getNavigation(siteKey);
  const footer = await repo.getFooter(siteKey);

  const mapNav = navItems.map((n: any) => n.url?.replace(/^\//, '') || '').filter(Boolean);

  // pages clés
  const home = await repo.getPageBySlug(siteKey, 'home');
  const contact = await repo.getPageBySlug(siteKey, 'contact');
  const studio = await repo.getPageBySlug(siteKey, 'studio');
  const workPage = await repo.getPageBySlug(siteKey, 'work');
  const blogPage = await repo.getPageBySlug(siteKey, 'blog');

  // articles / projects
  const articlesRes = await repo.listArticles(siteKey, { limit: 500, status: 'published' });
  const projectsRes = await repo.listProjects(siteKey, { limit: 500, status: 'published', visibility: 'public' });
  const adminProjectsRes = await repo.listProjects(siteKey, { limit: 500, status: 'published', visibility: 'admin' });

  const content: any = {
    metadata: meta?.metadata || {},
    nav: {
      logo: meta?.metadata?.title || siteKey,
      items: mapNav,
      location: meta?.metadata?.location || '',
      pageLabels: {},
    },
    footer: footer || undefined,
    home: home || {},
    contact: contact || {},
    studio: studio || {},
    work: {
      ...(workPage || {}),
      projects: projectsRes.items,
      adminProjects: adminProjectsRes.items,
    },
    blog: {
      ...(blogPage || {}),
      articles: articlesRes.items,
    },
    _template: meta?.activeTheme || siteKey,
    typography: meta?.typography || meta?.metadata?.typography || {},
    // garder compat typographie/spacing/palettes
    ...meta,
  };

  return content;
}

export async function GET(req: NextRequest) {
  try {
    const siteKey = req.nextUrl.searchParams.get('site') || 'soliva';
    const mode = (process.env.CONTENT_MODE as ContentMode) || 'json';

    // Si mode JSON, on garde l'ancien comportement (lecture fichier), sinon on reconstruit via repo (DB/dual)
    const content = mode === 'json'
      ? await readContent()
      : await buildContentFromStore(siteKey);

    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('❌ API: Erreur lors de la lecture du contenu:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // Extraire les détails de l'erreur de manière plus claire
    let errorDetails = error instanceof Error ? error.message : 'Erreur inconnue';
    let errorStack = error instanceof Error ? error.stack : undefined;
    
    // Si c'est une erreur de validation Zod, extraire les détails
    if (error instanceof Error && error.message.includes('Content validation failed')) {
      errorDetails = error.message;
      console.error('❌ API: Erreur de validation Zod détectée:', errorDetails);
    }
    
    // Toujours retourner les détails en développement, et aussi en production pour les erreurs de validation
    const isDev = process.env.NODE_ENV === 'development';
    const isValidationError = error instanceof Error && error.message.includes('Content validation failed');
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la lecture du contenu',
        details: errorDetails,
        stack: (isDev || isValidationError) ? errorStack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Le champ "content" est requis' },
        { status: 400 }
      );
    }

    const content: Content = body.content;
    const currentTemplate = content._template;
    
    console.log('🔄 API: Tentative d\'écriture du contenu...');
    console.log('📊 Taille du contenu:', JSON.stringify(content).length, 'caractères');
    console.log('🎨 Template actuel:', currentTemplate);
    
    // NOUVELLE LOGIQUE : Sauvegarder selon le template
    if (currentTemplate && currentTemplate !== 'soliva') {
      // Pour les templates autres que soliva, sauvegarder dans le template spécifique
      console.log(`📁 Sauvegarde dans le template "${currentTemplate}"`);
      
      const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
      const templateDir = join(process.cwd(), 'data', 'templates', currentTemplate);
      
      // Créer le dossier s'il n'existe pas
      if (!existsSync(templateDir)) {
        mkdirSync(templateDir, { recursive: true });
      }
      
      // ✅ PROTECTION : Valider le contenu avant de sauvegarder
      // writeContent() valide automatiquement, donc on sauvegarde d'abord dans content.json
      // puis on copie le fichier validé vers le template
      await writeContent(content, { actor: 'admin-api' });
      
      // Lire le contenu validé depuis content.json et le copier vers le template
      const validatedContent = await readContent();
      writeFileSync(templateContentPath, JSON.stringify(validatedContent, null, 2));
      
      // Aussi sauvegarder dans content.json pour l'affichage actuel
      await writeContent(content, { actor: 'admin-api' });
      
      // ✅ OPTIMISATION : Invalider le cache des métadonnées après sauvegarde
      invalidateMetadataCache();
      
      console.log(`✅ Contenu sauvegardé dans le template "${currentTemplate}"`);
      
    } else {
      // Pour soliva ou pas de template, sauvegarder normalement
      console.log('📁 Sauvegarde dans content.json (template soliva ou par défaut)');
      await writeContent(content, { actor: 'admin-api' });
      
      // ✅ OPTIMISATION : Invalider le cache des métadonnées après sauvegarde
      invalidateMetadataCache();
      
      console.log('✅ Contenu écrit avec succès');
    }
    
    // OPTIMISATION PERFORMANCE : Retourner directement le contenu sauvegardé
    // au lieu de relire le fichier (évite de lire 475Mo à nouveau)
    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('❌ API: Erreur lors de l\'écriture du contenu:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // Retourner une erreur plus détaillée
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'écriture du contenu',
        details: errorMessage,
        stack: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
