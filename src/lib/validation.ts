/**
 * Schémas de validation Zod pour les APIs critiques
 */

import { z } from 'zod';

// Validation pour les données de contenu
export const BlockDataSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.string(), z.any()),
});

export const PageSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  blocks: z.array(BlockDataSchema).optional(),
});

export const ContentUpdateSchema = z.object({
  path: z.string(),
  value: z.any(),
});

// Validation pour l'upload de fichiers
export const FileUploadSchema = z.object({
  file: z.instanceof(File).or(z.any()),
  maxSize: z.number().optional().default(10 * 1024 * 1024), // 10MB par défaut
  allowedTypes: z.array(z.string()).optional(),
});

// Validation pour l'authentification admin
export const AdminAuthSchema = z.object({
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Validation pour les APIs AI
export const AIPromptSchema = z.object({
  prompt: z.string().min(1, "Le prompt ne peut pas être vide").max(5000, "Le prompt est trop long"),
  context: z.record(z.string(), z.any()).optional(),
  blockType: z.string().optional(),
});

// Helper pour valider les requêtes
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { 
        success: false, 
        error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation error'
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

export type BlockData = z.infer<typeof BlockDataSchema>;
export type Page = z.infer<typeof PageSchema>;
export type ContentUpdate = z.infer<typeof ContentUpdateSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type AdminAuth = z.infer<typeof AdminAuthSchema>;
export type AIPrompt = z.infer<typeof AIPromptSchema>;

