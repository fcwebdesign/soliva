import { z } from 'zod';

export const metadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  layout: z.enum(['compact', 'standard', 'wide']).optional(),
}).passthrough();

const heroSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
}).passthrough();

const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
}).passthrough();

const navSchema = z.object({
  logo: z.string(),
  items: z.array(z.string()),
  location: z.string(),
}).passthrough();

const contactSectionSchema = z.object({
  title: z.string(),
  email: z.string(),
}).passthrough();

const briefGeneratorSchema = z.object({
  placeholder: z.string(),
  button: z.string(),
  loading: z.string(),
  resultTitle: z.string(),
}).passthrough();

const contactSchema = z.object({
  hero: heroSchema.partial({ subtitle: true }).optional(),
  sections: z.object({
    collaborations: contactSectionSchema.optional(),
    inquiries: contactSectionSchema.optional(),
  }).optional(),
  socials: z.array(z.string()).optional(),
  briefGenerator: briefGeneratorSchema.optional(),
}).passthrough();

const studioSchema = z.object({
  hero: heroSchema.optional(),
  content: z.union([
    z.object({
      description: z.string(),
      image: imageSchema,
    }).passthrough(),
    z.string()
  ]).optional(),
  blocks: z.array(z.any()).optional(),
}).passthrough();

const projectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  slug: z.string(),
}).passthrough();

const adminProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  publishedAt: z.string().optional(),
  excerpt: z.string().optional(),
  client: z.string().optional(),
  category: z.string().optional(),
  year: z.string().optional(),
  featured: z.boolean().optional(),
  blocks: z.array(z.any()).optional(),
}).passthrough();

const workSchema = z.object({
  hero: heroSchema,
  filters: z.array(z.string()),
  description: z.string(),
  projects: z.array(projectSchema),
  adminProjects: z.array(adminProjectSchema).optional(),
}).passthrough();

const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string().optional(),
  publishedAt: z.string().optional(),
  excerpt: z.string().optional(),
}).passthrough();

const blogSchema = z.object({
  hero: heroSchema,
  description: z.string(),
  articles: z.array(articleSchema),
}).passthrough();

const footerSchema = z.object({
  socials: z.array(z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    target: z.string().optional(),
    platform: z.string().optional(),
  }).passthrough()).optional(),
}).passthrough();

export const contentSchema = z.object({
  metadata: metadataSchema,
  nav: navSchema,
  home: z.object({ hero: heroSchema }).passthrough(),
  contact: contactSchema,
  studio: studioSchema,
  work: workSchema,
  blog: blogSchema,
  footer: footerSchema.optional(),
  _template: z.string().optional(),
  _templateVersion: z.string().optional(),
}).passthrough();

export type ContentFromSchema = z.infer<typeof contentSchema>;
