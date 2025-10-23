import { readContent } from '@/lib/content';
import WorkClient from './work-client';
import { notFound } from 'next/navigation';

export const runtime = "nodejs";

export default async function Work(): Promise<React.JSX.Element> {
  const content = await readContent();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('work')) {
    notFound();
  }
  
  return <WorkClient content={content.work} />;
}
