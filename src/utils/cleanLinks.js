import { detectLinkKind } from './linkUtils';

/**
 * Nettoie les liens HTML en supprimant target="_blank" des liens internes
 * @param {string} html - Le HTML contenant les liens
 * @returns {string} - Le HTML nettoyé
 */
export function cleanInternalLinks(html) {
  if (!html || typeof html !== 'string') return html;
  
  // Regex pour trouver les balises <a> avec href
  return html.replace(/<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*?)>/gi, (match, beforeHref, href, afterHref) => {
    const linkKind = detectLinkKind(href);
    
    // Si c'est un lien interne, supprimer target="_blank" et rel
    if (linkKind === 'internal') {
      // Supprimer target="_blank" et rel="noopener noreferrer"
      let cleanedBefore = beforeHref.replace(/\s*target\s*=\s*["']_blank["']/gi, '');
      let cleanedAfter = afterHref.replace(/\s*target\s*=\s*["']_blank["']/gi, '');
      cleanedBefore = cleanedBefore.replace(/\s*rel\s*=\s*["'][^"']*noopener[^"']*["']/gi, '');
      cleanedAfter = cleanedAfter.replace(/\s*rel\s*=\s*["'][^"']*noopener[^"']*["']/gi, '');
      
      // Nettoyer les espaces doubles
      cleanedBefore = cleanedBefore.replace(/\s+/g, ' ').trim();
      cleanedAfter = cleanedAfter.replace(/\s+/g, ' ').trim();
      
      return `<a ${cleanedBefore}href="${href}"${cleanedAfter ? ' ' + cleanedAfter : ''}>`;
    }
    
    // Si c'est un lien externe, s'assurer qu'il a target="_blank"
    if (linkKind === 'external') {
      const hasTarget = /target\s*=\s*["']_blank["']/i.test(beforeHref + afterHref);
      const hasRel = /rel\s*=\s*["'][^"']*noopener[^"']*["']/i.test(beforeHref + afterHref);
      
      if (!hasTarget) {
        const relAttr = hasRel ? '' : ' rel="noopener noreferrer"';
        return `<a ${beforeHref}href="${href}"${afterHref} target="_blank"${relAttr}>`;
      }
    }
    
    return match;
  });
}

/**
 * Nettoie un objet de contenu en appliquant cleanInternalLinks à tous les champs HTML
 * @param {object} content - L'objet de contenu
 * @returns {object} - L'objet de contenu nettoyé
 */
export function cleanContentLinks(content) {
  if (!content || typeof content !== 'object') return content;
  
  const cleaned = { ...content };
  
  // Fonction récursive pour nettoyer les liens
  const cleanObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.includes('<a href=')) {
        obj[key] = cleanInternalLinks(value);
      } else if (typeof value === 'object' && value !== null) {
        cleanObject(value);
      }
    }
  };
  
  cleanObject(cleaned);
  return cleaned;
} 