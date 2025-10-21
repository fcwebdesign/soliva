// Types de base pour les champs d'édition des blocs
// Migré depuis utils/blockUtils.ts pour centralisation

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'rich-text'
  | 'image'
  | 'select'
  | 'number'
  | 'toggle'
  | 'array'
  | 'color'
  | 'link';

// Configuration d'un champ d'édition
export interface FieldConfig {
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Pour les select
  min?: number; // Pour les number
  max?: number; // Pour les number
  arrayItemFields?: FieldConfig[]; // Pour les array
  defaultValue?: any;
}

// Métadonnées d'un bloc
export interface BlockMetadata {
  type: string;
  label: string;
  description?: string;
  icon?: string;
  category?: 'content' | 'layout' | 'media' | 'interactive';
  fields?: Record<string, FieldConfig>;
  preview?: string; // URL ou base64 d'une preview
}

