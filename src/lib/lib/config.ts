// Configuration globale du site pour le SEO
export const SITE_CONFIG = {
  name: "Soliva",
  url: "https://soliva.fr", // À adapter selon votre domaine
  description: "AI-Native Studio - Agence de création digitale",
  defaultOgImage: "/og-default.jpg",
  twitter: {
    site: "@soliva", // À adapter
    creator: "@soliva" // À adapter
  },
  contact: {
    email: "contact@soliva.fr", // À adapter
    phone: "+33 1 23 45 67 89" // À adapter
  }
};

// Configuration des métadonnées par défaut
export const DEFAULT_METADATA = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s — ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: ["agence digitale", "création web", "design", "développement", "IA"],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: SITE_CONFIG.url
  },
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    images: [SITE_CONFIG.defaultOgImage]
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitter.site,
    creator: SITE_CONFIG.twitter.creator,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.defaultOgImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "your-google-verification-code", // À adapter
    yandex: "your-yandex-verification-code", // À adapter
    yahoo: "your-yahoo-verification-code" // À adapter
  }
}; 