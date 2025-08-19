import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json();
    
    if (!type || !id) {
      return NextResponse.json({ 
        error: 'Type et ID requis' 
      }, { status: 400 });
    }

    const content = await readContent();
    
    let itemToDuplicate: any = null;
    let itemsArray: any[] = [];
    
    if (type === 'work') {
      itemsArray = content.work?.adminProjects || [];
      itemToDuplicate = itemsArray.find(item => item.id === id);
    } else if (type === 'blog') {
      itemsArray = content.blog?.articles || [];
      itemToDuplicate = itemsArray.find(item => item.id === id);
    } else {
      return NextResponse.json({ 
        error: 'Type invalide. Utilisez "work" ou "blog"' 
      }, { status: 400 });
    }

    if (!itemToDuplicate) {
      return NextResponse.json({ 
        error: 'Contenu non trouvé' 
      }, { status: 404 });
    }

    // Créer une copie du contenu
    const duplicatedItem = {
      ...itemToDuplicate,
      id: `${itemToDuplicate.id}-copy-${Date.now()}`,
      title: `${itemToDuplicate.title} (copie)`,
      slug: `${itemToDuplicate.slug || itemToDuplicate.id}-copy-${Date.now()}`,
      status: 'draft' as const,
      publishedAt: undefined,
      _lastModified: new Date().toISOString()
    };

    // Ajouter la copie à la liste
    itemsArray.push(duplicatedItem);

    // Sauvegarder le contenu
    await writeContent(content);

    return NextResponse.json({
      success: true,
      duplicatedItem,
      message: 'Contenu dupliqué avec succès'
    });

  } catch (error) {
    console.error('Erreur duplication:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la duplication',
      details: error.message 
    }, { status: 500 });
  }
} 