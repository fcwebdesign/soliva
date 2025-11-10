import { NextRequest, NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { setTransitionConfig } from '@/utils/transitionConfig';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { transitionConfig } = await request.json();
    
    if (!transitionConfig) {
      return NextResponse.json({ error: 'Configuration de transition requise' }, { status: 400 });
    }

    // Valider la configuration
    const validTypes = [
      'slide-up', 'slide-down', 'slide-left', 'slide-right',
      'fade', 'fade-blur', 'zoom', 'zoom-out-in', 'flip', 'rotate',
      'curtain', 'reveal-left', 'reveal-right', 'cover-left', 'cover-right',
      'cover-up', 'cover-down', 'parallax-slide'
    ];
    if (!validTypes.includes(transitionConfig.type)) {
      return NextResponse.json({ error: 'Type de transition invalide' }, { status: 400 });
    }

    if (transitionConfig.duration && (transitionConfig.duration < 300 || transitionConfig.duration > 3000)) {
      return NextResponse.json({ error: 'Durée doit être entre 300ms et 3000ms' }, { status: 400 });
    }

    // Lire le contenu actuel (détecter le template depuis content.json)
    let content = await readContent();
    const currentTemplate = (content as any)._template;
    
    // Si un template spécifique est défini et qu'un fichier de template existe, le lire
    if (currentTemplate && currentTemplate !== 'soliva') {
      const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
      
      if (existsSync(templateContentPath)) {
        console.log(`📁 [Transitions POST] Lecture depuis le template "${currentTemplate}"`);
        try {
          const templateContent = JSON.parse(readFileSync(templateContentPath, 'utf-8'));
          content = templateContent;
          console.log(`✅ [Transitions POST] Contenu du template "${currentTemplate}" chargé avec succès`);
        } catch (error) {
          console.warn(`⚠️ [Transitions POST] Erreur lecture template "${currentTemplate}", fallback sur content.json:`, error);
          // Fallback sur le contenu de base si erreur
        }
      }
    }
    
    // Créer l'objet de config
    const finalConfig = {
      type: transitionConfig.type,
      duration: transitionConfig.duration || 1500,
      easing: transitionConfig.easing || 'cubic-bezier(0.87, 0, 0.13, 1)',
      updatedAt: new Date().toISOString()
    };
    
    // UTILISER LA FONCTION UTILITAIRE CENTRALISÉE (évite les bugs de localisation)
    // Cette fonction sauvegarde automatiquement aux deux endroits (_transitionConfig et metadata._transitionConfig)
    setTransitionConfig(content, finalConfig);
    
    console.log('💾 [Transitions] Config sauvegardée:', finalConfig);

    // NOUVELLE LOGIQUE : Sauvegarder selon le template (comme /api/admin/content)
    if (currentTemplate && currentTemplate !== 'soliva') {
      // Pour les templates autres que soliva, sauvegarder dans le template spécifique
      console.log(`📁 [Transitions] Sauvegarde dans le template "${currentTemplate}"`);
      
      const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
      const templateDir = join(process.cwd(), 'data', 'templates', currentTemplate);
      
      // Créer le dossier s'il n'existe pas
      if (!existsSync(templateDir)) {
        mkdirSync(templateDir, { recursive: true });
      }
      
      // Sauvegarder dans le template spécifique
      writeFileSync(templateContentPath, JSON.stringify(content, null, 2));
      
      // Aussi sauvegarder dans content.json pour l'affichage actuel
      await writeContent(content);
      
      console.log(`✅ [Transitions] Contenu sauvegardé dans le template "${currentTemplate}"`);
    } else {
      // Pour soliva ou pas de template, sauvegarder normalement
      console.log('📁 [Transitions] Sauvegarde dans content.json (template soliva ou par défaut)');
      await writeContent(content);
      console.log('✅ [Transitions] Contenu écrit avec succès');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration des transitions sauvegardée', 
      config: (content as any)._transitionConfig 
    });

  } catch (error) {
    console.error('Erreur sauvegarde transitions:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Lire d'abord le contenu de base pour détecter le template
    let content = await readContent();
    const currentTemplate = (content as any)._template;
    
    // Si un template spécifique est défini et qu'un fichier de template existe, le lire
    if (currentTemplate && currentTemplate !== 'soliva') {
      const templateContentPath = join(process.cwd(), 'data', 'templates', currentTemplate, 'content.json');
      
      if (existsSync(templateContentPath)) {
        console.log(`📁 [Transitions GET] Lecture depuis le template "${currentTemplate}"`);
        try {
          const templateContent = JSON.parse(readFileSync(templateContentPath, 'utf-8'));
          content = templateContent;
          console.log(`✅ [Transitions GET] Contenu du template "${currentTemplate}" chargé avec succès`);
        } catch (error) {
          console.warn(`⚠️ [Transitions GET] Erreur lecture template "${currentTemplate}", fallback sur content.json:`, error);
          // Fallback sur le contenu de base si erreur
        }
      }
    }
    
    // UTILISER LA FONCTION UTILITAIRE CENTRALISÉE (évite les bugs de localisation)
    const { getTransitionConfig } = await import('@/utils/transitionConfig');
    const transitionConfig = getTransitionConfig(content);
    
    return NextResponse.json({
      transitionConfig: transitionConfig || null
    });

  } catch (error) {
    console.error('Erreur lecture transitions:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture' }, { status: 500 });
  }
}
