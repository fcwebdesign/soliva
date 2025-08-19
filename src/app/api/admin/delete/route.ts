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
    
    if (type === 'work') {
      itemsArray = content.work?.adminProjects || [];
      itemIndex = itemsArray.findIndex(item => item.id === id);
    } else if (type === 'blog') {
      itemsArray = content.blog?.articles || [];
      itemIndex = itemsArray.findIndex(item => item.id === id);
    } else {
      return NextResponse.json({ 
        error: 'Type invalide. Utilisez "work" ou "blog"' 
      }, { status: 400 });
    }

    if (itemIndex === -1) {
      return NextResponse.json({ 
        error: 'Contenu non trouvé' 
      }, { status: 404 });
    }

    // Supprimer l'élément
    const deletedItem = itemsArray.splice(itemIndex, 1)[0];

    // Sauvegarder le contenu
    await writeContent(content);

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