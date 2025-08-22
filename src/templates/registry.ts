export type TemplateMeta = {
  key: string;
  autonomous: boolean; // Si true, le template gère son propre header/footer
  name: string;
  description?: string;
};

export const TEMPLATES: Record<string, TemplateMeta> = {
  'minimaliste-premium': { 
    key: 'minimaliste-premium', 
    autonomous: true,
    name: 'Minimaliste Premium',
    description: 'Template minimaliste avec animations fluides et typographie impactante'
  },
  // Autres templates futurs...
}; 