import { NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync, cpSync, renameSync } from 'fs';
import { join } from 'path';
import { aiTemplateNaming } from '@/lib/ai-template-naming';
import { SEED_DATA } from '@/lib/content';

export async function POST(request: Request) {
  try {
    const templateData = await request.json();
    const { name, category, useAI, description, autonomous, styles, blocks, pages, apply, register, cloneFrom } = templateData;
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

    // CLONAGE DIRECT D'UN TEMPLATE EXISTANT (ex: pearl)
    let clonedFromExisting = false;
    if (cloneFrom) {
      const sourceDir = join(process.cwd(), 'src', 'templates', cloneFrom);
      const sourceDataDir = join(process.cwd(), 'data', 'templates', cloneFrom);
      if (existsSync(sourceDir)) {
        // Copier le code complet
        cpSync(sourceDir, templateDir, { recursive: true });

        // Renommer le client
        const oldClient = join(templateDir, `${cloneFrom}-client.tsx`);
        const newClient = join(templateDir, `${templateName}-client.tsx`);
        if (existsSync(oldClient)) {
          renameSync(oldClient, newClient);
        }

        // Harmoniser le nom du composant exporté
        if (existsSync(newClient)) {
          try {
            let clientSrc = readFileSync(newClient, 'utf-8');
            const compOld = cloneFrom.charAt(0).toUpperCase() + cloneFrom.slice(1).replace(/-/g, '');
            const compNew = templateName.charAt(0).toUpperCase() + templateName.slice(1).replace(/-/g, '');
            clientSrc = clientSrc.replace(new RegExp(`function\\s+${compOld}Client`, 'g'), `function ${compNew}Client`);
            clientSrc = clientSrc.replace(new RegExp(`export default function ${compOld}Client`, 'g'), `export default function ${compNew}Client`);
            writeFileSync(newClient, clientSrc, 'utf-8');
          } catch (e) {
            console.warn('⚠️ Harmonisation du client cloné échouée:', e);
          }
        }

        // Adapter le scope CSS
        const cssPath = join(templateDir, `${cloneFrom}.css`);
        if (existsSync(cssPath)) {
          try {
            let css = readFileSync(cssPath, 'utf-8');
            const sourceClass = `.template-${cloneFrom}`;
            const targetClass = `.template-${templateName}`;
            const isSelector = `:is(${sourceClass}, ${targetClass})`;
            css = css.replace(new RegExp(`\\${sourceClass}`, 'g'), isSelector);
            writeFileSync(cssPath, css, 'utf-8');
            const newCssPath = join(templateDir, `${templateName}.css`);
            if (!existsSync(newCssPath)) {
              writeFileSync(newCssPath, css, 'utf-8');
            }
          } catch (e) {
            console.warn('⚠️ Adaptation CSS cloné échouée:', e);
          }
        }

        clonedFromExisting = true;
        console.log(`✅ Template cloné depuis "${cloneFrom}" → ${templateName}`);
      }

      // Copier le contenu (version live prioritaire)
      const targetDataDir = join(process.cwd(), 'data', 'templates', templateName);
      mkdirSync(targetDataDir, { recursive: true });
      const sourceContentPath = join(process.cwd(), 'data', 'templates', cloneFrom, 'content.json');
      const liveContentPath = join(process.cwd(), 'data', 'content.json');
      let contentSource: string | null = null;
      try {
        if (existsSync(liveContentPath)) {
          const live = JSON.parse(readFileSync(liveContentPath, 'utf-8'));
          if (live._template === cloneFrom) {
            contentSource = liveContentPath;
          }
        }
      } catch {
        // ignore
      }
      if (!contentSource && existsSync(sourceContentPath)) {
        contentSource = sourceContentPath;
      }
      if (contentSource) {
        try {
          const clonedContent = JSON.parse(readFileSync(contentSource, 'utf-8'));
          clonedContent._template = templateName;
          writeFileSync(join(targetDataDir, 'content.json'), JSON.stringify(clonedContent, null, 2));
        } catch (e) {
          console.warn('⚠️ Copie du contenu cloné échouée:', e);
        }
      }
    }

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

    // Footer complet du template (identité, liens, réseaux sociaux, légaux)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Identité + description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="font-semibold text-xl text-gray-900">
              {footer?.logoImage ? (
                <img src={footer.logoImage} alt="Logo" className="h-8 max-w-[200px] object-contain" />
              ) : (
                footer?.logo || '{COMP}'
              )}
            </div>
            {footer?.description && (
              <p className="text-sm text-gray-600 max-w-prose">{footer.description}</p>
            )}
          </div>

          {/* Liens et Réseaux sociaux */}
          <div className="flex flex-col md:flex-row md:justify-end gap-12">
            {Array.isArray(footer?.links) && footer.links.length > 0 && (
              <div className="space-y-2 text-left">
                <ul className="space-y-1">
                  {footer.links.map((l: any, idx: number) => (
                    <li key={idx}><a href={l.url || '#'} className="text-sm text-gray-700 hover:text-gray-900">{l.title}</a></li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(footer?.socialLinks) && footer.socialLinks.length > 0 && (
              <div className="space-y-2 text-left">
                <ul className="space-y-1">
                  {footer.socialLinks.map((s: any, idx: number) => (
                    <li key={idx}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-gray-900">{s.platform}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bas de page: copyright + liens */}
        <div className="border-t pt-6 text-center text-gray-500 text-sm">
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
                  <li key={key}><a href={href} target={target} className="text-gray-500 hover:text-gray-900 transition-colors">{label}</a></li>
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

    // Écrire les fichiers générés (sauf si clonage déjà effectué)
    if (!clonedFromExisting) {
      const componentsDir = join(templateDir, 'components');
      mkdirSync(componentsDir, { recursive: true });
      writeFileSync(join(componentsDir, `Header.tsx`), headerComponent);
      writeFileSync(join(componentsDir, `Footer.tsx`), footerComponent);
      writeFileSync(join(templateDir, `${templateName}-client.tsx`), clientComponent);
    }

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

    // Créer le dossier du template dans data/templates et le fichier content.json basé sur le seed
    const dataTemplateDir = join(dataTemplatesDir, templateName);
    if (!existsSync(dataTemplateDir)) {
      mkdirSync(dataTemplateDir, { recursive: true });
    }

    const seededContent = {
      ...SEED_DATA,
      _template: templateName,
      metadata: {
        ...SEED_DATA.metadata,
        title: `Site ${templateName}`,
        description: `Description du site ${templateName}`,
      },
      nav: {
        ...SEED_DATA.nav,
        logo: templateName,
      },
      home: {
        ...(SEED_DATA.home as any),
        title: `Accueil ${templateName}`,
        description: `Page d'accueil du template ${templateName}`,
        hero: {
          ...(SEED_DATA.home as any)?.hero,
          title: `Bienvenue sur ${templateName}`,
          subtitle: `Template ${templateName} généré avec l'IA`,
          cta: 'Découvrir',
        },
        blocks: [],
      },
      studio: {
        ...(SEED_DATA.studio as any),
        title: `Studio ${templateName}`,
        description: `Page studio du template ${templateName}`,
        blocks: [],
      },
      work: {
        ...(SEED_DATA.work as any),
        title: `Projets ${templateName}`,
        description: `Page projets du template ${templateName}`,
        blocks: [],
      },
      contact: {
        ...(SEED_DATA.contact as any),
        title: `Contact ${templateName}`,
        description: `Page contact du template ${templateName}`,
        blocks: [],
      },
      blog: {
        ...(SEED_DATA.blog as any),
        title: `Blog ${templateName}`,
        description: `Page blog du template ${templateName}`,
        blocks: [],
      },
    };

    writeFileSync(join(dataTemplatesDir, `${templateName}.json`), JSON.stringify(templateConfig, null, 2));
    writeFileSync(join(dataTemplateDir, 'content.json'), JSON.stringify(seededContent, null, 2));

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
