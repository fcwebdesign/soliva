import { readContent } from '@/lib/content';
import BlogClient from './blog-client';

export const runtime = "nodejs";

export default async function Blog(): Promise<React.JSX.Element> {
  const content = await readContent();
  
  return <BlogClient content={content.blog} />;
} 