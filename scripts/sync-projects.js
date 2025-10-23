#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Synchronisation des projets admin ↔ frontend...');

// Lire le fichier content.json
const contentPath = path.join(__dirname, '..', 'data', 'content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

console.log('📊 Avant synchronisation:');
console.log(`  - adminProjects: ${content.work?.adminProjects?.length || 0} projets`);
console.log(`  - projects (frontend): ${content.work?.projects?.length || 0} projets`);

// Synchroniser projects (frontend) avec adminProjects (admin)
if (content.work?.adminProjects && content.work?.projects) {
  // Créer un map des slugs adminProjects pour référence rapide
  const adminProjectsMap = new Map();
  content.work.adminProjects.forEach(project => {
    if (project.slug) {
      adminProjectsMap.set(project.slug.trim(), project);
    }
  });
  
  console.log(`📝 adminProjects disponibles: ${Array.from(adminProjectsMap.keys()).join(', ')}`);
  
  // Filtrer projects (frontend) pour ne garder que ceux qui existent dans adminProjects
  const originalProjectsCount = content.work.projects.length;
  content.work.projects = content.work.projects.filter(project => {
    if (!project.slug) return false;
    const cleanSlug = project.slug.trim();
    const exists = adminProjectsMap.has(cleanSlug);
    if (!exists) {
      console.log(`🗑️ Suppression de projects: "${project.slug}" (n'existe plus dans adminProjects)`);
    }
    return exists;
  });
  
  console.log(`📊 Après synchronisation:`);
  console.log(`  - adminProjects: ${content.work.adminProjects.length} projets`);
  console.log(`  - projects (frontend): ${content.work.projects.length} projets`);
  console.log(`  - Projets supprimés du frontend: ${originalProjectsCount - content.work.projects.length}`);
  
  // Sauvegarder
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));
  console.log('✅ Synchronisation terminée et sauvegardée !');
  
} else {
  console.log('❌ Structure work non trouvée dans content.json');
}
