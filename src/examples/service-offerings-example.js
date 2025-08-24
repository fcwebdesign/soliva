// Exemple de données pour le bloc service-offerings
export const serviceOfferingsExample = {
  id: "service-offerings-1",
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
      icon: "🏗️" // Icône pour représenter l'architecture
    },
    {
      id: "salesforce-advisory",
      title: "Salesforce Advisory",
      description: "We offer Salesforce-specific advisory services tailored to specific needs as part of a larger project or standalone solutions. Our certified specialists ensure ambitions are met with scalability and long-term success in mind."
    }
  ]
};

// Exemple d'utilisation dans un bloc simple
export const singleServiceOfferingExample = {
  id: "single-service-1",
  type: "service-offering",
  title: "Commercial Excellence",
  description: "We deliver tailored commercial excellence services grounded in your organization's maturity, capabilities, and ambitions. In the context of what is achievable to improve and implement, we combine hands-on assessments, realistic roadmaps, and scalable designs to optimize processes, enable technology, and achieve measurable results. We call it ComEx with context."
}; 