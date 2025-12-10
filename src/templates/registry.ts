export type TemplateMeta = {
  key: string;
  autonomous: boolean; // Si true, le template gère son propre header/footer
  name: string;
  description?: string;
};

export const TEMPLATES: Record<string, TemplateMeta> = {
  'soliva': {
    key: 'soliva',
    autonomous: false,
    name: 'Soliva Original',
    description: 'Template original Soliva avec design personnalisé'
  },
  'pearl': {
    key: 'pearl',
    autonomous: true,
    name: 'pearl',
    description: 'Template généré automatiquement'
  },
  'Starter-Kit': {
    key: 'Starter-Kit',
    autonomous: true,
    name: 'Starter-Kit',
    description: 'Template généré automatiquement'
  },
  // Autres templates futurs...
};
