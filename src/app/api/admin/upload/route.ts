import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    // Créer le dossier uploads s'il n'existe pas
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille max: ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        { status: 400 }
      );
    }

    // Vérifier l'extension
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Extension non autorisée. Extensions autorisées: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Générer un nom unique
    const timestamp = Date.now();
    const hash = createHash('md5').update(fileName + timestamp).digest('hex').slice(0, 8);
    const uniqueFileName = `${timestamp}-${hash}${extension}`;
    const filePath = join(UPLOADS_DIR, uniqueFileName);

    // Normaliser le nom de fichier (éviter path traversal)
    const normalizedPath = join(UPLOADS_DIR, uniqueFileName);
    if (!normalizedPath.startsWith(UPLOADS_DIR)) {
      return NextResponse.json(
        { error: 'Nom de fichier invalide' },
        { status: 400 }
      );
    }

    // Lire et écrire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      url,
      filename: uniqueFileName,
      size: file.size,
      type: file.type,
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 