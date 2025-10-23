import { readContent } from '@/lib/content';
import PageClient from './page-client';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await readContent();
  const customPages = (content as any)?.pages?.pages || [];
  const page = customPages.find((p: any) => p.slug === slug || p.id === slug);
  if (!page) {
    notFound();
  }
  if ((page as any)?.disabled) {
    notFound();
  }
  return <PageClient />;
}

