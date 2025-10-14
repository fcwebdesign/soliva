import { NextRequest, NextResponse } from 'next/server';
import { readContent } from '@/lib/content';
import { promises as fs } from 'fs';
import { join } from 'path';
import archiver from 'archiver';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début de la génération de l\'export statique...');
    
    // Lire le contenu actuel
    const content = await readContent();
    console.log('✅ Contenu lu avec succès');

    // Créer un buffer pour le ZIP
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Écouter les données du ZIP
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Attendre la fin de l'archivage
    const archivePromise = new Promise<void>((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);
    });

    // Générer les pages HTML statiques
    await generateStaticPages(archive, content);
    
    // Copier les assets
    await copyAssets(archive);
    
    // Ajouter les instructions
    await addInstructions(archive);
    
    // Finaliser l'archive
    archive.finalize();
    await archivePromise;

    // Créer le buffer final
    const buffer = Buffer.concat(chunks);
    
    console.log('✅ Export statique généré avec succès');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="soliva-export-${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'export:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de l\'export statique',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

async function generateStaticPages(archive: archiver.Archiver, content: any) {
  console.log('📄 Génération des pages HTML...');
  
  const pages = [
    { id: 'home', path: '/', title: content.home?.hero?.title || 'Accueil' },
    { id: 'studio', path: '/studio', title: content.studio?.hero?.title || 'Studio' },
    { id: 'contact', path: '/contact', title: content.contact?.hero?.title || 'Contact' },
    { id: 'work', path: '/work', title: content.work?.hero?.title || 'Portfolio' },
    { id: 'blog', path: '/blog', title: content.blog?.hero?.title || 'Blog' },
  ];

  // Générer index.html (page d'accueil)
  const homeHtml = generatePageHTML('home', content, content.home);
  archive.append(homeHtml, { name: 'index.html' });

  // Générer les autres pages
  for (const page of pages.slice(1)) {
    const pageHtml = generatePageHTML(page.id, content, content[page.id]);
    const filename = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`;
    archive.append(pageHtml, { name: filename });
  }

  // Générer les pages de projets
  if (content.work?.projects) {
    for (const project of content.work.projects) {
      if (project.slug) {
        const projectHtml = generateProjectHTML(project, content);
        archive.append(projectHtml, { name: `work/${project.slug}.html` });
      }
    }
  }

  // Générer les pages d'articles
  if (content.blog?.articles) {
    for (const article of content.blog.articles) {
      if (article.id) {
        const articleHtml = generateArticleHTML(article, content);
        archive.append(articleHtml, { name: `blog/${article.id}.html` });
      }
    }
  }
}

function generatePageHTML(pageId: string, content: any, pageData: any): string {
  const title = pageData?.hero?.title || pageData?.title || 'Page';
  const description = pageData?.description || pageData?.hero?.subtitle || '';
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${content.metadata?.title || 'Soliva'}</title>
    <meta name="description" content="${description}">
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <div id="root">
        <header class="page-header">
            <nav class="navigation">
                <div class="nav-brand">
                    <a href="/">${content.nav?.logo || 'Soliva'}</a>
                </div>
                <ul class="nav-links">
                    ${content.nav?.items?.map((item: string) => 
                      `<li><a href="/${item === 'home' ? '' : item}">${item.charAt(0).toUpperCase() + item.slice(1)}</a></li>`
                    ).join('') || ''}
                </ul>
            </nav>
        </header>
        
        <main class="page-content">
            <div class="hero-section">
                <h1 class="page-title">${title}</h1>
                ${description ? `<p class="page-description">${description}</p>` : ''}
            </div>
            
            <div class="content-blocks">
                ${generateBlocksHTML(pageData?.blocks || [])}
            </div>
        </main>
        
        <footer class="page-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>${content.footer?.logo || content.nav?.logo || 'Soliva'}</h3>
                    <p>${content.footer?.description || ''}</p>
                </div>
                <div class="footer-links">
                    ${content.footer?.links?.map((link: any) => 
                      `<a href="${link.url}">${link.title}</a>`
                    ).join('') || ''}
                </div>
                <div class="footer-social">
                    ${content.footer?.socialLinks?.map((social: any) => 
                      `<a href="${social.url}" target="_blank">${social.platform}</a>`
                    ).join('') || ''}
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} ${content.footer?.copyright || 'Soliva'}</p>
            </div>
        </footer>
    </div>
    
    <script src="assets/scripts.js"></script>
</body>
</html>`;
}

function generateProjectHTML(project: any, content: any): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title} - Portfolio</title>
    <meta name="description" content="${project.description}">
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <div id="root">
        <header class="page-header">
            <nav class="navigation">
                <div class="nav-brand">
                    <a href="../">${content.nav?.logo || 'Soliva'}</a>
                </div>
                <ul class="nav-links">
                    ${content.nav?.items?.map((item: string) => 
                      `<li><a href="../${item === 'home' ? '' : item}">${item.charAt(0).toUpperCase() + item.slice(1)}</a></li>`
                    ).join('') || ''}
                </ul>
            </nav>
        </header>
        
        <main class="project-content">
            <div class="project-hero">
                <h1>${project.title}</h1>
                <p class="project-description">${project.description}</p>
                ${project.image ? `<img src="../${project.image}" alt="${project.alt || project.title}" class="project-image">` : ''}
            </div>
            
            <div class="content-blocks">
                ${generateBlocksHTML(project.blocks || [])}
            </div>
            
            <div class="project-navigation">
                <a href="../work" class="back-link">← Retour au portfolio</a>
            </div>
        </main>
        
        <footer class="page-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>${content.footer?.logo || content.nav?.logo || 'Soliva'}</h3>
                </div>
            </div>
        </footer>
    </div>
    
    <script src="../assets/scripts.js"></script>
</body>
</html>`;
}

function generateArticleHTML(article: any, content: any): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Blog</title>
    <meta name="description" content="${article.excerpt || article.description || ''}">
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <div id="root">
        <header class="page-header">
            <nav class="navigation">
                <div class="nav-brand">
                    <a href="../">${content.nav?.logo || 'Soliva'}</a>
                </div>
                <ul class="nav-links">
                    ${content.nav?.items?.map((item: string) => 
                      `<li><a href="../${item === 'home' ? '' : item}">${item.charAt(0).toUpperCase() + item.slice(1)}</a></li>`
                    ).join('') || ''}
                </ul>
            </nav>
        </header>
        
        <main class="article-content">
            <article class="blog-article">
                <header class="article-header">
                    <h1>${article.title}</h1>
                    <time class="article-date">${new Date().toLocaleDateString('fr-FR')}</time>
                </header>
                
                <div class="article-body">
                    ${generateBlocksHTML(article.blocks || [])}
                </div>
                
                <div class="article-navigation">
                    <a href="../blog" class="back-link">← Retour au blog</a>
                </div>
            </article>
        </main>
        
        <footer class="page-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>${content.footer?.logo || content.nav?.logo || 'Soliva'}</h3>
                </div>
            </div>
        </footer>
    </div>
    
    <script src="../assets/scripts.js"></script>
</body>
</html>`;
}

function generateBlocksHTML(blocks: any[]): string {
  if (!blocks || blocks.length === 0) {
    return '<p>Contenu en cours de rédaction...</p>';
  }

  return blocks.map(block => {
    switch (block.type) {
      case 'hero':
        return `
          <section class="hero-block">
            <h2>${block.title || ''}</h2>
            <p>${block.content || ''}</p>
          </section>
        `;
      case 'text':
        return `
          <section class="text-block">
            <h3>${block.title || ''}</h3>
            <div class="text-content">${block.content || ''}</div>
          </section>
        `;
      case 'image':
        return `
          <section class="image-block">
            ${block.src ? `<img src="${block.src}" alt="${block.alt || ''}" class="block-image">` : ''}
            ${block.caption ? `<p class="image-caption">${block.caption}</p>` : ''}
          </section>
        `;
      case 'cta':
        return `
          <section class="cta-block">
            <h3>${block.title || ''}</h3>
            <p>${block.content || ''}</p>
            ${block.buttonText && block.buttonUrl ? 
              `<a href="${block.buttonUrl}" class="cta-button">${block.buttonText}</a>` : ''}
          </section>
        `;
      default:
        return `
          <section class="generic-block">
            <h3>${block.title || ''}</h3>
            <div class="block-content">${block.content || ''}</div>
          </section>
        `;
    }
  }).join('');
}

async function copyAssets(archive: archiver.Archiver) {
  console.log('📁 Copie des assets...');
  
  try {
    // Copier les images du dossier public
    const publicDir = join(process.cwd(), 'public');
    const publicFiles = await fs.readdir(publicDir, { withFileTypes: true });
    
    for (const file of publicFiles) {
      if (file.isFile()) {
        const filePath = join(publicDir, file.name);
        const fileContent = await fs.readFile(filePath);
        archive.append(fileContent, { name: `assets/${file.name}` });
      }
    }
    
    // Copier les images du dossier uploads
    const uploadsDir = join(publicDir, 'uploads');
    try {
      const uploadFiles = await fs.readdir(uploadsDir, { withFileTypes: true });
      for (const file of uploadFiles) {
        if (file.isFile()) {
          const filePath = join(uploadsDir, file.name);
          const fileContent = await fs.readFile(filePath);
          archive.append(fileContent, { name: `assets/uploads/${file.name}` });
        }
      }
    } catch (error) {
      console.log('⚠️ Dossier uploads non trouvé, ignoré');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la copie des assets:', error);
  }
}

async function addInstructions(archive: archiver.Archiver) {
  console.log('📝 Ajout des instructions...');
  
  const instructions = `# Export Statique Soliva

## Fichiers inclus

- \`index.html\` - Page d'accueil
- \`studio.html\` - Page studio
- \`contact.html\` - Page contact
- \`work.html\` - Page portfolio
- \`blog.html\` - Page blog
- \`work/[projet].html\` - Pages de projets individuels
- \`blog/[article].html\` - Pages d'articles individuels
- \`assets/\` - Dossier contenant tous les assets (CSS, JS, images)

## Déploiement

### Option 1: Netlify (Recommandé)
1. Connectez votre compte GitHub à Netlify
2. Uploadez le contenu de ce ZIP dans un nouveau repository
3. Connectez le repository à Netlify
4. Votre site sera en ligne automatiquement

### Option 2: Vercel
1. Créez un compte sur Vercel
2. Uploadez le contenu de ce ZIP
3. Vercel détectera automatiquement les fichiers statiques

### Option 3: Hébergement traditionnel
1. Uploadez tous les fichiers sur votre serveur web
2. Assurez-vous que le serveur supporte les fichiers statiques
3. Configurez votre nom de domaine

## Support

Pour toute question concernant cet export :
- Email: contact@soliva.com
- Documentation: https://docs.soliva.com/export

## Limitations

⚠️ **Important** : Cet export est statique, ce qui signifie :
- Plus d'interface d'administration
- Impossible d'ajouter de nouveaux projets/articles
- Pas de fonctionnalités IA
- Contenu figé dans le temps

Pour des modifications futures, contactez-nous pour nos services de maintenance.

---
Généré le ${new Date().toLocaleDateString('fr-FR')} par Soliva CMS
`;

  archive.append(instructions, { name: 'README.md' });
  
  // Ajouter un fichier de configuration basique
  const config = `{
  "name": "soliva-static-export",
  "version": "1.0.0",
  "description": "Export statique généré par Soliva CMS",
  "generated": "${new Date().toISOString()}",
  "pages": [
    "index.html",
    "studio.html", 
    "contact.html",
    "work.html",
    "blog.html"
  ]
}`;

  archive.append(config, { name: 'export-config.json' });
}
