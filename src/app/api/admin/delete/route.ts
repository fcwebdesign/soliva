import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';

export async function DELETE(request: NextRequest) {
  try {
    const { type, id } = await request.json();
    
    if (!type || !id) {
      return NextResponse.json({ 
        error: 'Type et ID requis' 
      }, { status: 400 });
    }

    const content = await readContent();
    
    let itemsArray: any[] = [];
    let itemIndex = -1;
    
    let deletedItem: any;
    
    if (type === 'work') {
      // Supprimer de adminProjects
      itemsArray = content.work?.adminProjects || [];
      itemIndex = itemsArray.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return NextResponse.json({ 
          error: 'Projet non trouvé dans adminProjects' 
        }, { status: 404 });
      }
      
      deletedItem = itemsArray.splice(itemIndex, 1)[0];
      
      // AUSSI supprimer de projects (frontend) en utilisant le slug
      if (content.work?.projects && deletedItem.slug) {
        // Nettoyer les espaces dans le slug supprimé
        const cleanDeletedSlug = deletedItem.slug.trim();
        
        console.log('🔍 Recherche dans projects frontend:', {
          deletedSlug: deletedItem.slug,
          cleanDeletedSlug: cleanDeletedSlug,
          availableSlugs: content.work.projects.map(p => p.slug)
        });
        
        // Rechercher avec correspondance flexible (slug exact ou nettoyé)
        const frontendIndex = content.work.projects.findIndex(item => {
          const cleanItemSlug = item.slug?.trim() || '';
          return cleanItemSlug === cleanDeletedSlug || item.slug === deletedItem.slug;
        });
        
        console.log('🔍 Index trouvé dans projects:', frontendIndex);
        
        if (frontendIndex !== -1) {
          content.work.projects.splice(frontendIndex, 1);
          console.log('✅ Projet supprimé de projects frontend');
        } else {
          console.log('⚠️ Projet non trouvé dans projects frontend');
        }
        
        // SYNCHRONISATION COMPLÈTE : Nettoyer tous les projets orphelins
        console.log('🔄 Synchronisation complète des projets...');
        const adminSlugs = new Set((content.work.adminProjects || []).map(p => p.slug?.trim()).filter(Boolean));
        const originalCount = content.work.projects.length;
        
        content.work.projects = content.work.projects.filter(project => {
          const projectSlug = project.slug?.trim();
          const exists = projectSlug && adminSlugs.has(projectSlug);
          if (!exists && projectSlug) {
            console.log(`🗑️ Suppression orpheline: "${project.slug}"`);
          }
          return exists;
        });
        
        const removedCount = originalCount - content.work.projects.length;
        if (removedCount > 0) {
          console.log(`✅ ${removedCount} projets orphelins supprimés du frontend`);
        }
      }
      
    } else if (type === 'blog') {
      itemsArray = content.blog?.articles || [];
      itemIndex = itemsArray.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return NextResponse.json({ 
          error: 'Article non trouvé' 
        }, { status: 404 });
      }
      
      deletedItem = itemsArray.splice(itemIndex, 1)[0];
    } else {
      return NextResponse.json({ 
        error: 'Type invalide. Utilisez "work" ou "blog"' 
      }, { status: 400 });
    }

    // Sauvegarder le contenu
    await writeContent(content);
    
    console.log('✅ Suppression terminée:', {
      type,
      id,
      adminProjectsCount: content.work?.adminProjects?.length || 0,
      projectsCount: content.work?.projects?.length || 0
    });

    return NextResponse.json({
      success: true,
      deletedItem,
      message: 'Contenu supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression',
      details: error.message 
    }, { status: 500 });
  }
} 