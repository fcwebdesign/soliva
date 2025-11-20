import { loadTemplateMetadata } from '@/lib/load-template-metadata';
import BlogClient from './blog-client';
import { notFound } from 'next/navigation';

export const runtime = "nodejs";

export default async function Blog(): Promise<React.JSX.Element> {
  // ✅ OPTIMISATION : Utiliser loadTemplateMetadata au lieu de readContent (41 MB → ~100 Ko)
  const content = await loadTemplateMetadata();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('blog')) {
    notFound();
  }
  
  return <BlogClient content={content.blog} />;
}
