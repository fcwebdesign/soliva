import { readContent } from '@/lib/content';
import BlogClient from './blog-client';
import { notFound } from 'next/navigation';

export const runtime = "nodejs";

export default async function Blog(): Promise<React.JSX.Element> {
  const content = await readContent();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('blog')) {
    notFound();
  }
  
  return <BlogClient content={content.blog} />;
}
