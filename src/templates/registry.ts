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
  'praxis': {
    key: 'praxis',
    autonomous: true,
    name: 'Praxis',
    description: 'Template corporate léger avec en-tête dédié'
  },'effica': {
    key: 'effica',
    autonomous: true,
    name: 'effica',
    description: 'Template généré automatiquement'
  },// Autres templates futurs...
};
