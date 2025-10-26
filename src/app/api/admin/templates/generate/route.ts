import { NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const templateData = await request.json();
    const { name, category, useAI, description, autonomous, styles, blocks, pages } = templateData;
    
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Nom et catégorie requis' },
        { status: 400 }
      );
    }

    // Générer un nom unique si nécessaire
    let templateName = name;
    let counter = 1;
    while (existsSync(join(process.cwd(), 'src', 'templates', templateName))) {
      templateName = `${name}-${counter}`;
      counter++;
    }

    // Créer le dossier du template
    const templateDir = join(process.cwd(), 'src', 'templates', templateName);
    mkdirSync(templateDir, { recursive: true });

    // Créer le composant client simple
    const clientComponent = `'use client';
import { useEffect, useState } from 'react';
import BlockRenderer from '@/blocks/BlockRenderer';

export default function ${templateName.charAt(0).toUpperCase() + templateName.slice(1).replace(/-/g, '')}Client() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };
    loadContent();
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">${templateName}</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Accueil</a>
              <a href="/work" className="text-gray-500 hover:text-gray-900">Projets</a>
              <a href="/studio" className="text-gray-500 hover:text-gray-900">Studio</a>
              <a href="/blog" className="text-gray-500 hover:text-gray-900">Blog</a>
              <a href="/contact" className="text-gray-500 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Template ${templateName}</h2>
          <p className="text-gray-600 mb-8">${description || 'Template généré automatiquement'}</p>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">Contenu du template à configurer</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 ${templateName}. Template généré automatiquement.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}`;

    writeFileSync(join(templateDir, `${templateName}-client.tsx`), clientComponent);

    // Créer le fichier de configuration du template
    const templateConfig = {
      name: templateName,
      category,
      description: description || `Template ${category} généré automatiquement`,
      autonomous,
      styles: styles || {},
      blocks: blocks || [],
      pages: pages || ['home'],
      createdAt: new Date().toISOString()
    };

    // Créer le dossier data/templates s'il n'existe pas
    const dataTemplatesDir = join(process.cwd(), 'data', 'templates');
    if (!existsSync(dataTemplatesDir)) {
      mkdirSync(dataTemplatesDir, { recursive: true });
    }

    writeFileSync(join(dataTemplatesDir, `${templateName}.json`), JSON.stringify(templateConfig, null, 2));

    console.log(`✅ Template "${templateName}" généré avec succès`);

    return NextResponse.json({
      success: true,
      templateName,
      message: `Template "${templateName}" généré avec succès`,
      path: templateDir
    });

  } catch (error) {
    console.error('Erreur génération template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du template' },
      { status: 500 }
    );
  }
}