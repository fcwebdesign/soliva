export interface Metadata {
  title: string;
  description: string;
}

export interface Nav {
  logo: string;
  items: string[];
  location: string;
}

export interface Hero {
  title: string;
  subtitle?: string;
}

export interface ContactSection {
  title: string;
  email: string;
}

export interface ContactSections {
  collaborations: ContactSection;
  inquiries: ContactSection;
}

export interface BriefGenerator {
  placeholder: string;
  button: string;
  loading: string;
  resultTitle: string;
}

export interface Contact {
  hero: Hero;
  sections: ContactSections;
  socials: string[];
  briefGenerator: BriefGenerator;
}

export interface ContentImage {
  src: string;
  alt: string;
}

export interface StudioContent {
  description: string;
  image: ContentImage;
}

export interface Studio {
  hero: Hero;
  content: StudioContent;
}

export interface Project {
  title: string;
  description: string;
  category: string;
  image: string;
  alt: string;
  slug: string;
}

export interface Work {
  hero: Hero;
  filters: string[];
  description: string;
  projects: Project[];
}

export interface Article {
  id: string;
  title: string;
}

export interface Blog {
  hero: Hero;
  description: string;
  articles: Article[];
}

export interface Home {
  hero: Hero;
}

export interface Content {
  metadata: Metadata;
  nav: Nav;
  home: Home;
  contact: Contact;
  studio: Studio;
  work: Work;
  blog: Blog;
} 