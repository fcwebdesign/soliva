// Fonction pour convertir les données du template en blocs
export function convertTemplateToBlocks(content, templateKey) {
  if (templateKey === 'minimaliste-premium') {
    return convertMinimalisteToBlocks(content);
  }
  
  // Pour les autres templates, retourner les blocs existants ou un tableau vide
  return content.blocks || [];
}

function convertMinimalisteToBlocks(content) {
  const blocks = [];
  let blockId = 1;

  // Bloc Hero minimaliste
  if (content.hero) {
    blocks.push({
      id: `block-${blockId++}`,
      type: 'hero-minimaliste',
      title: content.hero.title || "Design minimal. Impact maximal.",
      subtitle: content.hero.subtitle || "Identités, sites et produits. Sobriété, précision, résultats."
    });
  }

  // Bloc Featured minimaliste
  if (content.featured) {
    blocks.push({
      id: `block-${blockId++}`,
      type: 'featured-minimaliste',
      src: content.featured.image || "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2000&auto=format&fit=crop",
      alt: content.featured.alt || "Projet en vedette"
    });
  }

  // Bloc Work Grid minimaliste
  if (content.work) {
    blocks.push({
      id: `block-${blockId++}`,
      type: 'work-grid-minimaliste',
      title: content.work.title || "Travaux sélectionnés",
      subtitle: content.work.subtitle || "Peu de pièces, beaucoup d'impact.",
      items: (content.work.items || []).map(item => ({
        title: item.title,
        kind: item.category || "Design",
        image: item.image || item.featuredImage,
        href: item.url || `#`
      }))
    });
  }

  // Bloc Text Block minimaliste (About)
  if (content.about) {
    blocks.push({
      id: `block-${blockId++}`,
      type: 'text-block-minimaliste',
      title: content.about.title || "À propos",
      text: content.about.description || "Studio indépendant. Nous concevons des expériences sobres et utiles. Peu d'éléments, beaucoup d'impact. Chaque décision sert la lisibilité, la vitesse et la conversion."
    });
  }

  // Bloc CTA minimaliste (Contact)
  if (content.contact) {
    blocks.push({
      id: `block-${blockId++}`,
      type: 'cta-minimaliste',
      text: content.contact.title || "Travaillons ensemble",
      email: content.contact.email || "hello@studio.fr",
      emailLabel: content.contact.email || "hello@studio.fr"
    });
  }

  return blocks;
} 