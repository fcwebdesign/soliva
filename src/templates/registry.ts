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
  'starter': {
    key: 'starter',
    autonomous: true,
    name: 'Starter Example',
    description: 'Exemple de template avec Shell unique et routing client'
  },
  // Autres templates futurs...
};
