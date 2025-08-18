import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { SEED_DATA } from '@/lib/content';

export const runtime = "nodejs";

const DATA_FILE_PATH = join(process.cwd(), 'data', 'content.json');

export async function POST() {
  try {
    console.log('🔄 Réinitialisation du contenu avec le seed complet...');
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Sauvegarder l'ancien contenu s'il existe
    try {
      const oldContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = join(dataDir, `content-backup-${timestamp}.json`);
      await fs.writeFile(backupPath, oldContent, 'utf-8');
      console.log('✅ Ancien contenu sauvegardé:', backupPath);
    } catch (error) {
      console.log('ℹ️ Aucun ancien contenu à sauvegarder');
    }
    
    // Écrire le seed complet
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
    
    console.log('✅ Contenu réinitialisé avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Contenu réinitialisé avec le seed complet',
      data: SEED_DATA
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la réinitialisation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 