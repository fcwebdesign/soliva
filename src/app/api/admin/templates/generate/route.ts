import { NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { aiTemplateNaming } from '@/lib/ai-template-naming';

export async function POST(request: Request) {
  try {
    const templateData = await request.json();
    const { name, category, useAI, description, autonomous, styles, blocks, pages, apply, register } = templateData;
    const shouldRegister = register !== false; // par défaut: on enregistre (Effica-like)
    const autonomousFlag = autonomous !== false; // par défaut autonome
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie requise' },
        { status: 400 }
      );
    }

    // Générer un nom créatif avec l'IA
    let templateName: string;
    
    if (useAI !== false) { // Utiliser l'IA par défaut
      try {
        // Récupérer les noms existants pour éviter les doublons
        const existingNames: string[] = [];
        
        // Templates statiques
        const staticTemplates = ['soliva', 'starter'];
        existingNames.push(...staticTemplates);
        
        // Templates générés dynamiquement
        const dataTemplatesDir = join(process.cwd(), 'data', 'templates');
        if (existsSync(dataTemplatesDir)) {
          const templateFiles = readdirSync(dataTemplatesDir).filter(file => file.endsWith('.json'));
          templateFiles.forEach(file => {
            const templateKey = file.replace('.json', '');
            existingNames.push(templateKey);
          });
        }
        
        // Templates dans src/templates
        const templatesDir = join(process.cwd(), 'src', 'templates');
        if (existsSync(templatesDir)) {
          const templateDirs = readdirSync(templatesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
          existingNames.push(...templateDirs);
        }
        
        templateName = await aiTemplateNaming.getUniqueTemplateName(category, existingNames);
        console.log(`🤖 Nom généré par IA: "${templateName}"`);
        
      } catch (error) {
        console.error('❌ Erreur génération nom IA:', error);
        // Fallback vers nom générique
        templateName = `${category}-template`;
        let counter = 1;
        while (existsSync(join(process.cwd(), 'src', 'templates', templateName))) {
          templateName = `${category}-template-${counter}`;
          counter++;
        }
      }
    } else {
      // Utiliser le nom fourni ou générer un nom générique
      templateName = name || `${category}-template`;
      let counter = 1;
      while (existsSync(join(process.cwd(), 'src', 'templates', templateName))) {
        templateName = `${name || category}-${counter}`;
        counter++;
      }
    }

    // Créer le dossier du template
    const templateDir = join(process.cwd(), 'src', 'templates', templateName);
    mkdirSync(templateDir, { recursive: true });

    // Composant Header du template (basé sur navModel)
    const headerComponent = `"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { buildNavModel } from "@/utils/navModel";
import { useTemplate } from "@/templates/context";

export default function Header{COMP}({ nav, pages }: any) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { key } = useTemplate();
  const model = buildNavModel({ nav, pages, pathname, templateKey: key !== 'default' ? key : undefined });

  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center space-x-3">
              {model.brand.image ? (
                <img src={model.brand.image} alt="Logo" className="h-8 w-auto object-contain max-w-[180px]" />
              ) : (
                <span className="text-xl font-bold tracking-tight text-gray-900 truncate">{model.brand.text}</span>
              )}
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            {model.items.map((item: any) => (
              <Link
                key={item.key}
                href={item.href}
                target={item.target}
                className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-3">
            {model.location && <span className="hidden sm:inline text-xs text-gray-400">{model.location}</span>}
            <button type="button" className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-200" onClick={() => setOpen(v => !v)} aria-label="Ouvrir le menu" aria-expanded={open}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}</svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {model.items.map((item: any) => (
              <div key={item.key} className="block">
                <Link
                  href={item.href}
                  target={item.target}
                  className={"px-3 py-2 rounded-md text-sm font-medium transition-colors " + (item.active ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}`.replace('{COMP}', templateName.charAt(0).toUpperCase() + templateName.slice(1).replace(/-/g, ''));

    // Footer basique du template
    const footerComponent = `type PageLink = { slug?: string; id?: string; title?: string };

export default function Footer{COMP}({ footer, pages }: { footer?: any; pages?: { pages?: PageLink[] } }) {
  const year = new Date().getFullYear();
  const copyright = footer?.copyright || ('© ' + year + ' {COMP}. Tous droits réservés.');
  const links: string[] = footer?.bottomLinks || [];
  const labelMap: Record<string, string | { title: string; customUrl?: string; target?: string }> = footer?.legalPageLabels || {};
  const allPages = pages?.pages || [];

  const defaultPages = [
    { key: 'home', label: 'Accueil', path: '/' },
    { key: 'work', label: 'Réalisations', path: '/work' },
    { key: 'studio', label: 'Studio', path: '/studio' },
    { key: 'blog', label: 'Journal', path: '/blog' },
    { key: 'contact', label: 'Contact', path: '/contact' },
  ];

  const customPages = allPages.map(p => ({ key: p.slug || p.id, label: p.title || 'Page', path: '/' + (p.slug || p.id) }));
  const available = [...defaultPages, ...customPages];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>{copyright}</p>
          {links.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-4 justify-center">
              {links.map((key) => {
                const page = available.find(p => p.key === key);
                const meta = labelMap[key];
                let label = page?.label || key;
                let href = page?.path || '#';
                let target: '_self'|'_blank' = '_self';
                if (typeof meta === 'string') label = meta;
                if (meta && typeof meta === 'object') { label = meta.title || label; href = meta.customUrl || href; target = meta.target === '_blank' ? '_blank' : '_self'; }
                return (
                  <li key={key}>
                    <a href={href} target={target} className="text-gray-500 hover:text-gray-900 transition-colors">{label}</a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}`.replace(/{COMP}/g, templateName.charAt(0).toUpperCase() + templateName.slice(1).replace(/-/g, ''));

    // Client du template prêt à rendre les blocs & le header
    const clientComponent = `'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';
import Header{COMP} from './components/Header';
import Footer{COMP} from './components/Footer';

export default function {COMP}Client() {
  const [content, setContent] = useState<any>(null);
  const pathname = usePathname();

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
  }, [pathname]); // Recharger le contenu quand le pathname change

  // Logique de routage (sans hook pour garder l'ordre stable)
  const route = (() => {
    if (pathname === '/') return 'home';
    if (pathname === '/work') return 'work';
    if (pathname.startsWith('/work/')) return 'work-slug';
    if (pathname === '/blog') return 'blog';
    if (pathname.startsWith('/blog/')) return 'blog-slug';
    if (pathname === '/studio') return 'studio';
    if (pathname === '/contact') return 'contact';
    return 'custom';
  })();

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Résolution de la page courante
  let pageData: any = null;
  if (route === 'home') {
    pageData = content?.home;
  } else if (route === 'work') {
    pageData = content?.work;
  } else if (route === 'work-slug') {
    // Pour les pages de projet individuelles, utiliser le contenu work
    pageData = content?.work;
  } else if (route === 'blog') {
    pageData = content?.blog;
  } else if (route === 'blog-slug') {
    // Pour les articles individuels, utiliser le contenu blog
    pageData = content?.blog;
  } else if (route === 'studio') {
    pageData = content?.studio;
  } else if (route === 'contact') {
    pageData = content?.contact;
  } else {
    // Page personnalisée
    const firstSegment = pathname?.split('/')[1] || '';
    const customPages = content?.pages?.pages || [];
    pageData = customPages.find((p: any) => (p.slug || p.id) === firstSegment) || null;
  }
  
  if (!pageData) pageData = content?.home || { blocks: [] };

  return (
    <div className="min-h-screen bg-white">
      <Header{COMP} nav={content.nav || { logo: '${templateName}' }} pages={content.pages} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Array.isArray(pageData?.blocks) && pageData.blocks.length > 0 ? (
          <BlockRenderer blocks={pageData.blocks} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{pageData?.title || 'Page'}</h2>
            <p className="text-gray-600 mb-8">{pageData?.description || "Aucun bloc pour l'instant"}</p>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-gray-400">Ajoute des blocs depuis l’admin pour cette page.</p>
            </div>
          </div>
        )}
      </main>
      <Footer{COMP} footer={content.footer} pages={content.pages} />
    </div>
  );
}`
      .replace(/{COMP}/g, templateName.charAt(0).toUpperCase() + templateName.slice(1).replace(/-/g, ''));

    // Écrire les fichiers générés
    const componentsDir = join(templateDir, 'components');
    mkdirSync(componentsDir, { recursive: true });
    writeFileSync(join(componentsDir, `Header.tsx`), headerComponent);
    writeFileSync(join(componentsDir, `Footer.tsx`), footerComponent);
    writeFileSync(join(templateDir, `${templateName}-client.tsx`), clientComponent);

    // Enregistrement du template dans le registre/renderer (par défaut oui, sauf register:false)
    try {
      if (shouldRegister) {
      const registryPath = join(process.cwd(), 'src', 'templates', 'registry.ts');
      let registrySrc = readFileSync(registryPath, 'utf-8');
      if (!registrySrc.includes(`'${templateName}':`)) {
        const insertion = `  '${templateName}': {\n    key: '${templateName}',\n    autonomous: ${autonomousFlag ? 'true' : 'false'},\n    name: '${templateName}',\n    description: 'Template généré automatiquement'\n  },\n`;
        const marker = '// Autres templates futurs...';
        if (registrySrc.includes(marker)) {
          registrySrc = registrySrc.replace(marker, insertion + '  ' + marker);
        } else {
          registrySrc = registrySrc.replace(/\n\};\n?$/, `\n${insertion}};\n`);
        }
        writeFileSync(registryPath, registrySrc);
      }

      const rendererPath = join(process.cwd(), 'src', 'templates', 'TemplateRenderer.tsx');
      let rendererSrc = readFileSync(rendererPath, 'utf-8');
      const compName = templateName.charAt(0).toUpperCase() + templateName.slice(1).replace(/-/g, '') + 'Client';
      const importLine = `import ${compName} from '@/templates/${templateName}/${templateName}-client';`;
      if (!rendererSrc.includes(importLine)) {
        const expIdx = rendererSrc.indexOf('export async function TemplateRenderer');
        if (expIdx !== -1) {
          rendererSrc = rendererSrc.slice(0, expIdx) + importLine + '\n' + rendererSrc.slice(expIdx);
        } else {
          rendererSrc = importLine + '\n' + rendererSrc;
        }
      }
      if (!rendererSrc.includes(`case '${templateName}':`)) {
        const defaultMarker = '// Templates générés dynamiquement sont gérés par le système de fichiers';
        const caseBlock = `\n    case '${templateName}':\n      return <${compName} />;\n`;
        if (rendererSrc.includes(defaultMarker)) {
          rendererSrc = rendererSrc.replace(defaultMarker, caseBlock + '    ' + defaultMarker);
        } else {
          // fallback: insert before 'default:'
          rendererSrc = rendererSrc.replace(/default:\n/, caseBlock + '    default:\n');
        }
      }
      writeFileSync(rendererPath, rendererSrc);
      }
    } catch (e) {
      console.warn('⚠️ Enregistrement optionnel du template échoué (non bloquant):', e);
    }

    // Application automatique du template (désactivée par défaut)
    try {
      const shouldApply = apply === true; // n'appliquer que si apply: true
      if (shouldApply) {
        const contentPath = join(process.cwd(), 'data', 'content.json');
        const content = JSON.parse(readFileSync(contentPath, 'utf8'));
        // Backup
        const currentTemplate = content._template || 'default';
        const backupPath = join(process.cwd(), 'data', 'backups', `template-${currentTemplate}-${Date.now()}.json`);
        writeFileSync(backupPath, JSON.stringify(content, null, 2));
        // Appliquer uniquement la clé de template (préserve le contenu)
        const nextContent = { ...content, _template: templateName };
        writeFileSync(contentPath, JSON.stringify(nextContent, null, 2));
      }
    } catch (e) {
      console.warn('⚠️ Application automatique du template échouée (non bloquant):', e);
    }

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
