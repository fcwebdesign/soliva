import { readContent } from '@/lib/content';
import StudioClient from './studio-client';

export const runtime = "nodejs";

export default async function Studio() {
  const content = await readContent();
  
  // Rendre directement le StudioClient sans passer par le layout normal
  return <StudioClient content={content.studio} />;
}
