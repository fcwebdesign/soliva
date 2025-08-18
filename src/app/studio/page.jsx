import { readContent } from '@/lib/content';
import StudioClient from './studio-client';

export const runtime = "nodejs";

export default async function Studio() {
  const content = await readContent();
  
  return <StudioClient content={content.studio} />;
}
