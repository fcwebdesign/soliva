#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des slugs dans content.json...');

// Lire le fichier content.json
const contentPath = path.join(__dirname, '..', 'data', 'content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

let cleanedCount = 0;

// Fonction pour nettoyer un slug
function cleanSlug(slug) {
  if (!slug || typeof slug !== 'string') return slug;
  return slug.trim();
}

// Nettoyer les slugs dans work.projects
if (content.work?.projects) {
  content.work.projects.forEach(project => {
    if (project.slug) {
      const originalSlug = project.slug;
      project.slug = cleanSlug(project.slug);
      if (originalSlug !== project.slug) {
        console.log(`📝 Nettoyé: "${originalSlug}" → "${project.slug}"`);
        cleanedCount++;
      }
    }
  });
}

// Nettoyer les slugs dans work.adminProjects
if (content.work?.adminProjects) {
  content.work.adminProjects.forEach(project => {
    if (project.slug) {
      const originalSlug = project.slug;
      project.slug = cleanSlug(project.slug);
      if (originalSlug !== project.slug) {
        console.log(`📝 Nettoyé: "${originalSlug}" → "${project.slug}"`);
        cleanedCount++;
      }
    }
  });
}

// Nettoyer les slugs dans blog.articles
if (content.blog?.articles) {
  content.blog.articles.forEach(article => {
    if (article.slug) {
      const originalSlug = article.slug;
      article.slug = cleanSlug(article.slug);
      if (originalSlug !== article.slug) {
        console.log(`📝 Nettoyé: "${originalSlug}" → "${article.slug}"`);
        cleanedCount++;
      }
    }
  });
}

// Sauvegarder le fichier nettoyé
fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));

console.log(`✅ Nettoyage terminé ! ${cleanedCount} slugs nettoyés.`);
console.log('📁 Fichier sauvegardé:', contentPath);
