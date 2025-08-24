// Fichier de test pour les blocs de service
// Copiez ces données dans votre éditeur d'administration pour tester

// Exemple de bloc service-offering (simple)
const serviceOfferingExample = {
  id: "test-service-1",
  type: "service-offering",
  title: "Commercial Excellence",
  description: "We deliver tailored commercial excellence services grounded in your organization's maturity, capabilities, and ambitions. In the context of what is achievable to improve and implement, we combine hands-on assessments, realistic roadmaps, and scalable designs to optimize processes, enable technology, and achieve measurable results. We call it ComEx with context.",
  icon: "🏗️"
};

// Exemple de bloc service-offerings (groupe)
const serviceOfferingsExample = {
  id: "test-services-group",
  type: "service-offerings",
  title: "OUR CORE OFFERINGS",
  offerings: [
    {
      id: "commercial-excellence",
      title: "Commercial Excellence",
      description: "We deliver tailored commercial excellence services grounded in your organization's maturity, capabilities, and ambitions. In the context of what is achievable to improve and implement, we combine hands-on assessments, realistic roadmaps, and scalable designs to optimize processes, enable technology, and achieve measurable results. We call it ComEx with context."
    },
    {
      id: "enterprise-architecture",
      title: "Enterprise & Integration Architecture",
      description: "While Salesforce is at the heart of what we do, it rarely operates in isolation. We design integration strategies, robust data models, and workflows to ensure seamless operations across systems such as SAP, Oracle, and Microsoft.",
      icon: "🏗️"
    },
    {
      id: "salesforce-advisory",
      title: "Salesforce Advisory",
      description: "We offer Salesforce-specific advisory services tailored to specific needs as part of a larger project or standalone solutions. Our certified specialists ensure ambitions are met with scalability and long-term success in mind."
    }
  ]
};

// Exemple de contenu complet avec blocs
const homeContentWithServiceBlocks = {
  hero: {
    title: "Soliva",
    subtitle: "creative studio.\ndigital & brand strategy."
  },
  blocks: [
    {
      id: "intro-content",
      type: "content",
      content: "<p>Bienvenue sur notre site. Nous sommes spécialisés dans l'excellence commerciale et l'architecture d'entreprise.</p>"
    },
    serviceOfferingsExample, // Le bloc de services
    {
      id: "cta-section",
      type: "cta",
      ctaText: "Travaillons ensemble",
      ctaLink: "/contact"
    }
  ]
};

console.log("✅ Exemples de blocs de service créés");
console.log("📝 Copiez ces données dans votre éditeur d'administration pour tester");

export { serviceOfferingExample, serviceOfferingsExample, homeContentWithServiceBlocks }; 