import { loadTemplateMetadata } from '@/lib/load-template-metadata';
import WorkClient from './work-client';
import { notFound } from 'next/navigation';

export const runtime = "nodejs";

export default async function Work(): Promise<React.JSX.Element> {
  // ✅ OPTIMISATION : Utiliser loadTemplateMetadata au lieu de readContent (41 MB → ~100 Ko)
  const content = await loadTemplateMetadata();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('work')) {
    notFound();
  }
  
  return <WorkClient content={content.work} />;
}
