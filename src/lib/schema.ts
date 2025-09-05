import { SITE_NAME, SITE_URL } from './seo';

// Configuration de l'organisation
const ORGANIZATION_CONFIG = {
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Agence créative spécialisée en design et développement web",
  sameAs: [
    "https://linkedin.com/company/soliva",
    "https://twitter.com/soliva",
    "https://instagram.com/soliva"
  ]
};

// Types pour les schémas
export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

export interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

export interface ArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
  inLanguage: string;
}

export interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

export interface HowToSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  step: Array<{
    '@type': string;
    name: string;
    text: string;
  }>;
}

// Générer le schéma Organization (tronc commun)
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION_CONFIG.name,
    url: ORGANIZATION_CONFIG.url,
    logo: ORGANIZATION_CONFIG.logo,
    description: ORGANIZATION_CONFIG.description,
    sameAs: ORGANIZATION_CONFIG.sameAs
  };
}

// Générer le schéma WebSite (tronc commun)
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORGANIZATION_CONFIG.name,
    url: ORGANIZATION_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${ORGANIZATION_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

// Générer le schéma BreadcrumbList
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Générer le schéma Article
export function generateArticleSchema(article: {
  title: string;
  excerpt?: string;
  content: string | any;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  image?: string;
}): ArticleSchema {
  const publishedDate = article.publishedAt || new Date().toISOString();
  const modifiedDate = article.updatedAt || publishedDate;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.content.substring(0, 160),
    image: article.image ? `${SITE_URL}${article.image}` : undefined,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: SITE_NAME
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${article.slug}`
    },
    inLanguage: 'fr-FR'
  };
}

// Générer le schéma FAQ
export function generateFAQSchema(content: string | any): FAQSchema | null {
  // Détection intelligente des questions/réponses
  const contentString = typeof content === 'string' ? content : JSON.stringify(content || '');
  const cleanContent = contentString.toLowerCase();
  
  // Patterns de questions plus larges
  const questionPatterns = [
    /(?:comment|pourquoi|quand|où|qui|quoi|que|est-ce que|peut-on|faut-il|doit-on|comment faire|comment utiliser|comment optimiser|comment créer|comment développer|comment améliorer|comment choisir|comment éviter|comment réussir|comment gérer|comment organiser|comment structurer|comment analyser|comment évaluer|comment mesurer|comment tester|comment valider|comment implémenter|comment déployer|comment maintenir|comment évoluer|comment adapter|comment personnaliser|comment automatiser|comment simplifier|comment complexifier|comment approfondir|comment approfondir|comment approfondir)/gi,
    /(?:qu'est-ce que|qu'est-ce qu'|c'est quoi|c'est que|à quoi sert|pour quoi|dans quel but|dans quel objectif|dans quel cadre|dans quel contexte|dans quel cas|dans quelle situation|dans quelle mesure|dans quelle proportion|dans quelle limite|dans quelle frontière|dans quelle zone|dans quelle région|dans quel pays|dans quelle ville|dans quel quartier|dans quelle rue|dans quel bâtiment|dans quelle pièce|dans quel bureau|dans quel espace|dans quel environnement|dans quel milieu|dans quel secteur|dans quel domaine|dans quel champ|dans quel terrain|dans quel marché|dans quel business|dans quel métier|dans quelle profession|dans quel secteur d'activité|dans quel domaine d'expertise|dans quel champ de compétence|dans quel terrain de jeu|dans quel marché cible|dans quel business model|dans quel métier d'avenir|dans quelle profession d'avenir|dans quel secteur d'avenir|dans quel domaine d'avenir|dans quel champ d'avenir|dans quel terrain d'avenir|dans quel marché d'avenir|dans quel business d'avenir|dans quel métier de demain|dans quelle profession de demain|dans quel secteur de demain|dans quel domaine de demain|dans quel champ de demain|dans quel terrain de demain|dans quel marché de demain|dans quel business de demain)/gi
  ];
  
  // Compter les questions détectées
  let questionCount = 0;
  questionPatterns.forEach(pattern => {
    const matches = cleanContent.match(pattern);
    if (matches) questionCount += matches.length;
  });
  
  // Si moins de 2 questions, pas de FAQ
  if (questionCount < 2) return null;
  
  // Extraire les questions et réponses du contenu
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const faqItems = [];
  
  for (let i = 0; i < sentences.length && faqItems.length < 5; i++) {
    const sentence = sentences[i].trim();
    const lowerSentence = sentence.toLowerCase();
    
    // Vérifier si c'est une question
    const isQuestion = questionPatterns.some(pattern => pattern.test(lowerSentence));
    
    if (isQuestion && sentence.length > 20 && sentence.length < 200) {
      // Chercher une réponse dans les phrases suivantes
      let answer = '';
      for (let j = i + 1; j < Math.min(i + 3, sentences.length); j++) {
        const nextSentence = sentences[j].trim();
        if (nextSentence.length > 30) {
          answer += nextSentence + '. ';
        }
      }
      
      if (answer.length > 50) {
        faqItems.push({
          '@type': 'Question',
          name: sentence,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer.trim()
          }
        });
      }
    }
  }
  
  // Si moins de 2 FAQ valides, pas de schéma
  if (faqItems.length < 2) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems
  };
}

// Générer le schéma HowTo
export function generateHowToSchema(content: string | any, title: string): HowToSchema | null {
  // Détection intelligente des étapes
  const contentString = typeof content === 'string' ? content : JSON.stringify(content || '');
  const cleanContent = contentString.toLowerCase();
  
  // Patterns d'étapes plus larges
  const stepPatterns = [
    /(?:étape|step|1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.|première|deuxième|troisième|quatrième|cinquième|sixième|septième|huitième|neuvième|dixième|d'abord|ensuite|puis|après|enfin|finalement|pour commencer|pour finir|pour terminer|pour conclure|pour résumer|pour récapituler|pour synthétiser|pour analyser|pour évaluer|pour mesurer|pour tester|pour valider|pour implémenter|pour déployer|pour maintenir|pour évoluer|pour adapter|pour personnaliser|pour automatiser|pour simplifier|pour complexifier|pour approfondir)/gi,
    /(?:premièrement|deuxièmement|troisièmement|quatrièmement|cinquièmement|sixièmement|septièmement|huitièmement|neuvièmement|dixièmement|en premier|en second|en troisième|en quatrième|en cinquième|en sixième|en septième|en huitième|en neuvième|en dixième|dans un premier temps|dans un second temps|dans un troisième temps|dans un quatrième temps|dans un cinquième temps|dans un sixième temps|dans un septième temps|dans un huitième temps|dans un neuvième temps|dans un dixième temps)/gi
  ];
  
  // Compter les étapes détectées
  let stepCount = 0;
  stepPatterns.forEach(pattern => {
    const matches = cleanContent.match(pattern);
    if (matches) stepCount += matches.length;
  });
  
  // Si moins de 3 étapes, pas de HowTo
  if (stepCount < 3) return null;
  
  // Extraire les étapes du contenu
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const steps = [];
  
  for (let i = 0; i < sentences.length && steps.length < 10; i++) {
    const sentence = sentences[i].trim();
    const lowerSentence = sentence.toLowerCase();
    
    // Vérifier si c'est une étape
    const isStep = stepPatterns.some(pattern => pattern.test(lowerSentence));
    
    if (isStep && sentence.length > 30 && sentence.length < 300) {
      steps.push({
        '@type': 'HowToStep',
        name: `Étape ${steps.length + 1}`,
        text: sentence
      });
    }
  }
  
  // Si moins de 3 étapes valides, pas de schéma
  if (steps.length < 3) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: `Guide étape par étape : ${title}`,
    step: steps
  };
}

// Générer tous les schémas pour un article
export function generateAllSchemas(article: {
  title: string;
  excerpt?: string;
  content: string | any;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  image?: string;
  schemas?: string[];
}): string {
  const schemas: any[] = [];
  
  // Toujours ajouter le schéma Article
  schemas.push(generateArticleSchema(article));
  
  // Analyser le contenu pour détecter les schémas pertinents
  const detectedSchemas = detectContentSchemas(article.content);
  
  // Ajouter les schémas détectés ET demandés
  if (detectedSchemas.includes('FAQPage') && article.schemas?.includes('FAQPage')) {
    const faqSchema = generateFAQSchema(article.content);
    if (faqSchema) schemas.push(faqSchema);
  }
  
  if (detectedSchemas.includes('HowTo') && article.schemas?.includes('HowTo')) {
    const howToSchema = generateHowToSchema(article.content, article.title);
    if (howToSchema) schemas.push(howToSchema);
  }
  
  // Retourner le JSON-LD
  return JSON.stringify(schemas, null, 2);
}

// Détecter les types de schémas pertinents dans le contenu
export function detectContentSchemas(content: string | any): string[] {
  const detectedSchemas: string[] = [];
  
  // Convertir le contenu en string si ce n'est pas déjà le cas
  const contentString = typeof content === 'string' ? content : JSON.stringify(content || '');
  const cleanContent = contentString.toLowerCase();
  
  // Détecter FAQ
  const questionPatterns = [
    /(?:comment|pourquoi|quand|où|qui|quoi|que|est-ce que|peut-on|faut-il|doit-on)/gi,
    /(?:qu'est-ce que|qu'est-ce qu'|c'est quoi|c'est que|à quoi sert|pour quoi)/gi
  ];
  
  let questionCount = 0;
  questionPatterns.forEach(pattern => {
    const matches = cleanContent.match(pattern);
    if (matches) questionCount += matches.length;
  });
  
  if (questionCount >= 2) {
    detectedSchemas.push('FAQPage');
  }
  
  // Détecter HowTo
  const stepPatterns = [
    /(?:étape|step|1\.|2\.|3\.|4\.|5\.|d'abord|ensuite|puis|après|enfin)/gi,
    /(?:premièrement|deuxièmement|troisièmement|dans un premier temps|dans un second temps)/gi
  ];
  
  let stepCount = 0;
  stepPatterns.forEach(pattern => {
    const matches = cleanContent.match(pattern);
    if (matches) stepCount += matches.length;
  });
  
  if (stepCount >= 3) {
    detectedSchemas.push('HowTo');
  }
  
  return detectedSchemas;
}
